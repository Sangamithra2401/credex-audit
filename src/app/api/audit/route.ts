import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { AuditInput } from "@/lib/types";
import { getServiceClient } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateAISummary(auditResult: ReturnType<typeof runAudit>): Promise<string> {
  const { totalMonthlySavings, recommendations, input } = auditResult;
  const toolList = recommendations.map((r) => r.toolName).join(", ");

  const prompt = `You are a concise financial analyst. Write a single paragraph (100 words max) summarizing this AI tool spend audit for a ${input.teamSize}-person team whose primary use case is ${input.useCase}.

Tools audited: ${toolList}
Total monthly savings identified: $${totalMonthlySavings}
Key recommendations: ${recommendations.filter((r) => !r.isOptimal).map((r) => r.recommendedAction).join("; ")}

Write in second person ("you/your team"). Be specific with numbers. Be honest — if savings are low, say so. Do not mention Credex. Do not use bullet points.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content[0];
    return block.type === "text" ? block.text.trim() : fallbackSummary(auditResult);
  } catch {
    return fallbackSummary(auditResult);
  }
}

function fallbackSummary(auditResult: ReturnType<typeof runAudit>): string {
  const { totalMonthlySavings, recommendations, input } = auditResult;
  const optimised = recommendations.filter((r) => r.isOptimal).length;
  const needsAction = recommendations.filter((r) => !r.isOptimal).length;
  if (totalMonthlySavings === 0) {
    return `Your team of ${input.teamSize} is spending efficiently across ${optimised} AI tool(s). No significant savings opportunities were found — your current stack is well-matched to your ${input.useCase} workflow.`;
  }
  return `Your team of ${input.teamSize} could save $${totalMonthlySavings}/month ($${totalMonthlySavings * 12}/year) on AI tools. Of ${recommendations.length} tools audited, ${needsAction} have actionable downgrades or switches. The biggest lever is plan right-sizing — your usage profile suggests you're paying for capacity you're not using.`;
}

export async function POST(req: NextRequest) {
  try {
    const input: AuditInput = await req.json();

    // Basic validation
    if (!input.tools || input.tools.length === 0) {
      return NextResponse.json({ error: "At least one tool required" }, { status: 400 });
    }
    if (input.tools.length > 20) {
      return NextResponse.json({ error: "Too many tools" }, { status: 400 });
    }

    const auditResult = runAudit(input);
    const aiSummary = await generateAISummary(auditResult);
    const fullResult = { ...auditResult, aiSummary };

    // Store in Supabase
    const db = getServiceClient();
    const { error } = await db.from("audits").insert({
      id: fullResult.id,
      result: fullResult,
      created_at: fullResult.createdAt,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return result even if storage fails
    }

    return NextResponse.json(fullResult);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

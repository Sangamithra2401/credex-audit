import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getServiceClient();
    const { data, error } = await db.from("audits").select("result").eq("id", params.id).single();
    if (error || !data) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Strip identifying info for public share
    const result = data.result;
    const publicResult = {
      id: result.id,
      recommendations: result.recommendations,
      totalMonthlySavings: result.totalMonthlySavings,
      totalAnnualSavings: result.totalAnnualSavings,
      aiSummary: result.aiSummary,
      input: {
        teamSize: result.input.teamSize,
        useCase: result.input.useCase,
        tools: result.input.tools, // No PII in tools
      },
      createdAt: result.createdAt,
    };

    return NextResponse.json(publicResult);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

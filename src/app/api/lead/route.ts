import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple rate limiting via in-memory map (use Redis in production)
const rateLimitMap = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < 60_000);
  if (timestamps.length >= 5) return true;
  rateLimitMap.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, companyName, role, teamSize, auditId, honeypot } = body;

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      return NextResponse.json({ ok: true }); // Silently ignore
    }

    if (!email || !auditId) {
      return NextResponse.json({ error: "Email and auditId required" }, { status: 400 });
    }

    const db = getServiceClient();

    // Get audit to check savings amount
    const { data: auditRow } = await db.from("audits").select("result").eq("id", auditId).single();
    const savings = auditRow?.result?.totalMonthlySavings ?? 0;
    const isHighSavings = savings > 500;

    // Store lead
    await db.from("leads").insert({
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
      audit_id: auditId,
      monthly_savings: savings,
      created_at: new Date().toISOString(),
    });

    // Send confirmation email
    await resend.emails.send({
      from: "SpendSmart AI <noreply@yourdomain.com>",
      to: email,
      subject: `Your AI spend audit — $${savings}/mo in savings identified`,
      html: `
        <h2>Your AI Spend Audit is ready</h2>
        <p>We found <strong>$${savings}/month</strong> ($${savings * 12}/year) in potential savings for your team.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditId}">View your full audit →</a></p>
        ${isHighSavings ? `<p><strong>Because your savings are significant, a Credex advisor will reach out within 24h to show you how to capture more of those savings through discounted AI credits.</strong></p>` : ""}
        <hr/>
        <p style="color:#666;font-size:12px">SpendSmart AI by Credex · credex.rocks</p>
      `,
    });

    return NextResponse.json({ ok: true, isHighSavings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

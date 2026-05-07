"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { AuditResult, Recommendation } from "@/lib/types";

function SavingsBadge({ amount }: { amount: number }) {
  if (amount > 0)
    return <span className="text-green-400 font-semibold">Save ${amount}/mo</span>;
  return <span className="text-gray-400 text-sm">✓ Optimal</span>;
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className={`bg-gray-800 border rounded-xl p-5 ${rec.isOptimal ? "border-gray-700" : "border-yellow-800/50"}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-white font-semibold">{rec.toolName}</h3>
          <p className="text-gray-400 text-sm capitalize">{rec.currentPlan} plan · ${rec.currentMonthlySpend}/mo</p>
        </div>
        <SavingsBadge amount={rec.estimatedMonthlySavings} />
      </div>
      <div className="bg-gray-900 rounded-lg p-3 mb-2">
        <p className="text-green-300 text-sm font-medium mb-1">→ {rec.recommendedAction}</p>
        <p className="text-gray-400 text-sm">{rec.reasoning}</p>
      </div>
      {rec.estimatedMonthlySavings > 0 && (
        <p className="text-xs text-gray-500">Annual savings: ${rec.estimatedAnnualSavings.toLocaleString()}</p>
      )}
    </div>
  );
}

function LeadCapture({ auditId, savings }: { auditId: string; savings: number }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honey, setHoney] = useState(""); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, companyName: company, role, auditId, honeypot: honey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      toast.success("Report sent! Check your inbox.");
    } catch {
      toast.error("Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✉️</div>
        <h3 className="text-white font-semibold mb-1">Report sent!</h3>
        <p className="text-gray-400 text-sm">Check your inbox for your full audit breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-1">
        {savings > 0 ? "Get this report in your inbox" : "Stay updated on new optimizations"}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {savings > 100 ? "We'll also reach out about Credex credits to capture even more savings." : "We'll notify you when new savings apply to your stack."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — hidden from real users */}
        <input type="text" value={honey} onChange={(e) => setHoney(e.target.value)}
          style={{ display: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input type="email" required placeholder="Work email *" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
          />
          <input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Sending..." : "Send me the report"}
        </button>
      </form>
    </div>
  );
}

export default function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then((r) => r.json())
      .then(setResult)
      .catch(() => toast.error("Audit not found"))
      .finally(() => setLoading(false));
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-lg animate-pulse">Loading your audit...</div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg mb-4">Audit not found.</p>
        <a href="/" className="text-green-400 hover:underline">Start a new audit →</a>
      </div>
    </div>
  );

  const isHighSavings = result.totalMonthlySavings > 500;
  const isOptimal = result.totalMonthlySavings < 100;

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* Hero savings */}
        <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Total potential savings</p>
          {isOptimal ? (
            <>
              <div className="text-5xl font-bold text-green-400 mb-2">You&apos;re spending well</div>
              <p className="text-gray-400">Less than $100/month in savings found — your AI stack is well-optimised.</p>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold text-green-400 mb-1">
                ${result.totalMonthlySavings.toLocaleString()}<span className="text-3xl text-gray-400">/mo</span>
              </div>
              <div className="text-2xl text-gray-300 mb-2">
                ${result.totalAnnualSavings.toLocaleString()} per year
              </div>
              <p className="text-gray-400 text-sm">Based on {result.recommendations.length} tools audited for a {result.input.teamSize}-person team</p>
            </>
          )}
        </div>

        {/* AI Summary */}
        {result.aiSummary && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">AI Analyst Summary</p>
            <p className="text-gray-300 leading-relaxed">{result.aiSummary}</p>
          </div>
        )}

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-2">Capture even more savings with Credex</h2>
            <p className="text-gray-300 mb-4">
              Your team qualifies for discounted AI credits from Credex — real savings on the same Cursor, Claude, and ChatGPT plans, sourced from companies that overforecast.
            </p>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Book a Credex consultation →
            </a>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Tool-by-tool breakdown</h2>
          {result.recommendations.map((rec) => (
            <RecommendationCard key={rec.toolId} rec={rec} />
          ))}
        </div>

        {/* Lead capture */}
        <LeadCapture auditId={result.id} savings={result.totalMonthlySavings} />

        {/* Share */}
        <div className="flex items-center gap-3">
          <button onClick={copyLink}
            className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl py-3 text-sm transition-colors"
          >
            {copied ? "Link copied! ✓" : "Share this audit"}
          </button>
          <a href="/" className="flex-1 text-center border border-green-800 hover:border-green-600 text-green-400 rounded-xl py-3 text-sm transition-colors">
            Audit another team →
          </a>
        </div>
      </div>
    </main>
  );
}

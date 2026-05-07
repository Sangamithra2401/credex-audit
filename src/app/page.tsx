"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuditInput, ToolEntry, ToolId, UseCase } from "@/lib/types";

const TOOLS: { id: ToolId; name: string; plans: string[] }[] = [
  { id: "cursor", name: "Cursor", plans: ["hobby", "pro", "business", "enterprise"] },
  { id: "github_copilot", name: "GitHub Copilot", plans: ["individual", "business", "enterprise"] },
  { id: "claude", name: "Claude", plans: ["free", "pro", "max", "team", "enterprise"] },
  { id: "chatgpt", name: "ChatGPT", plans: ["plus", "team", "enterprise"] },
  { id: "anthropic_api", name: "Anthropic API", plans: ["api_direct"] },
  { id: "openai_api", name: "OpenAI API", plans: ["api_direct"] },
  { id: "gemini", name: "Gemini", plans: ["pro", "ultra", "api"] },
  { id: "windsurf", name: "Windsurf", plans: ["free", "pro", "teams", "enterprise"] },
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding / Engineering" },
  { value: "writing", label: "Writing / Content" },
  { value: "data", label: "Data Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed / General" },
];

const DEFAULT_TOOL: ToolEntry = { toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 };
const STORAGE_KEY = "credex_audit_form";

export default function HomePage() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolEntry[]>([{ ...DEFAULT_TOOL }]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [loading, setLoading] = useState(false);

  // Persist form state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { tools: t, teamSize: ts, useCase: uc } = JSON.parse(saved);
        setTools(t); setTeamSize(ts); setUseCase(uc);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
  }, [tools, teamSize, useCase]);

  function addTool() {
    setTools([...tools, { ...DEFAULT_TOOL }]);
  }

  function removeTool(i: number) {
    setTools(tools.filter((_, idx) => idx !== i));
  }

  function updateTool(i: number, field: keyof ToolEntry, value: string | number) {
    const updated = [...tools];
    if (field === "monthlySpend" || field === "seats") {
      (updated[i] as Record<string, unknown>)[field] = Number(value);
    } else {
      (updated[i] as Record<string, unknown>)[field] = value;
      if (field === "toolId") {
        const tool = TOOLS.find((t) => t.id === value);
        updated[i].plan = tool?.plans[0] ?? "pro";
      }
    }
    setTools(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tools.length === 0) { toast.error("Add at least one tool"); return; }
    setLoading(true);
    try {
      const input: AuditInput = { tools, teamSize, useCase };
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/audit/${data.id}`);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="text-center px-4 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 bg-green-900/30 text-green-400 text-sm px-3 py-1 rounded-full mb-6 border border-green-800">
          Free · No login required · Results in 60 seconds
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 leading-tight">
          Stop overpaying for<br />
          <span className="text-green-400">AI tools.</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-8">
          See exactly where your team is wasting money on Cursor, Claude, ChatGPT, and more. Get a free audit with real savings numbers — no fluff.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Team size</label>
              <input
                type="number" min={1} value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Primary use case</label>
              <select
                value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              >
                {USE_CASES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Your AI tools</h2>
              <button type="button" onClick={addTool}
                className="text-sm text-green-400 hover:text-green-300 border border-green-800 rounded-lg px-3 py-1"
              >+ Add tool</button>
            </div>

            {tools.map((tool, i) => {
              const toolDef = TOOLS.find((t) => t.id === tool.toolId);
              return (
                <div key={i} className="bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Tool {i + 1}</span>
                    {tools.length > 1 && (
                      <button type="button" onClick={() => removeTool(i)} className="text-gray-500 hover:text-red-400 text-sm">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-400 mb-1">Tool</label>
                      <select value={tool.toolId} onChange={(e) => updateTool(i, "toolId", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                      >
                        {TOOLS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Plan</label>
                      <select value={tool.plan} onChange={(e) => updateTool(i, "plan", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                      >
                        {toolDef?.plans.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Monthly $</label>
                      <input type="number" min={0} value={tool.monthlySpend}
                        onChange={(e) => updateTool(i, "monthlySpend", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Seats</label>
                      <input type="number" min={1} value={tool.seats}
                        onChange={(e) => updateTool(i, "seats", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
          >
            {loading ? "Analysing your spend..." : "Get my free audit →"}
          </button>
          <p className="text-center text-xs text-gray-600">No account needed. Email captured only if you want your report.</p>
        </form>
      </section>
    </main>
  );
}

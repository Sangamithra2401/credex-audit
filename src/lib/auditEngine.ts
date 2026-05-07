// Audit engine — rules-based, no AI. Defensible math only.
import { AuditInput, AuditResult, Recommendation, ToolId } from "./types";
import { PRICING } from "./pricing";
import { nanoid } from "nanoid";

const TOOL_NAMES: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

function auditCursor(plan: string, monthlySpend: number, seats: number, useCase: string): Partial<Recommendation> {
  const pricePerSeat = monthlySpend / seats;

  // Business plan for <=2 users is overkill vs Pro
  if (plan === "business" && seats <= 2) {
    const savings = seats * (40 - 20);
    return {
      recommendedAction: "Downgrade to Cursor Pro",
      recommendedPlan: "pro",
      estimatedMonthlySavings: savings,
      reasoning: `Business plan at $40/seat makes sense for teams needing SSO and admin controls. With only ${seats} user(s), Pro ($20/seat) covers all coding features and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  // Enterprise for <5 users is almost certainly overkill
  if (plan === "enterprise" && seats < 5) {
    const savings = seats * (60 - 40);
    return {
      recommendedAction: "Downgrade to Cursor Business",
      recommendedPlan: "business",
      estimatedMonthlySavings: savings,
      reasoning: `Enterprise pricing ($60/seat) is designed for large orgs with compliance needs. With ${seats} seat(s), Business ($40/seat) has the same core features and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  // Overpaying per seat relative to plan price
  if (pricePerSeat > 40 && plan === "pro") {
    return {
      recommendedAction: "Review billing — you may be on the wrong plan",
      estimatedMonthlySavings: 0,
      reasoning: `You entered $${pricePerSeat.toFixed(0)}/seat but Cursor Pro is $20/seat. Check your invoice — you may have been auto-upgraded or billed incorrectly.`,
      isOptimal: false,
    };
  }

  // Windsurf is a cheaper alternative for non-power-users
  if (plan === "pro" && useCase !== "coding" && seats >= 3) {
    const windsurfCost = seats * 15;
    const savings = monthlySpend - windsurfCost;
    if (savings > 0) {
      return {
        recommendedAction: "Consider Windsurf Pro as alternative",
        estimatedMonthlySavings: savings,
        reasoning: `For ${useCase} use cases, Windsurf Pro ($15/seat) offers comparable AI code completion at 25% less cost. Switching ${seats} seats saves ~$${savings}/mo.`,
        isOptimal: false,
      };
    }
  }

  return {
    recommendedAction: "No changes needed",
    estimatedMonthlySavings: 0,
    reasoning: `Your Cursor ${plan} plan is appropriately sized for ${seats} user(s) and a ${useCase} workflow.`,
    isOptimal: true,
  };
}

function auditGithubCopilot(plan: string, monthlySpend: number, seats: number, useCase: string): Partial<Recommendation> {
  // Individual plan billed as team
  if (plan === "business" && seats === 1) {
    const savings = 19 - 10;
    return {
      recommendedAction: "Downgrade to Individual plan",
      recommendedPlan: "individual",
      estimatedMonthlySavings: savings,
      reasoning: `GitHub Copilot Business ($19/seat) adds policy management for teams. With 1 user, Individual ($10/seat) has all the same AI features and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  if (plan === "enterprise" && seats < 10) {
    const savings = seats * (39 - 19);
    return {
      recommendedAction: "Downgrade to Business plan",
      recommendedPlan: "business",
      estimatedMonthlySavings: savings,
      reasoning: `Copilot Enterprise ($39/seat) adds fine-tuned models and enterprise security. Under 10 seats, Business ($19/seat) provides full functionality and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  // Non-coding use case — Copilot is IDE-only, poor fit
  if (useCase !== "coding" && useCase !== "mixed") {
    const savings = Math.round(monthlySpend * 0.5);
    return {
      recommendedAction: "Replace with Claude Pro or ChatGPT Plus for non-coding work",
      estimatedMonthlySavings: savings,
      reasoning: `GitHub Copilot is an IDE tool — it's poor value for ${useCase} workflows. Claude Pro ($20/seat) or ChatGPT Plus ($20/seat) provide far better coverage for non-coding tasks.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "Spending looks appropriate",
    estimatedMonthlySavings: 0,
    reasoning: `GitHub Copilot ${plan} is a reasonable choice for a ${seats}-person coding team.`,
    isOptimal: true,
  };
}

function auditClaude(plan: string, monthlySpend: number, seats: number): Partial<Recommendation> {
  if (plan === "team" && seats <= 2) {
    const savings = seats * (30 - 20);
    return {
      recommendedAction: "Downgrade to Claude Pro",
      recommendedPlan: "pro",
      estimatedMonthlySavings: savings,
      reasoning: `Claude Team ($30/seat) adds collaboration features but requires minimum billing of 5 seats. With ${seats} seat(s), Pro ($20/seat) covers all model access and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  if (plan === "max" && seats > 1) {
    const savings = seats * (100 - 30);
    return {
      recommendedAction: "Switch majority of seats to Claude Team",
      recommendedPlan: "team",
      estimatedMonthlySavings: savings,
      reasoning: `Claude Max ($100/seat) is for power users who need 5× usage limits. Most team members don't hit Pro limits. Switching to Team ($30/seat) saves $${savings}/mo with no practical difference for typical usage.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "Claude plan is well-matched",
    estimatedMonthlySavings: 0,
    reasoning: `Claude ${plan} is appropriately matched to ${seats} user(s).`,
    isOptimal: true,
  };
}

function auditChatGPT(plan: string, monthlySpend: number, seats: number): Partial<Recommendation> {
  if (plan === "plus" && seats > 1) {
    // Plus is individual — multiple "seats" means multiple individual accounts
    const teamCost = seats * 30;
    const plusCost = seats * 20;
    if (teamCost - plusCost > 0) {
      return {
        recommendedAction: "Consider moving to Team plan for multi-user features",
        recommendedPlan: "team",
        estimatedMonthlySavings: 0,
        reasoning: `ChatGPT Plus ($20/seat) is individual-only. With ${seats} users, Team ($30/seat) adds shared workspace and admin controls. It costs more but is the correct plan tier — you may be violating ToS on individual accounts.`,
        isOptimal: false,
      };
    }
  }

  if (plan === "enterprise" && seats < 10) {
    const savings = seats * (60 - 30);
    return {
      recommendedAction: "Downgrade to Team plan",
      recommendedPlan: "team",
      estimatedMonthlySavings: savings,
      reasoning: `ChatGPT Enterprise ($60/seat) is built for compliance-heavy orgs with SSO. Under 10 seats, Team ($30/seat) has the same model access and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "ChatGPT plan looks right",
    estimatedMonthlySavings: 0,
    reasoning: `ChatGPT ${plan} is appropriately matched for ${seats} user(s).`,
    isOptimal: true,
  };
}

function auditAPITool(toolId: ToolId, monthlySpend: number): Partial<Recommendation> {
  // API billing is usage-based — we check if spend seems high relative to seat-based alternatives
  if (monthlySpend > 100) {
    const potentialSavings = Math.round(monthlySpend * 0.2);
    return {
      recommendedAction: "Review usage and consider prompt caching / batching",
      estimatedMonthlySavings: potentialSavings,
      reasoning: `At $${monthlySpend}/mo on API spend, enabling prompt caching (saves up to 90% on repeated prompts) and Batch API (50% discount on non-latency-sensitive work) could save ~$${potentialSavings}/mo without changing capabilities.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "API spend looks reasonable",
    estimatedMonthlySavings: 0,
    reasoning: `API spend of $${monthlySpend}/mo is modest. No immediate optimization needed beyond monitoring for sudden spikes.`,
    isOptimal: true,
  };
}

function auditGemini(plan: string, monthlySpend: number, seats: number, useCase: string): Partial<Recommendation> {
  if (plan === "ultra" && useCase === "coding") {
    const savings = seats * (20 - 0); // Gemini free tier is competitive for coding
    return {
      recommendedAction: "Switch to Claude Pro or ChatGPT for coding tasks",
      estimatedMonthlySavings: Math.round(monthlySpend * 0.4),
      reasoning: `Gemini Ultra is strongest for multimodal/Google Workspace workflows. For coding, Cursor or GitHub Copilot provide deeper IDE integration at similar cost. Consider reallocating.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "Gemini spend looks appropriate",
    estimatedMonthlySavings: 0,
    reasoning: `Gemini ${plan} is a reasonable choice for ${useCase} workflows, especially within the Google ecosystem.`,
    isOptimal: true,
  };
}

function auditWindsurf(plan: string, monthlySpend: number, seats: number): Partial<Recommendation> {
  if (plan === "enterprise" && seats < 5) {
    const savings = seats * (45 - 30);
    return {
      recommendedAction: "Downgrade to Windsurf Teams",
      recommendedPlan: "teams",
      estimatedMonthlySavings: savings,
      reasoning: `Windsurf Enterprise ($45/seat) is for large orgs needing on-prem or compliance. With ${seats} seat(s), Teams ($30/seat) has equivalent coding features and saves $${savings}/mo.`,
      isOptimal: false,
    };
  }

  return {
    recommendedAction: "Windsurf plan looks right",
    estimatedMonthlySavings: 0,
    reasoning: `Windsurf ${plan} is appropriately matched for ${seats} user(s).`,
    isOptimal: true,
  };
}

export function runAudit(input: AuditInput): Omit<AuditResult, "aiSummary"> {
  const recommendations: Recommendation[] = input.tools.map((tool) => {
    let partial: Partial<Recommendation>;

    switch (tool.toolId) {
      case "cursor":
        partial = auditCursor(tool.plan, tool.monthlySpend, tool.seats, input.useCase);
        break;
      case "github_copilot":
        partial = auditGithubCopilot(tool.plan, tool.monthlySpend, tool.seats, input.useCase);
        break;
      case "claude":
        partial = auditClaude(tool.plan, tool.monthlySpend, tool.seats);
        break;
      case "chatgpt":
        partial = auditChatGPT(tool.plan, tool.monthlySpend, tool.seats);
        break;
      case "anthropic_api":
      case "openai_api":
        partial = auditAPITool(tool.toolId, tool.monthlySpend);
        break;
      case "gemini":
        partial = auditGemini(tool.plan, tool.monthlySpend, tool.seats, input.useCase);
        break;
      case "windsurf":
        partial = auditWindsurf(tool.plan, tool.monthlySpend, tool.seats);
        break;
      default:
        partial = { recommendedAction: "No data", estimatedMonthlySavings: 0, reasoning: "Tool not recognized.", isOptimal: true };
    }

    const monthly = partial.estimatedMonthlySavings ?? 0;
    return {
      toolId: tool.toolId,
      toolName: TOOL_NAMES[tool.toolId],
      currentPlan: tool.plan,
      currentMonthlySpend: tool.monthlySpend,
      recommendedAction: partial.recommendedAction ?? "No changes needed",
      recommendedPlan: partial.recommendedPlan,
      estimatedMonthlySavings: monthly,
      estimatedAnnualSavings: monthly * 12,
      reasoning: partial.reasoning ?? "",
      isOptimal: partial.isOptimal ?? true,
    };
  });

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);

  return {
    id: nanoid(10),
    input,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    createdAt: new Date().toISOString(),
  };
}

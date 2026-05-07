// All shared TypeScript types for the app

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number; // USD, total (not per seat)
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface Recommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  reasoning: string;
  isOptimal: boolean;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: Recommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  createdAt: string;
}

export interface LeadCapture {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}

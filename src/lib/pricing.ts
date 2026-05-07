// All pricing data — sourced from official vendor pages
// Last verified: 2025-05-07
// Every number traces to PRICING_DATA.md

export const PRICING = {
  cursor: {
    name: "Cursor",
    plans: {
      hobby: { label: "Hobby", pricePerSeat: 0, source: "https://cursor.sh/pricing" },
      pro: { label: "Pro", pricePerSeat: 20, source: "https://cursor.sh/pricing" },
      business: { label: "Business", pricePerSeat: 40, source: "https://cursor.sh/pricing" },
      enterprise: { label: "Enterprise", pricePerSeat: 60, source: "https://cursor.sh/pricing" },
    },
  },
  github_copilot: {
    name: "GitHub Copilot",
    plans: {
      individual: { label: "Individual", pricePerSeat: 10, source: "https://github.com/features/copilot#pricing" },
      business: { label: "Business", pricePerSeat: 19, source: "https://github.com/features/copilot#pricing" },
      enterprise: { label: "Enterprise", pricePerSeat: 39, source: "https://github.com/features/copilot#pricing" },
    },
  },
  claude: {
    name: "Claude",
    plans: {
      free: { label: "Free", pricePerSeat: 0, source: "https://claude.ai/upgrade" },
      pro: { label: "Pro", pricePerSeat: 20, source: "https://claude.ai/upgrade" },
      max: { label: "Max", pricePerSeat: 100, source: "https://claude.ai/upgrade" },
      team: { label: "Team", pricePerSeat: 30, source: "https://claude.ai/upgrade" },
      enterprise: { label: "Enterprise", pricePerSeat: 60, source: "https://www.anthropic.com/enterprise" },
    },
  },
  chatgpt: {
    name: "ChatGPT",
    plans: {
      plus: { label: "Plus", pricePerSeat: 20, source: "https://openai.com/chatgpt/pricing" },
      team: { label: "Team", pricePerSeat: 30, source: "https://openai.com/chatgpt/pricing" },
      enterprise: { label: "Enterprise", pricePerSeat: 60, source: "https://openai.com/chatgpt/pricing" },
    },
  },
  anthropic_api: {
    name: "Anthropic API",
    plans: {
      api_direct: { label: "API Direct", pricePerSeat: 0, source: "https://www.anthropic.com/pricing" },
    },
  },
  openai_api: {
    name: "OpenAI API",
    plans: {
      api_direct: { label: "API Direct", pricePerSeat: 0, source: "https://openai.com/pricing" },
    },
  },
  gemini: {
    name: "Gemini",
    plans: {
      pro: { label: "Pro", pricePerSeat: 20, source: "https://one.google.com/about/plans" },
      ultra: { label: "Ultra", pricePerSeat: 20, source: "https://one.google.com/about/plans" },
      api: { label: "API", pricePerSeat: 0, source: "https://ai.google.dev/pricing" },
    },
  },
  windsurf: {
    name: "Windsurf",
    plans: {
      free: { label: "Free", pricePerSeat: 0, source: "https://codeium.com/windsurf/pricing" },
      pro: { label: "Pro", pricePerSeat: 15, source: "https://codeium.com/windsurf/pricing" },
      teams: { label: "Teams", pricePerSeat: 30, source: "https://codeium.com/windsurf/pricing" },
      enterprise: { label: "Enterprise", pricePerSeat: 45, source: "https://codeium.com/windsurf/pricing" },
    },
  },
} as const;

export type PricingToolId = keyof typeof PRICING;

# Prompts

## AI Summary Prompt (used in `/api/audit/route.ts`)

```
You are a concise financial analyst. Write a single paragraph (100 words max) summarizing this AI tool spend audit for a {teamSize}-person team whose primary use case is {useCase}.

Tools audited: {toolList}
Total monthly savings identified: ${totalMonthlySavings}
Key recommendations: {recommendations joined by "; "}

Write in second person ("you/your team"). Be specific with numbers. Be honest — if savings are low, say so. Do not mention Credex. Do not use bullet points.
```

### Why I wrote it this way

- **"Financial analyst" persona** constrains the model away from cheerleading and toward honest numbers.
- **100-word max** prevents padding. First drafts without this were 200+ words.
- **"Do not mention Credex"** keeps the summary neutral — the Credex CTA is a separate UI element, not baked into the AI output.
- **"Do not use bullet points"** was added after the first 10 test runs — the model kept defaulting to a list format despite the "single paragraph" instruction.
- **Second person** makes the output feel personal without being generic.

### What I tried that didn't work

1. **"You are a helpful AI assistant..."** — Too generic. Output was marketing copy, not honest analysis.
2. **Asking for 3 bullet points** — Looked fine visually but was harder to skim than a well-written paragraph.
3. **Including full pricing tables in the prompt** — Made the context too long, increased latency, and the model started hallucinating tool names.
4. **Asking it to mention the Credex CTA** — The summary felt like an ad. Removed it.

### Fallback

If the Anthropic API call fails (network error, 429, 500), the code falls back to a deterministic template in `fallbackSummary()` in the same file. The fallback uses the same inputs but generates copy via string interpolation — no AI, always works.

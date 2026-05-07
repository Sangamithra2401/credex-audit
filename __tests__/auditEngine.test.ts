import { runAudit } from "../src/lib/auditEngine";
import { AuditInput } from "../src/lib/types";

// Helper
function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    tools: [],
    teamSize: 3,
    useCase: "coding",
    ...overrides,
  };
}

describe("Audit Engine", () => {
  // Test 1: Cursor Business with ≤2 seats should recommend Pro
  test("Cursor Business with 2 seats recommends Pro downgrade", () => {
    const input = makeInput({
      tools: [{ toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 }],
    });
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.estimatedMonthlySavings).toBe(40); // 2 * (40 - 20)
    expect(rec.isOptimal).toBe(false);
    expect(rec.recommendedPlan).toBe("pro");
  });

  // Test 2: Cursor Pro with 1 seat should be optimal
  test("Cursor Pro with 1 seat is flagged as optimal", () => {
    const input = makeInput({
      tools: [{ toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }],
    });
    const result = runAudit(input);
    expect(result.recommendations[0].isOptimal).toBe(true);
    expect(result.totalMonthlySavings).toBe(0);
  });

  // Test 3: GitHub Copilot Business with 1 seat should recommend Individual
  test("GitHub Copilot Business with 1 seat recommends Individual", () => {
    const input = makeInput({
      tools: [{ toolId: "github_copilot", plan: "business", monthlySpend: 19, seats: 1 }],
    });
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.estimatedMonthlySavings).toBe(9); // 19 - 10
    expect(rec.isOptimal).toBe(false);
  });

  // Test 4: Claude Team with 2 seats should recommend Pro
  test("Claude Team with ≤2 seats recommends Pro downgrade", () => {
    const input = makeInput({
      tools: [{ toolId: "claude", plan: "team", monthlySpend: 60, seats: 2 }],
    });
    const result = runAudit(input);
    expect(result.recommendations[0].estimatedMonthlySavings).toBe(20); // 2 * (30 - 20)
    expect(result.recommendations[0].isOptimal).toBe(false);
  });

  // Test 5: Multiple tools — total savings is sum of all
  test("Total monthly savings is the sum of all tool recommendations", () => {
    const input = makeInput({
      tools: [
        { toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 },  // saves 40
        { toolId: "github_copilot", plan: "business", monthlySpend: 19, seats: 1 }, // saves 9
      ],
    });
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(49);
    expect(result.totalAnnualSavings).toBe(49 * 12);
  });

  // Test 6: API tool with high spend flags optimization
  test("Anthropic API with spend >$100 recommends caching optimizations", () => {
    const input = makeInput({
      tools: [{ toolId: "anthropic_api", plan: "api_direct", monthlySpend: 500, seats: 1 }],
    });
    const result = runAudit(input);
    expect(result.recommendations[0].isOptimal).toBe(false);
    expect(result.recommendations[0].estimatedMonthlySavings).toBeGreaterThan(0);
  });

  // Test 7: ChatGPT Enterprise with <10 seats recommends Team
  test("ChatGPT Enterprise with 5 seats recommends Team downgrade", () => {
    const input = makeInput({
      tools: [{ toolId: "chatgpt", plan: "enterprise", monthlySpend: 300, seats: 5 }],
    });
    const result = runAudit(input);
    expect(result.recommendations[0].estimatedMonthlySavings).toBe(150); // 5 * (60 - 30)
  });

  // Test 8: Audit result has correct ID and timestamp format
  test("Audit result has a non-empty ID and valid ISO timestamp", () => {
    const input = makeInput({
      tools: [{ toolId: "windsurf", plan: "pro", monthlySpend: 15, seats: 1 }],
    });
    const result = runAudit(input);
    expect(result.id).toBeTruthy();
    expect(result.id.length).toBeGreaterThan(0);
    expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
  });
});

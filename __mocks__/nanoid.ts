// Mock nanoid for Jest (nanoid v5 is ESM-only)
export const nanoid = (size?: number) => "test_" + Math.random().toString(36).slice(2, size ?? 10);

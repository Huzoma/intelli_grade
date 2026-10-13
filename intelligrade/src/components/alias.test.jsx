import { describe, expect, it } from "vitest";

import MetricCard from "@/components/MetricCard";

// Config guard: proves the "@/*" alias and the JSX transform both work in the
// jsdom project. Kept thin on purpose (spec 0001, AC-3).
describe("@/* alias in the jsdom project", () => {
  it("resolves a component through the alias", () => {
    expect(typeof MetricCard).toBe("function");
  });
});

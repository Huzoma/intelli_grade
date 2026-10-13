import { describe, expect, it } from "vitest";

import { config, proxy } from "@/proxy";

// Config guard: proves the "@/*" alias resolves for a plain module in the Node
// project, and that the runner boots. Kept thin on purpose (spec 0001, AC-3).
describe("@/* alias in the node project", () => {
  it("resolves a plain module through the alias", () => {
    expect(typeof proxy).toBe("function");
  });

  it("keeps the route matcher the guard depends on", () => {
    expect(config.matcher).toEqual(["/login", "/student/:path*", "/lecturer/:path*"]);
  });
});

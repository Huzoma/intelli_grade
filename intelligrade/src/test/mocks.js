import { vi } from "vitest";

// Shared test doubles for the boundaries the unit layer mocks: the Next.js
// request and cache APIs, the navigation router, and the Prisma singleton.
//
// Vitest only honours `vi.mock` inside the test file (or a setup file), so the
// wiring lives there. These builders supply the shapes, which the test file
// reaches through an async mock factory:
//
//   vi.mock("@/lib/prisma", async () => {
//     const { createPrismaMock } = await import("@/test/mocks");
//     return { prisma: createPrismaMock() };
//   });
//
// A test then imports the mocked module and asserts on the returned spies.

/**
 * A stand-in for the async Next.js cookie store, covering the calls the app
 * makes. Pass initial cookies as `{ name: value }`.
 */
export function createCookieStore(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    get: vi.fn((name) => (values.has(name) ? { name, value: values.get(name) } : undefined)),
    has: vi.fn((name) => values.has(name)),
    set: vi.fn((name, value) => {
      values.set(name, value);
    }),
    delete: vi.fn((name) => {
      values.delete(name);
    }),
  };
}

/**
 * A stand-in for the Prisma singleton. Every model method is a spy that
 * resolves to undefined until a test gives it a value with
 * `mockResolvedValue`, so an un-stubbed call fails loudly instead of hanging.
 */
export function createPrismaMock() {
  const model = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  });

  return {
    user: model(),
    submission: model(),
    rubric: model(),
    vivaQuestion: model(),
    comment: model(),
  };
}

/** A stand-in for the `next/navigation` client router. */
export function createRouterMock() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };
}

/** A stand-in for `next/cache`. */
export function createCacheMock() {
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  };
}

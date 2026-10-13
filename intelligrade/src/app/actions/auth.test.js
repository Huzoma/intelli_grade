import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import { buildUser } from "@/test/factories";

vi.mock("next/headers", async () => {
  const { createCookieStore } = await import("@/test/mocks");
  const cookieStore = createCookieStore();
  return {
    cookies: async () => cookieStore,
    headers: async () => new Headers(),
  };
});

vi.mock("next/navigation", async () => {
  const { createRouterMock } = await import("@/test/mocks");
  return {
    redirect: vi.fn(),
    useRouter: () => createRouterMock(),
    usePathname: () => "/login",
    useSearchParams: () => new URLSearchParams(),
  };
});

vi.mock("@/lib/prisma", async () => {
  const { createPrismaMock } = await import("@/test/mocks");
  return { prisma: createPrismaMock() };
});

const PASSWORD = "correct horse battery staple";
const SESSION_COOKIE = "intelligrade_session";

// Mirrors the hashing inside src/app/actions/auth.js.
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loginAction", () => {
  it("writes the session cookie and returns the role on success", async () => {
    const user = buildUser({
      email: "student@university.edu",
      role: "STUDENT",
      password: hashPassword(PASSWORD),
    });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await loginAction(user.email, PASSWORD, "STUDENT");

    expect(result).toEqual({ success: true, role: "STUDENT" });

    const cookieStore = await cookies();
    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      JSON.stringify({ userId: user.id, role: "STUDENT" }),
      expect.objectContaining({ httpOnly: true, path: "/" })
    );
  });

  it("returns the error shape without writing a cookie when the password is wrong", async () => {
    const user = buildUser({
      email: "student@university.edu",
      password: hashPassword("some other password"),
    });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await loginAction(user.email, PASSWORD, "STUDENT");

    expect(result).toEqual({ error: "Invalid email or password" });

    const cookieStore = await cookies();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("returns the same error when no account matches the email", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await loginAction("nobody@university.edu", PASSWORD, "STUDENT");

    expect(result).toEqual({ error: "Invalid email or password" });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a role override that does not match the account", async () => {
    const user = buildUser({
      email: "student@university.edu",
      role: "STUDENT",
      password: hashPassword(PASSWORD),
    });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await loginAction(user.email, PASSWORD, "LECTURER");

    expect(result).toEqual({ error: "User is not registered as a LECTURER" });

    const cookieStore = await cookies();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

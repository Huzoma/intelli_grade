import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginPage from "@/app/(auth)/login/page";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";

vi.mock("@/app/actions/auth", () => ({ loginAction: vi.fn() }));

vi.mock("next/navigation", async () => {
  const { createRouterMock } = await import("@/test/mocks");
  const router = createRouterMock();
  return {
    redirect: vi.fn(),
    useRouter: () => router,
    usePathname: () => "/login",
    useSearchParams: () => new URLSearchParams(),
  };
});

// Vitest runs with `globals` off, so React Testing Library's automatic cleanup
// is not registered and each test must unmount its own tree.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  loginAction.mockReset();
  vi.clearAllMocks();
});

function renderLogin() {
  return render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );
}

function submitButton() {
  return screen.getByRole("button", { name: /sign in to dashboard/i });
}

describe("login screen", () => {
  it("renders the seeded credentials and the sign in controls", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue("uzoma@university.edu");
    expect(screen.getByLabelText(/^password$/i)).toHaveValue("password");
    expect(submitButton()).toBeInTheDocument();
  });

  it("shows the error the action returned and does not navigate", async () => {
    const user = userEvent.setup();
    loginAction.mockResolvedValue({ error: "Invalid email or password" });

    renderLogin();
    await user.click(submitButton());

    expect(loginAction).toHaveBeenCalledWith("uzoma@university.edu", "password", "STUDENT");
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("clears a previous error and navigates when a later attempt succeeds", async () => {
    const user = userEvent.setup();
    loginAction.mockResolvedValueOnce({ error: "Invalid email or password" });
    loginAction.mockResolvedValueOnce({ success: true, role: "STUDENT" });

    renderLogin();

    await user.click(submitButton());
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();

    await user.click(submitButton());

    await waitFor(() => expect(useRouter().push).toHaveBeenCalledWith("/student"));
    // The banner leaves through Framer Motion's exit animation, so it is waited for.
    await waitFor(() =>
      expect(screen.queryByText("Invalid email or password")).not.toBeInTheDocument()
    );
  });

  it("sends a lecturer to the lecturer dashboard", async () => {
    const user = userEvent.setup();
    loginAction.mockResolvedValue({ success: true, role: "LECTURER" });

    renderLogin();
    await user.click(screen.getByRole("button", { name: /lecturer/i }));
    await user.click(submitButton());

    await waitFor(() => expect(useRouter().push).toHaveBeenCalledWith("/lecturer"));
    expect(loginAction).toHaveBeenCalledWith("eric@university.edu", "password", "LECTURER");
  });
});

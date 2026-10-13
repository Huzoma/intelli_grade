import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

const ORIGIN = "http://localhost:3000";

// The guard only reads `url`, `nextUrl.pathname` and `cookies.get`, so a plain
// object is a truer double than a whole Next.js request.
function createRequest(pathname, sessionValue) {
  return {
    url: `${ORIGIN}${pathname}`,
    nextUrl: { pathname },
    cookies: {
      get: (name) => (sessionValue === undefined ? undefined : { name, value: sessionValue }),
    },
  };
}

function sessionFor(role) {
  return JSON.stringify({ userId: "user_1", role });
}

function redirectTarget(response) {
  return response.headers.get("location");
}

describe("proxy route guard", () => {
  describe("on /student", () => {
    it("redirects a request with no session to /login", () => {
      const response = proxy(createRequest("/student", undefined));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/login`);
    });

    it("redirects a lecturer session to /login", () => {
      const response = proxy(createRequest("/student", sessionFor("LECTURER")));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/login`);
    });

    it("lets a student session through", () => {
      const response = proxy(createRequest("/student", sessionFor("STUDENT")));

      expect(response.status).toBe(200);
      expect(redirectTarget(response)).toBeNull();
    });

    it("redirects a session it cannot parse to /login", () => {
      const response = proxy(createRequest("/student", "not-json"));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/login`);
    });
  });

  describe("on /lecturer", () => {
    it("redirects a request with no session to /login", () => {
      const response = proxy(createRequest("/lecturer", undefined));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/login`);
    });

    it("redirects a student session to /login", () => {
      const response = proxy(createRequest("/lecturer/roster", sessionFor("STUDENT")));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/login`);
    });

    it("lets a lecturer session through", () => {
      const response = proxy(createRequest("/lecturer/roster", sessionFor("LECTURER")));

      expect(response.status).toBe(200);
      expect(redirectTarget(response)).toBeNull();
    });
  });

  describe("on /login", () => {
    it("lets a signed out visitor through", () => {
      const response = proxy(createRequest("/login", undefined));

      expect(response.status).toBe(200);
      expect(redirectTarget(response)).toBeNull();
    });

    it("sends a student session to the student dashboard", () => {
      const response = proxy(createRequest("/login", sessionFor("STUDENT")));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/student`);
    });

    it("sends a lecturer session to the lecturer dashboard", () => {
      const response = proxy(createRequest("/login", sessionFor("LECTURER")));

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe(`${ORIGIN}/lecturer`);
    });
  });

  it("leaves an unmatched path untouched", () => {
    const response = proxy(createRequest("/", undefined));

    expect(response.status).toBe(200);
    expect(redirectTarget(response)).toBeNull();
  });
});

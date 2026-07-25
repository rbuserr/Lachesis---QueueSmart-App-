// AUTHENTICATION MODULE TESTS (Eduardo)

import { beforeEach, describe, expect, it } from "vitest";

import { POST as loginRoute } from "@/app/api/auth/login/route";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import {
  validateLoginInput,
  validateRegisterInput,
} from "@/lib/validations";
import { appStore } from "@/server/app-store";
import {
  findUserByEmail,
  loginUser,
  registerUser,
} from "@/server/auth";

const initialUsers = appStore.users.map((user) => ({ ...user }));

function jsonRequest(path: string, body: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Authentication validation", () => {
  it("accepts valid registration and login inputs", () => {
    expect(
      validateRegisterInput({
        name: "Eduardo Flores",
        email: "eduardo@example.com",
        password: "Password123",
      })
    ).toEqual([]);
    expect(
      validateLoginInput({
        email: "eduardo@example.com",
        password: "Password123",
      })
    ).toEqual([]);
  });

  it.each([
    [
      { name: "", email: "valid@example.com", password: "Password123" },
      "Name is required",
    ],
    [
      { name: "E", email: "valid@example.com", password: "Password123" },
      "Name must be at least 2 characters",
    ],
    [
      {
        name: "E".repeat(51),
        email: "valid@example.com",
        password: "Password123",
      },
      "Name must not exceed 50 characters",
    ],
    [
      { name: "Eduardo", email: "invalid", password: "Password123" },
      "Email format is invalid",
    ],
    [
      {
        name: "Eduardo",
        email: `${"e".repeat(90)}@example.com`,
        password: "Password123",
      },
      "Email must not exceed 100 characters",
    ],
    [
      { name: "Eduardo", email: "valid@example.com", password: "short" },
      "Password must be at least 8 characters",
    ],
    [
      {
        name: "Eduardo",
        email: "valid@example.com",
        password: "P".repeat(65),
      },
      "Password must not exceed 64 characters",
    ],
  ])("rejects invalid registration input", (input, expectedError) => {
    expect(validateRegisterInput(input)).toContain(expectedError);
  });

  it("requires both login fields", () => {
    expect(validateLoginInput({ email: "", password: "" })).toEqual([
      "Email is required",
      "Password is required",
    ]);
  });
});

describe("Authentication server logic", () => {
  beforeEach(() => {
    appStore.users.splice(
      0,
      appStore.users.length,
      ...initialUsers.map((user) => ({ ...user }))
    );
  });

  it("registers a normalized user without exposing the password", () => {
    const user = registerUser({
      name: "  Eduardo Flores  ",
      email: "  EDUARDO@Example.com ",
      password: "Password123",
    });

    expect(user).toMatchObject({
      name: "Eduardo Flores",
      email: "eduardo@example.com",
      role: "user",
    });
    expect(user).not.toHaveProperty("password");
    expect(findUserByEmail(" EDUARDO@example.com ")).toMatchObject({
      id: user.id,
      password: "Password123",
    });
  });

  it("rejects duplicate emails regardless of casing", () => {
    registerUser({
      name: "First User",
      email: "duplicate@example.com",
      password: "Password123",
    });

    expect(() =>
      registerUser({
        name: "Second User",
        email: "DUPLICATE@example.com",
        password: "Password456",
      })
    ).toThrow("already exists");
  });

  it("logs in users and preserves admin role handling", () => {
    const registered = registerUser({
      name: "Trader",
      email: "trader@example.com",
      password: "Password123",
    });

    expect(
      loginUser({
        email: " TRADER@example.com ",
        password: "Password123",
      })
    ).toEqual(registered);
    expect(
      loginUser({
        email: "admin@queuesmart.com",
        password: "Admin123",
      }).role
    ).toBe("admin");
  });

  it("returns one generic error for unknown users and wrong passwords", () => {
    expect(() =>
      loginUser({
        email: "missing@example.com",
        password: "Password123",
      })
    ).toThrow("Invalid email or password");
    expect(() =>
      loginUser({
        email: "admin@queuesmart.com",
        password: "WrongPassword",
      })
    ).toThrow("Invalid email or password");
  });
});

describe("Authentication API routes", () => {
  beforeEach(() => {
    appStore.users.splice(
      0,
      appStore.users.length,
      ...initialUsers.map((user) => ({ ...user }))
    );
  });

  it("registers and logs in a user through the API", async () => {
    const registration = await registerRoute(
      jsonRequest("/api/auth/register", {
        name: "API User",
        email: "api@example.com",
        password: "Password123",
      })
    );
    const registrationBody = await registration.json();

    expect(registration.status).toBe(201);
    expect(registrationBody).toMatchObject({
      success: true,
      user: {
        name: "API User",
        email: "api@example.com",
        role: "user",
      },
    });
    expect(registrationBody.user).not.toHaveProperty("password");

    const login = await loginRoute(
      jsonRequest("/api/auth/login", {
        email: "api@example.com",
        password: "Password123",
      })
    );
    expect(login.status).toBe(200);
    expect(await login.json()).toMatchObject({
      success: true,
      message: "Login successful",
      user: { email: "api@example.com", role: "user" },
    });
  });

  it("returns validation errors without creating an account", async () => {
    const response = await registerRoute(
      jsonRequest("/api/auth/register", {
        name: "A",
        email: "not-an-email",
        password: "short",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.errors).toEqual(
      expect.arrayContaining([
        "Name must be at least 2 characters",
        "Email format is invalid",
        "Password must be at least 8 characters",
      ])
    );
    expect(findUserByEmail("not-an-email")).toBeUndefined();
  });

  it("rejects duplicate registration with a conflict response", async () => {
    const requestBody = {
      name: "Duplicate",
      email: "duplicate@example.com",
      password: "Password123",
    };
    await registerRoute(jsonRequest("/api/auth/register", requestBody));

    const duplicate = await registerRoute(
      jsonRequest("/api/auth/register", requestBody)
    );

    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toMatchObject({
      success: false,
      error: expect.stringContaining("already exists"),
    });
  });

  it("rejects malformed body shapes and invalid credentials", async () => {
    const invalidRegistration = await registerRoute(
      jsonRequest("/api/auth/register", [])
    );
    expect(invalidRegistration.status).toBe(400);

    const invalidLoginBody = await loginRoute(
      jsonRequest("/api/auth/login", "invalid")
    );
    expect(invalidLoginBody.status).toBe(400);

    const invalidCredentials = await loginRoute(
      jsonRequest("/api/auth/login", {
        email: "missing@example.com",
        password: "Password123",
      })
    );
    expect(invalidCredentials.status).toBe(401);
    expect(await invalidCredentials.json()).toMatchObject({
      success: false,
      error: "Invalid email or password",
    });
  });
});

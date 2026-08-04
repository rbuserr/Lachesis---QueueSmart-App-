// Eduardo's registration route for the QueueSmart application.
// Validates input and creates UserCredential + UserProfile in the database.

import { NextResponse } from "next/server";

import { validateRegisterInput } from "@/lib/validations";
import { registerUser } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be a valid object",
        },
        { status: 400 },
      );
    }

    const input = body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    const errors = validateRegisterInput({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 },
      );
    }

    const user = await registerUser({
      name: input.name as string,
      email: input.email as string,
      password: input.password as string,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to register user";

    const status = message.includes("already exists") ? 409 : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}

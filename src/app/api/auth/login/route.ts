// Eduardo's login route for the QueueSmart application.
// Validates input and authenticates against UserCredential in the database.

import { NextResponse } from "next/server";

import { validateLoginInput } from "@/lib/validations";
import { loginUser } from "@/server/auth";

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
      email?: unknown;
      password?: unknown;
    };

    const errors = validateLoginInput({
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

    const user = await loginUser({
      email: input.email as string,
      password: input.password as string,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to log in";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 },
    );
  }
}

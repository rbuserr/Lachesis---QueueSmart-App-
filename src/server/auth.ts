// Eduardo's user management module for the QueueSmart application.
// Persists UserCredential + UserProfile in Neon via Prisma. Passwords are hashed.

import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/password";
import type { PublicUser, UserRole } from "@/types/domain";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

/** Internal auth record (password hash never returned from login/register). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  passwordHash: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function toAuthUser(credential: {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  profile: { fullName: string } | null;
}): AuthUser {
  return {
    id: credential.id,
    name: credential.profile?.fullName ?? credential.email,
    email: credential.email,
    role: credential.role,
    createdAt: credential.createdAt.toISOString(),
    passwordHash: credential.passwordHash,
  };
}

export async function findUserByEmail(
  email: string,
): Promise<AuthUser | null> {
  const normalizedEmail = normalizeEmail(email);

  const credential = await prisma.userCredential.findUnique({
    where: { email: normalizedEmail },
    include: { profile: true },
  });

  return credential ? toAuthUser(credential) : null;
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<PublicUser> {
  const normalizedEmail = normalizeEmail(input.email);
  const fullName = input.name.trim();
  const passwordHash = await hashPassword(input.password);

  try {
    const credential = await prisma.userCredential.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "user",
        profile: {
          create: {
            fullName,
            email: normalizedEmail,
          },
        },
      },
      include: { profile: true },
    });

    return toPublicUser(toAuthUser(credential));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("An account with this email already exists");
    }

    throw error;
  }
}

export async function loginUser(
  input: LoginUserInput,
): Promise<PublicUser> {
  const user = await findUserByEmail(input.email);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  return toPublicUser(user);
}

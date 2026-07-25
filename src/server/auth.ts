//Eduardo's user management module for the QueueSmart application.
// This module provides functions to register and authenticate users, as well as manage user data in the application store.

import "server-only";

import { appStore } from "@/server/app-store";
import type { PublicUser, User } from "@/types/domain";

export interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

export function findUserByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();

    return appStore.users.find(
        (user) => user.email.toLowerCase() === normalizedEmail,
    );
}

export function registerUser(input: RegisterUserInput): PublicUser {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = findUserByEmail(normalizedEmail);

    if (existingUser) {
        throw new Error("An account with this email already exists");
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
        role: "user",
        createdAt: new Date().toISOString(),
    };

    appStore.users.push(newUser);

    return toPublicUser(newUser);
}

export function loginUser(input: LoginUserInput): PublicUser {
    const user = findUserByEmail(input.email);

    if (!user || user.password !== input.password) {
        throw new Error("Invalid email or password");
    }

    return toPublicUser(user);
}
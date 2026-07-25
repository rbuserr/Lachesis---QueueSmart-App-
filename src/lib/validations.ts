// HISTORY MODULE VALIDATIONS (David)

export function validateHistoryRecord(
  data: unknown
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  const record =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : {};

  // Validate Required Fields & Types
  if (!record.id || typeof record.id !== "string") {
    errors.push("Invalid or missing 'id' (must be a string).");
  }

  if (!record.traderName || typeof record.traderName !== "string") {
    errors.push("Invalid or missing 'traderName' (must be a string).");
  }

  if (!Number.isInteger(record.serviceId)) {
    errors.push("Invalid or missing 'serviceId' (must be an integer).");
  }

  if (
    typeof record.joinedAt !== "string" ||
    Number.isNaN(Date.parse(record.joinedAt))
  ) {
    errors.push("Invalid or missing 'joinedAt' timestamp.");
  }

  if (
    record.completedAt !== null &&
    (typeof record.completedAt !== "string" ||
      Number.isNaN(Date.parse(record.completedAt)))
  ) {
    errors.push("'completedAt' must be a timestamp or null.");
  }

  if (
    record.outcome !== "served" &&
    record.outcome !== "left" &&
    record.outcome !== "cancelled"
  ) {
    errors.push("Outcome must be served, left, or cancelled.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

// Eduardo's Validations

export interface RegisterInput {
  name: unknown;
  email: unknown;
  password: unknown;
}

export interface LoginInput {
  email: unknown;
  password: unknown;
}

export function validateRegisterInput(input: RegisterInput): string[] {
  const errors: string[] = [];

  if (typeof input.name !== "string" || input.name.trim() === "") {
    errors.push("Name is required");
  } else if (input.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (input.name.trim().length > 50) {
    errors.push("Name must not exceed 50 characters");
  }

  if (typeof input.email !== "string" || input.email.trim() === "") {
    errors.push("Email is required");
  } else {
    const email = input.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length > 100) {
      errors.push("Email must not exceed 100 characters");
    }

    if (!emailPattern.test(email)) {
      errors.push("Email format is invalid");
    }
  }

  if (typeof input.password !== "string" || input.password === "") {
    errors.push("Password is required");
  } else if (input.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else if (input.password.length > 64) {
    errors.push("Password must not exceed 64 characters");
  }

  return errors;
}

export function validateLoginInput(input: LoginInput): string[] {
  const errors: string[] = [];

  if (typeof input.email !== "string" || input.email.trim() === "") {
    errors.push("Email is required");
  }

  if (typeof input.password !== "string" || input.password === "") {
    errors.push("Password is required");
  }

  return errors;
}
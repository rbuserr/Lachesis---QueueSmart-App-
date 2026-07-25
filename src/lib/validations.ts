// HISTORY MODULE VALIDATIONS (David)

export function validateHistoryRecord(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // Validate Required Fields & Types
  if (!data.id || typeof data.id !== "string") {
    errors.push("Invalid or missing 'id' (must be a string).");
  }
  
  if (!data.service || typeof data.service !== "string") {
    errors.push("Invalid or missing 'service' (must be a string).");
  }
  
  if (!data.status || typeof data.status !== "string") {
    errors.push("Invalid or missing 'status' (must be a string).");
  }

  // Validate Field Length Limits
  if (data.service && data.service.length > 100) {
    errors.push("Service name exceeds maximum length of 100 characters.");
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
// HISTORY MODULE VALIDATIONS

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

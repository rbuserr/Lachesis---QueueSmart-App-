import type { Priority } from "@/types/trader";

export function priorityLabel(priority: Priority): string {
  return priority.toUpperCase();
}

export function priorityVariant(
  priority: Priority
): "default" | "secondary" | "destructive" {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
  }
}

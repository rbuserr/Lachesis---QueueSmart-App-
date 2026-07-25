// HISTORY MODULE TESTS (David)

import { beforeEach, describe, expect, it } from "vitest";

import { validateHistoryRecord } from "@/lib/validations";
import { addHistoryRecord, getHistoryStore } from "@/server/app-store";
import type { QueueHistoryEntry } from "@/types/trader";

const validRecord: QueueHistoryEntry = {
  id: "Q-1004",
  traderName: "John D.",
  serviceId: 1,
  joinedAt: "2026-07-24T20:00:00.000Z",
  completedAt: "2026-07-24T20:12:00.000Z",
  outcome: "served",
};

describe("History Module Backend Logic", () => {
  beforeEach(() => {
    getHistoryStore().splice(0);
  });

  it("validates a correctly formatted history record", () => {
    expect(validateHistoryRecord(validRecord)).toEqual({ valid: true });
  });

  it("fails validation when a required field is missing", () => {
    const missingIdRecord: Partial<QueueHistoryEntry> = { ...validRecord };
    delete missingIdRecord.id;
    const result = validateHistoryRecord(missingIdRecord);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Invalid or missing 'id' (must be a string)."
    );
  });

  it("fails validation for an unsupported outcome", () => {
    const result = validateHistoryRecord({
      ...validRecord,
      outcome: "resolved",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Outcome must be served, left, or cancelled."
    );
  });

  it("adds and retrieves a history record from the in-memory store", () => {
    addHistoryRecord(validRecord);

    const history = getHistoryStore();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(validRecord);
  });
});

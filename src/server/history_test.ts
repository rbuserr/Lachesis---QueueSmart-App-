import { getHistoryStore, addHistoryRecord } from "./app-store";
import { validateHistoryRecord } from "../lib/validations";
import type { QueueHistoryEntry } from "../types/trader";

describe("History Module Backend Logic", () => {
  
  it("should validate a correctly formatted history record", () => {
    const validRecord = {
      id: "Q-1004",
      service: "Margin Call Review",
      status: "Resolved",
      date: new Date().toISOString(),
      duration: "12m"
    };
    
    const result = validateHistoryRecord(validRecord);
    expect(result.valid).toBe(true);
  });

  it("should fail validation if a required field is missing", () => {
    const missingIdRecord = {
      service: "Platform Bug Report",
      status: "Cancelled",
      date: new Date().toISOString(),
      duration: "5m"
    };
    
    const result = validateHistoryRecord(missingIdRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid or missing 'id' (must be a string).");
  });

  it("should fail validation if service name exceeds length limit", () => {
    const invalidRecord = {
      id: "Q-1005",
      service: "A".repeat(101), // Exceeds the 100 character limit
      status: "Resolved",
      date: new Date().toISOString(),
      duration: "5m"
    };
    
    const result = validateHistoryRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Service name exceeds maximum length of 100 characters.");
  });

  it("should successfully add a record to the in-memory store and retrieve it", () => {
    const initialCount = getHistoryStore().length;
    
    const newRecord: QueueHistoryEntry = {
      id: "Q-9999",
      service: "Technical Support",
      status: "Resolved",
      date: new Date().toISOString(),
      duration: "2m"
    };

    addHistoryRecord(newRecord);

    const newStore = getHistoryStore();
    expect(newStore.length).toBe(initialCount + 1);
    
    // Check that the newest record is pushed to the top (index 0)
    expect(newStore[0].id).toBe("Q-9999");
    expect(newStore[0].service).toBe("Technical Support");
  });
});

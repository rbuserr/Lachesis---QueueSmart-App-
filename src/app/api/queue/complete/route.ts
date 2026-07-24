import { NextResponse } from "next/server";
import { completeCurrentService } from "@/server/queue";
import { addHistoryRecord } from "@/server/app-store";
import { validateHistoryRecord } from "@/lib/validations";

export async function POST(request: Request) {
  // TODO(authentication-module): require an administrator session.
  
  // 1. Execute Joshua's logic first to remove the user from the active queue
  const entry = await completeCurrentService();

  // 2. If a ticket was successfully completed, save it to your history
  if (entry) {
    // Attempt to parse the body if the frontend sent specific details, fallback if empty
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Ignore error if request has no JSON body
    }

    const historyData = {
      // Use the body data if provided, otherwise fallback to the server entry data
      id: body.id || `Q-${entry.id}`,
      service: body.serviceName || `Service ID: ${entry.serviceId}`,
      status: body.status || "Resolved",
      date: new Date().toISOString(),
      duration: body.duration || "N/A"
    };

    // HISTORY MODULE: Validate data
    const validation = validateHistoryRecord(historyData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.errors }, 
        { status: 400 }
      );
    }

    // HISTORY MODULE: Save to the shared in-memory store
    addHistoryRecord(historyData);
  }

  // 3. Return Joshua's original response format so the frontend doesn't break
  return NextResponse.json({ entry });
}

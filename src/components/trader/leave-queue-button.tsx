"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export function LeaveQueueButton({
  entryId,
  canLeave,
}: {
  entryId: number;
  canLeave: boolean;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  const leave = async () => {
    setLeaving(true);
    setError("");
    try {
      await api.queue.leave(entryId);
      router.push("/queue/join");
      router.refresh();
    } catch (leaveError) {
      setError(
        leaveError instanceof Error
          ? leaveError.message
          : "Unable to leave the queue."
      );
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        disabled={!canLeave || leaving}
        onClick={() => void leave()}
      >
        {leaving ? "Leaving..." : "Leave Queue"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

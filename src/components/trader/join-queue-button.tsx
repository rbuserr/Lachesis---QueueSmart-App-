"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { readSessionUserClient } from "@/lib/auth/session";

export function JoinQueueButton({
  serviceId,
  serviceName,
  disabled,
}: {
  serviceId: number;
  serviceName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const join = async () => {
    setJoining(true);
    setError("");
    try {
      const user = readSessionUserClient();
      const traderName = user?.name.trim();

      if (!traderName) {
        setError("Please log in before joining a queue.");
        router.push("/login");
        return;
      }

      await api.queue.join({
        traderName,
        serviceId,
      });
      router.push("/queue/status");
      router.refresh();
    } catch (joinError) {
      setError(
        joinError instanceof Error ? joinError.message : "Unable to join queue.",
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button
        className="w-full"
        disabled={disabled || joining}
        onClick={() => void join()}
      >
        {joining ? "Joining..." : `Join ${serviceName}`}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

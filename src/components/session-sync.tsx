import { useEffect } from "react";

import { SESSION_EVENT_KEY, SESSION_STORAGE_KEY, readSession } from "@/lib/supabase";

type SessionSyncProps = {
  onSessionChange: ReturnType<typeof readSession> extends infer T ? (session: T) => void : never;
};

const SessionSync = ({ onSessionChange }: SessionSyncProps) => {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== SESSION_STORAGE_KEY && event.key !== SESSION_EVENT_KEY) return;
      onSessionChange(readSession());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [onSessionChange]);

  return null;
};

export default SessionSync;
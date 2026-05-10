import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { type AuthSession, isSessionExpired, readSession, refreshSession, storeSession } from "@/lib/supabase";

type AuthGuardProps = {
  children: JSX.Element;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const [session, setSession] = useState<AuthSession | null>(readSession());

  useEffect(() => {
    const validateSession = async () => {
      const currentSession = readSession();

      if (!currentSession?.access_token) {
        setSession(null);
        setStatus("blocked");
        return;
      }

      if (!isSessionExpired(currentSession)) {
        setSession(currentSession);
        setStatus("allowed");
        return;
      }

      if (!currentSession.refresh_token) {
        storeSession(null);
        setSession(null);
        setStatus("blocked");
        return;
      }

      try {
        const nextSession = await refreshSession(currentSession);
        setSession(nextSession);
        setStatus("allowed");
      } catch {
        storeSession(null);
        setSession(null);
        setStatus("blocked");
      }
    };

    validateSession();
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white/90 px-6 py-5 text-sm font-medium text-slate-600 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          Checking your secure session...
        </div>
      </main>
    );
  }

  if (!session?.access_token || status === "blocked") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AuthGuard;
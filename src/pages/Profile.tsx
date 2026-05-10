import { useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import ProfilePanel from "@/components/profile-panel";
import SessionSync from "@/components/session-sync";
import type { AuthSession } from "@/lib/supabase";
import { readSession, refreshSession, storeSession } from "@/lib/supabase";

const Profile = () => {
  const [session, setSession] = useState<AuthSession | null>(readSession());

  useEffect(() => {
    const storedSession = readSession();

    if (!storedSession?.refresh_token) return;
    if (!storedSession.expires_at) return;

    refreshSession(storedSession)
      .then((nextSession) => {
        setSession(nextSession);
      })
      .catch(() => {
        storeSession(null);
        setSession(null);
      });
  }, []);

  return (
    <AppShell session={session}>
      <SessionSync onSessionChange={setSession} />
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Account center</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Profile settings</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Update your identity details and review your current account progress.
          </p>
        </div>

        <ProfilePanel session={session} />
      </div>
    </AppShell>
  );
};

export default Profile;
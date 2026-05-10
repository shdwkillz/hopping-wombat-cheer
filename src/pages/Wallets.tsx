import { useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import SessionSync from "@/components/session-sync";
import SupabaseActionsPanel from "@/components/supabase-actions-panel";
import WalletsManagementPanel from "@/components/wallets-management-panel";
import WithdrawalHistoryPanel from "@/components/withdrawal-history-panel";
import type { AuthSession } from "@/lib/supabase";
import { readSession, refreshSession, storeSession } from "@/lib/supabase";

const Wallets = () => {
  const [session, setSession] = useState<AuthSession | null>(readSession());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedSession = readSession();

    if (!storedSession?.refresh_token) return;
    if (!storedSession.expires_at) return;

    refreshSession(storedSession)
      .then((nextSession) => {
        setSession(nextSession);
        setRefreshKey((current) => current + 1);
      })
      .catch(() => {
        storeSession(null);
        setSession(null);
      });
  }, []);

  return (
    <AppShell session={session}>
      <SessionSync
        onSessionChange={(nextSession) => {
          setSession(nextSession);
          setRefreshKey((current) => current + 1);
        }}
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Payout center</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Wallets and withdrawals</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Connect payout destinations, manage saved wallets, and review all withdrawal activity in one place.
          </p>
        </div>

        <SupabaseActionsPanel
          session={session}
          onUpdated={() => setRefreshKey((current) => current + 1)}
        />

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <WalletsManagementPanel
            session={session}
            refreshKey={refreshKey}
            onUpdated={() => setRefreshKey((current) => current + 1)}
          />
          <WithdrawalHistoryPanel session={session} refreshKey={refreshKey} />
        </div>
      </div>
    </AppShell>
  );
};

export default Wallets;
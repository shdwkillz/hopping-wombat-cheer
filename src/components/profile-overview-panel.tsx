import { useEffect, useState } from "react";
import { Activity, UserCircle2 } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch } from "@/lib/supabase";
import DashboardSummaryCards from "@/components/dashboard-summary-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";

type ProfileRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  role: string;
  mining_power: number;
  xp: number;
  streak_days: number;
};

type ProfileOverviewPanelProps = {
  session: AuthSession | null;
  refreshKey?: number;
};

const ProfileOverviewPanel = ({ session, refreshKey = 0 }: ProfileOverviewPanelProps) => {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [walletCount, setWalletCount] = useState(0);
  const [withdrawalCount, setWithdrawalCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(session));

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setWalletCount(0);
      setWithdrawalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      authenticatedFetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,first_name,last_name,username,role,mining_power,xp,streak_days&id=eq.${session.user.id}&limit=1`,
      ),
      authenticatedFetch(
        `${SUPABASE_URL}/rest/v1/wallets?select=id&user_id=eq.${session.user.id}`,
      ),
      authenticatedFetch(
        `${SUPABASE_URL}/rest/v1/withdrawal_requests?select=id&user_id=eq.${session.user.id}`,
      ),
    ])
      .then(async ([profileResponse, walletsResponse, withdrawalsResponse]) => {
        const profileResult = await profileResponse.json();
        const walletsResult = await walletsResponse.json();
        const withdrawalsResult = await withdrawalsResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileResult.message || "Could not load profile summary.");
        }

        if (!walletsResponse.ok) {
          throw new Error(walletsResult.message || "Could not load wallet summary.");
        }

        if (!withdrawalsResponse.ok) {
          throw new Error(withdrawalsResult.message || "Could not load withdrawal summary.");
        }

        setProfile((profileResult[0] as ProfileRecord | undefined) ?? null);
        setWalletCount((walletsResult as { id: string }[]).length);
        setWithdrawalCount((withdrawalsResult as { id: string }[]).length);
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load account summary.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey, session]);

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900">Account overview</CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Sign in to see your live account summary.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const displayName =
    profile?.first_name ||
    profile?.username ||
    session.user.email ||
    "Member";

  return (
    <div className="space-y-5">
      <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_32%),linear-gradient(135deg,#ffffff,#f5f3ff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Activity className="h-4 w-4" />
                Live member overview
              </div>
              <div>
                <p className="text-sm text-slate-500">Welcome back</p>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {loading ? "Loading..." : displayName}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Review your progress, connected wallets, and request activity from one place.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/60 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="font-bold capitalize text-slate-900">
                    {loading ? "Loading..." : profile?.role || "member"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-[1.75rem] border-0 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
              <CardContent className="p-5">
                <div className="h-24 animate-pulse rounded-[1.25rem] bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DashboardSummaryCards
          miningPower={profile?.mining_power || 0}
          xp={profile?.xp || 0}
          walletCount={walletCount}
          withdrawalCount={withdrawalCount}
        />
      )}
    </div>
  );
};

export default ProfileOverviewPanel;
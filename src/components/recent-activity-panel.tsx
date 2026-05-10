import { useEffect, useState } from "react";
import { ArrowDownToLine, Clock3, Wallet } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";

type WalletRecord = {
  id: string;
  network: string;
  label: string | null;
  address: string;
  created_at: string;
};

type WithdrawalRecord = {
  id: string;
  network: string;
  amount_points: number;
  status: string;
  requested_at: string;
};

type RecentActivityPanelProps = {
  session: AuthSession | null;
  refreshKey: number;
};

const shortenAddress = (value: string) => {
  if (value.length < 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const RecentActivityPanel = ({ session, refreshKey }: RecentActivityPanelProps) => {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(session));

  useEffect(() => {
    if (!session) {
      setWallets([]);
      setWithdrawals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      authenticatedFetch(
        `${SUPABASE_URL}/rest/v1/wallets?select=id,network,label,address,created_at&user_id=eq.${session.user.id}&order=created_at.desc&limit=3`,
      ),
      authenticatedFetch(
        `${SUPABASE_URL}/rest/v1/withdrawal_requests?select=id,network,amount_points,status,requested_at&user_id=eq.${session.user.id}&order=requested_at.desc&limit=3`,
      ),
    ])
      .then(async ([walletsResponse, withdrawalsResponse]) => {
        const walletsResult = await walletsResponse.json();
        const withdrawalsResult = await withdrawalsResponse.json();

        if (!walletsResponse.ok) {
          throw new Error(walletsResult.message || "Could not load recent wallets.");
        }

        if (!withdrawalsResponse.ok) {
          throw new Error(withdrawalsResult.message || "Could not load recent withdrawals.");
        }

        setWallets(walletsResult as WalletRecord[]);
        setWithdrawals(withdrawalsResult as WithdrawalRecord[]);
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load recent activity.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey, session]);

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Clock3 className="h-6 w-6 text-primary" />
            Recent activity
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Sign in to see your latest wallet updates and withdrawal requests.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Wallet className="h-6 w-6 text-primary" />
            Recent wallets
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Your newest payout destinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-500">Loading recent wallets...</div>
          ) : wallets.length ? (
            wallets.map((wallet) => (
              <div key={wallet.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold capitalize text-slate-900">
                      {wallet.label || wallet.network}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{shortenAddress(wallet.address)}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {wallet.network}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {formatDate(wallet.created_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              No wallets added yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <ArrowDownToLine className="h-6 w-6 text-cyan-300" />
            Recent withdrawals
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-300">
            Your latest payout conversion requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              Loading recent withdrawals...
            </div>
          ) : withdrawals.length ? (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-bold capitalize text-white">{withdrawal.network}</p>
                    <p className="mt-1 text-sm text-slate-300">{withdrawal.amount_points} points</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(withdrawal.requested_at)}</p>
                  </div>
                  <span className="w-fit rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-200">
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-6 text-slate-300">
              No withdrawal requests yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivityPanel;
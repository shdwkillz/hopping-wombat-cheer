import { useEffect, useState } from "react";
import { ArrowDownToLine } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";

type WithdrawalRecord = {
  id: string;
  network: string;
  amount_points: number;
  status: string;
  risk_score: number;
  requested_at: string;
};

type WithdrawalHistoryPanelProps = {
  session: AuthSession | null;
  refreshKey: number;
};

const WithdrawalHistoryPanel = ({ session, refreshKey }: WithdrawalHistoryPanelProps) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(session));

  useEffect(() => {
    if (!session) {
      setWithdrawals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/withdrawal_requests?select=id,network,amount_points,status,risk_score,requested_at&user_id=eq.${session.user.id}&order=requested_at.desc`,
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load withdrawals.");
        }

        setWithdrawals(result as WithdrawalRecord[]);
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load withdrawals.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey, session]);

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Withdrawal history</CardTitle>
          <CardDescription className="text-base text-slate-300">
            Sign in to review your payout requests.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-black">
          <ArrowDownToLine className="h-6 w-6 text-cyan-300" />
          Withdrawal history
        </CardTitle>
        <CardDescription className="text-base leading-7 text-slate-300">
          Track current and past payout conversion requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Loading withdrawal history...
          </div>
        ) : withdrawals.length ? (
          withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold capitalize text-white">{withdrawal.network}</p>
                  <p className="mt-1 text-sm text-slate-300">{withdrawal.amount_points} points</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(withdrawal.requested_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-200">
                    {withdrawal.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    Risk {withdrawal.risk_score}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-6 text-slate-300">
            You have not submitted any withdrawal requests yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistoryPanel;
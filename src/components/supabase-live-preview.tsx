import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Coins, Shield, Wallet, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
  };
};

type Task = {
  id: string;
  title: string;
  description: string;
  task_type: string;
  reward_points: number;
  estimated_revenue_cents: number;
};

type Treasury = {
  snapshot_date: string;
  verified_revenue_cents: number;
  reward_pool_cents: number;
  liquidity_reserve_cents: number;
  emergency_reserve_cents: number;
  payout_rate: number;
};

type WalletRecord = {
  id: string;
  network: string;
  address: string;
  is_verified: boolean;
};

type WithdrawalRecord = {
  id: string;
  network: string;
  amount_points: number;
  status: string;
  risk_score: number;
};

type SupabaseLivePreviewProps = {
  session: AuthSession | null;
  refreshKey: number;
};

const SUPABASE_URL = "https://gydhnsdhqbvsdjtxucgk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZGhuc2RocWJ2c2RqdHh1Y2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTAzMzMsImV4cCI6MjA5Mzk2NjMzM30.47mfKFIyF6FDACryWIoyEBw5uAMJeqpWxodirr0f_B8";

const currency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const SupabaseLivePreview = ({ session, refreshKey }: SupabaseLivePreviewProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: session ? `Bearer ${session.access_token}` : `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    }),
    [session],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const publicRequests = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/reward_tasks?select=id,title,description,task_type,reward_points,estimated_revenue_cents&is_active=eq.true&order=created_at.asc`,
          { headers: authHeaders },
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/treasury_snapshots?select=snapshot_date,verified_revenue_cents,reward_pool_cents,liquidity_reserve_cents,emergency_reserve_cents,payout_rate&order=snapshot_date.desc&limit=1`,
          { headers: authHeaders },
        ),
      ]);

      const tasksResult = await publicRequests[0].json();
      const treasuryResult = await publicRequests[1].json();

      if (!publicRequests[0].ok) throw new Error(tasksResult.message || "Unable to load reward tasks.");
      if (!publicRequests[1].ok) throw new Error(treasuryResult.message || "Unable to load treasury.");

      setTasks(tasksResult as Task[]);
      setTreasury((treasuryResult[0] as Treasury) ?? null);

      if (session) {
        const privateRequests = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/wallets?select=id,network,address,is_verified&user_id=eq.${session.user.id}&order=created_at.desc`,
            { headers: authHeaders },
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/withdrawal_requests?select=id,network,amount_points,status,risk_score&user_id=eq.${session.user.id}&order=requested_at.desc`,
            { headers: authHeaders },
          ),
        ]);

        const walletsResult = await privateRequests[0].json();
        const withdrawalsResult = await privateRequests[1].json();

        if (!privateRequests[0].ok) throw new Error(walletsResult.message || "Unable to load wallets.");
        if (!privateRequests[1].ok) throw new Error(withdrawalsResult.message || "Unable to load withdrawals.");

        setWallets(walletsResult as WalletRecord[]);
        setWithdrawals(withdrawalsResult as WithdrawalRecord[]);
      } else {
        setWallets([]);
        setWithdrawals([]);
      }

      setLoading(false);
    };

    load().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load live data.");
      setLoading(false);
    });
  }, [authHeaders, refreshKey, session]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Coins className="h-6 w-6 text-primary" /> Live data preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Verified revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "Loading..." : treasury ? currency(treasury.verified_revenue_cents) : "—"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Reward pool</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "Loading..." : treasury ? currency(treasury.reward_pool_cents) : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center justify-between text-sm text-emerald-900">
              <span>Payout rate</span>
              <span>{loading ? "Loading..." : treasury ? `${Math.round(treasury.payout_rate * 100)}%` : "—"}</span>
            </div>
            <Progress value={loading ? 0 : treasury ? Math.round(treasury.payout_rate * 100) : 0} className="mt-3 h-3 rounded-full" />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-500">Loading live tasks…</div>
            ) : tasks.length ? (
              tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">{task.reward_points} pts</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No active tasks are available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <Shield className="h-6 w-6 text-cyan-300" /> Authenticated preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Wallets</p>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : wallets.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Withdrawals</p>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : withdrawals.length}</p>
            </div>
          </div>

          {!session ? (
            <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-50">
              Sign in to view your wallet and withdrawal records.
            </div>
          ) : null}

          {session && loading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading your private account data…
            </div>
          ) : null}

          {session && !loading && wallets.length ? (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold capitalize">{wallet.network}</p>
                      <p className="text-xs break-all text-slate-300">{wallet.address}</p>
                      <p className="mt-1 text-[11px] text-slate-400">ID: {wallet.id}</p>
                    </div>
                    {wallet.is_verified ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {session && !loading && !wallets.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300">
              No linked wallets yet.
            </div>
          ) : null}

          {session ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white">Network</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={4} className="text-center text-slate-300">
                        Loading records...
                      </TableCell>
                    </TableRow>
                  ) : withdrawals.length ? (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="border-white/10">
                        <TableCell className="capitalize text-white">{withdrawal.network}</TableCell>
                        <TableCell className="text-white">{withdrawal.amount_points}</TableCell>
                        <TableCell className="capitalize text-white">{withdrawal.status}</TableCell>
                        <TableCell className="text-white">{withdrawal.risk_score}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={4} className="text-center text-slate-300">
                        No private records yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan-300" />
              Uses direct REST reads against your Supabase tables.
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-300" />
              This keeps live data visible without depending on the missing package.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseLivePreview;
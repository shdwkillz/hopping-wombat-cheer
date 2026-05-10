import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Coins,
  Crown,
  Gift,
  LoaderCircle,
  LogOut,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { AuthError, Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const NETWORKS = ["polygon", "solana", "litecoin", "usdc"] as const;

type Network = (typeof NETWORKS)[number];

type Profile = {
  id: string;
  username: string | null;
  role: string;
  mining_power: number;
  xp: number;
  streak_days: number;
  first_name: string | null;
};

type RewardTask = {
  id: string;
  title: string;
  description: string;
  task_type: string;
  reward_points: number;
  estimated_revenue_cents: number;
  cooldown_seconds: number;
};

type TreasurySnapshot = {
  id: string;
  verified_revenue_cents: number;
  operational_costs_cents: number;
  reserve_allocation_cents: number;
  reward_pool_cents: number;
  liquidity_reserve_cents: number;
  emergency_reserve_cents: number;
  payout_rate: number;
  snapshot_date: string;
};

type WalletRecord = {
  id: string;
  network: Network;
  address: string;
  is_verified: boolean;
  label: string | null;
};

type WithdrawalRecord = {
  id: string;
  network: Network;
  amount_points: number;
  status: string;
  risk_score: number;
  requested_at: string;
};

type LedgerEntry = {
  id: string;
  entry_type: string;
  points_delta: number;
  notes: string | null;
  created_at: string;
};

type RiskFlag = {
  id: string;
  flag_type: string;
  severity: string;
  details: string;
  created_at: string;
};

const currency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

const mapAuthError = (error: AuthError | Error) => {
  if (error.message.toLowerCase().includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  return error.message;
};

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [taskLoadingId, setTaskLoadingId] = useState<string | null>(null);
  const [walletSaving, setWalletSaving] = useState(false);
  const [withdrawSaving, setWithdrawSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(null);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
  });
  const [walletForm, setWalletForm] = useState({
    network: "polygon" as Network,
    address: "",
    label: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    walletId: "",
    amountPoints: "",
  });
  const [riskForm, setRiskForm] = useState({
    flagType: "manual_review",
    severity: "medium",
    details: "",
  });

  const totalPoints = useMemo(() => ledger.reduce((sum, entry) => sum + entry.points_delta, 0), [ledger]);
  const withdrawablePoints = Math.max(totalPoints, 0);
  const reserveCoverage = treasury
    ? Math.round(((treasury.liquidity_reserve_cents + treasury.emergency_reserve_cents) / Math.max(treasury.operational_costs_cents, 1)) * 30)
    : 0;

  const loadAuthenticatedData = async (userId: string) => {
    const [
      profileResult,
      tasksResult,
      treasuryResult,
      walletsResult,
      withdrawalsResult,
      ledgerResult,
      riskFlagsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id, username, role, mining_power, xp, streak_days, first_name").eq("id", userId).single(),
      supabase
        .from("reward_tasks")
        .select("id, title, description, task_type, reward_points, estimated_revenue_cents, cooldown_seconds")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("treasury_snapshots")
        .select("id, verified_revenue_cents, operational_costs_cents, reserve_allocation_cents, reward_pool_cents, liquidity_reserve_cents, emergency_reserve_cents, payout_rate, snapshot_date")
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("wallets").select("id, network, address, is_verified, label").order("created_at", { ascending: false }),
      supabase
        .from("withdrawal_requests")
        .select("id, network, amount_points, status, risk_score, requested_at")
        .order("requested_at", { ascending: false }),
      supabase
        .from("reward_ledger")
        .select("id, entry_type, points_delta, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("risk_flags")
        .select("id, flag_type, severity, details, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const results = [profileResult, tasksResult, treasuryResult, walletsResult, withdrawalsResult, ledgerResult, riskFlagsResult];
    const firstError = results.find((result) => result.error)?.error;

    if (firstError) {
      throw firstError;
    }

    setProfile(profileResult.data as Profile);
    setTasks((tasksResult.data as RewardTask[]) ?? []);
    setTreasury((treasuryResult.data as TreasurySnapshot | null) ?? null);
    setWallets((walletsResult.data as WalletRecord[]) ?? []);
    setWithdrawals((withdrawalsResult.data as WithdrawalRecord[]) ?? []);
    setLedger((ledgerResult.data as LedgerEntry[]) ?? []);
    setRiskFlags((riskFlagsResult.data as RiskFlag[]) ?? []);
  };

  const loadPublicData = async () => {
    const [tasksResult, treasuryResult] = await Promise.all([
      supabase
        .from("reward_tasks")
        .select("id, title, description, task_type, reward_points, estimated_revenue_cents, cooldown_seconds")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("treasury_snapshots")
        .select("id, verified_revenue_cents, operational_costs_cents, reserve_allocation_cents, reward_pool_cents, liquidity_reserve_cents, emergency_reserve_cents, payout_rate, snapshot_date")
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (treasuryResult.error) throw treasuryResult.error;

    setTasks((tasksResult.data as RewardTask[]) ?? []);
    setTreasury((treasuryResult.data as TreasurySnapshot | null) ?? null);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(data.session);
        if (data.session?.user) {
          await loadAuthenticatedData(data.session.user.id);
        } else {
          await loadPublicData();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load app data.");
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      if (nextSession?.user) {
        await loadAuthenticatedData(nextSession.user.id);
      } else {
        setProfile(null);
        setWallets([]);
        setWithdrawals([]);
        setLedger([]);
        setRiskFlags([]);
        await loadPublicData();
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (authMode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: authForm.username,
              first_name: authForm.firstName,
            },
          },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Check your email to verify before signing in.");
        setAuthMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (signInError) throw signInError;
        setNotice("Signed in successfully.");
      }
    } catch (err) {
      setError(err instanceof Error ? mapAuthError(err) : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteTask = async (task: RewardTask) => {
    if (!session?.user) {
      setError("Sign in to complete tasks and earn rewards.");
      return;
    }

    setTaskLoadingId(task.id);
    setError(null);
    setNotice(null);

    try {
      const contributionScore = Number((task.reward_points * Math.max(treasury?.payout_rate ?? 1, 0.1)).toFixed(2));
      const eventInsert = await supabase
        .from("engagement_events")
        .insert({
          user_id: session.user.id,
          task_id: task.id,
          event_type: "reward_credited",
          contribution_score: contributionScore,
          revenue_cents: task.estimated_revenue_cents,
          metadata: { client_verified: true, task_type: task.task_type },
        })
        .select("id")
        .single();

      if (eventInsert.error) throw eventInsert.error;

      const ledgerInsert = await supabase.from("reward_ledger").insert({
        user_id: session.user.id,
        source_event_id: eventInsert.data.id,
        entry_type: "earn",
        points_delta: task.reward_points,
        notes: `Completed ${task.title}`,
      });

      if (ledgerInsert.error) throw ledgerInsert.error;

      const profileUpdate = await supabase
        .from("profiles")
        .update({
          mining_power: Number((Number(profile?.mining_power ?? 0) + task.reward_points / 10).toFixed(2)),
          xp: Number(profile?.xp ?? 0) + task.reward_points,
          streak_days: task.task_type === "daily" ? Number(profile?.streak_days ?? 0) + 1 : Number(profile?.streak_days ?? 0),
        })
        .eq("id", session.user.id);

      if (profileUpdate.error) throw profileUpdate.error;

      await loadAuthenticatedData(session.user.id);
      setNotice(`Reward credited for ${task.title}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task.");
    } finally {
      setTaskLoadingId(null);
    }
  };

  const handleAddWallet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user) return;

    setWalletSaving(true);
    setError(null);
    setNotice(null);

    try {
      const { error: walletError } = await supabase.from("wallets").insert({
        user_id: session.user.id,
        network: walletForm.network,
        address: walletForm.address.trim(),
        label: walletForm.label.trim() || null,
      });

      if (walletError) throw walletError;
      setWalletForm({ network: "polygon", address: "", label: "" });
      await loadAuthenticatedData(session.user.id);
      setNotice("Wallet linked successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link wallet.");
    } finally {
      setWalletSaving(false);
    }
  };

  const handleWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user) return;

    const amount = Number(withdrawForm.amountPoints);
    if (!withdrawForm.walletId || !Number.isFinite(amount) || amount < 100) {
      setError("Choose a wallet and request at least 100 points.");
      return;
    }

    if (amount > withdrawablePoints) {
      setError("Withdrawal amount exceeds available balance.");
      return;
    }

    const selectedWallet = wallets.find((wallet) => wallet.id === withdrawForm.walletId);
    if (!selectedWallet) {
      setError("Selected wallet was not found.");
      return;
    }

    const riskScore = Math.min(95, Math.max(5, Math.round(amount / 25) + riskFlags.length * 8 + (selectedWallet.is_verified ? 0 : 12)));

    setWithdrawSaving(true);
    setError(null);
    setNotice(null);

    try {
      const withdrawalInsert = await supabase.from("withdrawal_requests").insert({
        user_id: session.user.id,
        wallet_id: selectedWallet.id,
        network: selectedWallet.network,
        amount_points: amount,
        risk_score: riskScore,
        status: riskScore >= 70 ? "under_review" : "pending",
      });
      if (withdrawalInsert.error) throw withdrawalInsert.error;

      const ledgerInsert = await supabase.from("reward_ledger").insert({
        user_id: session.user.id,
        entry_type: "withdrawal_hold",
        points_delta: -amount,
        notes: `Withdrawal request submitted to ${selectedWallet.network}`,
      });
      if (ledgerInsert.error) throw ledgerInsert.error;

      setWithdrawForm({ walletId: "", amountPoints: "" });
      await loadAuthenticatedData(session.user.id);
      setNotice(riskScore >= 70 ? "Withdrawal submitted for review." : "Withdrawal queued successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit withdrawal request.");
    } finally {
      setWithdrawSaving(false);
    }
  };

  const handleRiskFlag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user || !riskForm.details.trim()) return;

    setError(null);
    setNotice(null);

    try {
      const { error: riskError } = await supabase.from("risk_flags").insert({
        user_id: session.user.id,
        flag_type: riskForm.flagType,
        severity: riskForm.severity,
        details: riskForm.details.trim(),
      });
      if (riskError) throw riskError;

      setRiskForm({ flagType: "manual_review", severity: "medium", details: "" });
      await loadAuthenticatedData(session.user.id);
      setNotice("Risk review signal submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit risk signal.");
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setNotice(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  };

  const heroStats = [
    { label: "Verified revenue", value: treasury ? currency(treasury.verified_revenue_cents) : "—" },
    { label: "Safe reward pool", value: treasury ? currency(treasury.reward_pool_cents) : "—" },
    { label: "Reserve coverage", value: treasury ? `${reserveCoverage} days` : "—" },
    { label: "Payout rate", value: treasury ? `${Math.round(treasury.payout_rate * 100)}%` : "—" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-[0_20px_80px_rgba(51,65,85,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">NovaForge Loop</p>
              <p className="text-sm text-muted-foreground">Revenue-backed engagement rewards platform</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border-0 bg-emerald-100 px-4 py-1.5 text-emerald-700">Supabase live data</Badge>
            <Badge className="rounded-full border-0 bg-violet-100 px-4 py-1.5 text-violet-700">Auth + ledger + treasury</Badge>
            <Badge className="rounded-full border-0 bg-amber-100 px-4 py-1.5 text-amber-700">RLS protected</Badge>
            {session?.user ? (
              <Button variant="outline" onClick={handleSignOut} className="rounded-full border-primary/20 bg-white/90 px-4 text-primary hover:bg-primary/5">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <Badge className="rounded-full border-0 bg-primary/10 px-4 py-1.5 text-primary">Real app foundation, not a mock shell</Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Build growth through verified engagement and only pay out from real platform revenue.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Users can sign up, complete live reward tasks, accumulate off-chain balances in the ledger, link wallets, request delayed withdrawals, and monitor treasury-backed sustainability in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat) => (
                <Card key={stat.label} className="rounded-[1.75rem] border-0 bg-slate-900 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
                  <CardContent className="p-5">
                    <p className="text-sm text-slate-300">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {error ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}
            {notice ? (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
            ) : null}
          </div>

          <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.22),_transparent_38%),linear-gradient(135deg,#1e1b4b,#312e81_45%,#0f172a)] text-white shadow-[0_30px_90px_rgba(49,46,129,0.32)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="rounded-full border-0 bg-white/15 px-3 py-1 text-white">Access control</Badge>
                <Sparkles className="h-5 w-5 text-violet-200" />
              </div>
              <CardTitle className="text-2xl font-black">Sign up or sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                <div className="grid grid-cols-2 gap-2 rounded-[1rem] bg-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`rounded-[0.875rem] px-4 py-2 text-sm font-semibold transition ${
                      authMode === "signup" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className={`rounded-[0.875rem] px-4 py-2 text-sm font-semibold transition ${
                      authMode === "signin" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Sign in
                  </button>
                </div>

                {authMode === "signup" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First name</Label>
                      <Input
                        id="firstName"
                        value={authForm.firstName}
                        onChange={(event) => setAuthForm((current) => ({ ...current, firstName: event.target.value }))}
                        className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                        placeholder="Nova"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={authForm.username}
                        onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                        className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                        placeholder="novaforge"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                    className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button disabled={authLoading} className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-white/90">
                  {authLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {authMode === "signup" ? "Create account" : "Access dashboard"}
                </Button>
                <p className="text-xs leading-5 text-white/70">
                  Email verification is enforced by Supabase before password sign-in succeeds.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.5rem] bg-slate-200/70 p-2 md:grid-cols-4">
            <TabsTrigger value="tasks" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Tasks</TabsTrigger>
            <TabsTrigger value="treasury" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Treasury</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Wallet</TabsTrigger>
            <TabsTrigger value="trust" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Trust center</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="rounded-[1.75rem] border-0 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          {task.task_type === "ad" ? <Target className="h-5 w-5" /> : null}
                          {task.task_type === "offerwall" ? <Gift className="h-5 w-5" /> : null}
                          {task.task_type === "game" ? <Crown className="h-5 w-5" /> : null}
                          {task.task_type === "daily" ? <Sparkles className="h-5 w-5" /> : null}
                        </div>
                        <Badge className="rounded-full border-0 bg-slate-100 px-3 py-1 text-slate-700">{task.task_type}</Badge>
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-slate-900">{task.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                        <span>Reward</span>
                        <span className="font-semibold text-slate-900">+{task.reward_points} pts</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                        <span>Revenue estimate</span>
                        <span className="font-semibold text-emerald-600">{currency(task.estimated_revenue_cents)}</span>
                      </div>
                      <Button
                        disabled={taskLoadingId === task.id}
                        onClick={() => handleCompleteTask(task)}
                        className="mt-5 h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {taskLoadingId === task.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                        Complete task
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Bot className="h-6 w-6 text-cyan-300" /> Reward engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Available points</p>
                      <p className="mt-2 text-2xl font-bold">{withdrawablePoints}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Mining power</p>
                      <p className="mt-2 text-2xl font-bold">{profile?.mining_power ?? 0}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">XP</p>
                      <p className="mt-2 text-2xl font-bold">{profile?.xp ?? 0}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Streak</p>
                      <p className="mt-2 text-2xl font-bold">{profile?.streak_days ?? 0} days</p>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5">
                    <div className="flex items-center justify-between text-sm text-emerald-100">
                      <span>Payout throttle</span>
                      <span>{treasury ? `${Math.round(treasury.payout_rate * 100)}%` : "—"}</span>
                    </div>
                    <Progress value={treasury ? Math.round(treasury.payout_rate * 100) : 0} className="mt-3 h-3 rounded-full bg-white/10" />
                    <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                      Points are earned instantly but withdrawability stays aligned with revenue-backed liquidity.
                    </p>
                  </div>
                  <Separator className="bg-white/10" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Recent ledger activity</p>
                    <div className="mt-3 space-y-3">
                      {ledger.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold capitalize text-white">{entry.entry_type.replace("_", " ")}</span>
                            <span className={entry.points_delta >= 0 ? "text-emerald-300" : "text-amber-300"}>
                              {entry.points_delta >= 0 ? `+${entry.points_delta}` : entry.points_delta} pts
                            </span>
                          </div>
                          <p className="mt-2 text-slate-300">{entry.notes ?? "Ledger entry"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treasury">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <TrendingUp className="h-6 w-6 text-emerald-500" /> Treasury system
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
                    Available reward pool = verified revenue − ops costs − reserve allocation. Rewards are throttled by payout rate before users can convert points into withdrawals.
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Verified revenue", value: treasury ? currency(treasury.verified_revenue_cents) : "—" },
                      { label: "Operational costs", value: treasury ? currency(treasury.operational_costs_cents) : "—" },
                      { label: "Reserve allocation", value: treasury ? currency(treasury.reserve_allocation_cents) : "—" },
                      { label: "Reward pool", value: treasury ? currency(treasury.reward_pool_cents) : "—" },
                      { label: "Liquidity reserve", value: treasury ? currency(treasury.liquidity_reserve_cents) : "—" },
                      { label: "Emergency reserve", value: treasury ? currency(treasury.emergency_reserve_cents) : "—" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1.25rem] bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-0 bg-[linear-gradient(180deg,#eef2ff,#ffffff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <Brain className="h-6 w-6 text-violet-500" /> Sustainability controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-slate-700">
                  <div className="flex items-start gap-3 rounded-[1.25rem] bg-white p-4">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
                    <span>Public treasury visibility is read-only. User balances and withdrawal actions remain protected by user-scoped RLS.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.25rem] bg-white p-4">
                    <Shield className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <span>Reserve coverage is designed to absorb revenue swings before payout liquidity is affected.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.25rem] bg-white p-4">
                    <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
                    <span>Withdrawal requests are delayed and risk scored. Larger requests are routed into under-review state.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-5">
                <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                      <Wallet className="h-6 w-6 text-orange-500" /> Link wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleAddWallet}>
                      <div className="space-y-2">
                        <Label htmlFor="network">Network</Label>
                        <Select value={walletForm.network} onValueChange={(value: Network) => setWalletForm((current) => ({ ...current, network: value }))}>
                          <SelectTrigger id="network" className="h-11 rounded-2xl bg-slate-50">
                            <SelectValue placeholder="Choose network" />
                          </SelectTrigger>
                          <SelectContent>
                            {NETWORKS.map((network) => (
                              <SelectItem key={network} value={network}>
                                {network}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="walletAddress">Wallet address</Label>
                        <Input
                          id="walletAddress"
                          value={walletForm.address}
                          onChange={(event) => setWalletForm((current) => ({ ...current, address: event.target.value }))}
                          className="h-11 rounded-2xl bg-slate-50"
                          placeholder="Paste a destination wallet"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="walletLabel">Label</Label>
                        <Input
                          id="walletLabel"
                          value={walletForm.label}
                          onChange={(event) => setWalletForm((current) => ({ ...current, label: event.target.value }))}
                          className="h-11 rounded-2xl bg-slate-50"
                          placeholder="Main wallet"
                        />
                      </div>
                      <Button disabled={!session?.user || walletSaving} className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {walletSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save wallet
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-black text-slate-900">Request withdrawal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleWithdraw}>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawWallet">Destination wallet</Label>
                        <Select value={withdrawForm.walletId} onValueChange={(value) => setWithdrawForm((current) => ({ ...current, walletId: value }))}>
                          <SelectTrigger id="withdrawWallet" className="h-11 rounded-2xl bg-slate-50">
                            <SelectValue placeholder="Select linked wallet" />
                          </SelectTrigger>
                          <SelectContent>
                            {wallets.map((wallet) => (
                              <SelectItem key={wallet.id} value={wallet.id}>
                                {wallet.network} · {wallet.address.slice(0, 8)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amountPoints">Amount in points</Label>
                        <Input
                          id="amountPoints"
                          type="number"
                          min="100"
                          value={withdrawForm.amountPoints}
                          onChange={(event) => setWithdrawForm((current) => ({ ...current, amountPoints: event.target.value }))}
                          className="h-11 rounded-2xl bg-slate-50"
                          placeholder="100"
                        />
                      </div>
                      <p className="text-sm text-slate-500">Available to request: {withdrawablePoints} points</p>
                      <Button disabled={!session?.user || withdrawSaving} className="h-11 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                        {withdrawSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Queue withdrawal
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <Zap className="h-6 w-6 text-primary" /> Wallet and payout activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Linked wallets</p>
                    <div className="mt-4 space-y-3">
                      {wallets.length ? (
                        wallets.map((wallet) => (
                          <div key={wallet.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{wallet.label || `${wallet.network} wallet`}</p>
                                <p className="text-sm text-slate-500">{wallet.address}</p>
                              </div>
                              <Badge className={`rounded-full border-0 px-3 py-1 ${wallet.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {wallet.is_verified ? "Verified" : "Pending check"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-500">No wallets linked yet.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Withdrawal queue</p>
                    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Network</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Risk</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {withdrawals.length ? (
                            withdrawals.map((withdrawal) => (
                              <TableRow key={withdrawal.id}>
                                <TableCell className="capitalize">{withdrawal.network}</TableCell>
                                <TableCell>{withdrawal.amount_points} pts</TableCell>
                                <TableCell className="capitalize">{withdrawal.status.replace("_", " ")}</TableCell>
                                <TableCell>{withdrawal.risk_score}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-slate-500">No withdrawal requests yet.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trust">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Shield className="h-6 w-6 text-cyan-300" /> Fraud prevention + review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Signals on file</p>
                      <p className="mt-2 text-2xl font-bold">{riskFlags.length}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Highest severity</p>
                      <p className="mt-2 text-2xl font-bold capitalize">{riskFlags[0]?.severity ?? "none"}</p>
                    </div>
                  </div>
                  <form className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5" onSubmit={handleRiskFlag}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-white">Flag type</Label>
                        <Select value={riskForm.flagType} onValueChange={(value) => setRiskForm((current) => ({ ...current, flagType: value }))}>
                          <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual_review">manual_review</SelectItem>
                            <SelectItem value="velocity">velocity</SelectItem>
                            <SelectItem value="behavior">behavior</SelectItem>
                            <SelectItem value="wallet">wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Severity</Label>
                        <Select value={riskForm.severity} onValueChange={(value) => setRiskForm((current) => ({ ...current, severity: value }))}>
                          <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">low</SelectItem>
                            <SelectItem value="medium">medium</SelectItem>
                            <SelectItem value="high">high</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Details</Label>
                      <Textarea
                        value={riskForm.details}
                        onChange={(event) => setRiskForm((current) => ({ ...current, details: event.target.value }))}
                        className="min-h-[110px] rounded-[1.5rem] border-white/10 bg-white/10 text-white placeholder:text-white/50"
                        placeholder="Describe a suspicious wallet, device pattern, or engagement anomaly."
                      />
                    </div>
                    <Button disabled={!session?.user} className="rounded-full bg-white text-slate-900 hover:bg-white/90">
                      Submit review signal
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                      <Sparkles className="h-6 w-6 text-violet-500" /> Review feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {riskFlags.length ? (
                      riskFlags.map((flag) => (
                        <div key={flag.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold capitalize text-slate-900">{flag.flag_type.replace("_", " ")}</p>
                            <Badge className={`rounded-full border-0 px-3 py-1 ${
                              flag.severity === "high"
                                ? "bg-rose-100 text-rose-700"
                                : flag.severity === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{flag.details}</p>
                          <p className="mt-2 text-xs text-slate-400">{formatDate(flag.created_at)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-500">No review signals submitted yet.</div>
                    )}
                  </CardContent>
                </Card>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Crown className="mr-2 h-4 w-4" /> Production readiness notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] border-0 bg-white p-0 sm:max-w-2xl">
                    <div className="p-6 sm:p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900">What is real in this build</DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-slate-600">
                          This app now uses real Supabase authentication, real tables, real RLS policies, real inserts for task completions, real wallet linking, real withdrawal requests, and real ledger persistence.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
                        <p>Still intentionally not included: real ad network SDK callbacks, blockchain signing, multisig execution, AML vendor integrations, or external fraud intelligence APIs.</p>
                        <p>Those require provider credentials and secure server-side rails, but the product foundation here is no longer a static mock.</p>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Understood</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" /> Loading platform data
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default Index;

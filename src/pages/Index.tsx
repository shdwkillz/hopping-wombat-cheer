import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  Coins,
  Crown,
  Gauge,
  Gift,
  Globe,
  Lock,
  Radar,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

import AccountStatusCard from "@/components/account-status-card";
import SupabaseActionsPanel from "@/components/supabase-actions-panel";
import SupabaseAuthPanel, { readSession } from "@/components/supabase-auth-panel";
import SupabaseLivePreview from "@/components/supabase-live-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const monetizationStreams = [
  {
    title: "Rewarded ads + mediation",
    detail: "AI routes inventory to the highest quality placements and only unlocks value after verified completion.",
    icon: Target,
  },
  {
    title: "Offerwalls + partners",
    detail: "Tasks, surveys, trials, and affiliate events contribute audited revenue into the shared reward pool.",
    icon: Gift,
  },
  {
    title: "Premium loops",
    detail: "Battle passes, cosmetics, sponsored tournaments, and marketplace fees create margin beyond ad demand.",
    icon: Crown,
  },
  {
    title: "Optional infrastructure revenue",
    detail: "Compute-sharing or rev-share integrations are isolated, risk-scored, and never required for core rewards.",
    icon: Globe,
  },
];

const treasuryAllocations = [
  { label: "User rewards", value: 45, color: "bg-[hsl(var(--chart-1))]" },
  { label: "Growth reinvestment", value: 20, color: "bg-[hsl(var(--chart-2))]" },
  { label: "Operational reserve", value: 15, color: "bg-[hsl(var(--chart-3))]" },
  { label: "Liquidity reserve", value: 10, color: "bg-[hsl(var(--chart-4))]" },
  { label: "Security reserve", value: 5, color: "bg-[hsl(var(--chart-5))]" },
  { label: "Emergency treasury", value: 5, color: "bg-primary" },
];

const protectionLayers = [
  "Email verification, device fingerprinting, 2FA, refresh-token rotation, session binding",
  "Ad completion verification, click-spam throttling, replay protection, emulator and VPN detection",
  "Server-authoritative scoring, anomaly-based anti-cheat, matchmaking integrity and bot detection",
  "Delayed withdrawals, wallet reputation analysis, AML flags, velocity limits, multisig treasury approvals",
];

const serviceStacks = [
  {
    name: "Experience layer",
    items: ["React + Tailwind UI", "Mobile-first dashboards", "Task walls, clans, pass, treasury visibility"],
  },
  {
    name: "Core platform",
    items: ["Auth + RBAC", "Reward engine", "Treasury engine", "Fraud graph + risk scoring"],
  },
  {
    name: "Data + AI",
    items: ["Postgres ledger", "Redis cooldowns", "ClickHouse analytics", "Retention and anomaly models"],
  },
  {
    name: "Payout + ops",
    items: ["Off-chain balances", "Queued settlements", "Multisig withdrawal rail", "Grafana + Prometheus"],
  },
];

const apiGroups = [
  {
    title: "Auth + identity",
    routes: ["POST /auth/register", "POST /auth/login", "POST /auth/verify-email", "POST /auth/refresh"],
  },
  {
    title: "Engagement + rewards",
    routes: ["GET /tasks/feed", "POST /ads/complete", "POST /games/submit-score", "GET /rewards/quote"],
  },
  {
    title: "Treasury + payouts",
    routes: ["GET /treasury/summary", "POST /withdrawals/request", "GET /withdrawals/history", "POST /wallets/link"],
  },
  {
    title: "Admin + risk",
    routes: ["GET /admin/alerts", "POST /admin/review/:caseId", "GET /admin/forecast", "POST /admin/sponsor-campaigns"],
  },
];

const schemaTables = [
  "profiles, wallets, user_devices, roles",
  "engagement_events, reward_tasks, referrals, challenge completions",
  "reward_ledger, treasury_snapshots, reserve buckets, payout quotes",
  "withdrawal_requests, aml_flags, fraud_cases, risk_scores, moderation actions",
  "season_passes, cosmetics, marketplace_orders, sponsorship_campaigns, ai_recommendations",
];

const aiSystems = [
  {
    title: "Revenue optimizer",
    copy: "Chooses the best ad or partner path per user segment while respecting quality thresholds and frequency caps.",
  },
  {
    title: "Sustainability forecaster",
    copy: "Projects liquidity stress, reserve coverage, and safe payout ceilings before each reward epoch closes.",
  },
  {
    title: "Fraud intelligence mesh",
    copy: "Combines identity signals, graph analysis, behavior anomalies, and wallet risk to suppress abuse before payout.",
  },
  {
    title: "Retention orchestrator",
    copy: "Predicts churn and serves personalized quests, upgrade offers, clan nudges, and sponsored challenges.",
  },
];

const operatingPrinciples = [
  "Rewards are funded only from verified net revenue, treasury profits, and reserve-safe allocations.",
  "No guaranteed returns, no fake mining, and no dependence on new user deposits.",
  "All withdrawals pass delay windows, dynamic limits, and risk review before treasury settlement.",
  "Emergency controls automatically throttle emissions when revenue quality or liquidity coverage falls.",
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Index = () => {
  const [session, setSession] = useState(readSession());
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/70 p-4 shadow-[0_20px_80px_rgba(51,65,85,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">NovaForge Loop</p>
                <p className="text-sm text-muted-foreground">Autonomous engagement rewards platform concept</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border-0 bg-emerald-100 px-4 py-1.5 text-emerald-700">Revenue-backed only</Badge>
              <Badge className="rounded-full border-0 bg-violet-100 px-4 py-1.5 text-violet-700">AI-optimized</Badge>
              <Badge className="rounded-full border-0 bg-amber-100 px-4 py-1.5 text-amber-700">Fraud hardened</Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="rounded-full border-0 bg-primary/10 px-4 py-1.5 text-primary">
                Sustainable rewards, not speculative payouts
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  A self-balancing reward ecosystem that only pays from verified revenue.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Explore the platform concept, connect an account, preview live Supabase data, and test wallet-linked actions from a single polished dashboard.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => scrollToSection("platform-blueprint")}
                  className="h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                >
                  Explore system blueprint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection("risk-controls")}
                  className="h-12 rounded-full border-primary/20 bg-white/80 px-6 text-base font-semibold text-primary hover:bg-primary/5"
                >
                  Review risk controls
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Reward cap", value: "<= net revenue" },
                  { label: "Treasury reserve floor", value: "35% protected" },
                  { label: "Withdrawal model", value: "Delayed + risk scored" },
                ].map((item) => (
                  <Card key={item.label} className="rounded-[1.75rem] border-0 bg-slate-900 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="mt-2 text-lg font-bold">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <SupabaseAuthPanel
              session={session}
              onAuthenticated={(nextSession) => {
                setSession(nextSession);
                setRefreshKey((current) => current + 1);
              }}
              onSignedOut={() => {
                setSession(null);
                setRefreshKey((current) => current + 1);
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <AccountStatusCard session={session} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SupabaseLivePreview session={session} refreshKey={refreshKey} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <SupabaseActionsPanel session={session} onUpdated={() => setRefreshKey((current) => current + 1)} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {monetizationStreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <Card key={stream.title} className="rounded-[1.75rem] border-0 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{stream.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stream.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="platform-blueprint" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="architecture" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.5rem] bg-slate-200/70 p-2 md:grid-cols-4">
            <TabsTrigger value="architecture" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Architecture</TabsTrigger>
            <TabsTrigger value="economics" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Economics</TabsTrigger>
            <TabsTrigger value="security" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Security</TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-[1rem] py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture">
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Gauge className="h-6 w-6 text-cyan-300" /> Full architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceStacks.map((stack) => (
                    <div key={stack.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-base font-bold">{stack.name}</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                        {stack.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-slate-900">Database schema + API surface</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Schema clusters</p>
                    <div className="mt-4 space-y-3">
                      {schemaTables.map((table) => (
                        <div key={table} className="rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          {table}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Core endpoints</p>
                    <div className="mt-4 space-y-3">
                      {apiGroups.map((group) => (
                        <div key={group.title} className="rounded-[1.25rem] border border-slate-200 p-4">
                          <p className="font-bold text-slate-900">{group.title}</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {group.routes.map((route) => (
                              <li key={route}>{route}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="economics">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <TrendingUp className="h-6 w-6 text-emerald-500" /> Revenue flow + treasury system
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
                    Verified revenue enters a single treasury ledger, platform costs are deducted, reserve buckets are filled, and only then is a capped reward pool minted for the next payout epoch.
                  </div>
                  <div className="space-y-3">
                    {treasuryAllocations.map((allocation) => (
                      <div key={allocation.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                          <span>{allocation.label}</span>
                          <span>{allocation.value}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100">
                          <div className={`h-3 rounded-full ${allocation.color}`} style={{ width: `${allocation.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Zap className="h-6 w-6 text-amber-300" /> Reward balancing logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-sm leading-7 text-slate-300">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    Available Reward Pool = Verified Revenue − Ops Costs − Reserve Allocation
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    User Reward Value = (User Contribution Score ÷ Total Contribution Score) × Available Reward Pool
                  </div>
                  <ul className="space-y-3">
                    <li>• Dynamic payout scaling reacts to liquidity coverage and fraud-adjusted revenue quality.</li>
                    <li>• Daily reward multipliers shrink automatically when cash conversion lags or reserve floors are threatened.</li>
                    <li>• Treasury protections can delay non-essential withdrawals to stop bank-run behavior.</li>
                    <li>• Growth events expand only after reserve, security, and liquidity ratios clear minimum thresholds.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div id="risk-controls" className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <Shield className="h-6 w-6 text-rose-500" /> Fraud prevention logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {protectionLayers.map((layer, index) => (
                    <div key={layer} className="flex gap-4 rounded-[1.5rem] bg-slate-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{layer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="rounded-[2rem] border-0 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                      <Wallet className="h-6 w-6 text-orange-500" /> Crypto payout flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
                    <p>1. User earns off-chain points from verified engagement.</p>
                    <p>2. Treasury converts eligible balances into a delayed withdrawal quote.</p>
                    <p>3. Risk engine checks wallet duplication, AML flags, velocity, and reserve pressure.</p>
                    <p>4. Approved batches settle through multisig-controlled rails on Polygon, Solana, Litecoin, or USDC networks.</p>
                  </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-0 bg-[linear-gradient(180deg,#eef2ff,#ffffff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                      <Lock className="h-6 w-6 text-violet-500" /> Security implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
                    <p>JWT auth, refresh token rotation, encrypted secrets, immutable audits, RBAC, WAF, and DDoS mitigation are baseline controls.</p>
                    <p>High-risk actions require stronger auth context, signed admin actions, and dual-control treasury approvals.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)] lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Bot className="h-6 w-6 text-cyan-300" /> AI systems + backend services
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {aiSystems.map((system) => (
                    <div key={system.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-lg font-bold text-white">{system.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{system.copy}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                    <Radar className="h-6 w-6 text-pink-500" /> DevOps + monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
                  <p>Dockerized services run behind Cloudflare on autoscaling clusters, with CDN caching, isolated queues, and regional failover.</p>
                  <p>Prometheus tracks latency, queue depth, and reserve ratios while Grafana, PostHog, and ClickHouse surface fraud and retention trends.</p>
                  <p>Cost control comes from off-chain settlement batching, ad mediation optimization, cold-storage treasury segregation, and intelligent scaling windows.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <Trophy className="h-6 w-6 text-fuchsia-500" /> Frontend structure + retention engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
              <p>The user experience is organized around Home, Tasks, Mining Lab, Clans, Marketplace, Wallet, and Trust Center screens.</p>
              <p>Retention loops include daily streaks, upgradeable virtual rigs, clans, seasonal ladders, prestige tracks, events, passes, and cosmetic drops.</p>
              <p>Admin surfaces focus on treasury health, fraud queues, revenue cohorts, sponsor campaigns, and withdrawal reviews to minimize manual work.</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 bg-[linear-gradient(180deg,#f5f3ff,#ffffff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <Brain className="h-6 w-6 text-violet-500" /> Sustainability + risk analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-700">
              <p>The model remains sustainable only if verified revenue quality, reserve coverage, fraud suppression, and withdrawal conversion stay within forecast ranges.</p>
              <Separator />
              <ul className="space-y-2">
                {operatingPrinciples.map((principle) => (
                  <li key={principle} className="flex gap-3">
                    <Activity className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <p>
                Key risks: partner revenue volatility, ad fraud pressure, payout regulation, app-store policy conflicts, wallet compliance requirements, and false-positive risk scoring. The design mitigates these with adaptive throttles, reserve locks, human review queues, and conservative withdrawal timing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Index;
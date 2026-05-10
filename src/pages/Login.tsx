import { useEffect, useState } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SupabaseAuthPanel from "@/components/supabase-auth-panel";
import type { AuthSession } from "@/lib/supabase";
import { readSession } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<AuthSession | null>(readSession());

  useEffect(() => {
    if (session?.access_token) {
      const nextPath = (location.state as { from?: string } | null)?.from || "/";
      navigate(nextPath, { replace: true });
    }
  }, [location.state, navigate, session]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Badge className="rounded-full border-0 bg-primary/10 px-4 py-1.5 text-primary">
            Secure account access
          </Badge>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Coins className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                NovaForge Loop
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Sign in to manage your wallets and rewards.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Access your private dashboard, connect payout wallets, and submit withdrawal requests through your secured account.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Private wallet records",
                "Withdrawal request tools",
                "Persistent account access",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/50 bg-white/70 p-4 text-sm font-medium text-slate-700 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <SupabaseAuthPanel
            session={session}
            onAuthenticated={(nextSession) => {
              setSession(nextSession);
            }}
            onSignedOut={() => {
              setSession(null);
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default Login;
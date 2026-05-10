import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, LogOut, ShieldCheck, Sparkles } from "lucide-react";

import {
  type AuthSession,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  storeSession,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";

type SupabaseAuthPanelProps = {
  session: AuthSession | null;
  onAuthenticated: (session: AuthSession) => void;
  onSignedOut: () => void;
};

const authBenefits = [
  "View your private wallet and withdrawal records",
  "Link payout wallets to your account dashboard",
  "Submit withdrawal requests from authenticated mode",
];

const SupabaseAuthPanel = ({
  session,
  onAuthenticated,
  onSignedOut,
}: SupabaseAuthPanelProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
  });

  useEffect(() => {
    if (!session) return;
    storeSession(session);
  }, [session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      if (!form.firstName.trim() || !form.username.trim()) {
        const errorMessage = "First name and username are required.";
        setMessage(errorMessage);
        showError(errorMessage);
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          data: {
            username: form.username.trim(),
            first_name: form.firstName.trim(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.msg || result.error_description || result.message || "Unable to create account.";
        setMessage(errorMessage);
        showError(errorMessage);
        setLoading(false);
        return;
      }

      const successMessage = "Account created. Please confirm your email, then sign in.";
      setMessage(successMessage);
      showSuccess(successMessage);
      setMode("signin");
      setLoading(false);
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.access_token || !result.user?.id) {
      const errorMessage = result.error_description || result.message || "Unable to sign in.";
      setMessage(errorMessage);
      showError(errorMessage);
      setLoading(false);
      return;
    }

    const nextSession: AuthSession = {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_at: result.expires_at,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    };

    storeSession(nextSession);
    onAuthenticated(nextSession);

    const successMessage = "Signed in successfully.";
    setMessage(successMessage);
    showSuccess(successMessage);
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
    }

    storeSession(null);
    onSignedOut();
    const successMessage = "Signed out.";
    setMessage(successMessage);
    showSuccess(successMessage);
  };

  if (session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.22),_transparent_38%),linear-gradient(135deg,#1e1b4b,#312e81_45%,#0f172a)] text-white shadow-[0_30px_90px_rgba(49,46,129,0.32)]">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <ShieldCheck className="h-4 w-4" />
            Authenticated session
          </div>
          <CardTitle className="text-2xl font-black">You’re signed in and ready to manage rewards.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-sm text-white/85">
            <p className="font-semibold">{session.user.email || "Authenticated user"}</p>
            <p className="mt-1 break-all text-xs text-white/70">{session.user.id}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {authBenefits.map((benefit) => (
              <div key={benefit} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/80">
                {benefit}
              </div>
            ))}
          </div>

          <Button onClick={handleSignOut} className="h-11 w-full rounded-full bg-white text-slate-900 hover:bg-white/90">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
          {message ? <p className="text-sm text-white/80">{message}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.22),_transparent_38%),linear-gradient(135deg,#1e1b4b,#312e81_45%,#0f172a)] text-white shadow-[0_30px_90px_rgba(49,46,129,0.32)]">
      <CardHeader className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          <Sparkles className="h-4 w-4" />
          Secure account access
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-black">Create an account or sign in.</CardTitle>
          <p className="text-sm leading-6 text-white/75">
            Use your account to unlock private wallet details, live withdrawal records, and authenticated dashboard actions.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {authBenefits.map((benefit) => (
            <div key={benefit} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/80">
              {benefit}
            </div>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2 rounded-[1rem] bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-[0.875rem] px-4 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-white text-slate-900" : "text-white/80"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-[0.875rem] px-4 py-2 text-sm font-semibold transition ${
                mode === "signin" ? "bg-white text-slate-900" : "text-white/80"
              }`}
            >
              Sign in
            </button>
          </div>

          {mode === "signup" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">
                  First name
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                  placeholder="Nova"
                  required={mode === "signup"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                  placeholder="novaforge"
                  required={mode === "signup"}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
              placeholder="••••••••"
              required
            />
          </div>
          <Button disabled={loading} className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-white/90">
            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : "Access dashboard"}
          </Button>
          {message ? <p className="text-sm text-white/80">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
};

export default SupabaseAuthPanel;
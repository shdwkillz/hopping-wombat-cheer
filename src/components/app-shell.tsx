import { Coins, LayoutDashboard, LogIn, UserCircle2, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import type { AuthSession } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  session: AuthSession | null;
  children: React.ReactNode;
};

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: UserCircle2 },
  { label: "Wallets", href: "/wallets", icon: Wallet },
];

const AppShell = ({ session, children }: AppShellProps) => {
  const location = useLocation();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 mb-6 rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <Link to="/" className="text-lg font-black tracking-tight text-slate-900">
                  NovaForge Loop
                </Link>
                <p className="text-sm text-slate-500">Revenue-backed rewards dashboard</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <nav className="flex flex-wrap gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                        active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {session ? (
                <Badge className="rounded-full border-0 bg-emerald-100 px-4 py-2 text-emerald-700">
                  {session.user.email || "Signed in"}
                </Badge>
              ) : (
                <Button asChild className="rounded-full">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
};

export default AppShell;
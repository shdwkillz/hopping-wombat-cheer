import { ArrowRight, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import type { AuthSession } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HomePersonalizedHeroProps = {
  session: AuthSession;
};

const HomePersonalizedHero = ({ session }: HomePersonalizedHeroProps) => {
  const displayName = session.user.email?.split("@")[0] || "Member";

  return (
    <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,#ffffff,#f5f3ff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge className="rounded-full border-0 bg-emerald-100 px-4 py-1.5 text-emerald-700">
              Signed in
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {displayName}.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Your account is active, and you can now manage wallets, review withdrawals, and update your profile from the live dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
            <Button asChild className="h-12 rounded-full px-6">
              <Link to="/profile">
                <Sparkles className="mr-2 h-4 w-4" />
                Open profile
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-primary/20 bg-white/80 px-6 text-primary hover:bg-primary/5"
            >
              <Link to="/wallets">
                <Wallet className="mr-2 h-4 w-4" />
                Manage wallets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomePersonalizedHero;
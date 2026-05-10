import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PublicLaunchBanner = () => {
  return (
    <Card className="rounded-[2rem] border-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,#ffffff,#f5f3ff)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge className="rounded-full border-0 bg-primary/10 px-4 py-1.5 text-primary">
              Public preview now live
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Explore the dashboard, then create an account to unlock private actions.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Visitors can review the platform concept and live public data first, while signed-in members can manage wallets, profiles, and withdrawal requests.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Protected account routes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Live product preview
              </span>
            </div>
          </div>

          <Button asChild className="h-12 rounded-full px-6">
            <Link to="/login">
              Try secure access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicLaunchBanner;
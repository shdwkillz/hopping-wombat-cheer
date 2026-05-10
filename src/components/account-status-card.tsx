import { CheckCircle2, ShieldAlert, UserRound, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
  };
};

type AccountStatusCardProps = {
  session: AuthSession | null;
};

const AccountStatusCard = ({ session }: AccountStatusCardProps) => {
  const isConnected = Boolean(session?.access_token);

  return (
    <Card className="rounded-[1.75rem] border-0 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                Account status
              </Badge>
              {isConnected ? (
                <Badge className="rounded-full border-0 bg-emerald-100 px-3 py-1 text-emerald-700">
                  Connected
                </Badge>
              ) : (
                <Badge className="rounded-full border-0 bg-amber-100 px-3 py-1 text-amber-700">
                  Guest mode
                </Badge>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-500">
                {session ? "Signed in as" : "Current experience"}
              </p>
              <p className="mt-1 break-all text-lg font-bold text-slate-900">
                {session?.user.email || "Browsing without an account"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <UserRound className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Identity</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {session ? "Authenticated" : "Anonymous"}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Wifi className="h-4 w-4 text-cyan-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Live data</span>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Active
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Limited
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountStatusCard;
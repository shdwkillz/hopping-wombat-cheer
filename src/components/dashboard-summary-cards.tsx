import { ShieldCheck, Sparkles, Trophy, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DashboardSummaryCardsProps = {
  miningPower: number;
  xp: number;
  walletCount: number;
  withdrawalCount: number;
};

const items = [
  {
    key: "miningPower",
    label: "Mining power",
    icon: Sparkles,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    key: "xp",
    label: "XP",
    icon: Trophy,
    accent: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    key: "walletCount",
    label: "Linked wallets",
    icon: Wallet,
    accent: "bg-cyan-100 text-cyan-700",
  },
  {
    key: "withdrawalCount",
    label: "Withdrawal requests",
    icon: ShieldCheck,
    accent: "bg-emerald-100 text-emerald-700",
  },
] as const;

const DashboardSummaryCards = ({
  miningPower,
  xp,
  walletCount,
  withdrawalCount,
}: DashboardSummaryCardsProps) => {
  const values = {
    miningPower,
    xp,
    walletCount,
    withdrawalCount,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.key}
            className="rounded-[1.75rem] border-0 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {values[item.key]}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${item.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardSummaryCards;
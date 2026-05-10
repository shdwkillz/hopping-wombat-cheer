import { FormEvent, useState } from "react";
import { ArrowDownToLine, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";

type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
  };
};

type SupabaseActionsPanelProps = {
  session: AuthSession | null;
  onUpdated: () => void;
};

const SUPABASE_URL = "https://gydhnsdhqbvsdjtxucgk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZGhuc2RocWJ2c2RqdHh1Y2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTAzMzMsImV4cCI6MjA5Mzk2NjMzM30.47mfKFIyF6FDACryWIoyEBw5uAMJeqpWxodirr0f_B8";

const SupabaseActionsPanel = ({ session, onUpdated }: SupabaseActionsPanelProps) => {
  const [walletForm, setWalletForm] = useState({
    network: "polygon",
    address: "",
    label: "",
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    walletId: "",
    network: "polygon",
    amountPoints: "",
  });
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900">Account actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Sign in first to link a wallet and request a withdrawal.
          </div>
        </CardContent>
      </Card>
    );
  }

  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const handleWalletSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWalletLoading(true);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/wallets`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: session.user.id,
        network: walletForm.network,
        address: walletForm.address,
        label: walletForm.label || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showError(result.message || "Could not link wallet.");
      setWalletLoading(false);
      return;
    }

    setWalletForm({
      network: walletForm.network,
      address: "",
      label: "",
    });
    if (result[0]?.id) {
      setWithdrawalForm((current) => ({
        ...current,
        walletId: result[0].id,
        network: result[0].network || current.network,
      }));
    }
    showSuccess("Wallet linked.");
    setWalletLoading(false);
    onUpdated();
  };

  const handleWithdrawalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWithdrawalLoading(true);

    const amount = Number(withdrawalForm.amountPoints);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/withdrawal_requests`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: session.user.id,
        wallet_id: withdrawalForm.walletId,
        network: withdrawalForm.network,
        amount_points: amount,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showError(result.message || "Could not submit withdrawal request.");
      setWithdrawalLoading(false);
      return;
    }

    setWithdrawalForm((current) => ({
      ...current,
      amountPoints: "",
    }));
    showSuccess("Withdrawal request submitted.");
    setWithdrawalLoading(false);
    onUpdated();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Wallet className="h-6 w-6 text-primary" /> Link wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleWalletSubmit}>
            <div className="space-y-2">
              <Label htmlFor="network" className="text-slate-900">
                Network
              </Label>
              <Input
                id="network"
                value={walletForm.network}
                onChange={(event) => setWalletForm((current) => ({ ...current, network: event.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="polygon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-900">
                Wallet address
              </Label>
              <Input
                id="address"
                value={walletForm.address}
                onChange={(event) => setWalletForm((current) => ({ ...current, address: event.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="0x123..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label" className="text-slate-900">
                Label
              </Label>
              <Input
                id="label"
                value={walletForm.label}
                onChange={(event) => setWalletForm((current) => ({ ...current, label: event.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Main wallet"
              />
            </div>
            <Button disabled={walletLoading} className="h-12 w-full rounded-full">
              {walletLoading ? "Saving..." : "Link wallet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <ArrowDownToLine className="h-6 w-6 text-cyan-300" /> Request withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleWithdrawalSubmit}>
            <div className="space-y-2">
              <Label htmlFor="walletId" className="text-white">
                Wallet ID
              </Label>
              <Input
                id="walletId"
                value={withdrawalForm.walletId}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, walletId: event.target.value }))}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                placeholder="Paste linked wallet ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdrawalNetwork" className="text-white">
                Network
              </Label>
              <Input
                id="withdrawalNetwork"
                value={withdrawalForm.network}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, network: event.target.value }))}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                placeholder="polygon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountPoints" className="text-white">
                Amount points
              </Label>
              <Input
                id="amountPoints"
                type="number"
                min="1"
                value={withdrawalForm.amountPoints}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, amountPoints: event.target.value }))}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/50"
                placeholder="2500"
                required
              />
            </div>
            <Button disabled={withdrawalLoading} className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-white/90">
              {withdrawalLoading ? "Submitting..." : "Request withdrawal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseActionsPanel;
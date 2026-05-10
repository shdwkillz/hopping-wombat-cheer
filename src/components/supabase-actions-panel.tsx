import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Wallet } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch, createJsonHeaders } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";

type WalletRecord = {
  id: string;
  network: string;
  address: string;
  is_verified: boolean;
  label?: string | null;
};

type SupabaseActionsPanelProps = {
  session: AuthSession | null;
  onUpdated: () => void;
};

const shortenAddress = (value: string) => {
  if (value.length < 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const SupabaseActionsPanel = ({ session, onUpdated }: SupabaseActionsPanelProps) => {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
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
  const [walletsLoading, setWalletsLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setWallets([]);
      return;
    }

    setWalletsLoading(true);

    authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/wallets?select=id,network,address,is_verified,label&user_id=eq.${session.user.id}&order=created_at.desc`,
    )
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not load wallets.");
        }

        const nextWallets = result as WalletRecord[];
        setWallets(nextWallets);

        if (nextWallets.length && !withdrawalForm.walletId) {
          setWithdrawalForm((current) => ({
            ...current,
            walletId: nextWallets[0].id,
            network: nextWallets[0].network,
          }));
        }
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load wallets.");
      })
      .finally(() => {
        setWalletsLoading(false);
      });
  }, [session, withdrawalForm.walletId]);

  const walletAddressHint = useMemo(() => {
    if (!walletForm.address) return "Paste the payout address for this network.";
    return walletForm.address.trim().length < 8 ? "Wallet address looks too short." : null;
  }, [walletForm.address]);

  const walletNetworkHint = useMemo(() => {
    if (!walletForm.network) return "Choose the payout network.";
    return walletForm.network.trim().length < 3 ? "Network name looks too short." : null;
  }, [walletForm.network]);

  const withdrawalAmountHint = useMemo(() => {
    if (!withdrawalForm.amountPoints) return "Enter how many points you want to convert.";
    const amount = Number(withdrawalForm.amountPoints);
    if (Number.isNaN(amount) || amount < 1) return "Enter a valid amount greater than 0.";
    return null;
  }, [withdrawalForm.amountPoints]);

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900">Account actions</CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Sign in to connect a wallet and submit a withdrawal request from your personal dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            You are currently browsing in guest mode. Once signed in, you can link a payout wallet, review your saved addresses, and send withdrawal requests.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleWalletSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (walletAddressHint || walletNetworkHint) {
      showError("Please review your wallet details before saving.");
      return;
    }

    setWalletLoading(true);

    const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/wallets`, {
      method: "POST",
      headers: createJsonHeaders(),
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

    const createdWallet = result[0] as WalletRecord | undefined;

    setWalletForm({
      network: walletForm.network,
      address: "",
      label: "",
    });

    if (createdWallet?.id) {
      setWallets((current) => [createdWallet, ...current]);
      setWithdrawalForm((current) => ({
        ...current,
        walletId: createdWallet.id,
        network: createdWallet.network || current.network,
      }));
    }

    showSuccess("Wallet linked.");
    setWalletLoading(false);
    onUpdated();
  };

  const handleWithdrawalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(withdrawalForm.amountPoints);

    if (!withdrawalForm.walletId || withdrawalAmountHint || Number.isNaN(amount) || amount < 1) {
      showError("Choose a wallet and enter a valid amount.");
      return;
    }

    setWithdrawalLoading(true);

    const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/withdrawal_requests`, {
      method: "POST",
      headers: createJsonHeaders(),
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
          <CardDescription className="text-base leading-7 text-slate-600">
            Add the wallet address where you want future payouts to be sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-900">{session.user.email || "authenticated user"}</span>
          </div>

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
              <p className={`text-xs ${walletNetworkHint ? "text-amber-600" : "text-slate-500"}`}>
                {walletNetworkHint || "Examples: polygon, solana, litecoin, usdc."}
              </p>
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
              <p className={`text-xs ${walletAddressHint && walletForm.address ? "text-amber-600" : "text-slate-500"}`}>
                {walletAddressHint}
              </p>
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
              <p className="text-xs text-slate-500">Optional name to help you recognize this wallet later.</p>
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
          <CardDescription className="text-base leading-7 text-slate-300">
            Choose a linked wallet and submit the number of points you want to convert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {walletsLoading
              ? "Loading your wallets..."
              : wallets.length
                ? "Choose one of your linked wallets below."
                : "You do not have any linked wallets yet. Add one on the left to continue."}
          </div>

          <form className="space-y-4" onSubmit={handleWithdrawalSubmit}>
            <div className="space-y-2">
              <Label className="text-white">Choose wallet</Label>
              <div className="grid gap-3">
                {wallets.map((wallet) => {
                  const selected = withdrawalForm.walletId === wallet.id;

                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() =>
                        setWithdrawalForm((current) => ({
                          ...current,
                          walletId: wallet.id,
                          network: wallet.network,
                        }))
                      }
                      className={`rounded-[1.25rem] border p-4 text-left transition ${
                        selected
                          ? "border-cyan-300 bg-cyan-300/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold capitalize text-white">
                            {wallet.label || wallet.network}
                          </p>
                          <p className="text-xs text-slate-300">{shortenAddress(wallet.address)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{wallet.network}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{wallet.is_verified ? "Verified" : "Pending"}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!walletsLoading && !wallets.length ? (
                <p className="text-xs text-amber-200">Add a wallet first to unlock withdrawal requests.</p>
              ) : null}
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
              <p className="text-xs text-slate-400">This follows the selected wallet but can still be adjusted if needed.</p>
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
              <p className={`text-xs ${withdrawalAmountHint && withdrawalForm.amountPoints ? "text-amber-200" : "text-slate-400"}`}>
                {withdrawalAmountHint || "Only whole, positive point amounts can be requested."}
              </p>
            </div>
            <Button disabled={withdrawalLoading || !wallets.length} className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-white/90">
              {withdrawalLoading ? "Submitting..." : "Request withdrawal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseActionsPanel;
import { useEffect, useState } from "react";
import { CheckCircle2, Wallet } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch } from "@/lib/supabase";
import ConfirmDeleteWalletDialog from "@/components/confirm-delete-wallet-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";

type WalletRecord = {
  id: string;
  network: string;
  address: string;
  label: string | null;
  is_verified: boolean;
  created_at?: string;
};

type WalletsManagementPanelProps = {
  session: AuthSession | null;
  refreshKey: number;
  onUpdated: () => void;
};

const shortenAddress = (value: string) => {
  if (value.length < 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const WalletsManagementPanel = ({
  session,
  refreshKey,
  onUpdated,
}: WalletsManagementPanelProps) => {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(session));
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/wallets?select=id,network,address,label,is_verified,created_at&user_id=eq.${session.user.id}&order=created_at.desc`,
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load wallets.");
        }

        setWallets(result as WalletRecord[]);
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load wallets.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey, session]);

  const handleDelete = async (walletId: string) => {
    if (!session) return;

    setDeletingId(walletId);

    const response = await authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/wallets?id=eq.${walletId}&user_id=eq.${session.user.id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const result = await response.json();
      showError(result.message || "Could not remove wallet.");
      setDeletingId(null);
      return;
    }

    setWallets((current) => current.filter((wallet) => wallet.id !== walletId));
    showSuccess("Wallet removed.");
    setDeletingId(null);
    onUpdated();
  };

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900">Wallet management</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Sign in to manage your payout wallets.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
          <Wallet className="h-6 w-6 text-primary" />
          Saved wallets
        </CardTitle>
        <CardDescription className="text-base leading-7 text-slate-600">
          Review and remove payout destinations connected to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-500">Loading wallets...</div>
        ) : wallets.length ? (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold capitalize text-slate-900">
                    {wallet.label || wallet.network}
                  </p>
                  {wallet.is_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{shortenAddress(wallet.address)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{wallet.network}</p>
              </div>

              <ConfirmDeleteWalletDialog
                disabled={deletingId === wallet.id}
                walletLabel={wallet.label || wallet.network}
                onConfirm={() => handleDelete(wallet.id)}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            You do not have any saved wallets yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletsManagementPanel;
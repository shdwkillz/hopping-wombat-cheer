import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteWalletDialogProps = {
  disabled?: boolean;
  walletLabel: string;
  onConfirm: () => void;
};

const ConfirmDeleteWalletDialog = ({
  disabled = false,
  walletLabel,
  onConfirm,
}: ConfirmDeleteWalletDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {disabled ? "Removing..." : "Remove"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[1.75rem] border-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            Remove wallet
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-slate-600">
            This will remove <span className="font-semibold text-slate-900">{walletLabel}</span> from your saved payout wallets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
          >
            Remove wallet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteWalletDialog;
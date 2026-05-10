import { ChevronDown, LogOut, Settings, UserCircle2, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, storeSession } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess } from "@/utils/toast";

type AccountMenuProps = {
  session: AuthSession;
};

const AccountMenu = ({ session }: AccountMenuProps) => {
  const navigate = useNavigate();
  const email = session.user.email || "Signed in";
  const initials = email.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    if (session.access_token) {
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
    showSuccess("Signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto rounded-full border border-white/60 bg-white/80 px-2 py-2 hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                {email}
              </p>
              <p className="text-xs text-slate-500">Account</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-[1.25rem] border-slate-200 p-2"
      >
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-slate-900">{email}</p>
          <p className="mt-1 text-xs text-slate-500">Signed-in account</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
          <Link to="/profile" className="flex items-center">
            <UserCircle2 className="mr-2 h-4 w-4 text-primary" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
          <Link to="/wallets" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4 text-cyan-600" />
            Wallets
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
          <Link to="/profile" className="flex items-center">
            <Settings className="mr-2 h-4 w-4 text-violet-600" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer rounded-xl text-rose-600 focus:text-rose-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
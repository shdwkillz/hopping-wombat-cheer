import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, Save, UserCircle2 } from "lucide-react";

import type { AuthSession } from "@/lib/supabase";
import { SUPABASE_URL, authenticatedFetch, createJsonHeaders } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

type ProfileRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  role: string;
  mining_power: number;
  xp: number;
  streak_days: number;
};

type ProfilePanelProps = {
  session: AuthSession | null;
};

const ProfilePanel = ({ session }: ProfilePanelProps) => {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [loading, setLoading] = useState(Boolean(session));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,first_name,last_name,username,role,mining_power,xp,streak_days&id=eq.${session.user.id}&limit=1`,
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load profile.");
        }

        const nextProfile = (result[0] as ProfileRecord | undefined) ?? null;
        setProfile(nextProfile);
        setForm({
          firstName: nextProfile?.first_name || "",
          lastName: nextProfile?.last_name || "",
          username: nextProfile?.username || "",
        });
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : "Could not load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) return;

    setSaving(true);

    const response = await authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`,
      {
        method: "PATCH",
        headers: createJsonHeaders(),
        body: JSON.stringify({
          first_name: form.firstName.trim() || null,
          last_name: form.lastName.trim() || null,
          username: form.username.trim() || null,
          updated_at: new Date().toISOString(),
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      showError(result.message || "Could not save profile.");
      setSaving(false);
      return;
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            first_name: form.firstName.trim() || null,
            last_name: form.lastName.trim() || null,
            username: form.username.trim() || null,
          }
        : current,
    );

    showSuccess("Profile updated.");
    setSaving(false);
  };

  if (!session) {
    return (
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900">Profile</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Sign in to manage your account details.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <UserCircle2 className="h-6 w-6 text-primary" />
            Edit profile
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Keep your public account identity up to date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-500">Loading profile...</div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-900">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                    className="h-11 rounded-2xl"
                    placeholder="Nova"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-900">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                    className="h-11 rounded-2xl"
                    placeholder="Forge"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-900">
                  Username
                </Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="h-11 rounded-2xl"
                  placeholder="novaforge"
                />
              </div>

              <Button disabled={saving} className="h-12 rounded-full px-6">
                {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Account snapshot</CardTitle>
          <CardDescription className="text-base leading-7 text-slate-300">
            A quick view of your current account standing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Role</p>
            <p className="mt-2 text-xl font-bold capitalize">{profile?.role || "member"}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Mining power</p>
            <p className="mt-2 text-xl font-bold">{profile?.mining_power || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">XP</p>
            <p className="mt-2 text-xl font-bold">{profile?.xp || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Streak days</p>
            <p className="mt-2 text-xl font-bold">{profile?.streak_days || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:col-span-2">
            <p className="text-sm text-slate-300">Email</p>
            <p className="mt-2 break-all text-base font-semibold">{session.user.email || "Authenticated user"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePanel;
import AppShell from "@/components/app-shell";
import FooterLinks from "@/components/footer-links";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <AppShell session={null}>
      <div className="space-y-6">
        <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Terms</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Terms of use</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                By using NovaForge Loop, you agree to use the platform responsibly and understand that account access, rewards, and withdrawals may be reviewed, limited, or delayed for safety and abuse prevention.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Accounts</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are responsible for maintaining the confidentiality of your login credentials and for activity that occurs under your account.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Rewards and withdrawals</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Rewards are not guaranteed, and withdrawal requests may be subject to review, timing delays, risk controls, and platform availability.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Acceptable use</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fraud, abuse, automation, evasion of security controls, or misuse of wallet and withdrawal systems may result in account restrictions or removal.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Contact</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  For questions about these terms, contact <a className="font-semibold text-primary" href="mailto:supportnovaforgeloop@pingmx.com">supportnovaforgeloop@pingmx.com</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <FooterLinks />
      </div>
    </AppShell>
  );
};

export default Terms;
import AppShell from "@/components/app-shell";
import FooterLinks from "@/components/footer-links";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <AppShell session={null}>
      <div className="space-y-6">
        <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Privacy</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Privacy policy</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                NovaForge Loop collects only the information needed to provide secure account access, wallet management, and reward-related product features.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">What we collect</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We may store account details such as email address, profile information, connected wallet records, and withdrawal activity needed to operate the service.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">How we use it</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your information is used to authenticate access, personalize the dashboard, support payouts, improve product reliability, and protect the platform from abuse.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We use authenticated access controls and protected database rules to reduce unauthorized access to private account records.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Contact</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  For privacy-related questions, contact <a className="font-semibold text-primary" href="mailto:support@novaforgeloop.com">support@novaforgeloop.com</a>.
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

export default Privacy;
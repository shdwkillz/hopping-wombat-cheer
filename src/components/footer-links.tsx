import { Mail, ShieldCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const FooterLinks = () => {
  return (
    <footer className="mt-10 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-black tracking-tight text-slate-900">NovaForge Loop</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Revenue-backed rewards dashboard with secure account access, wallet management, and withdrawal tracking.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            Privacy
          </Link>
          <Link
            to="/terms"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <FileText className="h-4 w-4 text-cyan-600" />
            Terms
          </Link>
          <a
            href="mailto:support@novaforgeloop.com"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <Mail className="h-4 w-4 text-violet-600" />
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterLinks;
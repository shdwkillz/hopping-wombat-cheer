import { Compass, House, SearchX } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl rounded-[2rem] border-0 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.1)] backdrop-blur">
        <CardContent className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
            <SearchX className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Page not found
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            We couldn’t find that page.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            The link may be broken, the page may have moved, or the address may be incorrect.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-2 text-slate-900">
                <Compass className="h-4 w-4 text-cyan-500" />
                <span className="font-semibold">Current path</span>
              </div>
              <p className="mt-2 break-all text-sm text-slate-600">{location.pathname}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-2 text-slate-900">
                <House className="h-4 w-4 text-primary" />
                <span className="font-semibold">Suggested action</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Return to the dashboard home and continue from there.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <Link to="/">
                <House className="mr-2 h-4 w-4" />
                Go to home
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/login">Go to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default NotFound;
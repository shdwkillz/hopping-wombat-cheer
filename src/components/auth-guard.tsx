import { Navigate, useLocation } from "react-router-dom";

import { readSession } from "@/lib/supabase";

type AuthGuardProps = {
  children: JSX.Element;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const session = readSession();

  if (!session?.access_token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AuthGuard;
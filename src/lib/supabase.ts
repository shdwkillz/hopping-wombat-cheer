export const SUPABASE_URL = "https://gydhnsdhqbvsdjtxucgk.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZGhuc2RocWJ2c2RqdHh1Y2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTAzMzMsImV4cCI6MjA5Mzk2NjMzM30.47mfKFIyF6FDACryWIoyEBw5uAMJeqpWxodirr0f_B8";
export const SESSION_STORAGE_KEY = "novaforge-supabase-session";
export const REFRESH_BUFFER_SECONDS = 60;

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
  };
};

export const isSessionShapeValid = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== "object") return false;

  const session = value as AuthSession;

  return Boolean(
    typeof session.access_token === "string" &&
      typeof session.refresh_token === "string" &&
      session.user &&
      typeof session.user.id === "string",
  );
};

export const isSessionExpired = (session: AuthSession) => {
  if (!session.expires_at) return false;
  return session.expires_at <= Math.floor(Date.now() / 1000) + REFRESH_BUFFER_SECONDS;
};

export const readSession = () => {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) return null;

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isSessionShapeValid(parsedValue)) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsedValue;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export const storeSession = (session: AuthSession | null) => {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const createAuthHeaders = (accessToken?: string) => ({
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: accessToken
    ? `Bearer ${accessToken}`
    : `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
});

export const createJsonHeaders = (accessToken?: string) => ({
  ...createAuthHeaders(accessToken),
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

export const refreshSession = async (session: AuthSession) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: session.refresh_token,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.access_token || !result.user?.id) {
    throw new Error(result.error_description || result.message || "Unable to refresh session.");
  }

  const nextSession: AuthSession = {
    access_token: result.access_token,
    refresh_token: result.refresh_token || session.refresh_token,
    expires_at: result.expires_at,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
  };

  storeSession(nextSession);
  return nextSession;
};
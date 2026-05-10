const unsupported = async () => ({
  data: null,
  error: new Error("Supabase client package is not installed in this environment yet."),
});

const queryBuilder = {
  select: () => queryBuilder,
  eq: () => queryBuilder,
  order: () => queryBuilder,
  limit: () => queryBuilder,
  maybeSingle: unsupported,
  single: unsupported,
  insert: () => queryBuilder,
  update: () => queryBuilder,
  delete: () => queryBuilder,
  then: undefined,
};

export type Session = {
  user?: {
    id: string;
    email?: string;
  };
} | null;

export type AuthError = Error;

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null as Session }, error: null }),
    onAuthStateChange: (_callback: (_event: string, _session: Session) => void) => ({
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    }),
    signUp: async () => ({ error: new Error("Supabase auth package is not installed in this environment yet.") }),
    signInWithPassword: async () => ({ error: new Error("Supabase auth package is not installed in this environment yet.") }),
    signOut: async () => ({ error: null }),
  },
  from: (_table: string) => queryBuilder,
};

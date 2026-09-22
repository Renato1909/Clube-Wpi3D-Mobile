import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type AuthSessionApi = {
  getSession: () => Promise<{
    data: { session: Session | null };
    error: unknown | null;
  }>;
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => {
    data: {
      subscription: {
        unsubscribe: () => void;
      };
    };
  };
  signOut: (options?: {
    scope?: "global" | "local" | "others";
  }) => Promise<{ error: unknown | null }>;
};

export async function getInitialSession(
  auth: Pick<AuthSessionApi, "getSession">,
) {
  const { data, error } = await auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToAuthSession(
  auth: Pick<AuthSessionApi, "onAuthStateChange">,
  onSessionChange: (session: Session | null) => void,
) {
  const {
    data: { subscription },
  } = auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });

  return () => subscription.unsubscribe();
}

export async function signOutCurrentSession(
  auth: Pick<AuthSessionApi, "signOut">,
) {
  const { error } = await auth.signOut({ scope: "local" });
  if (error) throw error;
}

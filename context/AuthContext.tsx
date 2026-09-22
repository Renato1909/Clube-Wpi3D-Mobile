import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  getInitialSession,
  signOutCurrentSession,
  subscribeToAuthSession,
} from "../lib/auth-session";
import { registerPushToken, unregisterPushToken } from "../lib/push";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const C = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeToAuthSession(
      supabase.auth,
      (nextSession) => {
        if (mounted) setSession(nextSession);
      },
    );

    void getInitialSession(supabase.auth)
      .then((nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    void registerPushToken(session.user.id).catch(() => undefined);
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        if (session?.user?.id) {
          await unregisterPushToken(session.user.id).catch(() => undefined);
        }

        await signOutCurrentSession(supabase.auth);
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useAuth() {
  const value = useContext(C);
  if (!value) throw new Error("useAuth fora do AuthProvider");
  return value;
}

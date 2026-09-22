import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  getInitialSession,
  signOutCurrentSession,
  subscribeToAuthSession,
  type AuthSessionApi,
} from "../lib/auth-session";

function makeSession(): Session {
  return {
    access_token: "access-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    expires_at: 1700000000,
    token_type: "bearer",
    user: {
      id: "user-1",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      aud: "authenticated",
      created_at: "2024-01-01T00:00:00.000Z",
    },
  } as Session;
}

function makeAuth(overrides: Partial<AuthSessionApi> = {}) {
  const session = makeSession();
  let callback:
    | ((event: AuthChangeEvent, nextSession: Session | null) => void)
    | undefined;
  let unsubscribed = false;

  const auth: AuthSessionApi = {
    getSession: jest.fn(async () => ({
      data: { session },
      error: null,
    })),
    onAuthStateChange: jest.fn(
      (nextCallback: (
        event: AuthChangeEvent,
        nextSession: Session | null,
      ) => void) => {
        callback = nextCallback;
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                unsubscribed = true;
              },
            },
          },
        };
      },
    ),
    signOut: jest.fn(async () => ({ error: null })),
    ...overrides,
  };

  return {
    auth,
    session,
    emit(nextSession: Session | null) {
      callback?.("INITIAL_SESSION", nextSession);
    },
    wasUnsubscribed: () => unsubscribed,
  };
}

test("initial session contract returns the persisted session", async () => {
  const { auth, session } = makeAuth();

  await expect(getInitialSession(auth)).resolves.toBe(session);
  expect(auth.getSession).toHaveBeenCalledTimes(1);
});

test("initial session contract propagates auth storage errors", async () => {
  const error = new Error("storage failure");
  const { auth } = makeAuth({
    getSession: jest.fn(async () => ({
      data: { session: null },
      error,
    })),
  });

  await expect(getInitialSession(auth)).rejects.toBe(error);
});

test("auth listener forwards sessions and exposes cleanup", () => {
  const { auth, session, emit, wasUnsubscribed } = makeAuth();
  const onSessionChange = jest.fn();

  const unsubscribe = subscribeToAuthSession(auth, onSessionChange);

  emit(session);
  emit(null);

  expect(onSessionChange).toHaveBeenNthCalledWith(1, session);
  expect(onSessionChange).toHaveBeenNthCalledWith(2, null);

  unsubscribe();
  expect(wasUnsubscribed()).toBe(true);
});

test("logout contract is local to the current device session", async () => {
  const { auth } = makeAuth();

  await expect(signOutCurrentSession(auth)).resolves.toBeUndefined();
  expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
});

test("logout contract propagates auth errors", async () => {
  const error = new Error("logout failed");
  const { auth } = makeAuth({
    signOut: jest.fn(async () => ({ error })),
  });

  await expect(signOutCurrentSession(auth)).rejects.toBe(error);
});

export const AUTH_PASSWORD_MIN_LENGTH = 8;

export function resolveAuthNext(next?: string) {
  return next === "/minha-conta" || next === "/redefinir-senha" ? next : "/minha-conta";
}

export function normalizeAuthCode(code?: string) {
  return typeof code === "string" && code.length > 0 ? code : null;
}


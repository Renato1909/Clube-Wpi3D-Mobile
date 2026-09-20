import { normalizeAuthCode,resolveAuthNext } from "../lib/auth";
test("auth callback only accepts app-local next paths",()=>{expect(resolveAuthNext("/redefinir-senha")).toBe("/redefinir-senha");expect(resolveAuthNext("https://example.com")).toBe("/minha-conta");expect(resolveAuthNext(undefined)).toBe("/minha-conta");});
test("auth code is normalized",()=>{expect(normalizeAuthCode("abc")).toBe("abc");expect(normalizeAuthCode("")).toBeNull();expect(normalizeAuthCode(undefined)).toBeNull();});

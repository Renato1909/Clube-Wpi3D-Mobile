import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildQuoteFilePath,
  rollbackQuoteSubmission,
} from "../lib/quote-submission";

describe("quote submission helpers", () => {
  test("builds a user-scoped sanitized storage path", () => {
    expect(
      buildQuoteFilePath("user-1", 42, "modelo final (v2).stl"),
    ).toBe("user-1/42/modelo_final__v2_.stl");
  });

  test("rolls back storage and database records in order", async () => {
    const remove = jest.fn().mockResolvedValue({ data: ["user-1/42/model.stl"], error: null });

    const quoteFilesUserEq = jest.fn().mockResolvedValue({ error: null });
    const quoteFilesQuoteEq = jest.fn(() => ({ eq: quoteFilesUserEq }));
    const quoteFilesDelete = jest.fn(() => ({ eq: quoteFilesQuoteEq }));

    const quoteUserEq = jest.fn().mockResolvedValue({ error: null });
    const quoteIdEq = jest.fn(() => ({ eq: quoteUserEq }));
    const quoteDelete = jest.fn(() => ({ eq: quoteIdEq }));

    const from = jest.fn((table: string) =>
      table === "quote_files"
        ? { delete: quoteFilesDelete }
        : { delete: quoteDelete },
    );

    const client = {
      storage: { from: jest.fn(() => ({ remove })) },
      from,
    } as unknown as SupabaseClient;

    const result = await rollbackQuoteSubmission(
      client,
      "user-1",
      42,
      ["user-1/42/model.stl"],
    );

    expect(result).toEqual({ ok: true, error: null });
    expect(remove).toHaveBeenCalledWith(["user-1/42/model.stl"]);
    expect(quoteFilesDelete).toHaveBeenCalled();
    expect(quoteDelete).toHaveBeenCalled();
  });

  test("does not delete database records when storage cleanup fails", async () => {
    const remove = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "permission denied" } });

    const quoteFilesDelete = jest.fn();
    const quoteDelete = jest.fn();

    const client = {
      storage: { from: jest.fn(() => ({ remove })) },
      from: jest.fn((table: string) =>
        table === "quote_files"
          ? { delete: quoteFilesDelete }
          : { delete: quoteDelete },
      ),
    } as unknown as SupabaseClient;

    const result = await rollbackQuoteSubmission(
      client,
      "user-1",
      42,
      ["user-1/42/model.stl"],
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("storage");
    expect(quoteFilesDelete).not.toHaveBeenCalled();
    expect(quoteDelete).not.toHaveBeenCalled();
  });
});

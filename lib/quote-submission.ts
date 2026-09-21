import type { SupabaseClient } from "@supabase/supabase-js";

export const QUOTE_FILES_BUCKET = "quote-files";

export function buildQuoteFilePath(
  userId: string,
  quoteId: number,
  fileName: string,
  index = 0,
) {
  const safeName =
    fileName
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .slice(-180) || "arquivo";

  const prefix = index > 0 ? `${index}-` : "";
  return `${userId}/${quoteId}/${prefix}${safeName}`;
}

export async function rollbackQuoteSubmission(
  client: SupabaseClient,
  userId: string,
  quoteId: number,
  uploadedPaths: string[],
) {
  if (uploadedPaths.length > 0) {
    const { error } = await client.storage
      .from(QUOTE_FILES_BUCKET)
      .remove(uploadedPaths);

    if (error) {
      return {
        ok: false,
        error: `storage: ${error.message}`,
      };
    }
  }

  const { error: filesError } = await client
    .from("quote_files")
    .delete()
    .eq("quote_id", quoteId)
    .eq("user_id", userId);

  if (filesError) {
    return {
      ok: false,
      error: `quote_files: ${filesError.message}`,
    };
  }

  const { error: quoteError } = await client
    .from("quotes")
    .delete()
    .eq("id", quoteId)
    .eq("user_id", userId);

  if (quoteError) {
    return {
      ok: false,
      error: `quotes: ${quoteError.message}`,
    };
  }

  return { ok: true, error: null };
}

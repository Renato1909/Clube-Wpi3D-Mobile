export const QUOTE_DESCRIPTION_MIN_LENGTH = 10;
export const QUOTE_DESCRIPTION_MAX_LENGTH = 5000;

export function validateQuoteDescription(value: string) {
  const text = value.trim();

  if (text.length < QUOTE_DESCRIPTION_MIN_LENGTH) {
    return "A descrição deve ter pelo menos 10 caracteres.";
  }

  if (text.length > QUOTE_DESCRIPTION_MAX_LENGTH) {
    return "A descrição deve ter no máximo 5000 caracteres.";
  }

  return null;
}

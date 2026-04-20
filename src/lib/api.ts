const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const apiOrigin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (apiOrigin) {
    return `${apiOrigin}${normalizedPath}`;
  }

  return `${basePath}${normalizedPath}`;
}

export async function readErrorText(res: Response): Promise<string> {
  const text = (await res.text().catch(() => "")).trim();

  if (!text) return "";

  const looksLikeHtml = /^<!doctype html>/i.test(text) || /<html[\s>]/i.test(text);
  if (looksLikeHtml) {
    return "The API route was not found. Set VITE_API_ORIGIN to your backend URL.";
  }

  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

export function isUrlSafe(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Explicitly reject dangerous executable or script URL schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Allow relative paths (e.g. /about, #pricing, ?filter=1)
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return true;
  }

  // Allow standard protocols
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    // Relative URL without leading slash or anchor
    return /^[a-zA-Z0-9_\-./#?&=%+]+$/.test(trimmed);
  }
}

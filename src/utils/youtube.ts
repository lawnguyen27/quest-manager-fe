/** Extract YouTube video id from common URL shapes. */
export function extractYoutubeVideoId(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const m = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return m[1];
      const s = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (s) return s[1];
    }
  } catch {
    return null;
  }
  return null;
}

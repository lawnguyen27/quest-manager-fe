import { useEffect, useState } from 'react';

/** Stable object URL for a selected `File` — revoked on change/unmount. */
export function useObjectUrlPreview(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || file.size === 0) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return url;
}

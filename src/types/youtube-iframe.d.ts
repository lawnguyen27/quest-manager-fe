export {};

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, options: YTPlayerOptions) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onStateChange?: (e: { data: number }) => void;
  };
}

interface YTPlayer {
  destroy(): void;
}

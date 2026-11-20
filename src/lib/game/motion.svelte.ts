class MotionState {
  reduced = $state(false);
  hidden = $state(false);
  pausedByApp = $state(false);

  private media: MediaQueryList | null = null;
  private forcedReduced: boolean | null = null;

  get paused(): boolean {
    return this.hidden || this.pausedByApp;
  }

  start(): void {
    if (typeof window === "undefined" || this.media) return;

    const query = new URLSearchParams(window.location.search).get("motion");
    this.forcedReduced =
      query === "off" || query === "reduce"
        ? true
        : query === "full"
          ? false
          : null;

    this.media = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.forcedReduced ?? this.media.matches;
    this.hidden = document.hidden;

    this.media.addEventListener("change", this.onMediaChange);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  stop(): void {
    if (this.media) {
      this.media.removeEventListener("change", this.onMediaChange);
      this.media = null;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.pausedByApp = false;
  }

  pause(): void {
    this.pausedByApp = true;
  }

  resume(): void {
    this.pausedByApp = false;
  }

  private onMediaChange = (event: MediaQueryListEvent): void => {
    if (this.forcedReduced === null) {
      this.reduced = event.matches;
    }
  };

  private onVisibility = (): void => {
    this.hidden = document.hidden;
  };
}

export const motion = new MotionState();

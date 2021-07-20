interface Window {
  // Load and mount unity webgl [MA]
  onLoadPlayer(): void;
  // Triggers when any change happens in the player [MA]
  onPlayingStateChange(
    isPlaying: string,
    isPaused: string,
    isPlayingIntervalAnimation: string,
    isLoading: string,
    isRepeatable: string,
  ): void;
  // Trriggers when is playing an animation with the gloss length [MA]
  CounterGloss(counter: number, glossLength: number): void;
  // Triggers when the splash screen closes [MA]
  FinishWelcome(flag: boolean): void;
}

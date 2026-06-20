// Extiende los tipos del DOM con las props del spec de Screen Capture
// que TypeScript todavía no incluye.
interface DisplayMediaStreamOptions {
  systemAudio?: "include" | "exclude";
  selfBrowserSurface?: "include" | "exclude";
  surfaceSwitching?: "include" | "exclude";
  monitorTypeSurfaces?: "include" | "exclude";
  preferCurrentTab?: boolean;
}

interface MediaTrackConstraintSet {
  suppressLocalAudioPlayback?: boolean;
}
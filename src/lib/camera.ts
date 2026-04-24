export const CAMERA_PRESET_NAMES = [
  'reset',
  'close-center',
  'close-left',
  'close-right',
  'dramatic-center',
] as const;

export type CameraPresetName = (typeof CAMERA_PRESET_NAMES)[number];

export interface CameraValues {
  x: number;
  y: number;
  zoom: number;
  depth: number;
  blur: number;
}

export interface CameraTarget extends CameraValues {
  fadeTime: number;
}

export interface CameraPlaneTargets {
  backgroundX: number;
  backgroundY: number;
  backgroundScale: number;
  characterX: number;
  characterY: number;
  characterScale: number;
}

export interface CameraViewport {
  width: number;
  height: number;
}

export const CAMERA_DEFAULT_STATE: CameraTarget = {
  x: 0,
  y: 0,
  zoom: 1,
  depth: 0,
  blur: 0,
  fadeTime: 600,
};

// These presets intentionally bias toward readable motion so the camera move
// feels noticeable in a 2D VN scene instead of reading like a tiny scale bump.
export const CAMERA_PRESETS: Record<CameraPresetName, CameraValues> = {
  reset: {
    x: 0,
    y: 0,
    zoom: 1,
    depth: 0,
    blur: 0,
  },
  'close-center': {
    x: 0,
    y: -90,
    zoom: 1.18,
    depth: 0.58,
    blur: 4,
  },
  'close-left': {
    x: -420,
    y: -80,
    zoom: 1.22,
    depth: 0.62,
    blur: 5,
  },
  'close-right': {
    x: 420,
    y: -80,
    zoom: 1.22,
    depth: 0.62,
    blur: 5,
  },
  'dramatic-center': {
    x: 0,
    y: -150,
    zoom: 1.28,
    depth: 0.82,
    blur: 7,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function interpolate(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

// Camera commands resolve to a full target state. Missing fields fall back to
// the chosen preset (or the neutral default) instead of accumulating runtime state.
export function resolveCameraTarget(input: {
  preset?: CameraPresetName;
  x?: number;
  y?: number;
  zoom?: number;
  depth?: number;
  blur?: number;
  fadeTime: number;
}): CameraTarget {
  const base = input.preset ? CAMERA_PRESETS[input.preset] : CAMERA_DEFAULT_STATE;

  return {
    x: input.x ?? base.x,
    y: input.y ?? base.y,
    zoom: input.zoom ?? base.zoom,
    depth: input.depth ?? base.depth,
    blur: input.blur ?? base.blur,
    fadeTime: input.fadeTime,
  };
}

// Assume background art matches the stage size. The only safe pan range is the
// extra coverage created by the current background scale; clamping here prevents black edges.
function clampBackgroundOffset(offset: number, scale: number, size: number) {
  const safeMargin = Math.max(0, ((scale - 1) * size) / 2);
  return clamp(offset, -safeMargin, safeMargin);
}

// The camera is rendered as two planes: characters follow the focus more aggressively,
// while the background moves and scales less to create parallax and fake depth.
export function getCameraPlaneTargets(camera: CameraValues, viewport: CameraViewport): CameraPlaneTargets {
  const depth = clamp(camera.depth, 0, 1);
  const zoom = Math.max(1, camera.zoom);
  const zoomDelta = zoom - 1;
  // Zoom controls how hard the stage shifts toward the focus point.
  const normalizedZoom = clamp(zoomDelta / 0.3, 0, 1);
  const focusMoveStrength = interpolate(0.55, 0.88, normalizedZoom);
  // Depth controls how reluctant the background is to follow the character plane.
  const backgroundMoveRatio = interpolate(1, 0.22, depth);
  const backgroundScaleRatio = interpolate(1, 0.35, depth);
  const backgroundScale = 1 + zoomDelta * backgroundScaleRatio;
  const characterX = -camera.x * focusMoveStrength;
  const characterY = -camera.y * focusMoveStrength;
  const rawBackgroundX = characterX * backgroundMoveRatio;
  const rawBackgroundY = characterY * backgroundMoveRatio;

  return {
    backgroundX: clampBackgroundOffset(rawBackgroundX, backgroundScale, viewport.width),
    backgroundY: clampBackgroundOffset(rawBackgroundY, backgroundScale, viewport.height),
    backgroundScale,
    characterX,
    characterY,
    characterScale: zoom,
  };
}

export type AutoAdvance = 'off' | 'correct' | 'always';
export type Style = 'choice' | 'mixed';
/** How sentence-building exercises work: type it with the words shown, or tap the words. */
export type BuildMode = 'type' | 'tap';

export interface Settings {
  autoAdvance: AutoAdvance;
  delaySeconds: number;
  secondChance: boolean;
  size: number;
  style: Style;
  buildMode: BuildMode;
}

export const SIZES = [5, 10, 20, 30, 50];
export const DELAYS = [1, 2, 4, 10];

export const DEFAULT_SETTINGS: Settings = {
  autoAdvance: 'correct',
  delaySeconds: 4,
  secondChance: true,
  size: 10,
  style: 'choice',
  buildMode: 'type',
};

const KEY = 'dutch-trainer/settings/v1';

/** Accepts anything (old or hand-edited storage) and keeps only valid values. */
export function parseSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  const d = DEFAULT_SETTINGS;
  return {
    autoAdvance: ['off', 'correct', 'always'].includes(r.autoAdvance as string)
      ? (r.autoAdvance as AutoAdvance)
      : d.autoAdvance,
    delaySeconds: DELAYS.includes(r.delaySeconds as number) ? (r.delaySeconds as number) : d.delaySeconds,
    secondChance: typeof r.secondChance === 'boolean' ? r.secondChance : d.secondChance,
    size: SIZES.includes(r.size as number) ? (r.size as number) : d.size,
    style: r.style === 'choice' || r.style === 'mixed' ? r.style : d.style,
    buildMode: r.buildMode === 'type' || r.buildMode === 'tap' ? r.buildMode : d.buildMode,
  };
}

export function loadSettings(): Settings {
  try {
    return parseSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable: settings just won't persist.
  }
}

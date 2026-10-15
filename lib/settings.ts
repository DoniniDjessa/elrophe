import { defaultSettings } from '@/data/site';
import type { SettingsKey, SiteSettings } from './types';

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Fusion profonde : les objets sont fusionnés, les tableaux et valeurs simples remplacés */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlain(base) || !isPlain(override)) return (override ?? base) as T;
  const out: Plain = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null) continue;
    out[key] = isPlain(out[key]) && isPlain(value) ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

export function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const settings = { ...defaultSettings };
  for (const row of rows) {
    if (row.key in settings) {
      const key = row.key as SettingsKey;
      (settings as Record<SettingsKey, unknown>)[key] = deepMerge(defaultSettings[key], row.value);
    }
  }
  return settings;
}

/** Variables CSS injectées dans <html> à partir du thème personnalisé */
export function themeToCss(theme: SiteSettings['theme']): string {
  const safe = (v: string) => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : undefined);
  const vars: [string, string][] = [
    ['--bg-sage', theme.bg_sage],
    ['--bg-sage-light', theme.bg_sage_light],
    ['--surface-cream', theme.surface_cream],
    ['--forest', theme.forest],
    ['--ink', theme.ink],
    ['--ink-muted', theme.ink_muted],
    ['--leaf', theme.leaf],
    ['--lime', theme.lime],
  ];
  return `:root{${vars
    .filter(([, v]) => safe(v))
    .map(([k, v]) => `${k}:${v}`)
    .join(';')}}`;
}

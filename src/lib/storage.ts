/**
 * storage.ts — localStorage-backed persistence.
 *
 *  - Detail cache: the AI-generated disease JSON, keyed by disease|crop|lang.
 *    A cache hit means the detail page loads INSTANTLY and spends ZERO tokens —
 *    the main lever for stretching NIM credits across repeat scans.
 *  - Scan history: a short, deduped list of past diagnoses so field workers
 *    can reopen previous reports (which then load from the cache for free).
 */

// v2: added preHarvestInterval / reEntryPeriod to each pesticide.
// v3: per-language native-script AI instruction (fixes Gujarati & others).
// v4: disease-specific prompt (stops identical pesticides for every disease).
const CACHE_PREFIX = 'agri_detail_v4:';
const HISTORY_KEY = 'agri_history_v1';
const HISTORY_LIMIT = 50;

// ── Detail cache ──────────────────────────────────────
function cacheKey(disease: string, crop: string, lang: string): string {
  return `${CACHE_PREFIX}${disease}|${crop}|${lang}`.toLowerCase();
}

/** Returns the cached parsed AI JSON for this disease/crop/lang, or null. */
export function getCachedDetail(disease: string, crop: string, lang: string): unknown | null {
  try {
    const raw = localStorage.getItem(cacheKey(disease, crop, lang));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedDetail(disease: string, crop: string, lang: string, parsed: unknown): void {
  try {
    localStorage.setItem(cacheKey(disease, crop, lang), JSON.stringify(parsed));
  } catch {
    /* quota / unavailable — caching is best-effort */
  }
}

// ── Scan history ──────────────────────────────────────
export interface HistoryEntry {
  id: string;
  disease: string;
  crop: string;
  severity: string;
  confidence: string;
  healthScore: string;
  rawResult: string; // lets us reopen the full report (and hit the cache)
  lang: string;
  date: number; // epoch ms
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Add an entry to the front, de-duping on the same raw result, capped. */
export function addHistory(entry: Omit<HistoryEntry, 'id' | 'date'>): void {
  try {
    const list = getHistory().filter((e) => e.rawResult !== entry.rawResult);
    list.unshift({ ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_LIMIT)));
  } catch {
    /* best-effort */
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* best-effort */
  }
}

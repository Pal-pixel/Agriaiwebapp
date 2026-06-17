/**
 * agro.ts — pure, offline agronomy helpers used by the field-action widgets.
 *
 * These run entirely in the browser (zero AI tokens). They turn the terse
 * dosage / frequency strings the model returns into something a farmer can
 * act on: how much product to mix in their sprayer, and on which dates to
 * spray.
 */

// ── Dosage parsing ────────────────────────────────────
export type DoseBasis = 'litre' | 'acre' | 'hectare' | 'plant';

export interface DoseRate {
  /** Lower bound of the recommended amount (e.g. 2 for "2-3 ml/L"). */
  min: number;
  /** Upper bound; equals `min` when the dosage is a single value. */
  max: number;
  /** Product unit being measured out: "ml", "g", "kg" or "L". */
  unit: string;
  /** What the amount is measured *per*: litre of water, acre, hectare, plant. */
  basis: DoseBasis;
}

const UNIT_ALIASES: Record<string, string> = {
  ml: 'ml', millilitre: 'ml', milliliter: 'ml',
  l: 'L', litre: 'L', liter: 'L', litres: 'L', liters: 'L',
  g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kgs: 'kg', kilogram: 'kg', kilograms: 'kg',
};

/**
 * Pulls a usable rate out of a free-text dosage like "2-3 ml/litre",
 * "400 ml per acre" or "2.5 g/L of water". Returns null when nothing
 * recognisable is found, so the UI can fall back to plain text.
 */
export function parseDoseRate(dosage: string): DoseRate | null {
  if (!dosage) return null;
  const s = dosage.toLowerCase().replace(/–|—/g, '-');

  // Leading amount (single value or a "2-3" / "2 to 3" range) + product unit.
  const m = s.match(
    /(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(ml|millilitres?|milliliters?|kgs?|kilograms?|gms?|grams?|g|litres?|liters?|l)\b/,
  );
  if (!m) return null;

  const min = parseFloat(m[1]);
  const max = m[2] ? parseFloat(m[2]) : min;
  const unit = UNIT_ALIASES[m[3]] ?? m[3];

  // Where does that amount apply? Look at the whole string for a basis word.
  let basis: DoseBasis = 'litre';
  if (/hectare|\bha\b/.test(s)) basis = 'hectare';
  else if (/acre/.test(s)) basis = 'acre';
  else if (/plant|tree|vine/.test(s)) basis = 'plant';
  else if (/litre|liter|\/\s*l\b|per\s*l\b|\bl\b\s*(?:of\s*)?water|\/l/.test(s)) basis = 'litre';
  // If the product unit itself was L/kg and no per-area word, it's likely a
  // bulk per-area dose; default such cases to acre rather than per-litre.
  else if (unit === 'L' || unit === 'kg') basis = 'acre';

  return { min, max, unit, basis };
}

/** "2" or, for a range, "2–3" — formatted to at most 2 decimals. */
function fmtRange(min: number, max: number): string {
  const f = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));
  return min === max ? f(min) : `${f(min)}–${f(max)}`;
}

export interface MixResult {
  /** Human-readable amount of product, e.g. "30–45 ml". */
  product: string;
  /** Optional secondary line, e.g. total water or product per tank. */
  detail?: string;
}

/**
 * Computes how much product to measure out for a per-litre dosage given the
 * sprayer tank size (litres) and number of tank-loads.
 */
export function mixForTank(rate: DoseRate, tankLitres: number, tanks: number): MixResult {
  const perTankMin = rate.min * tankLitres;
  const perTankMax = rate.max * tankLitres;
  const totalMin = perTankMin * tanks;
  const totalMax = perTankMax * tanks;
  const perTank = `${fmtRange(perTankMin, perTankMax)} ${rate.unit}`;
  if (tanks <= 1) return { product: `${perTank}` };
  return {
    product: `${fmtRange(totalMin, totalMax)} ${rate.unit}`,
    detail: `${perTank} per tank × ${tanks} tanks · ${tankLitres * tanks} L water`,
  };
}

/** Computes total product for an area-based dosage (per acre / hectare). */
export function mixForArea(rate: DoseRate, area: number): MixResult {
  return { product: `${fmtRange(rate.min * area, rate.max * area)} ${rate.unit}` };
}

/** Computes total product for a per-plant dosage. */
export function mixForPlants(rate: DoseRate, plants: number): MixResult {
  return { product: `${fmtRange(rate.min * plants, rate.max * plants)} ${rate.unit}` };
}

// ── Spray schedule ────────────────────────────────────
/**
 * Best-effort read of an application interval (in days) from a frequency
 * string like "every 7 days", "weekly", "twice a week" or "every 10-14 days".
 * Falls back to 7 days, the most common foliar-spray cadence.
 */
export function parseIntervalDays(frequency: string): number {
  if (!frequency) return 7;
  const s = frequency.toLowerCase().replace(/–|—/g, '-');

  if (/daily|every\s*day|once\s*a\s*day/.test(s)) return 1;
  if (/fortnight|every\s*2\s*weeks|bi-?weekly/.test(s)) return 14;
  if (/twice\s*a\s*week|2\s*times?\s*a\s*week/.test(s)) return 3;
  if (/monthly|every\s*month/.test(s)) return 30;

  // "every 10-14 days" → mid-point; "every 7 days" → 7.
  const range = s.match(/(\d+)\s*-\s*(\d+)\s*days?/);
  if (range) return Math.round((parseInt(range[1], 10) + parseInt(range[2], 10)) / 2);
  const single = s.match(/(\d+)\s*days?/);
  if (single) return parseInt(single[1], 10);
  const weeks = s.match(/(\d+)\s*weeks?/);
  if (weeks) return parseInt(weeks[1], 10) * 7;

  if (/weekly|once\s*a\s*week/.test(s)) return 7;
  return 7;
}

/** Adds `days` to a date and returns a new Date (does not mutate). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Builds a list of spray dates from a start date, interval and count. */
export function sprayDates(start: Date, intervalDays: number, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i * intervalDays));
}

// ── Calendar export (.ics) ────────────────────────────
function toIcsDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

/**
 * Builds a minimal RFC-5545 VCALENDAR with one all-day VEVENT per spray date,
 * so the farmer can import the whole treatment plan into their phone calendar.
 */
export function buildSprayIcs(title: string, dates: Date[], note: string): string {
  const stamp = `${toIcsDate(new Date())}T000000Z`;
  const events = dates
    .map((d, i) => {
      const start = toIcsDate(d);
      const end = toIcsDate(addDays(d, 1));
      return [
        'BEGIN:VEVENT',
        `UID:agriai-${start}-${i}@agriai`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${title} (#${i + 1})`,
        `DESCRIPTION:${note}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT9H', // remind the morning of (9h before midnight-ish)
        'ACTION:DISPLAY',
        `DESCRIPTION:${title}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AgriAI//Spray Schedule//EN', events, 'END:VCALENDAR'].join(
    '\r\n',
  );
}

/** Triggers a browser download of an .ics file. */
export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

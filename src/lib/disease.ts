/**
 * disease.ts — types and parsers for the raw model output.
 * The backend returns a markdown-ish string; these helpers pull out the
 * crop name, disease name, confidence, severity and health score.
 */

export interface PesticideItem {
  name: string;
  type: string;
  description: string;
  howToUse: string[];
  dosage: string;
  frequency: string;
  safetyNote: string;
  /** Pre-harvest interval: days to wait after spraying before it's safe to harvest. */
  preHarvestInterval: string;
  /** Re-entry period: how long before it's safe to re-enter the sprayed field. */
  reEntryPeriod: string;
}

export interface DiseaseData {
  disease: string;
  crop: string;
  confidence: string;
  severity: string;
  healthScore: string;
  summary: string;
  pesticides: PesticideItem[];
  nonPesticideMethods: string[];
  preventionTips: string[];
  economicImpact: string;
  treatmentUrgency: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export function parseDiseaseName(raw: string): string {
  // Backend outputs: first bold = crop name, second bold = disease name
  const matches = raw.match(/\*\*(.+?)\*\*/g);
  if (matches && matches.length >= 2) {
    return matches[1].replace(/\*\*/g, '').trim();
  }
  const lines = raw.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('disease')) {
      return line.replace(/[#*]/g, '').replace(/disease/i, '').replace('🦠', '').trim();
    }
  }
  return 'Unknown Disease';
}

export function parseCropName(raw: string): string {
  // Backend outputs: first bold item is the crop name
  const matches = raw.match(/\*\*(.+?)\*\*/g);
  if (matches && matches.length >= 1) {
    return matches[0].replace(/\*\*/g, '').trim();
  }
  return 'Unknown Crop';
}

export function parseConfidence(raw: string): string {
  const match = raw.match(/(\d+\.\d+)%/);
  return match ? `${match[1]}%` : 'N/A';
}

export function parseSeverity(raw: string): string {
  const match = raw.match(/Severity[^\n]*\n[^\n]*\*\*(.*?)\*\*/);
  if (match) return match[1].trim();
  if (raw.includes('Severe')) return '🔴 Severe';
  if (raw.includes('Moderate')) return '🟡 Moderate';
  if (raw.includes('Healthy')) return '🟢 Healthy';
  return '🟠 Moderate';
}

export function parseHealthScore(raw: string): string {
  const match = raw.match(/Health Score[^\n]*\n[^\n]*\*\*(\d+)%\*\*/);
  return match ? `${match[1]}%` : 'N/A';
}

// Short system primers — these count as input tokens, so keep them tiny.
export const DISEASE_SYSTEM =
  'You are an Indian crop-protection expert. Recommend treatment that is SPECIFIC to the exact disease named — never a generic broad-spectrum default. Output ONE JSON object only, no markdown. Every array of strings must contain plain strings, never objects.';
export const CHAT_SYSTEM =
  'You are AgriAI, an assistant for Indian farmers. Answer in under 50 words: simple, practical, actionable. No preamble.';

// Token-lean prompt: terse fields, 2 pesticides, short steps. Used with the
// NIM `json` flag (response_format: json_object) so the reply is always valid,
// complete JSON — a small model can't be trusted to produce JSON from prose alone.
export function buildDiseaseInfoPrompt(diseaseName: string, cropName: string, langInstruction = ''): string {
  return `Disease "${diseaseName}" on ${cropName}. Recommend pesticides whose active ingredient is genuinely effective against THIS specific disease and its pathogen type (fungus vs bacterium vs virus vs mite/insect). Do NOT default to broad-spectrum Mancozeb/Copper unless they are truly the best choice for this exact disease. If viral: pesticides must target the insect vector (e.g. whitefly) plus roguing — no curative spray exists. If mites/insects: use miticides/insecticides, not fungicides. If bacterial: bactericides/copper+antibiotic.
Return JSON keys: summary(<=20 words, specific to this disease), economicImpact(<=10 words), treatmentUrgency(one of "Immediate Action Required","Treat Within 1 Week","Preventive Measure"), pesticides(array of EXACTLY 2 objects, each a DIFFERENT chemical class, with name(brand + active ingredient), type(Fungicide/Bactericide/Insecticide/Miticide), description(<=15 words, why it works on THIS disease), howToUse(array of 2 short strings), dosage(per litre or per acre, e.g. "2 ml/litre"), frequency(e.g. "every 7 days"), safetyNote(<=8 words), preHarvestInterval(e.g. "7 days"), reEntryPeriod(e.g. "24 hours")), nonPesticideMethods(array of 2 short strings specific to this disease), preventionTips(array of 2 short strings). Products available in India.${langInstruction}`;
}

// Chat prompt: minimal context, no "search the web", relies on CHAT_SYSTEM cap.
export function buildChatPrompt(question: string, data: DiseaseData | null): string {
  const ctx = data ? `Context: ${data.crop} with ${data.disease}. ` : '';
  return `${ctx}Q: ${question}`;
}

// ── Robust parsing ────────────────────────────────────
// The model occasionally wraps JSON in prose/fences or fills an array with
// objects instead of strings. These helpers coerce whatever comes back into
// the exact shape the UI needs, so the detail page can never crash on parse.

/** Pull a JSON object out of a raw reply, tolerating ```fences```, unescaped newlines, trailing commas, and stray text. */
export function extractJson(raw: string): any {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Response was empty');
  }
  let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 1. Direct JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 2. Extract outermost { ... } block
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 3. Remove trailing commas before closing braces/brackets
  const noTrailingCommas = cleaned.replace(/,\s*([\}\]])/g, '$1');
  try {
    return JSON.parse(noTrailingCommas);
  } catch (_) {}

  // 4. Escape literal raw newlines/tabs inside string values
  let inside = false;
  let out = '';
  for (let i = 0; i < noTrailingCommas.length; i++) {
    const char = noTrailingCommas[i];
    const prev = noTrailingCommas[i - 1];
    if (char === '"' && prev !== '\\') {
      inside = !inside;
      out += char;
    } else if (inside && (char === '\n' || char === '\r')) {
      out += '\\n';
    } else if (inside && char === '\t') {
      out += ' ';
    } else {
      out += char;
    }
  }

  try {
    return JSON.parse(out);
  } catch (_) {}

  throw new Error('Response was not valid JSON');
}

/** Coerce any value into a clean array of non-empty strings. */
function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const pick = o.text ?? o.tip ?? o.method ?? o.name ?? o.description ?? o.step;
        if (typeof pick === 'string') return pick;
        return Object.values(o).filter((x) => typeof x === 'string').join(' — ');
      }
      return String(item ?? '');
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));

export function getFallbackDiseaseDetails(disease: string, crop: string): Partial<DiseaseData> {
  const dLower = disease.toLowerCase();

  const isViral = dLower.includes('virus') || dLower.includes('mosaic') || dLower.includes('curl');
  const isBacterial = dLower.includes('bacterial') || dLower.includes('wilt') || dLower.includes('canker');

  let pesticides: PesticideItem[] = [];
  if (isViral) {
    pesticides = [
      {
        name: 'Imidacloprid 17.8% SL',
        type: 'Insecticide (Vector Control)',
        description: 'Controls sucking pests (whiteflies/aphids) that transmit plant viruses.',
        howToUse: ['Mix 0.5 ml per litre of water.', 'Foliar spray thoroughly on foliage.'],
        dosage: '0.5 ml/litre',
        frequency: 'every 10-14 days',
        safetyNote: 'Toxic to bees; avoid spraying during peak bloom.',
        preHarvestInterval: '7 days',
        reEntryPeriod: '24 hours',
      },
      {
        name: 'Neem Oil (10,000 ppm)',
        type: 'Bio-Insecticide',
        description: 'Organic repellent for vectors and nymphal stages.',
        howToUse: ['Mix 3-5 ml per litre of water.', 'Spray early morning or evening.'],
        dosage: '3-5 ml/litre',
        frequency: 'every 7 days',
        safetyNote: 'Safe for beneficial insects.',
        preHarvestInterval: '1 day',
        reEntryPeriod: '12 hours',
      },
    ];
  } else if (isBacterial) {
    pesticides = [
      {
        name: 'Copper Oxychloride 50% WP (Koptrol)',
        type: 'Bactericide/Fungicide',
        description: 'Contact bactericide that prevents bacterial multiplication on leaves.',
        howToUse: ['Mix 2.5 g per litre of water.', 'Spray evenly over the canopy.'],
        dosage: '2.5 g/litre',
        frequency: 'every 7-10 days',
        safetyNote: 'Wear gloves during mixing.',
        preHarvestInterval: '7 days',
        reEntryPeriod: '24 hours',
      },
      {
        name: 'Streptocycline (Streptomycin + Tetracycline)',
        type: 'Bactericide',
        description: 'Systemic bactericide for controlling severe bacterial infections.',
        howToUse: ['Mix 6 g per 50 litres of water.', 'Spray immediately upon first symptom.'],
        dosage: '0.12 g/litre',
        frequency: 'every 10 days',
        safetyNote: 'Do not exceed recommended dosage.',
        preHarvestInterval: '14 days',
        reEntryPeriod: '24 hours',
      },
    ];
  } else {
    // Default Fungal / General foliar disease
    pesticides = [
      {
        name: 'Kavach (Chlorothalonil 75% WP)',
        type: 'Fungicide',
        description: 'Broad-spectrum protective fungicide for foliar spots and blights.',
        howToUse: ['Mix 2 g per litre of water.', 'Spray thoroughly covering upper and lower leaf surfaces.'],
        dosage: '2 g/litre',
        frequency: 'every 7-10 days',
        safetyNote: 'Avoid contact with eyes and skin.',
        preHarvestInterval: '7 days',
        reEntryPeriod: '24 hours',
      },
      {
        name: 'Amistar (Azoxystrobin 23% SC)',
        type: 'Systemic Fungicide',
        description: 'Systemic action for effective control of leaf spots and rusts.',
        howToUse: ['Mix 1 ml per litre of water.', 'Apply at early symptom appearance.'],
        dosage: '1 ml/litre',
        frequency: 'every 10-14 days',
        safetyNote: 'Do not spray near aquatic bodies.',
        preHarvestInterval: '7 days',
        reEntryPeriod: '24 hours',
      },
    ];
  }

  return {
    summary: `${disease.replace(/_/g, ' ')} affecting ${crop}. Infection causes leaf discoloration and spotting, reducing photosynthetic capacity and yield potential.`,
    treatmentUrgency: 'Immediate Action Required',
    economicImpact: 'Causes leaf loss and can reduce overall crop yield if left unmanaged.',
    pesticides,
    nonPesticideMethods: [
      `Remove and burn severely infected leaves of ${crop} to prevent spore spread.`,
      'Ensure proper field drainage and avoid excessive overhead irrigation.',
    ],
    preventionTips: [
      `Practice crop rotation with non-host crops for 2–3 seasons.`,
      'Use certified disease-resistant seeds and maintain proper plant spacing for ventilation.',
    ],
  };
}

/** Merge the parsed model JSON with the locally-parsed base fields into DiseaseData. */
export function normalizeDiseaseData(
  parsed: any,
  base: Pick<DiseaseData, 'disease' | 'crop' | 'confidence' | 'severity' | 'healthScore'>,
): DiseaseData {
  const fallback = getFallbackDiseaseDetails(base.disease, base.crop);

  let pesticides: PesticideItem[] = Array.isArray(parsed?.pesticides)
    ? parsed.pesticides
        .map((p: any) => ({
          name: str(p?.name),
          type: str(p?.type),
          description: str(p?.description),
          howToUse: toStringArray(p?.howToUse),
          dosage: str(p?.dosage),
          frequency: str(p?.frequency),
          safetyNote: str(p?.safetyNote),
          preHarvestInterval: str(p?.preHarvestInterval ?? p?.phi),
          reEntryPeriod: str(p?.reEntryPeriod ?? p?.reEntry),
        }))
        .filter((p: PesticideItem) => p.name)
    : [];

  if (pesticides.length === 0 && fallback.pesticides) {
    pesticides = fallback.pesticides;
  }

  const summary = str(parsed?.summary) || fallback.summary || '';
  const nonPesticideMethods = toStringArray(parsed?.nonPesticideMethods);
  const preventionTips = toStringArray(parsed?.preventionTips);

  return {
    ...base,
    summary,
    pesticides,
    nonPesticideMethods: nonPesticideMethods.length > 0 ? nonPesticideMethods : (fallback.nonPesticideMethods || []),
    preventionTips: preventionTips.length > 0 ? preventionTips : (fallback.preventionTips || []),
    economicImpact: str(parsed?.economicImpact) || fallback.economicImpact || '',
    treatmentUrgency: str(parsed?.treatmentUrgency) || fallback.treatmentUrgency || 'Immediate Action Required',
  };
}

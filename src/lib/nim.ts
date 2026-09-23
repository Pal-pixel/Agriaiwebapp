/**
 * nim.ts — thin wrapper around Gemini's OpenAI-compatible chat API via /api/nim.
 *
 * Token economy: every call MUST pass a tight `maxTokens` cap.
 */
const API_URL = '/api/nim';
const GEMINI_MODEL = 'gemini-2.5-flash';

export interface NimOptions {
  /** Optional system instruction (keep it short — it counts as input tokens). */
  system?: string;
  /** Hard cap on output tokens. Defaults low on purpose. */
  maxTokens?: number;
  temperature?: number;
  /** Force a valid JSON-object reply. Essential for the detail page — small
   *  models otherwise emit malformed/incomplete JSON. */
  json?: boolean;
}

export async function callNim(prompt: string, opts: NimOptions = {}): Promise<string> {
  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  messages.push({ role: 'user', content: prompt });

  const body: Record<string, unknown> = {
    model: GEMINI_MODEL,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 120,
  };
  if (opts.json) body.response_format = { type: 'json_object' };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (json.error) throw new Error(`Gemini API error: ${json.error.message || JSON.stringify(json.error)}`);

  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}


/**
 * nim.ts — thin wrapper around NVIDIA NIM's OpenAI-compatible chat API.
 *
 * NOTE: the API key is shipped to the browser. For a public website you
 * should proxy this through a small backend so the key is not exposed.
 * Left inline here to preserve the original app's behaviour.
 *
 * Token economy: every call MUST pass a tight `maxTokens` cap. Output tokens
 * are what burn NIM credits, so keep them as small as the UI allows.
 */
const NIM_API_KEY = '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';
// Goes through the Vite proxy (see vite.config.ts) to dodge NVIDIA's lack of
// CORS headers. The proxy strips "/nim" and forwards to integrate.api.nvidia.com.
const NIM_URL = '/nim/v1/chat/completions';
// Small, fast, cheap model — best token-per-credit value for short answers.
const NIM_MODEL = 'meta/llama-3.1-8b-instruct';

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
    model: NIM_MODEL,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 120,
  };
  if (opts.json) body.response_format = { type: 'json_object' };

  const res = await fetch(NIM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NIM_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (json.error) throw new Error(`NIM API error: ${json.error.message || JSON.stringify(json.error)}`);

  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from NIM');
  return text;
}

/**
 * nim.ts — thin wrapper around Groq's OpenAI-compatible chat API.
 *
 * NOTE: the API key is shipped to the browser. For a public website you
 * should proxy this through a small backend so the key is not exposed.
 * Left inline here to preserve the original app's behaviour.
 *
 * Token economy: every call MUST pass a tight `maxTokens` cap. Output tokens
 * are what burn Groq credits, so keep them as small as the UI allows.
 */
const GROQ_URL = '/api/nim';
// llama-3.1-8b-instant is a highly responsive, active model for fast inferences
const GROQ_MODEL = 'llama-3.1-8b-instant';

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
    model: GROQ_MODEL,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 120,
  };
  if (opts.json) body.response_format = { type: 'json_object' };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (json.error) throw new Error(`Groq API error: ${json.error.message || JSON.stringify(json.error)}`);

  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}


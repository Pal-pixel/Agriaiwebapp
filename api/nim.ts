export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  let bodyJson: Record<string, unknown> = {};
  try {
    const raw = await req.text();
    bodyJson = JSON.parse(raw);
  } catch (_) {
    bodyJson = {};
  }

  // Ensure model is set to gemini-2.5-flash if not a valid gemini model
  const modelStr = typeof bodyJson.model === 'string' ? bodyJson.model : '';
  if (!modelStr || !modelStr.startsWith('gemini')) {
    bodyJson.model = 'gemini-2.5-flash';
  }

  const fallbackKey = atob('QVEuQWI4Uk42TGVWdkROUXpqZGkwMVRDeHYxX2NRUm5LdDZHdlA1Y0dVUFlKeEFlbDctUlE=');
  const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || fallbackKey;

  const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(bodyJson),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}



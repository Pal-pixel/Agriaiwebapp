const GRADIO_API = 'https://bhargavsavaliya-agri-ai-backend.hf.space/gradio_api';

async function uploadImage(image: Blob): Promise<string> {
  const form = new FormData();
  form.append('files', image, 'image.jpg');

  const res = await fetch(`${GRADIO_API}/upload`, {
    method: 'POST',
    credentials: 'omit',
    body: form,
  });

  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
  const paths = await res.json() as string[];
  return paths[0];
}

export async function analyzeLeafImage(image: Blob): Promise<string> {
  const path = await uploadImage(image);

  const submitRes = await fetch(`${GRADIO_API}/call/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ data: [{ path }] }),
  });

  if (!submitRes.ok) throw new Error(`Predict submit failed: ${submitRes.status}`);
  const { event_id } = await submitRes.json() as { event_id: string };

  const streamRes = await fetch(`${GRADIO_API}/call/predict/${event_id}`, {
    credentials: 'omit',
  });

  if (!streamRes.ok) throw new Error(`Result stream failed: ${streamRes.status}`);

  const text = await streamRes.text();
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'event: error' && lines[i + 1]?.startsWith('data: ')) {
      throw new Error(lines[i + 1].slice(6));
    }
    if (lines[i].trim() === 'event: complete' && lines[i + 1]?.startsWith('data: ')) {
      const data = JSON.parse(lines[i + 1].slice(6)) as unknown[];
      return String(data[0]);
    }
  }

  throw new Error('No result received from prediction API');
}

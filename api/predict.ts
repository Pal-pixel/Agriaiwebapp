export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const GRADIO_API = 'https://bhargavsavaliya-agri-ai-backend.hf.space/gradio_api';

    // 1. Upload the image to Hugging Face Gradio Space
    const uploadForm = new FormData();
    uploadForm.append('files', file, 'image.jpg');

    const uploadRes = await fetch(`${GRADIO_API}/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`HF Upload failed: ${uploadRes.status} ${errText}`);
    }

    const paths = (await uploadRes.json()) as string[];
    if (!paths || paths.length === 0) {
      throw new Error('No paths returned from upload');
    }
    const path = paths[0];

    // 2. Submit the prediction job
    const submitRes = await fetch(`${GRADIO_API}/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{ path }] }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`Predict submission failed: ${submitRes.status} ${errText}`);
    }

    const { event_id } = (await submitRes.json()) as { event_id: string };
    if (!event_id) {
      throw new Error('No event_id returned from prediction submission');
    }

    // 3. Read result stream (SSE)
    const streamRes = await fetch(`${GRADIO_API}/call/predict/${event_id}`);
    if (!streamRes.ok) {
      const errText = await streamRes.text();
      throw new Error(`Result stream connection failed: ${streamRes.status} ${errText}`);
    }

    const reader = streamRes.body?.getReader();
    if (!reader) {
      throw new Error('Readable stream not supported on prediction response');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let predictionResult = '';
    let streamError = '';
    let currentEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = '';
          continue;
        }

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const dataContent = trimmed.slice(5).trim();
          if (currentEvent === 'complete') {
            try {
              const data = JSON.parse(dataContent) as unknown[];
              predictionResult = String(data[0]);
            } catch (e) {
              streamError = 'Failed to parse prediction result';
            }
          } else if (currentEvent === 'error') {
            streamError = dataContent;
          }
        }
      }

      if (predictionResult || streamError) {
        break;
      }
    }

    // Terminate stream reader
    try {
      await reader.cancel();
    } catch (_) {}

    if (streamError) {
      throw new Error(streamError);
    }

    if (!predictionResult) {
      throw new Error('Prediction connection closed without result');
    }

    return new Response(JSON.stringify({ result: predictionResult }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Serverless Predict Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown prediction proxy error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

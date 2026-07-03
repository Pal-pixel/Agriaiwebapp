export async function analyzeLeafImage(image: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', image, 'image.jpg');

  const res = await fetch('/api/predict', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let errorMsg = `Crop analysis failed: ${res.status}`;
    try {
      const data = await res.json() as { error?: string };
      if (data.error) errorMsg = data.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const { result } = await res.json() as { result: string };
  return result;
}


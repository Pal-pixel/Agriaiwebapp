/**
 * predict.ts — sends a crop image to the Hugging Face Gradio space for
 * disease detection. Uses @gradio/client, which handles CORS correctly
 * in the browser.
 */
import { Client } from '@gradio/client';

const HF_SPACE = 'bhargavsavaliya/agri-ai-backend';

export async function analyzeLeafImage(image: Blob): Promise<string> {
  const client = await Client.connect(HF_SPACE);
  const result = await client.predict('/predict', { image });
  const data = result.data as unknown[];
  return String(data[0]);
}

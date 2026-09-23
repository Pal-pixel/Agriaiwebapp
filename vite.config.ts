import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load local environment variables (like GROQ_API_KEY from .env.local)
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'vercel-edge-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = req.url ? new URL(req.url, 'http://localhost').pathname : '';
            
            if (urlPath.startsWith('/api/')) {
              try {
                let handlerModule;
                if (urlPath === '/api/predict') {
                  handlerModule = await server.ssrLoadModule('/api/predict.ts');
                } else if (urlPath === '/api/nim') {
                  handlerModule = await server.ssrLoadModule('/api/nim.ts');
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: `Not found: ${urlPath}` }));
                  return;
                }

                const handler = handlerModule.default;

                // 1. Reconstruct Headers
                const headers = new Headers();
                for (const [key, value] of Object.entries(req.headers)) {
                  if (value !== undefined) {
                    if (Array.isArray(value)) {
                      value.forEach((v) => headers.append(key, v));
                    } else {
                      headers.set(key, value);
                    }
                  }
                }

                // 2. Read Request Body
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(chunk as Buffer);
                }
                const body = Buffer.concat(chunks);

                // 3. Create Web API Request
                const fullUrl = `http://localhost:${req.socket.localPort || 5173}${req.url}`;
                const webReq = new Request(fullUrl, {
                  method: req.method,
                  headers,
                  body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
                });

                // 4. Execute Vercel Edge function handler
                const webRes = await handler(webReq);

                // 5. Write Web Response back to Node HTTP Response
                res.statusCode = webRes.status;
                webRes.headers.forEach((value, key) => {
                  res.setHeader(key, value);
                });

                const resBuffer = await webRes.arrayBuffer();
                res.end(Buffer.from(resBuffer));
              } catch (error) {
                console.error(`API Emulator Error (${urlPath}):`, error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: error instanceof Error ? error.message : 'Internal emulator error',
                  })
                );
              }
            } else {
              next();
            }
          });
        },
      },
    ],
  };
});

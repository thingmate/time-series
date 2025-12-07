import { serve } from '@hono/node-server';
import { sValidator } from '@hono/standard-validator';
import { Path } from '@xstd/path';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { timeout } from 'hono/timeout';
import { readFileSync } from 'node:fs';
import { createSecureServer } from 'node:http2';
import { fileURLToPath } from 'node:url';
import * as z from 'zod';

// to gen keys:
// openssl req -x509 -nodes --new -keyout key.pem -out cert.pem -days 3650

const DIR_PATH = new Path(fileURLToPath(import.meta.url)).dirname();

export function startServer(): void {
  const app = new Hono();

  const v1 = new Hono().basePath('/v1');

  v1.use('*', cors(), prettyJSON(), compress(), timeout(5000));

  /* SERIES */
  v1.get(
    '/series/:id',
    sValidator(
      'query',
      z.strictObject({
        start: z.coerce.number().optional().default(Number.NEGATIVE_INFINITY),
        end: z.coerce.number().optional().default(Number.POSITIVE_INFINITY),
      }),
    ),
    (c) => {
      const { start, end } = c.req.valid('query');

      return c.json(`Hono! ${c.req.param('id')} -- ${start} - ${end}`);
    },
  );

  app.route('/', v1);

  const server = serve(
    {
      fetch: app.fetch,
      port: 1234,
      createServer: createSecureServer,
      serverOptions: {
        key: readFileSync(DIR_PATH.concat('./keys/key.pem').toString()),
        cert: readFileSync(DIR_PATH.concat('./keys/cert.pem').toString()),
      },
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
}

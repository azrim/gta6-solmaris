// Local static HTTP server for Solmar Coast: Neon Syndicate (Node 22 standard library only).
// Usage: node serve.ts [--port 8080]
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const cliArgs = process.argv.slice(2);
const portFlagIdx = cliArgs.indexOf('--port');
const parsedPort = portFlagIdx === -1 ? 8080 : Number(cliArgs[portFlagIdx + 1]);
const listenPort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 8080;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  const reqUrl = new URL(req.url ?? '/', 'http://localhost');
  let reqPath: string;
  try {
    reqPath = decodeURIComponent(reqUrl.pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const targetFile = resolve(join(gameRoot, normalize(reqPath)));
  if (targetFile !== gameRoot && !targetFile.startsWith(gameRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const fileStats = statSync(targetFile);
    if (!fileStats.isFile()) throw new Error('not a regular file');
    res.writeHead(200, {
      'content-type': CONTENT_TYPES[extname(targetFile).toLowerCase()] ?? 'application/octet-stream',
      'content-length': fileStats.size,
      'cache-control': 'no-store',
    });
    createReadStream(targetFile).pipe(res);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(listenPort, '127.0.0.1', () => {
  console.log(`Solmar Coast server listening at http://localhost:${listenPort}`);
});

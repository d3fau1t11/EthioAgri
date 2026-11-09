import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(option('--port', process.env.PORT || '3000'));
const basePath = option('--base-path', process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const root = resolve('out');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
try { await stat(resolve(root, 'index.html')); }
catch { console.error('Build the app first with npm run build (or npm run build:pages).'); process.exit(1); }
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (basePath && pathname === basePath) {
      response.writeHead(301, { Location: `${basePath}/` }); response.end(); return;
    }
    if (basePath && !pathname.startsWith(`${basePath}/`)) { response.writeHead(404); response.end('Not found'); return; }
    const relative = pathname.slice(basePath.length).replace(/^\/+/, '');
    let target = resolve(root, relative);
    if (target !== root && !target.startsWith(root + sep)) { response.writeHead(403); response.end('Forbidden'); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end(); return; }
    try { if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html'); }
    catch { /* Fall through to the exported 404 page. */ }
    let data;
    try { data = await readFile(target); }
    catch { target = resolve(root, '404.html'); data = await readFile(target); response.statusCode = 404; }
    response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(400); response.end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`EthioAgri preview: http://localhost:${port}${basePath}/`));

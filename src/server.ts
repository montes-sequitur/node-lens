import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import { runDiagnostics } from './diagnostics';
import { renderHtml } from './html';
import { formatCliReport } from './cli';

const DEFAULT_PORT = Number(process.env.PORT) || 3000;

const sendResponse = (
  res: http.ServerResponse,
  statusCode: number,
  contentType: string,
  body: string
): void => {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
};

export const startServer = (port = DEFAULT_PORT): http.Server => {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/health') {
      const payload = JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() });
      return sendResponse(res, 200, 'application/json', payload);
    }

    if (url.pathname === '/style.css') {
      try {
        const cssPath = path.join(process.cwd(), 'public', 'style.css');
        const cssContent = await fs.readFile(cssPath, 'utf-8');
        return sendResponse(res, 200, 'text/css; charset=utf-8', cssContent);
      } catch {
        return sendResponse(res, 404, 'text/plain', 'CSS file not found');
      }
    }

    if (
      ['/api/status', '/json'].includes(url.pathname) ||
      req.headers.accept?.includes('application/json')
    ) {
      const diagnostics = await runDiagnostics();
      return sendResponse(
        res,
        200,
        'application/json; charset=utf-8',
        JSON.stringify(diagnostics, null, 2)
      );
    }

    if (url.pathname === '/') {
      const diagnostics = await runDiagnostics();
      return sendResponse(res, 200, 'text/html; charset=utf-8', renderHtml(diagnostics));
    }

    return sendResponse(res, 404, 'text/plain; charset=utf-8', '404 Not Found');
  });

  server.listen(port, async () => {
    console.log(`\n🚀 Verification server running at: http://localhost:${port}`);
    console.log(`📡 JSON endpoint available at:       http://localhost:${port}/api/status`);
    console.log('\nRunning initial diagnostics...');
    console.log(formatCliReport(await runDiagnostics()));
  });

  return server;
};

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = 8080;
const ROOT = process.cwd();

function serveStatic(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.writeHead(200, { 'Content-Type': map[ext] || 'text/plain' });
    res.end(data);
  });
}

async function run() {
  const server = http.createServer(serveStatic);
  server.listen(PORT);
  console.log(`Static server running at http://localhost:${PORT}/`);

  const viewports = [
    { name: 'iphone-se', width: 375, height: 667 },
    { name: 'iphone-12', width: 390, height: 844 },
    { name: 'ipad', width: 768, height: 1024 },
    { name: 'ipad-pro', width: 1024, height: 1366 },
    { name: 'laptop-small', width: 1366, height: 768 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  const outDir = path.join(ROOT, 'test-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const vp of viewports) {
      console.log(`Testing ${vp.name} ${vp.width}x${vp.height}`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(600); // small pause for rendering
      const clip = { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 2000) };
      const outPath = path.join(outDir, `${vp.name}-${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

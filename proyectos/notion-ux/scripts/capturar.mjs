// Captura pantallas completas de archivos HTML → PNG (alta resolución)
import puppeteer from 'puppeteer-core';
import { readdirSync, mkdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';

const CHROME = '/usr/bin/google-chrome';
const OUT = resolve('/home/leo/notion-ux/capturas');
mkdirSync(OUT, { recursive: true });

function htmlsRecursivos(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...htmlsRecursivos(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

// Lista explícita: [archivo html, nombre salida]
const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Uso: node capturar.mjs <html1> <html2> ...  (o un directorio para capturar todos sus .html)');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

for (const t of targets) {
  const p = resolve(t);
  const files = statSync(p).isDirectory() ? htmlsRecursivos(p) : [p];
  for (const f of files) {
    const rel = relative('/home/leo/notion-ux/materiales', f).replace(/\//g, '__').replace('.html', '');
    const outFile = join(OUT, rel + '.png');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto('file://' + f, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: outFile, fullPage: true });
    console.log('OK', outFile);
    await page.close();
  }
}

await browser.close();
console.log('DONE');

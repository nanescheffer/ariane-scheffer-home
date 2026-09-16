import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const htmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const cssHref = html.match(/href="(\/_astro\/[^\"]+\.css)"/)?.[1];
if (!cssHref) throw new Error('CSS do build não encontrado.');

const cssPath = path.join(distDir, cssHref.replace(/^\//, ''));
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/url\((\/_astro\/[^)]+\.(?:woff2?|ttf))\)/g, (_, assetUrl) => {
  const assetPath = path.join(distDir, assetUrl.replace(/^\//, ''));
  const extension = path.extname(assetPath).slice(1);
  const mime = extension === 'woff2' ? 'font/woff2' : extension === 'woff' ? 'font/woff' : 'font/ttf';
  const encoded = fs.readFileSync(assetPath).toString('base64');
  return `url(data:${mime};base64,${encoded})`;
});

const portrait = fs.readFileSync(path.join(distDir, 'ariane-reference.png')).toString('base64');

html = html
  .replace(/<link rel="stylesheet" href="[^"]+">/, `<style>${css}</style>`)
  .replace('src="/ariane-reference.png"', `src="data:image/png;base64,${portrait}"`)
  .replaceAll('href="/fluxos"', 'href="#fluxos"')
  .replaceAll('href="/sobre"', 'href="#depoimentos"')
  .replaceAll('href="/contato"', 'href="#contato"')
  .replace('class="section service-section service-fluxos"', 'id="fluxos" class="section service-section service-fluxos"')
  .replace('class="section testimonials-section"', 'id="depoimentos" class="section testimonials-section"')
  .replace('class="closing-section"', 'id="contato" class="closing-section"');

fs.writeFileSync(path.join(projectRoot, 'site-ariane-preview.html'), html);

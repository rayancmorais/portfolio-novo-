/**
 * Pós-build: escreve um HTML real para cada rota de estudo de caso, com título,
 * description e Open Graph próprios.
 *
 * Por que isso existe: o site é SPA sem SSR, então crawlers de preview de link
 * (LinkedIn, WhatsApp, Slack) leem só o <head> e nunca executam o JS — sem isso
 * as três rotas de case compartilhariam o preview da home. O corpo continua
 * hidratando no cliente; o que muda é o que chega no HTML cru.
 *
 * Roda sem dependência nova: só troca atributos no index.html que o Vite gerou.
 * A lista de rotas vem de src/data/case-routes.json, o mesmo arquivo que
 * src/data/cases.ts consome — as duas não têm como divergir.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://rayancmorais.com.br';

const readJson = path => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Troca o content= de uma meta identificada por name= ou property=. */
function replaceMeta(html, attribute, key, value) {
  const pattern = new RegExp(
    `(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*(")`,
    'i'
  );
  return html.replace(pattern, `$1${escapeAttribute(value)}$2`);
}

function buildCaseHtml(shell, { slug, title }, copy) {
  const url = `${SITE_URL}/case/${slug}`;
  const pageTitle = `${title} — ${copy.kind} · Rayan Morais`;

  let html = shell;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(pageTitle)}</title>`);
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/i,
    `$1${escapeAttribute(url)}$2`
  );
  html = replaceMeta(html, 'name', 'description', copy.problem);
  html = replaceMeta(html, 'property', 'og:url', url);
  html = replaceMeta(html, 'property', 'og:title', pageTitle);
  html = replaceMeta(html, 'property', 'og:description', copy.problem);
  html = replaceMeta(html, 'name', 'twitter:title', pageTitle);
  html = replaceMeta(html, 'name', 'twitter:description', copy.problem);
  return html;
}

const shell = readFileSync(join(DIST, 'index.html'), 'utf8');
const home = readJson('src/translations/pt-br/home.json');
const caseRoutes = readJson('src/data/case-routes.json');

caseRoutes.forEach((route, index) => {
  const copy = home.caseStudies.items[index];
  if (!copy) throw new Error(`Sem tradução para a rota /case/${route.slug} (índice ${index})`);

  const outDir = join(DIST, 'case', route.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), buildCaseHtml(shell, route, copy));
  console.log(`prerender-meta: /case/${route.slug}`);
});

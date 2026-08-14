/**
 * Gera src/data/github-stats.json a partir do GitHub real.
 *
 * Rodar com `npm run github:stats` e commitar o JSON. É deliberadamente manual,
 * e não um passo do build: a API sem autenticação permite 60 req/h por IP, e
 * build de CI roda em IP compartilhado — ligar isso no deploy trocaria números
 * desatualizados por builds que quebram de forma intermitente.
 *
 * Usa GITHUB_TOKEN se existir (ou `gh auth token`), o que eleva o limite e
 * libera a contagem de contribuições, que só existe no GraphQL.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/github-stats.json');
const USER = 'rayancmorais';

/* Cores oficiais do linguist, para a barra bater com o que o GitHub mostra. */
const LANGUAGE_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#da5b0b',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572a5',
  Go: '#00add8',
};

function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const token = resolveToken();
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-stats-script',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} em /${path}`);
  return res.json();
}

/** Contribuições dos últimos 12 meses só existem no GraphQL, que exige token. */
async function fetchContributions() {
  if (!token) return null;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}`,
      variables: { login: USER },
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? null;
}

/**
 * Distribuição por linguagem PRINCIPAL de cada repositório, não por bytes.
 * Por bytes, um único repo de notebooks domina a barra inteira — notebooks
 * guardam as saídas embutidas (imagens em base64) e pesam ordens de grandeza
 * mais que código.
 */
function languageShare(repos) {
  const counts = {};
  for (const repo of repos) {
    if (repo.fork || !repo.language) continue;
    counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 3);
  const restShare = ranked.slice(3).reduce((sum, [, n]) => sum + n, 0);

  const languages = top.map(([name, n]) => ({
    name,
    pct: Math.round((n / total) * 100),
    color: LANGUAGE_COLORS[name] ?? 'var(--fg-4)',
  }));

  if (restShare > 0) {
    languages.push({ name: null, pct: Math.round((restShare / total) * 100), color: 'var(--fg-4)' });
  }
  return languages;
}

const [profile, repos, commitSearch, contributions] = await Promise.all([
  api(`users/${USER}`),
  api(`users/${USER}/repos?per_page=100&type=owner`),
  api(`search/commits?q=author:${USER}&per_page=1`),
  fetchContributions(),
]);

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

const stats = {
  generatedAt: new Date().toISOString().slice(0, 10),
  commits: commitSearch.total_count,
  publicRepos: profile.public_repos,
  // Sem token não dá para consultar contribuições; preserva o último valor bom.
  contributionsLastYear: contributions ?? previous.contributionsLastYear ?? null,
  languages: languageShare(repos),
};

writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`github-stats: ${stats.commits} commits · ${stats.publicRepos} repos · atualizado ${stats.generatedAt}`);
console.log(stats.languages.map(l => `  ${l.name ?? 'outros'} ${l.pct}%`).join('\n'));

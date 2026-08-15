/* ============================================================================
   Estudos de caso — ponto único de entrada.

   Aqui ficam os dados-base (ordem, ano, stack, links, métricas), consumidos
   tanto pela seção da home quanto pelas páginas /case/:slug, para que os dois
   nunca divirjam.

   A prosa curta da home (problema, abordagem, resultado) vive no i18next. O
   conteúdo técnico longo — decisões, código anotado e retrospectiva — vive em
   ./<slug>.ts, um arquivo por case.
   ========================================================================== */

import { cupommaniac } from './cupommaniac';
import { crashGame } from './crash-game';
import { luxLabBrasil } from './lux-lab-brasil';
import type { CaseContent } from './types';

export interface CaseStudy {
  slug: string;
  no: string;
  title: string;
  year: string;
  domain: string;
  image?: string;
  stack: string[];
  /** Site no ar. Ausente quando o projeto não tem demo pública. */
  link?: string;
  /** Repositório. Ausente quando o código é privado. */
  repo?: string;
  metricValues: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'cupommaniac',
    no: '01',
    title: 'CupomManiac',
    year: '2026',
    domain: 'cupommaniac.com.br',
    image: '/assets/cases/cupommaniac.png',
    stack: [
      'Next.js 15',
      'Fastify',
      'Prisma',
      'PostgreSQL',
      'Redis',
      'BullMQ',
      'Meilisearch',
      'Vercel',
      'Railway',
    ],
    link: 'https://cupommaniac.com.br',
    metricValues: ['5', '3h', '0–100'],
  },
  {
    slug: 'crash-game',
    no: '02',
    title: 'Crash Game',
    year: '2026',
    domain: 'jungle-gaming.app',
    image: '/assets/cases/crashGame.png',
    stack: [
      'NestJS',
      'Bun',
      'DDD',
      'RabbitMQ',
      'Kong',
      'Keycloak',
      'WebSocket',
      'PostgreSQL',
      'Docker',
    ],
    repo: 'https://github.com/rayancmorais/fullstack-challengeRayancm',
    metricValues: ['91', '11', '4'],
  },
  {
    // O slug fica como está: a URL já foi publicada. Só o título exibido muda,
    // porque o case cobre os dois mercados, não só o Brasil.
    slug: 'lux-lab-brasil',
    no: '03',
    title: 'Lux Lab',
    year: '2026',
    domain: 'luxlabbr.vercel.app',
    image: '/assets/cases/brdropshipping.png',
    stack: [
      'Go',
      'Gin',
      'AWS Lambda',
      'MongoDB',
      'Next.js 15',
      'MercadoPago',
      'Stripe',
      'OAuth2/OIDC',
    ],
    // Assimetria proposital: o site no ar é a versão BR, o código público é o
    // da versão EU. Os rótulos dizem qual é qual (ver `links_note`).
    link: 'https://luxlabbr.vercel.app',
    repo: 'https://github.com/rayancmorais/luxeLab',
    metricValues: ['2', '3', 'OAuth2'],
  },
];

export function findCaseBySlug(slug: string | undefined): CaseStudy | undefined {
  return CASE_STUDIES.find(c => c.slug === slug);
}

export function findNextCase(slug: string): CaseStudy {
  const index = CASE_STUDIES.findIndex(c => c.slug === slug);
  return CASE_STUDIES[(index + 1) % CASE_STUDIES.length];
}

/**
 * Case anterior, sem dar a volta: no primeiro devolve `undefined`, e aí a
 * página oferece a home no lugar — "anterior" apontando para o último seria
 * mentira sobre a ordem.
 */
export function findPreviousCase(slug: string): CaseStudy | undefined {
  const index = CASE_STUDIES.findIndex(c => c.slug === slug);
  return index > 0 ? CASE_STUDIES[index - 1] : undefined;
}

/* ------------------------------------------------- conteúdo técnico ------- */

const CONTENT: Record<string, CaseContent> = {
  [cupommaniac.slug]: cupommaniac,
  [crashGame.slug]: crashGame,
  [luxLabBrasil.slug]: luxLabBrasil,
};

export function findCaseContent(slug: string): CaseContent | undefined {
  return CONTENT[slug];
}

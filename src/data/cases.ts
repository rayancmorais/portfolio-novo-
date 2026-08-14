/* ============================================================================
   Dados-base dos estudos de caso — o que não é texto traduzível.
   A prosa (problema, abordagem, resultado, decisões técnicas) vive no i18next,
   em translations/<lng>/home.json sob `caseStudies` e `casePages`.

   Consumido pela seção da home (CaseStudies) e pelas páginas /case/:slug,
   para que os dois nunca divirjam.
   ========================================================================== */

export interface CaseCodeSnippet {
  /** Caminho do arquivo de origem, mostrado como legenda do bloco. */
  file: string;
  language: string;
  code: string;
}

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
  /**
   * Trecho anotado do ponto mais interessante do projeto. Ausente enquanto o
   * código não foi escolhido — a página simplesmente não renderiza a seção.
   */
  snippet?: CaseCodeSnippet;
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
    slug: 'lux-lab-brasil',
    no: '03',
    title: 'Lux Lab Brasil',
    year: '2025',
    domain: 'luxlabbrasil.com.br',
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

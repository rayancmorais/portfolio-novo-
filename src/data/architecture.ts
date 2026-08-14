/* ============================================================================
   Topologia dos sistemas, desenhada como dados.

   Só geometria e ligações vivem aqui — a responsabilidade de cada nó é texto
   traduzível e fica no i18next, em `casePages.items[i].diagram.roles.<id>`.

   Coordenadas são o CENTRO de cada nó, no espaço do viewBox do diagrama.
   ========================================================================== */

export type NodeKind = 'client' | 'service' | 'infra' | 'external';

export interface DiagramNode {
  id: string;
  label: string;
  /** Linha secundária dentro do nó — stack ou detalhe curto. */
  sub?: string;
  kind: NodeKind;
  x: number;
  y: number;
  /** Destaca o nó que carrega a decisão central do projeto. */
  accent?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** Fluxo assíncrono ou fora do caminho síncrono principal. */
  dashed?: boolean;
  bidirectional?: boolean;
}

export interface Architecture {
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const ARCHITECTURES: Record<string, Architecture> = {
  cupommaniac: {
    width: 900,
    height: 400,
    nodes: [
      { id: 'web', label: 'Next.js 15', sub: 'SSR / ISR', kind: 'client', x: 110, y: 90 },
      {
        id: 'sources',
        label: '5 fontes afiliadas',
        sub: 'Adapter Pattern',
        kind: 'external',
        x: 110,
        y: 300,
      },
      { id: 'api', label: 'Fastify', sub: 'API', kind: 'service', x: 450, y: 195 },
      { id: 'queue', label: 'BullMQ', sub: 'sync a cada 3h', kind: 'infra', x: 450, y: 345 },
      { id: 'search', label: 'Meilisearch', sub: 'busca full-text', kind: 'infra', x: 790, y: 75 },
      { id: 'db', label: 'PostgreSQL', sub: 'Prisma', kind: 'infra', x: 790, y: 200 },
      { id: 'cache', label: 'Redis', kind: 'infra', x: 790, y: 325 },
    ],
    edges: [
      { from: 'web', to: 'api' },
      { from: 'sources', to: 'queue', dashed: true },
      { from: 'queue', to: 'api', label: 'lote' },
      { from: 'api', to: 'search' },
      { from: 'api', to: 'db' },
      { from: 'api', to: 'cache' },
    ],
  },

  'crash-game': {
    width: 900,
    height: 430,
    nodes: [
      { id: 'client', label: 'Cliente', sub: 'React', kind: 'client', x: 95, y: 225 },
      { id: 'keycloak', label: 'Keycloak', sub: 'OAuth2 / OIDC', kind: 'external', x: 310, y: 70 },
      { id: 'kong', label: 'Kong', sub: 'API Gateway', kind: 'infra', x: 310, y: 225 },
      { id: 'game', label: 'Game Service', sub: 'NestJS · DDD', kind: 'service', x: 555, y: 135 },
      {
        id: 'bus',
        label: 'RabbitMQ',
        sub: 'sem HTTP direto',
        kind: 'infra',
        x: 555,
        y: 320,
        accent: true,
      },
      {
        id: 'wallet',
        label: 'Wallet Service',
        sub: 'BigInt em centavos',
        kind: 'service',
        x: 800,
        y: 320,
      },
      { id: 'db', label: 'PostgreSQL', kind: 'infra', x: 800, y: 135 },
    ],
    edges: [
      { from: 'client', to: 'kong' },
      { from: 'client', to: 'game', label: 'WebSocket', dashed: true },
      { from: 'kong', to: 'keycloak', dashed: true },
      { from: 'kong', to: 'game' },
      { from: 'game', to: 'bus', bidirectional: true },
      { from: 'bus', to: 'wallet', bidirectional: true },
      { from: 'wallet', to: 'db' },
    ],
  },

  'lux-lab-brasil': {
    width: 900,
    height: 460,
    nodes: [
      { id: 'web', label: 'Next.js 15', sub: '7 idiomas', kind: 'client', x: 95, y: 230 },
      { id: 'gw', label: 'API Gateway', sub: 'timeout 28s', kind: 'infra', x: 300, y: 230 },
      {
        id: 'api',
        label: 'Go · AWS Lambda',
        sub: 'serverless',
        kind: 'service',
        x: 520,
        y: 230,
        accent: true,
      },
      { id: 'mongo', label: 'MongoDB', kind: 'infra', x: 760, y: 65 },
      { id: 'br', label: 'Fornecedores BR', kind: 'external', x: 760, y: 185 },
      { id: 'eu', label: 'Fornecedores EU', kind: 'external', x: 760, y: 300 },
      {
        id: 'pay',
        label: 'MercadoPago · Stripe',
        sub: 'gateway por região',
        kind: 'external',
        x: 760,
        y: 415,
      },
    ],
    edges: [
      { from: 'web', to: 'gw' },
      { from: 'gw', to: 'api' },
      { from: 'api', to: 'mongo' },
      { from: 'api', to: 'br', label: 'BR' },
      { from: 'api', to: 'eu', label: 'EU' },
      { from: 'api', to: 'pay', dashed: true },
    ],
  },
};

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  link: string;
  caseStudySlug?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'CupomManiac',
    description:
      'Plataforma fullstack de cupons e descontos para o mercado brasileiro. SSR/ISR com Next.js 15, API Fastify, filas BullMQ/Redis e painel admin completo.',
    technologies: [
      'Next.js 15',
      'Fastify',
      'PostgreSQL',
      'BullMQ',
      'Redis',
      'NextAuth v5',
      'Vercel',
      'Railway',
    ],
    imageUrl: '/images/cupommaniac.png',
    link: 'https://cupommaniac.com.br',
    caseStudySlug: 'cupommaniac',
    featured: true,
  },
  {
    id: 2,
    title: 'Crash Game — Jungle Gaming',
    description:
      'Crash game multiplayer em tempo real. Microsserviços com DDD, RabbitMQ, Keycloak OAuth2, WebSocket via Socket.io, provably fair HMAC-SHA256 e 91 testes unitários + 11 E2E.',
    technologies: [
      'NestJS',
      'RabbitMQ',
      'Socket.io',
      'Keycloak',
      'Kong',
      'Docker',
      'GitHub Actions',
      'PostgreSQL',
    ],
    imageUrl: '/images/crash-game.png',
    link: 'https://github.com/rayancmorais/fullstack-challengeRayancm',
    featured: true,
  },
  {
    id: 3,
    title: 'BR Dropshipping — Lux Lab Brasil',
    description:
      'Plataforma de dropshipping com 8 fornecedores internacionais, Stripe/PayPal/MercadoPago (Pix), chat IA com Claude via SSE e i18n em 7 idiomas.',
    technologies: [
      'Go',
      'Gin',
      'MongoDB',
      'AWS Lambda',
      'Stripe',
      'MercadoPago',
      'Claude (Anthropic)',
      'next-intl',
    ],
    imageUrl: '/images/br-dropshipping.png',
    link: '#',
    featured: true,
  },
  {
    id: 4,
    title: 'Portfólio Pessoal',
    description:
      'SPA com React 19 + Vite, code splitting por seção, Framer Motion, Lenis smooth scroll, i18next PT-BR/EN e tema claro/escuro.',
    technologies: ['React 19', 'Vite', 'Framer Motion', 'Lenis', 'Styled Components', 'i18next'],
    imageUrl: '/images/portfolio.png',
    link: 'https://portfolio-novo-omega.vercel.app',
    featured: false,
  },
];

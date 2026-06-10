export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Dados'
  | 'Auth & Pagamentos'
  | 'Cloud & DevOps'
  | 'IA';

export interface Skill {
  name: string;
  category: SkillCategory;
}

export const skills: Skill[] = [
  // Frontend
  { name: 'Next.js 15', category: 'Frontend' },
  { name: 'React 19', category: 'Frontend' },
  { name: 'React Native', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Framer Motion', category: 'Frontend' },
  { name: 'Styled Components', category: 'Frontend' },
  { name: 'Radix UI', category: 'Frontend' },
  // Backend
  { name: 'Fastify', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Go / Gin', category: 'Backend' },
  { name: 'BullMQ', category: 'Backend' },
  { name: 'RabbitMQ', category: 'Backend' },
  { name: 'Redis', category: 'Backend' },
  { name: 'Socket.io', category: 'Backend' },
  // Dados
  { name: 'PostgreSQL', category: 'Dados' },
  { name: 'MongoDB', category: 'Dados' },
  { name: 'MySQL', category: 'Dados' },
  { name: 'Supabase', category: 'Dados' },
  { name: 'Prisma ORM', category: 'Dados' },
  // Auth & Pagamentos
  { name: 'OAuth2 / OIDC', category: 'Auth & Pagamentos' },
  { name: 'NextAuth v5', category: 'Auth & Pagamentos' },
  { name: 'Keycloak', category: 'Auth & Pagamentos' },
  { name: 'JWT', category: 'Auth & Pagamentos' },
  { name: 'Stripe', category: 'Auth & Pagamentos' },
  { name: 'PayPal', category: 'Auth & Pagamentos' },
  { name: 'MercadoPago', category: 'Auth & Pagamentos' },
  { name: 'Pix', category: 'Auth & Pagamentos' },
  // Cloud & DevOps
  { name: 'AWS Lambda', category: 'Cloud & DevOps' },
  { name: 'AWS SAM', category: 'Cloud & DevOps' },
  { name: 'Docker', category: 'Cloud & DevOps' },
  { name: 'Vercel', category: 'Cloud & DevOps' },
  { name: 'Railway', category: 'Cloud & DevOps' },
  { name: 'GitHub Actions', category: 'Cloud & DevOps' },
  { name: 'Kong API Gateway', category: 'Cloud & DevOps' },
  // IA
  { name: 'Anthropic Claude API', category: 'IA' },
  { name: 'LLM Engineering', category: 'IA' },
];

export const CATEGORY_META: Record<
  SkillCategory,
  { color: string; bg: string; border: string; label: string }
> = {
  Frontend: {
    color: '#58a6ff',
    bg: 'rgba(88, 166, 255, 0.08)',
    border: 'rgba(88, 166, 255, 0.2)',
    label: 'FRONTEND',
  },
  Backend: {
    color: '#3fb950',
    bg: 'rgba(63, 185, 80, 0.08)',
    border: 'rgba(63, 185, 80, 0.2)',
    label: 'BACKEND',
  },
  Dados: {
    color: '#d29922',
    bg: 'rgba(210, 153, 34, 0.08)',
    border: 'rgba(210, 153, 34, 0.2)',
    label: 'DADOS',
  },
  'Auth & Pagamentos': {
    color: '#a371f7',
    bg: 'rgba(163, 113, 247, 0.08)',
    border: 'rgba(163, 113, 247, 0.2)',
    label: 'AUTH & PAGAMENTOS',
  },
  'Cloud & DevOps': {
    color: '#f78166',
    bg: 'rgba(247, 129, 102, 0.08)',
    border: 'rgba(247, 129, 102, 0.2)',
    label: 'CLOUD & DEVOPS',
  },
  IA: {
    color: '#39d353',
    bg: 'rgba(57, 211, 83, 0.08)',
    border: 'rgba(57, 211, 83, 0.2)',
    label: 'IA',
  },
};

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiStyledcomponents,
  SiRadixui,
  SiFastify,
  SiNestjs,
  SiNodedotjs,
  SiExpress,
  SiGo,
  SiPostgresql,
  SiMongodb,
  SiSupabase,
  SiPrisma,
  SiDocker,
  SiVercel,
  SiGithubactions,
  SiRabbitmq,
  SiRedis,
} from 'react-icons/si';

/* ── keyframes ──────────────────────────────────────────────────────────────── */

const borderFlow = keyframes`
  from { background-position: 0% 0; }
  to   { background-position: 200% 0; }
`;

const scanSweep = keyframes`
  0%   { top: -4%;  opacity: 0; }
  8%   { opacity: 0.7; }
  92%  { opacity: 0.7; }
  100% { top: 104%; opacity: 0; }
`;

/* ── data ───────────────────────────────────────────────────────────────────── */

interface TechItem {
  name: string;
  icon: React.ReactNode;
}
interface EcoGroup {
  id: string;
  items: TechItem[];
  chips: string[];
}

const GROUPS: EcoGroup[] = [
  {
    id: 'frontend',
    items: [
      { name: 'Next.js 15', icon: <SiNextdotjs /> },
      { name: 'React 19', icon: <SiReact /> },
      { name: 'React Native', icon: <SiReact /> },
      { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
      { name: 'Framer Motion', icon: <SiFramer /> },
      { name: 'Styled Components', icon: <SiStyledcomponents /> },
      { name: 'Radix UI', icon: <SiRadixui /> },
    ],
    chips: ['TypeScript', 'i18next', 'Lenis', 'Vite'],
  },
  {
    id: 'backend',
    items: [
      { name: 'Node.js', icon: <SiNodedotjs /> },
      { name: 'Fastify', icon: <SiFastify /> },
      { name: 'NestJS', icon: <SiNestjs /> },
      { name: 'Express', icon: <SiExpress /> },
      { name: 'Go / Gin', icon: <SiGo /> },
      { name: 'Redis', icon: <SiRedis /> },
      { name: 'RabbitMQ', icon: <SiRabbitmq /> },
    ],
    chips: ['BullMQ', 'Socket.io', 'REST API', 'JWT'],
  },
  {
    id: 'data-devops',
    items: [
      { name: 'PostgreSQL', icon: <SiPostgresql /> },
      { name: 'MongoDB', icon: <SiMongodb /> },
      { name: 'Supabase', icon: <SiSupabase /> },
      { name: 'Prisma ORM', icon: <SiPrisma /> },
      { name: 'Docker', icon: <SiDocker /> },
      { name: 'Vercel', icon: <SiVercel /> },
      { name: 'GitHub Actions', icon: <SiGithubactions /> },
    ],
    chips: ['AWS Lambda', 'Railway', 'MySQL', 'Kong', 'Vitest', 'ESLint', 'Husky', 'Prettier'],
  },
];

/* ── motion ─────────────────────────────────────────────────────────────────── */

const itemVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 420, damping: 28, delay: i * 0.035 },
  }),
};

/* ── spotlight helpers ─────────────────────────────────────────────────────── */

function handleSpot(e: React.MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
}
function clearSpot(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.removeProperty('--spot-x');
  e.currentTarget.style.removeProperty('--spot-y');
}

/* ── component ─────────────────────────────────────────────────────────────── */

export function TechStack() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <Section id="ecosystem" ref={ref}>
      <Container>
        <Header
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionTitle>
            {t('techStack.title_1')}{' '}
            <Accent className="accent-sci">{t('techStack.title_accent')}</Accent>
          </SectionTitle>
          <Subtitle>{t('techStack.subtitle')}</Subtitle>
        </Header>

        <Panel
          as={motion.div}
          onMouseMove={handleSpot}
          onMouseLeave={clearSpot}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        >
          <Spot aria-hidden />
          <Scanline aria-hidden />

          <Columns>
            {GROUPS.map((g, gi) => (
              <GroupCol key={g.id}>
                <GroupHead>
                  <GroupTitle>{t(`techStack.groups.${g.id}`)}</GroupTitle>
                  <GroupLine aria-hidden />
                </GroupHead>

                <TechGrid>
                  {g.items.map((tech, i) => (
                    <TechItem
                      key={tech.name}
                      custom={gi * 7 + i}
                      variants={itemVariants}
                      initial="hidden"
                      animate={inView ? 'show' : 'hidden'}
                    >
                      <IconWell>{tech.icon}</IconWell>
                      <TechName>{tech.name}</TechName>
                    </TechItem>
                  ))}
                </TechGrid>

                <ChipDivider />

                <ChipRow>
                  {g.chips.map(chip => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </ChipRow>
              </GroupCol>
            ))}
          </Columns>
        </Panel>
      </Container>
    </Section>
  );
}

/* ── styled ─────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  padding: clamp(4rem, 9vw, 7rem) 1.5rem;
`;

const Container = styled.div`
  max-width: var(--container, 1200px);
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3.2rem;
`;

const SectionTitle = styled.h2`
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1);
  margin: 0.7rem 0 0.6rem;
`;

const Accent = styled.em`
  font-style: inherit;
  color: var(--cy);
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--fg-2);
  line-height: 1.6;
  max-width: 540px;
  margin: 0 auto;
`;

/* ── panel ── */

const Spot = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  border-radius: inherit;
  background: radial-gradient(
    360px circle at var(--spot-x, -9999px) var(--spot-y, -9999px),
    rgba(90, 130, 255, 0.16),
    rgba(70, 150, 255, 0.09) 45%,
    transparent 72%
  );
`;

const Scanline = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: -4%;
  height: 2px;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(120, 150, 255, 0.5) 35%,
    rgba(90, 180, 255, 0.5) 65%,
    transparent
  );
  filter: blur(1px);
  animation: ${scanSweep} 7s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const Panel = styled.div`
  position: relative;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    z-index: 4;
    background: linear-gradient(90deg, transparent, var(--cy) 30%, #64a0ff 55%, transparent);
    background-size: 200% 100%;
    animation: ${borderFlow} 6s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

/* ── columns ── */

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GroupCol = styled.div`
  position: relative;
  padding: 1.7rem 1.6rem 1.8rem;
  border-right: 1px solid var(--border-faint);

  &:last-child {
    border-right: none;
  }

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid var(--border-faint);
    &:last-child {
      border-bottom: none;
    }
  }
`;

const GroupHead = styled.div`
  margin-bottom: 1.3rem;
`;

const GroupTitle = styled.h3`
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.15rem;
  color: var(--fg-1);
  margin: 0 0 0.7rem;
`;

const GroupLine = styled.div`
  height: 2px;
  width: 100%;
  border-radius: 1px;
  background: linear-gradient(90deg, var(--cy), #64a0ff 55%, transparent);
  box-shadow:
    0 0 10px rgba(90, 130, 255, 0.6),
    0 0 20px rgba(90, 165, 255, 0.35);
`;

const TechGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
`;

const TechItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: default;
  transition:
    border-color 0.2s var(--ease),
    background 0.2s,
    box-shadow 0.2s,
    transform 0.2s var(--ease);

  &:hover {
    border-color: rgba(120, 145, 255, 0.5);
    background: var(--elev-2);
    transform: translateY(-2px);
    box-shadow:
      0 0 0 1px rgba(120, 145, 255, 0.14),
      0 8px 22px rgba(90, 110, 255, 0.16);
  }
`;

const IconWell = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--fg-2);
  flex-shrink: 0;
  transition:
    color 0.2s,
    background 0.2s,
    box-shadow 0.2s;

  ${TechItem}:hover & {
    color: var(--cy-bright);
    background: rgba(90, 120, 255, 0.14);
    box-shadow: 0 0 14px rgba(90, 130, 255, 0.4);
  }
`;

const TechName = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--fg-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChipDivider = styled.div`
  height: 1px;
  background: var(--border-faint);
  margin: 1.4rem 0 1rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  background: var(--cy-08);
  color: var(--cy-bright);
  border: 1px solid var(--cy-20);
  padding: 3px 10px;
  border-radius: var(--r-chip);
  font-family: var(--mono);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: rgba(100, 165, 255, 0.5);
    color: #b9c6ff;
    box-shadow: 0 0 12px rgba(110, 130, 255, 0.35);
  }
`;

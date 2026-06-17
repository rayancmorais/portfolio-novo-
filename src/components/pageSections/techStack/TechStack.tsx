import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
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

/* ── data ───────────────────────────────────────────────────────────────────── */

interface TechItem {
  name: string;
  icon: React.ReactNode;
}
interface EcoGroup {
  id: string;
  index: string;
  items: TechItem[];
  chips: string[];
}

const GROUPS: EcoGroup[] = [
  {
    id: 'frontend',
    index: 'F·01',
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
    index: 'B·02',
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
    index: 'D·03',
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
  const [active, setActive] = useState('frontend');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const group = GROUPS.find(g => g.id === active)!;

  return (
    <Section id="ecosystem" ref={ref}>
      <Container>
        <Header
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow>{t('techStack.eyebrow')}</Eyebrow>
          <SectionTitle>
            {t('techStack.title_1')} <Accent>{t('techStack.title_accent')}</Accent>
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

          {/* ── tabs ── */}
          <TabBar>
            {GROUPS.map(g => (
              <Tab key={g.id} $active={active === g.id} onClick={() => setActive(g.id)}>
                <TabIndex>{g.index}</TabIndex>
                <TabName>{t(`techStack.groups.${g.id}`)}</TabName>
                {active === g.id && <TabUnderline layoutId="eco-tab-line" />}
              </Tab>
            ))}
          </TabBar>

          {/* ── content ── */}
          <AnimatePresence mode="wait">
            <Content
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <TechGrid>
                {group.items.map((tech, i) => (
                  <TechItem
                    key={tech.name}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <IconWell>{tech.icon}</IconWell>
                    <TechName>{tech.name}</TechName>
                  </TechItem>
                ))}
              </TechGrid>

              <ChipDivider />

              <ChipRow>
                {group.chips.map(chip => (
                  <Chip key={chip}>{chip}</Chip>
                ))}
              </ChipRow>
            </Content>
          </AnimatePresence>
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
  margin-bottom: 2.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
`;

const Eyebrow = styled.p`
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--cy);
`;

const SectionTitle = styled.h2`
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1);
`;

const Accent = styled.em`
  font-style: inherit;
  color: var(--cy);
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--fg-2);
  line-height: 1.7;
`;

/* ── panel ── */

const Spot = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  border-radius: inherit;
  background: radial-gradient(
    340px circle at var(--spot-x, -9999px) var(--spot-y, -9999px),
    rgba(0, 229, 204, 0.14),
    rgba(0, 229, 204, 0.04) 55%,
    transparent 75%
  );
`;

const Panel = styled.div`
  position: relative;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
`;

/* ── tabs ── */

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border);

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  padding: 1.1rem 1rem 1.15rem;
  background: ${({ $active }) => ($active ? 'var(--elev-2)' : 'transparent')};
  border: none;
  border-right: 1px solid var(--border-faint);
  cursor: pointer;
  transition: background 0.2s var(--ease);

  &:last-child {
    border-right: none;
  }
  &:hover:not(:disabled) {
    background: var(--elev-2);
  }

  @media (max-width: 560px) {
    flex-direction: row;
    gap: 0.6rem;
    border-right: none;
    border-bottom: 1px solid var(--border-faint);
    &:last-child {
      border-bottom: none;
    }
  }
`;

const TabIndex = styled.span`
  font-family: var(--mono);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--cy);
`;

const TabName = styled.span`
  font-family: var(--serif);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--fg-1);
`;

const TabUnderline = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--cy);
  border-radius: 1px 1px 0 0;

  @media (max-width: 560px) {
    top: 0;
    bottom: auto;
    left: 0;
    right: auto;
    width: 2px;
    height: 100%;
    border-radius: 0 1px 1px 0;
  }
`;

/* ── content ── */

const Content = styled(motion.div)`
  padding: 1.8rem 2rem 2rem;

  @media (max-width: 600px) {
    padding: 1.4rem 1.2rem 1.6rem;
  }
`;

const TechGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: 0.5rem;
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
    background 0.2s;

  &:hover {
    border-color: var(--cy-35);
    background: var(--elev-2);
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
`;

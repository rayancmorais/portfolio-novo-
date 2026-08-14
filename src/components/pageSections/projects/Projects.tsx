import { useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ============================================================================
   Projects — "repository"-style project grid for the Rayan Morais portfolio.
   Stack: React + styled-components + framer-motion (no new dependencies).
   Visual tokens are read from tokens.css via CSS custom properties
   (--cy, --bg, --fg-1, etc.). Hex fallbacks are a safety net only.

   Deliberately distinct from CaseStudies: no screenshot frame — these read
   like repo cards (repo mark, owner/repo path, status badge, squared stack
   tags, repo-style footer link).
   ========================================================================== */

/* ---------------------------------------------------------------- data ---- */

type Status = 'live' | 'done' | 'wip';

interface Project {
  id: string;
  label: string; // "P·01"
  repo: string; // owner/repo path
  title: string;
  status: Status;
  description: string;
  stack: string[];
  link?: string; // external link, rendered only when present
}

const PROJECTS_BASE: Omit<Project, 'description'>[] = [
  {
    id: 'nexusai',
    label: 'P·01',
    repo: 'rayancmorais / nexusai',
    title: 'NexusAI',
    status: 'wip',
    stack: ['Go', 'Node.js', 'Python', 'gRPC', 'Qdrant', 'Next.js'],
  },
  {
    id: 'map-tracker',
    label: 'P·02',
    repo: 'rayancmorais / googleMap_Tracker_TypeScript',
    title: 'Map Tracker',
    status: 'done',
    stack: ['React Native', 'TypeScript'],
    link: 'https://github.com/rayancmorais/googleMap_Tracker_TypeScript',
  },
];

/* ------------------------------------------------------------- motion ---- */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 360, damping: 30 },
  },
};

/* -------------------------------------------------------------- styled ---- */

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.82); }
`;

const Section = styled.section`
  position: relative;
  padding: clamp(4rem, 9vw, 7rem) clamp(1.2rem, 4vw, 2.6rem);
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3.2rem;
`;

const Title = styled.h2`
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1, #e6e8ee);
  margin: 0.7rem 0 0.6rem;

  em {
    font-style: italic;
    color: var(--cy, #00f5d4);
  }
`;

const Subtitle = styled.p`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 1rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.6;
  max-width: 580px;
  margin: 0 auto;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
  align-items: stretch;
  max-width: 860px;
  margin: 0 auto;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    max-width: 540px;
    margin: 0 auto;
  }
`;

/* bracket corners — identical behaviour to CaseStudies */
const Bracket = styled.span`
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--cy, #00f5d4);
  opacity: 0;
  pointer-events: none;
  z-index: 5;
  transition:
    opacity 0.3s ease,
    top 0.3s ease,
    left 0.3s ease,
    right 0.3s ease,
    bottom 0.3s ease;

  &[data-c='tl'] {
    top: 9px;
    left: 9px;
    border-right: none;
    border-bottom: none;
  }
  &[data-c='tr'] {
    top: 9px;
    right: 9px;
    border-left: none;
    border-bottom: none;
  }
  &[data-c='bl'] {
    bottom: 9px;
    left: 9px;
    border-right: none;
    border-top: none;
  }
  &[data-c='br'] {
    bottom: 9px;
    right: 9px;
    border-left: none;
    border-top: none;
  }
`;

const Card = styled(motion.article)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.6rem 1.6rem 1.5rem;
  text-align: left;
  background: var(--elev, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-card, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;

  /* thin top accent rail that grows on hover — the "project" signature */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: 0;
    background: var(--cy, #00f5d4);
    transition: width 0.4s ease;
    z-index: 4;
  }

  &:hover {
    border-color: var(--cy-35, rgba(0, 245, 212, 0.35));
    box-shadow:
      0 0 0 1px rgba(0, 245, 212, 0.14),
      0 24px 60px rgba(0, 0, 0, 0.6);
    transform: translateY(-6px);
  }
  &:hover::after {
    width: 100%;
  }

  &:hover ${Bracket}[data-c="tl"] {
    top: 14px;
    left: 14px;
    opacity: 0.9;
  }
  &:hover ${Bracket}[data-c="tr"] {
    top: 14px;
    right: 14px;
    opacity: 0.9;
  }
  &:hover ${Bracket}[data-c="bl"] {
    bottom: 14px;
    left: 14px;
    opacity: 0.9;
  }
  &:hover ${Bracket}[data-c="br"] {
    bottom: 14px;
    right: 14px;
    opacity: 0.9;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
    &::after {
      transition: none;
    }
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const RepoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
`;

const Mark = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cy, #00f5d4);
  flex-shrink: 0;
`;

const RepoPath = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  color: var(--fg-4, #545b6b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Label = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cy, #00f5d4);
  border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
  border-radius: 6px;
  padding: 4px 8px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ $status: Status }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;

  ${({ $status }) => {
    if ($status === 'live')
      return css`
        color: var(--success, #4ade80);
        background: var(--success-bg, rgba(74, 222, 128, 0.1));
        border: 1px solid var(--success-border, rgba(74, 222, 128, 0.28));
      `;
    if ($status === 'wip')
      return css`
        color: var(--blue-bright, #64a0ff);
        background: var(--blue-15, rgba(62, 127, 233, 0.15));
        border: 1px solid var(--blue-30, rgba(62, 127, 233, 0.3));
      `;
    return css`
      color: var(--cy-bright, #5cf8e6);
      background: var(--cy-08, rgba(0, 245, 212, 0.08));
      border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
    `;
  }}
`;

const Dot = styled.span<{ $status: Status; $reduce: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $status }) => {
    if ($status === 'live') return 'var(--success, #4ade80)';
    if ($status === 'wip') return 'var(--blue-bright, #64a0ff)';
    return 'var(--cy, #00f5d4)';
  }};
  ${({ $status, $reduce }) =>
    ($status === 'live' || $status === 'wip') &&
    !$reduce &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const CardTitle = styled.h3`
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.75rem;
  line-height: 1.05;
  color: var(--fg-1, #e6e8ee);
  margin: 0;
`;

const Description = styled.p`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 0.9rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.7;
  margin: 0;
  flex-grow: 1;
`;

/* squared mono tags — the repo-style counterpart to CaseStudies' pills */
const Stack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Tag = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.68rem;
  letter-spacing: 0.02em;
  color: var(--fg-2, #8b93a7);
  background: var(--bg-2, rgba(255, 255, 255, 0.02));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: 4px;
  padding: 3px 8px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding-top: 1rem;
  margin-top: 0.1rem;
  border-top: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const RepoLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.74rem;
  letter-spacing: 0.02em;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;
  transition:
    color 0.2s ease,
    gap 0.2s ease;

  &:hover {
    color: var(--cy, #00f5d4);
    gap: 12px;
  }
`;

const NoLink = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--fg-4, #545b6b);
`;

/* ---------------------------------------------------------- component ---- */

export function Projects() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const reduce = useReducedMotion();

  const items = t('projects.items', { returnObjects: true }) as Array<{ description: string }>;
  const statusText: Record<Status, string> = {
    live: t('projects.status_live'),
    done: t('projects.status_done'),
    wip: t('projects.status_wip'),
  };

  const prettyHost = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <Section id="projects" aria-labelledby="projects-title">
      <Inner>
        <Header>
          <Title id="projects-title">
            <em className="accent-sci">{t('projects.title_accent')}</em>
          </Title>
          <Subtitle>{t('projects.subtitle')}</Subtitle>
        </Header>

        <Grid
          ref={ref}
          variants={reduce ? undefined : containerVariants}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : inView ? 'show' : 'hidden'}
        >
          {PROJECTS_BASE.map((p, i) => (
            <Card key={p.id} variants={reduce ? undefined : cardVariants}>
              <Bracket data-c="tl" aria-hidden="true" />
              <Bracket data-c="tr" aria-hidden="true" />
              <Bracket data-c="bl" aria-hidden="true" />
              <Bracket data-c="br" aria-hidden="true" />

              <TopRow>
                <RepoMeta>
                  <Mark aria-hidden="true">&lt;/&gt;</Mark>
                  <RepoPath>{p.repo}</RepoPath>
                </RepoMeta>
                <Label>{p.label}</Label>
              </TopRow>

              <StatusBadge $status={p.status}>
                <Dot $status={p.status} $reduce={!!reduce} aria-hidden="true" />
                {statusText[p.status]}
              </StatusBadge>

              <CardTitle>{p.title}</CardTitle>
              <Description>{items[i]?.description ?? ''}</Description>

              <Stack>
                {p.stack.map(tech => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </Stack>

              <Footer>
                {p.link ? (
                  <RepoLink href={p.link} target="_blank" rel="noopener noreferrer">
                    {prettyHost(p.link)} →
                  </RepoLink>
                ) : (
                  <NoLink>{t('projects.private_repo')}</NoLink>
                )}
              </Footer>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}

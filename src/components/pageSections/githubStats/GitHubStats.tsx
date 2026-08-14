import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ============================================================================
   GitHubStats — mocked GitHub activity panel for the Rayan Morais portfolio.
   Stack: React + styled-components + framer-motion (no new dependencies).
   Visual tokens are read from tokens.css via CSS custom properties
   (--cy, --bg, --fg-1, etc.). Hex fallbacks are a safety net only.

   No real API call — all numbers are hardcoded below. Swap MOCK for a
   fetch('https://api.github.com/users/rayancmorais') later if desired.
   ========================================================================== */

/* ---------------------------------------------------------------- data ---- */

import statsJson from '@/data/github-stats.json';

const GH_USER = 'rayancmorais';

/* Números reais, gerados por `npm run github:stats`. Hardcoded eles divergiam
   do perfil (dizia 12 repos quando havia 24) — e número errado custa mais
   confiança do que número ausente. */
const stats = statsJson as {
  generatedAt: string;
  commits: number;
  publicRepos: number;
  contributionsLastYear: number | null;
  languages: { name: string | null; pct: number; color: string }[];
};

interface Stat {
  id: string;
  value: number;
  suffix?: string;
  label: string;
}

interface Lang {
  name: string;
  pct: number;
  color: string;
}

/* ------------------------------------------------------------- motion ---- */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 360, damping: 30 },
  },
};

/* count-up hook — eases a number from 0 → target once `active` flips true */
function useCountUp(target: number, active: boolean, duration = 1100) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      // target é estável — setN no branch reduce é inicialização, não loop
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduce]);
  return n;
}

/* -------------------------------------------------------------- styled ---- */

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

const Handle = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  color: var(--fg-2, #8b93a7);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--cy, #00f5d4);
  }
`;

/* bracket-corner card — same recipe as the other sections */
const bracket = css`
  &::before,
  &::after,
  & > .brk-tr,
  & > .brk-bl {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
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
  }
  &::before {
    top: 9px;
    left: 9px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: 9px;
    right: 9px;
    border-left: none;
    border-top: none;
  }
  & > .brk-tr {
    top: 9px;
    right: 9px;
    border-left: none;
    border-bottom: none;
  }
  & > .brk-bl {
    bottom: 9px;
    left: 9px;
    border-right: none;
    border-top: none;
  }

  &:hover::before {
    top: 13px;
    left: 13px;
    opacity: 0.9;
  }
  &:hover::after {
    bottom: 13px;
    right: 13px;
    opacity: 0.9;
  }
  &:hover > .brk-tr {
    top: 13px;
    right: 13px;
    opacity: 0.9;
  }
  &:hover > .brk-bl {
    bottom: 13px;
    left: 13px;
    opacity: 0.9;
  }
`;

const cardBase = css`
  position: relative;
  background: var(--elev, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-card, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;

  &:hover {
    border-color: var(--cy-35, rgba(0, 245, 212, 0.35));
    box-shadow:
      0 0 0 1px rgba(0, 245, 212, 0.14),
      0 24px 60px rgba(0, 0, 0, 0.6);
    transform: translateY(-6px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const StatGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin-bottom: 1.2rem;

  /* Número curto não justifica largura total: lado a lado eles ficam
     comparáveis, que é o motivo de existir uma faixa de estatísticas. */
  @media (max-width: 768px) {
    gap: 0.6rem;
  }
`;

const StatCard = styled(motion.div)`
  ${cardBase}
  ${bracket}
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.5rem 1.4rem;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
  text-align: left;
`;

const StatValue = styled.span`
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(2.2rem, 4vw, 2.9rem);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  line-height: 1;
  color: var(--cy, #00f5d4);
  font-variant-numeric: tabular-nums;
`;

const StatLabel = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.66rem;

  @media (max-width: 768px) {
    font-size: 0.58rem;
    letter-spacing: 0.06em;
  }
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-4, #545b6b);
`;

const LangCard = styled(motion.div)`
  ${cardBase}
  ${bracket}
  padding: 1.7rem 1.7rem 1.6rem;
`;

const LangHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
`;

const LangTitle = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fg-2, #8b93a7);
`;

const Bar = styled.div`
  display: flex;
  width: 100%;
  height: 12px;
  border-radius: 100px;
  overflow: hidden;
  background: var(--bg-2, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const BarFill = styled(motion.span)`
  height: 100%;
  display: block;

  & + & {
    border-left: 2px solid var(--bg, #0d1117);
  }
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  margin-top: 1.1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.72rem;
  color: var(--fg-2, #8b93a7);
`;

const Swatch = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const Pct = styled.span`
  color: var(--fg-4, #545b6b);
`;

/* ---------------------------------------------------------- subcomponent -- */

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const n = useCountUp(stat.value, active);
  return (
    <StatCard variants={itemVariants}>
      <span className="brk-tr" aria-hidden="true" />
      <span className="brk-bl" aria-hidden="true" />
      <StatValue>
        {n}
        {stat.suffix ?? ''}
      </StatValue>
      <StatLabel>{stat.label}</StatLabel>
    </StatCard>
  );
}

/* ---------------------------------------------------------- component ---- */

export function GitHubStats() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const reduce = useReducedMotion();

  const STATS: Stat[] = [
    { id: 'commits', value: stats.commits, label: t('github.stat_commits') },
    { id: 'repos', value: stats.publicRepos, label: t('github.stat_repos') },
    ...(stats.contributionsLastYear
      ? [
          {
            id: 'contributions',
            value: stats.contributionsLastYear,
            label: t('github.stat_contributions'),
          },
        ]
      : []),
  ];

  /* `name: null` marca a fatia agregada — o rótulo dela é traduzível. */
  const LANGS: Lang[] = stats.languages.map(lang => ({
    ...lang,
    name: lang.name ?? t('github.lang_others'),
  }));

  return (
    <Section id="github" aria-labelledby="github-title">
      <Inner>
        <Header>
          <Title id="github-title">
            {t('github.title_1')} <em className="accent-sci">{t('github.title_accent')}</em>
          </Title>
          <Handle href={`https://github.com/${GH_USER}`} target="_blank" rel="noopener noreferrer">
            @{GH_USER} ↗
          </Handle>
        </Header>

        <motion.div
          ref={ref}
          variants={reduce ? undefined : containerVariants}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : inView ? 'show' : 'hidden'}
        >
          <StatGrid variants={reduce ? undefined : containerVariants}>
            {STATS.map(s => (
              <StatItem key={s.id} stat={s} active={inView} />
            ))}
          </StatGrid>

          <LangCard variants={reduce ? undefined : itemVariants}>
            <span className="brk-tr" aria-hidden="true" />
            <span className="brk-bl" aria-hidden="true" />

            <LangHead>
              <LangTitle>{t('github.lang_title')}</LangTitle>
            </LangHead>

            <Bar role="img" aria-label={t('github.lang_bar_aria')}>
              {LANGS.map(l => (
                <BarFill
                  key={l.name}
                  style={{ background: l.color }}
                  initial={reduce ? false : { width: 0 }}
                  animate={inView || reduce ? { width: `${l.pct}%` } : { width: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                />
              ))}
            </Bar>

            <Legend>
              {LANGS.map(l => (
                <LegendItem key={l.name}>
                  <Swatch $color={l.color} aria-hidden="true" />
                  {l.name}
                  <Pct>{l.pct}%</Pct>
                </LegendItem>
              ))}
            </Legend>
          </LangCard>
        </motion.div>
      </Inner>
    </Section>
  );
}

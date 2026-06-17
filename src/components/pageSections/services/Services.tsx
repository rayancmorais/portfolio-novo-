import { useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ============================================================================
   Services — what Rayan offers. Grid 2×2. Eyebrow "06 · Serviços".
   React + styled-components + framer-motion (no new dependencies).
   Tokens via CSS custom properties (--cy, --fg-1, …) with hex fallbacks.
   Icons are drawn as inline mono glyphs to avoid pulling a new icon dep.
   ========================================================================== */

interface Service {
  id: string;
  glyph: string;
  title: string;
  description: string;
  tags: string[];
}

const SERVICES_GLYPHS = ['</>', '{ }', '▣', '▲'] as const;
const SERVICES_IDS = ['fullstack', 'api', 'design', 'devops'] as const;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 360, damping: 30 },
  },
};

const Section = styled.section`
  position: relative;
  padding: clamp(4rem, 9vw, 7rem) clamp(1.2rem, 4vw, 2.6rem);
`;

const Inner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3.2rem;
`;

const Eyebrow = styled.span`
  display: block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--cy, #00f5d4);
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
  max-width: 540px;
  margin: 0 auto;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

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

const Card = styled(motion.article)`
  ${bracket}
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.8rem 1.8rem 1.9rem;
  text-align: left;
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

const IconWell = styled.span`
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--r-icon, 12px);
  background: var(--cy-08, rgba(0, 245, 212, 0.08));
  border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cy, #00f5d4);
`;

const CardTitle = styled.h3`
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.55rem;
  line-height: 1.1;
  color: var(--fg-1, #e6e8ee);
  margin: 0.2rem 0 0;
`;

const Description = styled.p`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 0.9rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.7;
  margin: 0;
  flex-grow: 1;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const Tag = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.68rem;
  letter-spacing: 0.02em;
  color: var(--cy-bright, #5cf8e6);
  background: var(--cy-08, rgba(0, 245, 212, 0.08));
  border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
  border-radius: var(--r-chip, 100px);
  padding: 3px 10px;
`;

export function Services() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const reduce = useReducedMotion();

  const items = t('services.items', { returnObjects: true }) as Service[];
  const SERVICES: Service[] = items.map((item, i) => ({
    ...item,
    id: SERVICES_IDS[i],
    glyph: SERVICES_GLYPHS[i],
  }));

  return (
    <Section id="services" aria-labelledby="services-title">
      <Inner>
        <Header>
          <Eyebrow>{t('services.eyebrow')}</Eyebrow>
          <Title id="services-title">
            {t('services.title_1')} <em>{t('services.title_accent')}</em>
          </Title>
          <Subtitle>{t('services.subtitle')}</Subtitle>
        </Header>

        <Grid
          ref={ref}
          variants={reduce ? undefined : containerVariants}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : inView ? 'show' : 'hidden'}
        >
          {SERVICES.map(s => (
            <Card key={s.id} variants={reduce ? undefined : cardVariants}>
              <span className="brk-tr" aria-hidden="true" />
              <span className="brk-bl" aria-hidden="true" />
              <IconWell aria-hidden="true">{s.glyph}</IconWell>
              <CardTitle>{s.title}</CardTitle>
              <Description>{s.description}</Description>
              <Tags>
                {s.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Tags>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}

import { useRef } from "react";
import styled, { css } from "styled-components";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

/* ============================================================================
   Testimonials — fictional peer/client quotes. Grid 3 cols.
   Eyebrow "07 · Depoimentos". React + styled-components + framer-motion.
   Tokens via CSS custom properties with hex fallbacks. No new dependencies.
   ========================================================================== */

const TESTIMONIALS_BASE = [
  { id: "t1", name: "Mariana Lopes", initials: "ML" },
  { id: "t2", name: "Bruno Carvalho", initials: "BC" },
  { id: "t3", name: "Camila Andrade", initials: "CA" },
] as const;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 360, damping: 30 },
  },
};

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

const Eyebrow = styled.span`
  display: block;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--cy, #00f5d4);
`;

const Title = styled.h2`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1, #e6e8ee);
  margin: 0.7rem 0 0.6rem;

  em { font-style: italic; color: var(--cy, #00f5d4); }
`;

const Subtitle = styled.p`
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 1rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.6;
  max-width: 540px;
  margin: 0 auto;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  align-items: stretch;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    max-width: 560px;
    margin: 0 auto;
  }
`;

const bracket = css`
  &::before,
  &::after,
  & > .brk-tr,
  & > .brk-bl {
    content: "";
    position: absolute;
    width: 13px;
    height: 13px;
    border: 1.5px solid var(--cy, #00f5d4);
    opacity: 0;
    pointer-events: none;
    z-index: 5;
    transition: opacity 0.3s ease, top 0.3s ease, left 0.3s ease,
      right 0.3s ease, bottom 0.3s ease;
  }
  &::before { top: 9px; left: 9px; border-right: none; border-bottom: none; }
  &::after { bottom: 9px; right: 9px; border-left: none; border-top: none; }
  & > .brk-tr { top: 9px; right: 9px; border-left: none; border-bottom: none; }
  & > .brk-bl { bottom: 9px; left: 9px; border-right: none; border-top: none; }
  &:hover::before { top: 13px; left: 13px; opacity: 0.9; }
  &:hover::after { bottom: 13px; right: 13px; opacity: 0.9; }
  &:hover > .brk-tr { top: 13px; right: 13px; opacity: 0.9; }
  &:hover > .brk-bl { bottom: 13px; left: 13px; opacity: 0.9; }
`;

const Card = styled(motion.figure)`
  ${bracket}
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 0;
  padding: 1.8rem 1.7rem;
  background: var(--elev, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-card, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    border-color: var(--cy-35, rgba(0, 245, 212, 0.35));
    box-shadow: 0 0 0 1px rgba(0, 245, 212, 0.14), 0 24px 60px rgba(0, 0, 0, 0.6);
    transform: translateY(-6px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`;

const Mark = styled.span`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-size: 3rem;
  line-height: 0.5;
  color: var(--cy-20, rgba(0, 245, 212, 0.25));
`;

const Quote = styled.blockquote`
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 0.95rem;
  color: var(--fg-1, #e6e8ee);
  line-height: 1.7;
  margin: 0;
  flex-grow: 1;
`;

const Person = styled.figcaption`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--cy-08, rgba(0, 245, 212, 0.08));
  border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--cy, #00f5d4);
`;

const Name = styled.span`
  display: block;
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--fg-1, #e6e8ee);
`;

const Role = styled.span`
  display: block;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  color: var(--fg-4, #545b6b);
  margin-top: 2px;
`;

export function Testimonials() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const reduce = useReducedMotion();

  const items = t('testimonials.items', { returnObjects: true }) as Array<{ quote: string; role: string }>;

  return (
    <Section id="testimonials" aria-labelledby="testimonials-title">
      <Inner>
        <Header>
          <Eyebrow>{t('testimonials.eyebrow')}</Eyebrow>
          <Title id="testimonials-title">
            {t('testimonials.title_1')} <em>{t('testimonials.title_accent')}</em>
          </Title>
          <Subtitle>{t('testimonials.subtitle')}</Subtitle>
        </Header>

        <Grid
          ref={ref}
          variants={reduce ? undefined : containerVariants}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : inView ? "show" : "hidden"}
        >
          {TESTIMONIALS_BASE.map((base, i) => (
            <Card key={base.id} variants={reduce ? undefined : cardVariants}>
              <span className="brk-tr" aria-hidden="true" />
              <span className="brk-bl" aria-hidden="true" />
              <Mark aria-hidden="true">&ldquo;</Mark>
              <Quote>{items[i]?.quote ?? ''}</Quote>
              <Person>
                <Avatar aria-hidden="true">{base.initials}</Avatar>
                <span>
                  <Name>{base.name}</Name>
                  <Role>{items[i]?.role ?? ''}</Role>
                </span>
              </Person>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}

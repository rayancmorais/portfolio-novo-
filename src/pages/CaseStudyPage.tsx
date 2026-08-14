import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CASE_STUDIES, findCaseBySlug, findNextCase } from '@/data/cases';
import { Navbar } from '@/components/pageSections/navbar/Navbar';
import { Footer } from '@/components/pageSections/footer/Footer';

/* ============================================================================
   Página de estudo de caso — /case/:slug

   Estrutura por seção: hero · contexto · abordagem · decisões técnicas ·
   código anotado · resultado + métricas · o que eu faria diferente · próximo.

   Seções sem conteúdo não renderizam. Isso deixa a página íntegra enquanto as
   decisões técnicas e o trecho de código de cada projeto ainda não existem.
   ========================================================================== */

interface CaseDecision {
  title: string;
  problem: string;
  alternatives: string;
  decision: string;
  tradeoff: string;
}

interface CasePageCopy {
  context_extra?: string;
  decisions?: CaseDecision[];
  retrospective?: string;
}

interface CaseHomeCopy {
  kind: string;
  problem: string;
  approach: string;
  result: string;
  metric_labels: string[];
}

/* -------------------------------------------------------------- styled ---- */

const Page = styled.div`
  position: relative;
`;

const Article = styled.article`
  max-width: 860px;
  margin: 0 auto;
  padding: clamp(6rem, 12vw, 9rem) clamp(1.2rem, 4vw, 2.6rem) clamp(4rem, 8vw, 6rem);
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--fg-3);
  text-decoration: none;
  transition:
    color 0.2s ease,
    gap 0.2s ease;

  &:hover {
    color: var(--cy-bright);
    gap: 12px;
  }
`;

const Eyebrow = styled.p`
  margin: 2rem 0 0.6rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cy);
`;

const Title = styled.h1`
  font-family: var(--font-serif, serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.4rem, 6vw, 3.8rem);
  line-height: 1.04;
  color: var(--fg-1);
  margin: 0 0 1.4rem;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.6rem;
`;

const Chip = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--cy-bright);
  background: var(--cy-08);
  border: 1px solid var(--cy-20);
  border-radius: var(--r-chip, 100px);
  padding: 4px 11px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Ghost = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.3rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-chip, 100px);
  font-family: var(--font-sans, sans-serif);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--fg-1);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: var(--cy-50);
    color: var(--cy-bright);
  }
`;

const Shot = styled.div`
  position: relative;
  overflow: hidden;
  margin: 2.8rem 0;
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);
  background: var(--bg-2);

  img {
    display: block;
    width: 100%;
  }
`;

const Section = styled.section`
  margin-top: 3.2rem;
`;

const SectionLabel = styled.h2`
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cy);
  margin: 0 0 1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid var(--border-faint);
`;

const Prose = styled.p`
  font-family: var(--font-sans, sans-serif);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--fg-2);
  margin: 0 0 1rem;
`;

const DecisionCard = styled.div`
  padding: 1.4rem 1.5rem;
  margin-bottom: 1rem;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);
`;

const DecisionTitle = styled.h3`
  font-family: var(--font-serif, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.35rem;
  color: var(--fg-1);
  margin: 0 0 1rem;
`;

const DecisionRow = styled.div`
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 0.9rem;
  margin-bottom: 0.7rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
`;

const DecisionLabel = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-4);
  padding-top: 4px;
`;

const DecisionText = styled.p`
  font-family: var(--font-sans, sans-serif);
  font-size: 0.94rem;
  line-height: 1.7;
  color: var(--fg-2);
  margin: 0;
`;

const CodeFrame = styled.figure`
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);
  overflow: hidden;
`;

const CodeCaption = styled.figcaption`
  padding: 0.7rem 1rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  color: var(--fg-4);
  background: var(--bg-2);
  border-bottom: 1px solid var(--border-faint);
`;

const Code = styled.pre`
  margin: 0;
  padding: 1.2rem 1rem;
  overflow-x: auto;
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--fg-2);
  background: var(--bg-2);
`;

const Metrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1.2rem 0;
  border-top: 1px solid var(--border-faint);
  border-bottom: 1px solid var(--border-faint);
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const MetricValue = styled.span`
  font-family: var(--font-serif, serif);
  font-weight: 500;
  font-size: 1.8rem;
  line-height: 1.1;
  color: var(--cy);
`;

const MetricLabel = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-4);
`;

const NextCard = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3.6rem;
  padding: 1.6rem 1.8rem;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);
  text-decoration: none;
  transition:
    border-color 0.3s ease,
    transform 0.3s ease;

  &:hover {
    border-color: var(--cy-35);
    transform: translateY(-3px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const NextLabel = styled.span`
  display: block;
  font-family: var(--font-mono, monospace);
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-4);
  margin-bottom: 6px;
`;

const NextTitle = styled.span`
  font-family: var(--font-serif, serif);
  font-style: italic;
  font-size: 1.5rem;
  color: var(--fg-1);
`;

const NextArrow = styled.span`
  font-size: 1.4rem;
  color: var(--cy);
`;

/* ---------------------------------------------------------- component ---- */

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('home');
  const reduce = useReducedMotion();

  const study = findCaseBySlug(slug);
  const index = CASE_STUDIES.findIndex(c => c.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!study) return;

    const previousTitle = document.title;
    document.title = `${study.title} — Rayan Morais`;
    return () => {
      document.title = previousTitle;
    };
  }, [study]);

  if (!study) return <Navigate to="/" replace />;

  const home = t(`caseStudies.items.${index}`, { returnObjects: true }) as CaseHomeCopy;
  const page = t(`casePages.items.${index}`, { returnObjects: true }) as CasePageCopy;
  const next = findNextCase(study.slug);

  const decisions = page?.decisions ?? [];
  const metricLabels = home?.metric_labels ?? [];

  return (
    <Page>
      <Navbar />
      <Article
        as={motion.article}
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <BackLink to="/">← {t('casePages.back')}</BackLink>

        <Eyebrow>
          {study.no} · {home?.kind} · {study.year}
        </Eyebrow>
        <Title>{study.title}</Title>

        <Chips>
          {study.stack.map(tech => (
            <Chip key={tech}>{tech}</Chip>
          ))}
        </Chips>

        <Actions>
          {study.link && (
            <Ghost href={study.link} target="_blank" rel="noopener noreferrer">
              {t('caseStudies.visit_site')}
            </Ghost>
          )}
          {study.repo && (
            <Ghost href={study.repo} target="_blank" rel="noopener noreferrer">
              {t('caseStudies.view_code')}
            </Ghost>
          )}
        </Actions>

        {study.image && (
          <Shot>
            <img src={study.image} alt={`${study.title} — screenshot`} />
          </Shot>
        )}

        <Section>
          <SectionLabel>{t('casePages.label_context')}</SectionLabel>
          <Prose>{home?.problem}</Prose>
          {page?.context_extra && <Prose>{page.context_extra}</Prose>}
        </Section>

        <Section>
          <SectionLabel>{t('casePages.label_approach')}</SectionLabel>
          <Prose>{home?.approach}</Prose>
        </Section>

        {decisions.length > 0 && (
          <Section>
            <SectionLabel>{t('casePages.label_decisions')}</SectionLabel>
            {decisions.map(d => (
              <DecisionCard key={d.title}>
                <DecisionTitle>{d.title}</DecisionTitle>
                <DecisionRow>
                  <DecisionLabel>{t('casePages.label_problem')}</DecisionLabel>
                  <DecisionText>{d.problem}</DecisionText>
                </DecisionRow>
                <DecisionRow>
                  <DecisionLabel>{t('casePages.label_alternatives')}</DecisionLabel>
                  <DecisionText>{d.alternatives}</DecisionText>
                </DecisionRow>
                <DecisionRow>
                  <DecisionLabel>{t('casePages.label_decision')}</DecisionLabel>
                  <DecisionText>{d.decision}</DecisionText>
                </DecisionRow>
                <DecisionRow>
                  <DecisionLabel>{t('casePages.label_tradeoff')}</DecisionLabel>
                  <DecisionText>{d.tradeoff}</DecisionText>
                </DecisionRow>
              </DecisionCard>
            ))}
          </Section>
        )}

        {study.snippet && (
          <Section>
            <SectionLabel>{t('casePages.label_code')}</SectionLabel>
            <CodeFrame>
              <CodeCaption>{study.snippet.file}</CodeCaption>
              <Code>
                <code>{study.snippet.code}</code>
              </Code>
            </CodeFrame>
          </Section>
        )}

        <Section>
          <SectionLabel>{t('casePages.label_result')}</SectionLabel>
          <Prose>{home?.result}</Prose>
          <Metrics>
            {study.metricValues.map((value, i) => (
              <Metric key={value}>
                <MetricValue>{value}</MetricValue>
                <MetricLabel>{metricLabels[i]}</MetricLabel>
              </Metric>
            ))}
          </Metrics>
        </Section>

        {page?.retrospective && (
          <Section>
            <SectionLabel>{t('casePages.label_retrospective')}</SectionLabel>
            <Prose>{page.retrospective}</Prose>
          </Section>
        )}

        <NextCard to={`/case/${next.slug}`}>
          <span>
            <NextLabel>{t('casePages.next')}</NextLabel>
            <NextTitle>{next.title}</NextTitle>
          </span>
          <NextArrow aria-hidden="true">→</NextArrow>
        </NextCard>
      </Article>
      <Footer />
    </Page>
  );
}

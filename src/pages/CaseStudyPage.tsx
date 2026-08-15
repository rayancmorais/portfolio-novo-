import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CASE_STUDIES, findCaseBySlug, findCaseContent, findNextCase } from '@/data/cases';
import { ARCHITECTURES } from '@/data/architecture';
import { ArchitectureDiagram } from '@/components/caseStudy/ArchitectureDiagram';
import { TechnicalDecisions } from '@/components/caseStudy/TechnicalDecisions';
import { CodeSnippet } from '@/components/caseStudy/CodeSnippet';
import { Retrospective } from '@/components/caseStudy/Retrospective';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/pageSections/navbar/Navbar';
import { Footer } from '@/components/pageSections/footer/Footer';

/* ============================================================================
   Página de estudo de caso — /case/:slug

   Estrutura por seção: hero · contexto · abordagem · decisões técnicas ·
   código anotado · resultado + métricas · o que eu faria diferente · próximo.

   Seções sem conteúdo não renderizam. Isso deixa a página íntegra enquanto as
   decisões técnicas e o trecho de código de cada projeto ainda não existem.
   ========================================================================== */

interface CaseDiagramCopy {
  caption: string;
  roles: Record<string, string>;
}

interface CasePageCopy {
  summary?: string;
  context_extra?: string;
  diagram?: CaseDiagramCopy;
}

interface CaseHomeCopy {
  kind: string;
  problem: string;
  approach: string;
  result: string;
  metric_labels: string[];
  visit_site_label?: string;
  view_code_label?: string;
  links_note?: string;
}

/* -------------------------------------------------------------- styled ---- */

const Page = styled.div`
  position: relative;
`;

/* Sem animação de entrada no container da página. A versão anterior partia de
   opacity: 0 e dependia do framer concluir a transição para o conteúdo
   aparecer — quando isso não acontecia, a página inteira ficava invisível.
   Conteúdo nunca deve depender de animação decorativa para existir. */
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

const Summary = styled.p`
  max-width: 62ch;
  margin: 0 0 1.6rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 1.02rem;
  line-height: 1.7;
  color: var(--fg-2);
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

const LinksNote = styled.p`
  max-width: 62ch;
  margin: 0.9rem 0 0;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--fg-3);
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
  const { language } = useLanguage();

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
  const architecture = ARCHITECTURES[study.slug];
  const content = findCaseContent(study.slug);

  const decisions = content?.decisions[language] ?? [];
  const retrospective = content?.retrospective[language]?.trim() ?? '';
  const snippet = content?.snippet;
  const metricLabels = home?.metric_labels ?? [];

  return (
    <Page>
      <Navbar />
      <Article>
        <BackLink to="/">← {t('casePages.back')}</BackLink>

        <Eyebrow>
          {study.no} · {home?.kind} · {study.year}
        </Eyebrow>
        <Title>{study.title}</Title>

        {page?.summary && <Summary>{page.summary}</Summary>}

        <Chips>
          {study.stack.map(tech => (
            <Chip key={tech}>{tech}</Chip>
          ))}
        </Chips>

        <Actions>
          {study.link && (
            <Ghost href={study.link} target="_blank" rel="noopener noreferrer">
              {home?.visit_site_label ?? t('caseStudies.visit_site')}
            </Ghost>
          )}
          {study.repo && (
            <Ghost href={study.repo} target="_blank" rel="noopener noreferrer">
              {home?.view_code_label ?? t('caseStudies.view_code')}
            </Ghost>
          )}
        </Actions>

        {home?.links_note && <LinksNote>{home.links_note}</LinksNote>}

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

        {architecture && page?.diagram && (
          <Section>
            <SectionLabel>{t('casePages.label_architecture')}</SectionLabel>
            <ArchitectureDiagram
              architecture={architecture}
              roles={page.diagram.roles}
              caption={page.diagram.caption}
              title={`${study.title} — ${t('casePages.label_architecture')}`}
            />
          </Section>
        )}

        {decisions.length > 0 && (
          <Section>
            <SectionLabel>{t('casePages.label_decisions')}</SectionLabel>
            <TechnicalDecisions decisions={decisions} />
          </Section>
        )}

        {snippet && snippet.code.trim() && (
          <Section>
            <SectionLabel>{t('casePages.label_code')}</SectionLabel>
            <CodeSnippet
              file={snippet.file}
              language={snippet.language}
              code={snippet.code}
              highlightLines={snippet.highlightLines}
              note={snippet.note[language]}
            />
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

        {retrospective && (
          <Section>
            <Retrospective text={retrospective} />
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

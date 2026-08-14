import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TechnicalDecision } from '@/data/cases/types';

/* ============================================================================
   Decisões técnicas — problema → alternativas → decisão → trade-off.

   O problema é parágrafo, não título: descrever o cenário de verdade toma
   algumas linhas, e isso em serif itálico grande fica ilegível. Quem ancora o
   bloco é o número. A hierarquia continua: alternativas discretas (foram
   descartadas), decisão em destaque, e trade-off menor e mais suave — assume o
   custo sem competir com a decisão.
   ========================================================================== */

const Card = styled.article`
  position: relative;
  padding: 1.5rem 1.6rem 1.3rem;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);

  & + & {
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    padding: 1.1rem 1.1rem 1rem;
  }
`;

const Index = styled.span`
  display: block;
  margin-bottom: 0.9rem;
  font-family: var(--font-serif, serif);
  font-style: italic;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--cy-20);
`;

const Problem = styled.p`
  margin: 0 0 1.2rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--fg-1);
`;

const Label = styled.p`
  margin: 0 0 0.4rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-4);
`;

const Alternatives = styled.ul`
  margin: 0 0 1.1rem;
  padding: 0;
  list-style: none;
`;

const Alternative = styled.li`
  position: relative;
  padding-left: 1.1rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--fg-3);

  & + & {
    margin-top: 0.3rem;
  }

  /* Marcador redondo, não travessão: o texto das alternativas já usa travessão
     internamente e os dois se confundiriam. */
  &::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.62em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--fg-4);
  }
`;

const Decision = styled.p`
  margin: 0 0 1.1rem;
  padding-left: 0.9rem;
  border-left: 2px solid var(--cy);
  font-family: var(--font-sans, sans-serif);
  font-size: 0.98rem;
  line-height: 1.65;
  color: var(--fg-1);
`;

const Tradeoff = styled.p`
  margin: 0;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border-faint);
  font-family: var(--font-sans, sans-serif);
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--fg-3);
`;

const TradeoffLabel = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-4);
  margin-right: 0.5rem;
`;

interface TechnicalDecisionsProps {
  decisions: TechnicalDecision[];
}

export function TechnicalDecisions({ decisions }: TechnicalDecisionsProps) {
  const { t } = useTranslation('home');

  return (
    <>
      {decisions.map((decision, index) => (
        <Card key={decision.problema}>
          <Index aria-hidden="true">{String(index + 1).padStart(2, '0')}</Index>

          <Label>{t('casePages.label_problem')}</Label>
          <Problem>{decision.problema}</Problem>

          {decision.alternativas.length > 0 && (
            <>
              <Label>{t('casePages.label_alternatives')}</Label>
              <Alternatives>
                {decision.alternativas.map(alternative => (
                  <Alternative key={alternative}>{alternative}</Alternative>
                ))}
              </Alternatives>
            </>
          )}

          {decision.decisao && (
            <>
              <Label>{t('casePages.label_decision')}</Label>
              <Decision>{decision.decisao}</Decision>
            </>
          )}

          {decision.tradeoff && (
            <Tradeoff>
              <TradeoffLabel>{t('casePages.label_tradeoff')}</TradeoffLabel>
              {decision.tradeoff}
            </Tradeoff>
          )}
        </Card>
      ))}
    </>
  );
}

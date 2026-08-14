import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TechnicalDecision } from '@/data/cases/types';

/* ============================================================================
   Decisões técnicas — problema → alternativas → decisão → trade-off.

   A hierarquia visual é a tese do bloco: o problema é o título, as alternativas
   ficam discretas (foram descartadas), a decisão é o destaque, e o trade-off é
   menor e mais suave — sinaliza honestidade sobre o custo sem competir com a
   decisão em si.
   ========================================================================== */

const Card = styled.article`
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

const Problem = styled.h3`
  font-family: var(--font-serif, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.4rem;
  line-height: 1.2;
  color: var(--fg-1);
  margin: 0 0 1.1rem;
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

  /* Riscado não — foram consideradas, não erradas. O traço apenas as agrupa. */
  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--fg-4);
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
      {decisions.map(decision => (
        <Card key={decision.problema}>
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

import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

/* ============================================================================
   "O que eu faria diferente hoje".

   Tratamento próprio de propósito: é autocrítica deliberada, não um adendo no
   fim da página. A borda lateral e o fundo tirado do resto marcam que o bloco
   foi escrito de caso pensado.
   ========================================================================== */

const Block = styled.aside`
  position: relative;
  padding: 1.5rem 1.6rem;
  background: var(--elev);
  border: 1px solid var(--border);
  border-left: 3px solid var(--blue-bright);
  border-radius: var(--r-card, 16px);

  @media (max-width: 768px) {
    padding: 1.1rem 1.2rem;
  }
`;

const Heading = styled.h3`
  margin: 0 0 0.7rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--blue-bright);
`;

const Text = styled.p`
  margin: 0;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.96rem;
  line-height: 1.75;
  color: var(--fg-2);

  & + & {
    margin-top: 0.9rem;
  }
`;

interface RetrospectiveProps {
  text: string;
}

export function Retrospective({ text }: RetrospectiveProps) {
  const { t } = useTranslation('home');
  const paragraphs = text.split('\n\n').filter(Boolean);

  return (
    <Block>
      <Heading>{t('casePages.label_retrospective')}</Heading>
      {paragraphs.map(paragraph => (
        <Text key={paragraph}>{paragraph}</Text>
      ))}
    </Block>
  );
}

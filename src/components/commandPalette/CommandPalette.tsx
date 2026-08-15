import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion, useReducedMotion } from 'framer-motion';
import { CASE_STUDIES } from '@/data/cases';
import { CV_URLS, EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/data/links';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';

/* ============================================================================
   Command palette (⌘K) — construída à mão, sem dependência nova.

   O documento sugeria `cmdk` ou Radix Dialog, mas Radix não está no projeto e
   `cmdk` traria uma dependência para um recurso de acabamento. São ~200 linhas
   de padrão conhecido.

   Acessibilidade: combobox + listbox com aria-activedescendant (o foco nunca
   sai do input), Esc para fechar, setas para navegar, Tab preso dentro do
   diálogo e foco devolvido a quem abriu.
   ========================================================================== */

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  perform: () => void;
}

/** Remove acentos para que "servicos" encontre "Serviços". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Casamento por subsequência: "cpm" encontra "CupomManiac". Pontua melhor os
 * casamentos mais compactos e os que começam no início de uma palavra.
 */
function score(label: string, query: string): number | null {
  if (!query) return 0;

  const haystack = fold(label);
  const needle = fold(query);
  let cursor = 0;
  let hits = 0;
  let firstHit = -1;

  for (const char of needle) {
    const found = haystack.indexOf(char, cursor);
    if (found === -1) return null;
    if (firstHit === -1) firstHit = found;
    if (found === cursor) hits += 1;
    cursor = found + 1;
  }

  return -(cursor - firstHit) + hits * 2 - firstHit;
}

/* -------------------------------------------------------------- styled ---- */

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(3rem, 12vh, 8rem) 1rem 1rem;
  background: rgba(4, 6, 12, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
`;

const Panel = styled(motion.div)`
  width: min(560px, 100%);
  max-height: min(60vh, 480px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-card, 16px);
  box-shadow: var(--shadow-card);
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--border-faint);
`;

const Prompt = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  color: var(--cy);
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.95rem;
  color: var(--fg-1);

  &::placeholder {
    color: var(--fg-4);
  }
`;

const List = styled.ul`
  flex: 1;
  margin: 0;
  padding: 0.5rem;
  overflow-y: auto;
  list-style: none;
`;

const GroupLabel = styled.li`
  padding: 0.6rem 0.7rem 0.35rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-4);
`;

const Option = styled.li<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.9rem;
  color: ${({ $active }) => ($active ? 'var(--fg-1)' : 'var(--fg-2)')};
  background: ${({ $active }) => ($active ? 'var(--elev-2)' : 'transparent')};
`;

const Hint = styled.span`
  flex-shrink: 0;
  font-family: var(--font-mono, monospace);
  font-size: 0.66rem;
  color: var(--fg-4);
`;

const Empty = styled.li`
  padding: 1.4rem 0.7rem;
  text-align: center;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.88rem;
  color: var(--fg-3);
`;

const Footer = styled.div`
  display: flex;
  gap: 1.1rem;
  padding: 0.55rem 1.1rem;
  border-top: 1px solid var(--border-faint);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: var(--fg-4);

  @media (max-width: 560px) {
    display: none;
  }
`;

/* ---------------------------------------------------------- component ---- */

const SECTION_IDS = ['work', 'ecosystem', 'projects', 'services', 'contact'] as const;

interface CommandPaletteProps {
  onClose: () => void;
}

/**
 * Montada apenas enquanto aberta — o provider cuida disso. Assim query, item
 * ativo e o aviso de "copiado" nascem limpos a cada abertura, sem effect de
 * reset.
 */
export function CommandPalette({ onClose }: CommandPaletteProps) {
  const { t } = useTranslation('home');
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const goToSection = useSectionNavigation();

  const commands = useMemo<Command[]>(() => {
    const nav = SECTION_IDS.map(id => ({
      id: `nav-${id}`,
      group: t('commandPalette.group_nav'),
      label: t(`commandPalette.nav_${id}`),
      perform: () => goToSection(id),
    }));

    const cases = CASE_STUDIES.map(study => ({
      id: `case-${study.slug}`,
      group: t('commandPalette.group_cases'),
      label: t('commandPalette.open_case', { name: study.title }),
      perform: () => navigate(`/case/${study.slug}`),
    }));

    const download = (url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      link.click();
    };

    const actions: Command[] = [
      {
        id: 'cv-pt',
        group: t('commandPalette.group_actions'),
        label: t('commandPalette.cv_pt'),
        perform: () => download(CV_URLS.ptBR),
      },
      {
        id: 'cv-en',
        group: t('commandPalette.group_actions'),
        label: t('commandPalette.cv_en'),
        perform: () => download(CV_URLS.en),
      },
      {
        id: 'copy-email',
        group: t('commandPalette.group_actions'),
        label: copied ? t('commandPalette.copied') : t('commandPalette.copy_email'),
        hint: EMAIL,
        perform: () => {
          void navigator.clipboard?.writeText(EMAIL);
          setCopied(true);
        },
      },
      {
        id: 'link-github',
        group: t('commandPalette.group_links'),
        label: 'GitHub',
        perform: () => window.open(GITHUB_URL, '_blank', 'noopener'),
      },
      {
        id: 'link-linkedin',
        group: t('commandPalette.group_links'),
        label: 'LinkedIn',
        perform: () => window.open(LINKEDIN_URL, '_blank', 'noopener'),
      },
      {
        id: 'toggle-lang',
        group: t('commandPalette.group_system'),
        label: t('commandPalette.toggle_lang', {
          lang: language === 'ptBR' ? 'English' : 'Português',
        }),
        perform: toggleLanguage,
      },
    ];

    return [...nav, ...cases, ...actions];
  }, [t, goToSection, navigate, language, toggleLanguage, copied]);

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map(command => ({ command, rank: score(command.label, query.trim()) }))
      .filter((entry): entry is { command: Command; rank: number } => entry.rank !== null)
      .sort((a, b) => b.rank - a.rank)
      .map(entry => entry.command);
  }, [commands, query]);

  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus();
    };
  }, []);

  const run = (command: Command) => {
    command.perform();
    // Copiar email mostra o feedback no lugar; as demais fecham a paleta.
    if (command.id !== 'copy-email') onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'Tab') {
      // Único elemento focável do diálogo: prende o foco sem sentinelas.
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(i => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(i => (results.length ? (i - 1 + results.length) % results.length : 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = results[activeIndex];
      if (command) run(command);
    }
  };

  /* Marca quem abre um grupo aqui, em vez de mutar uma variável durante o
     render da lista. */
  const rows = results.map((command, index) => ({
    command,
    index,
    startsGroup: index === 0 || results[index - 1].group !== command.group,
  }));

  return (
    <Backdrop
      initial={reduce ? false : { opacity: 0 }}
      animate={reduce ? undefined : { opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Panel
        role="dialog"
        aria-modal="true"
        aria-label={t('commandPalette.placeholder')}
        initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
        animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onKeyDown={handleKeyDown}
      >
        <Field>
          <Prompt aria-hidden="true">&gt;</Prompt>
          <Input
            ref={inputRef}
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={t('commandPalette.placeholder')}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={results[activeIndex]?.id}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
          />
        </Field>

        <List id="command-palette-list" role="listbox">
          {rows.length === 0 && <Empty role="presentation">{t('commandPalette.empty')}</Empty>}
          {rows.map(({ command, index, startsGroup }) => (
            <Fragment key={command.id}>
              {startsGroup && <GroupLabel role="presentation">{command.group}</GroupLabel>}
              <Option
                id={command.id}
                role="option"
                aria-selected={index === activeIndex}
                $active={index === activeIndex}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => run(command)}
              >
                <span>{command.label}</span>
                {command.hint && <Hint>{command.hint}</Hint>}
              </Option>
            </Fragment>
          ))}
        </List>

        <Footer aria-hidden="true">
          <span>↑↓ {t('commandPalette.hint_nav')}</span>
          <span>⏎ {t('commandPalette.hint_open')}</span>
          <span>esc {t('commandPalette.hint_close')}</span>
        </Footer>
      </Panel>
    </Backdrop>
  );
}

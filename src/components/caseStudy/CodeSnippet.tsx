import styled from 'styled-components';

/* ============================================================================
   Trecho de código anotado.

   O realce é feito por um tokenizador próprio, de uma passada só, em vez de
   trazer prism/shiki para o bundle. Cobre bem o que aparece num trecho de
   15–30 linhas: comentário, string, número, palavra-chave e chamada de função.
   Não é um parser — para código muito exótico ele degrada para texto simples,
   que continua legível.
   ========================================================================== */

type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'fn' | 'plain';

const KEYWORDS = [
  // JS / TS
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'of',
  'in',
  'await',
  'async',
  'import',
  'from',
  'export',
  'default',
  'new',
  'class',
  'interface',
  'type',
  'extends',
  'implements',
  'public',
  'private',
  'protected',
  'readonly',
  'static',
  'throw',
  'try',
  'catch',
  'finally',
  'switch',
  'case',
  'break',
  'continue',
  'this',
  'as',
  // Go
  'func',
  'package',
  'struct',
  'go',
  'defer',
  'chan',
  'map',
  'range',
  'select',
  'var',
  // literais
  'true',
  'false',
  'null',
  'nil',
  'undefined',
].join('|');

/* A ordem importa: comentário e string precisam vencer antes de qualquer coisa
   dentro deles ser interpretada como palavra-chave. */
const TOKENIZER = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<string>'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\`(?:[^\`\\]|\\.)*\`)`,
    String.raw`(?<number>\b\d[\d_]*(?:\.\d+)?\b)`,
    String.raw`\b(?<keyword>${KEYWORDS})\b`,
    String.raw`(?<fn>\b[A-Za-z_$][\w$]*(?=\())`,
  ].join('|'),
  'g'
);

interface Token {
  text: string;
  type: TokenType;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of code.matchAll(TOKENIZER)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ text: code.slice(cursor, index), type: 'plain' });

    const groups = match.groups ?? {};
    const type = (Object.keys(groups).find(key => groups[key] !== undefined) ??
      'plain') as TokenType;
    tokens.push({ text: match[0], type });
    cursor = index + match[0].length;
  }

  if (cursor < code.length) tokens.push({ text: code.slice(cursor), type: 'plain' });
  return tokens;
}

/** Reparte os tokens em linhas, preservando o tipo através das quebras. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];

  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, type: token.type });
    });
  }
  return lines;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  comment: 'var(--fg-4)',
  string: '#7fd88f',
  number: '#d19a66',
  keyword: 'var(--blue-bright)',
  fn: 'var(--cy-bright)',
  plain: 'var(--fg-2)',
};

/* -------------------------------------------------------------- styled ---- */

const Frame = styled.figure`
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--r-card, 16px);
  overflow: hidden;
`;

const Caption = styled.figcaption`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  color: var(--fg-4);
  background: var(--bg-2);
  border-bottom: 1px solid var(--border-faint);
`;

const Lang = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const Pre = styled.pre`
  margin: 0;
  padding: 0.9rem 0;
  overflow-x: auto;
  background: var(--bg-2);
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  line-height: 1.75;
`;

const Line = styled.code<{ $highlighted: boolean }>`
  display: block;
  padding: 0 1rem 0 0.7rem;
  border-left: 3px solid ${({ $highlighted }) => ($highlighted ? 'var(--cy)' : 'transparent')};
  background: ${({ $highlighted }) => ($highlighted ? 'var(--cy-08)' : 'transparent')};
  white-space: pre;
`;

const LineNo = styled.span`
  display: inline-block;
  width: 2.2em;
  margin-right: 1em;
  text-align: right;
  color: var(--fg-4);
  opacity: 0.6;
  user-select: none;
`;

const Note = styled.p`
  margin: 0;
  padding: 0.9rem 1rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--fg-2);
  background: var(--elev);
  border-top: 1px solid var(--border-faint);
`;

/* ---------------------------------------------------------- component ---- */

interface CodeSnippetProps {
  file: string;
  language: string;
  code: string;
  /** Linhas em base 1. */
  highlightLines?: number[];
  note?: string;
}

export function CodeSnippet({ file, language, code, highlightLines = [], note }: CodeSnippetProps) {
  const highlighted = new Set(highlightLines);
  const lines = toLines(tokenize(code.replace(/\n+$/, '')));

  return (
    <Frame>
      <Caption>
        <span>{file}</span>
        <Lang>{language}</Lang>
      </Caption>

      <Pre>
        {lines.map((tokens, index) => (
          <Line key={index} $highlighted={highlighted.has(index + 1)}>
            <LineNo aria-hidden="true">{index + 1}</LineNo>
            {tokens.map((token, i) => (
              <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
                {token.text}
              </span>
            ))}
          </Line>
        ))}
      </Pre>

      {note && <Note>{note}</Note>}
    </Frame>
  );
}

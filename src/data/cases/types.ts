/* ============================================================================
   Tipos do conteúdo técnico dos estudos de caso.

   Este conteúdo vive em arquivos de dados (um por case) e não no i18next: são
   blocos longos, com código e listas, que ficam ilegíveis dentro de JSON. Os
   rótulos das seções continuam no i18next.

   Todo campo aceita vazio. Seção sem conteúdo simplesmente não renderiza.
   ========================================================================== */

export type Language = 'ptBR' | 'en';

/** Mesmo conteúdo nos dois idiomas. O EN pode começar vazio. */
export type Localized<T> = Record<Language, T>;

export interface TechnicalDecision {
  /** Vira o título do bloco. */
  problema: string;
  /** Opções consideradas e descartadas. */
  alternativas: string[];
  decisao: string;
  /** O que se perdeu ao escolher assim. */
  tradeoff: string;
}

export interface AnnotatedSnippet {
  /** Caminho do arquivo de origem, exibido como legenda. */
  file: string;
  /** Usado só para rotular o bloco: 'ts', 'go', 'sql'… */
  language: string;
  code: string;
  /** Linhas (base 1) que recebem destaque. */
  highlightLines?: number[];
  /** Comentário explicando a decisão, abaixo do código. */
  note: Localized<string>;
}

export interface CaseContent {
  slug: string;
  decisions: Localized<TechnicalDecision[]>;
  snippet?: AnnotatedSnippet;
  retrospective: Localized<string>;
}

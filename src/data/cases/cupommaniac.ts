import type { CaseContent } from './types';

/* Conteúdo técnico do CupomManiac.
   Preencher aos poucos — campo vazio não renderiza nada. */

export const cupommaniac: CaseContent = {
  slug: 'cupommaniac',

  decisions: {
    ptBR: [
      {
        problema: 'N+1 no sync de afiliados',
        alternativas: [
          'Aumentar o pool de conexões — adia o problema em vez de resolver',
          'Processar em fila com concorrência limitada — mais complexo de operar',
          'Gravar em lote com deduplicação',
        ],
        decisao:
          'upsertMany com dedupe por (fonte, idExterno). O matching de alertas saiu de N queries por cupom para 3 chamadas em lote por ciclo, independente do volume.',
        tradeoff:
          'Perde o retorno individual de cada linha, que não era necessário no fluxo de sync.',
      },
    ],
    en: [],
  },

  // snippet: { file: '', language: 'ts', code: '', note: { ptBR: '', en: '' } },

  retrospective: {
    ptBR: '',
    en: '',
  },
};

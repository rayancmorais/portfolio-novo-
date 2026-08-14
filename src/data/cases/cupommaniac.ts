import type { CaseContent } from './types';

/**
 * ⚠️ REVISAR ANTES DE PUBLICAR
 *
 * 1. Os itens de `alternativas` são inferências — opções que um engenheiro
 *    consideraria nesses cenários, não necessariamente o que você considerou.
 *    Confirme, corrija ou remova cada uma. Alternativa inventada vira armadilha
 *    em entrevista, porque é exatamente sobre ela que perguntam.
 *
 * 2. `snippet.code` está vazio de propósito. Cole código REAL do repositório.
 *
 * 3. `retrospective` é um rascunho. Reescreva com o que você realmente pensa hoje.
 */
export const cupommaniac: CaseContent = {
  slug: 'cupommaniac',

  decisions: {
    ptBR: [
      {
        problema:
          'A plataforma sincroniza cupons de fontes com APIs completamente diferentes entre si — Lomadee, Admitad, Awin, Amazon Associates e Mercado Livre. Cada uma tem seu próprio formato de resposta, esquema de autenticação, paginação e política de rate limit. Escrever o fluxo de sincronização acoplado a cada fornecedor significaria reescrever a lógica de upsert toda vez que um novo entrasse.',
        alternativas: [
          'Um serviço de sync independente por fornecedor — isolamento total, mas duplica a lógica de deduplicação, upsert e indexação em cinco lugares, e qualquer correção precisaria ser replicada em todos.',
          'Mapeamento por configuração, com um JSON declarando de qual campo da resposta vem cada atributo do cupom — evitaria código por fornecedor, mas quebra quando a diferença não é só de nomes: paginação por cursor vs offset, autenticação por header vs query, formatos de data distintos.',
          'Condicionais dentro de um único serviço — rápido de escrever com duas fontes, insustentável com cinco.',
        ],
        decisao:
          'Uma interface única de sync implementada por cada fornecedor. Cada adapter é responsável apenas por buscar e normalizar seus dados para um formato comum; o serviço de upsert recebe sempre a mesma estrutura e não sabe de onde ela veio. Adicionar um fornecedor é escrever um adapter novo — nenhum código existente muda.',
        tradeoff:
          'A camada de normalização esconde particularidades que às vezes importam. Quando um fornecedor expõe um dado que os outros não têm, ou ele fica de fora do modelo comum, ou o modelo comum incha para acomodar exceções. Optei por manter o modelo enxuto e perder informação de nicho.',
      },
      {
        problema:
          'O sistema de alertas notifica usuários quando surge um cupom que combina com o que pediram. A implementação direta seria: para cada cupom novo, consultar quais alertas casam, criar as notificações e marcar o alerta como disparado. Com milhares de cupons entrando a cada ciclo de sincronização, isso significa milhares de idas ao banco por ciclo — e o custo cresce linearmente com o volume, justamente quando a plataforma cresce.',
        alternativas: [
          'Manter o matching por cupom, mas com fila e concorrência limitada — distribuiria a carga no tempo em vez de eliminá-la; o banco continuaria recebendo o mesmo número de queries, só que espalhadas.',
          'Cache dos alertas em memória durante o ciclo — reduziria as leituras, mas as escritas continuariam individuais, e o cache precisaria ser invalidado a cada alerta criado durante o ciclo.',
          'Processar o matching de forma assíncrona depois do sync — simplificaria o fluxo, mas atrasaria o alerta, e o valor do produto está justamente em avisar antes da oferta expirar.',
        ],
        decisao:
          'Reescrevi o matching para operar em lote sobre o ciclo inteiro, não sobre cada cupom: uma leitura única dos alertas relevantes, uma criação em lote das notificações com skipDuplicates, e uma atualização em lote dos alertas disparados. Três chamadas ao banco por ciclo, independente de virem 100 ou 100 mil cupons.',
        tradeoff:
          'O processamento deixou de ser incremental. Um erro no meio do lote afeta o ciclo inteiro em vez de um cupom isolado, e a lógica ficou mais difícil de depurar — não dá para acompanhar o que aconteceu com um cupom específico tão facilmente quanto no fluxo linear.',
      },
      {
        problema:
          'Backend hospedado na Railway, frontend na Vercel — domínios diferentes. Mutations feitas via fetch do navegador direto para o backend não levavam o cookie de sessão: SameSite=Lax bloqueia o envio em requisições cross-site. O sintoma era enganoso, porque a navegação normal funcionava e só as mutations falhavam com erro de autenticação, sem nada explícito indicando que o cookie tinha sido descartado pelo navegador.',
        alternativas: [
          'SameSite=None com Secure — resolveria em uma linha, mas abre o cookie de sessão para envio em qualquer contexto cross-site, exatamente a proteção contra CSRF que o Lax existe para dar.',
          'Colocar backend e frontend sob subdomínios do mesmo domínio, tornando as requisições same-site — funciona, mas amarra a arquitetura à topologia de DNS e complica trocar de provedor depois.',
          'Mover o backend para as API routes do Vercel — eliminaria o cross-origin, mas o backend tem workers e jobs agendados que não se encaixam bem no modelo serverless.',
        ],
        decisao:
          'Mutations sensíveis passam por rotas proxy no próprio Next.js: a requisição sai do navegador para o mesmo domínio, mantendo o cookie; a rota valida a sessão no servidor e só então repassa a chamada ao backend. O cookie nunca precisa cruzar origem.',
        tradeoff:
          'Um salto de rede a mais em cada mutation e uma camada extra para manter — cada rota nova precisa do seu proxy correspondente. Em troca, o cookie de sessão continua com a proteção padrão contra CSRF, e frontend e backend seguem livres para viver em provedores diferentes.',
      },
    ],
    en: [],
  },

  snippet: {
    // ⚠️ COLE CÓDIGO REAL DO REPOSITÓRIO AQUI.
    // Melhor candidato: o matching em lote (Decisão 2) — as três chamadas em
    // sequência, mostrando skipDuplicates. Alternativa: a interface Adapter com
    // uma implementação curta ao lado.
    file: '',
    language: 'ts',
    code: ``,
    highlightLines: [],
    note: {
      ptBR: 'skipDuplicates é o que torna a operação idempotente: se o mesmo ciclo for reprocessado, nenhum usuário recebe alerta duplicado.',
      en: '',
    },
  },

  retrospective: {
    // ⚠️ RASCUNHO — reescreva com sua opinião real.
    ptBR: `Teria escrito os adapters com testes de contrato desde o começo. Como cada fornecedor tem seu próprio formato, uma mudança silenciosa na API de qualquer um deles só aparece quando o sync quebra em produção — um teste de contrato por adapter pegaria isso antes.

Também teria separado o matching de alertas em um worker próprio desde o início, em vez de acoplá-lo ao ciclo de sync. Hoje os dois compartilham o mesmo destino: se o sync falha, o alerta não sai.

E teria medido antes de otimizar. O N+1 nos upserts eu percebi por sintoma — o banco travando sob carga — não por instrumentação. Com métricas de tempo por etapa do ciclo, teria encontrado mais cedo e com menos adivinhação.`,
    en: '',
  },
};

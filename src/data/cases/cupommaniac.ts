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
    en: [
      {
        problema:
          'The platform syncs coupons from sources whose APIs have nothing in common — Lomadee, Admitad, Awin, Amazon Associates and Mercado Livre. Each one has its own response format, authentication scheme, pagination and rate-limit policy. Writing the sync flow coupled to each provider would mean rewriting the upsert logic every time a new one came in.',
        alternativas: [
          'One independent sync service per provider — full isolation, but it duplicates deduplication, upsert and indexing logic across five places, and every fix would have to be replicated in all of them.',
          'Configuration-driven mapping, with a JSON declaring which response field feeds each coupon attribute — avoids per-provider code, but breaks down when the difference is not just naming: cursor vs offset pagination, header vs query authentication, different date formats.',
          'Conditionals inside a single service — quick to write with two sources, unsustainable with five.',
        ],
        decisao:
          'A single sync interface implemented by each provider. Every adapter is responsible only for fetching and normalizing its own data into a common shape; the upsert service always receives the same structure and never knows where it came from. Adding a provider means writing a new adapter — no existing code changes.',
        tradeoff:
          'The normalization layer hides provider quirks that sometimes matter. When one provider exposes data the others do not, either it stays out of the common model or the model bloats to accommodate exceptions. I chose to keep the model lean and lose niche information.',
      },
      {
        problema:
          'The alert system notifies users when a coupon matching their request shows up. The straightforward implementation would be: for each new coupon, query which alerts match, create the notifications and mark the alert as triggered. With thousands of coupons arriving every sync cycle, that means thousands of database roundtrips per cycle — and the cost grows linearly with volume, precisely as the platform grows.',
        alternativas: [
          'Keep per-coupon matching but move it to a queue with limited concurrency — spreads the load over time instead of removing it; the database still takes the same number of queries.',
          'Cache the alerts in memory during the cycle — fewer reads, but writes stay individual, and the cache would need invalidating on every alert created mid-cycle.',
          'Run matching asynchronously after the sync — simpler flow, but it delays the alert, and the product exists precisely to warn before the deal expires.',
        ],
        decisao:
          'I rewrote matching to operate in batches over the whole cycle rather than per coupon: one read of the relevant alerts, one batched creation of notifications with skipDuplicates, and one batched update of the triggered alerts. Three database calls per cycle, whether 100 or 100,000 coupons come in.',
        tradeoff:
          'Processing stopped being incremental. An error mid-batch affects the whole cycle instead of a single coupon, and the logic got harder to debug — tracing what happened to one specific coupon is no longer as easy as following a linear flow.',
      },
      {
        problema:
          'Backend on Railway, frontend on Vercel — different domains. Mutations sent by fetch straight from the browser to the backend carried no session cookie: SameSite=Lax blocks it on cross-site requests. The symptom was misleading, because normal navigation worked and only mutations failed with an auth error, with nothing explicitly saying the browser had dropped the cookie.',
        alternativas: [
          'SameSite=None with Secure — a one-line fix, but it opens the session cookie to any cross-site context, which is exactly the CSRF protection Lax exists to give.',
          'Put backend and frontend on subdomains of the same domain, making requests same-site — it works, but ties the architecture to DNS topology and complicates changing providers later.',
          'Move the backend into Vercel API routes — removes the cross-origin problem, but the backend has workers and scheduled jobs that do not fit the serverless model well.',
        ],
        decisao:
          'Sensitive mutations go through proxy routes in Next.js itself: the request leaves the browser for the same domain, keeping the cookie; the route validates the session server-side and only then forwards the call to the backend. The cookie never has to cross origins.',
        tradeoff:
          'One extra network hop per mutation and one more layer to maintain — every new route needs its matching proxy. In exchange, the session cookie keeps its default CSRF protection and frontend and backend stay free to live on different providers.',
      },
    ],
  },

  // Extraído de backend/src/application/services/AlertMatcherService.ts
  snippet: {
    file: 'backend/src/application/services/AlertMatcherService.ts',
    language: 'ts',
    code: `// ── Batch operations (replaces per-alert loop of 3 sequential queries) ──────

// 1. Single query to find already-notified alerts
const alreadyNotified = new Set(
  (
    (await db.alertNotification.findMany({
      where: { alertId: { in: matched.map((a: any) => a.id) }, cupomId: cupom.id },
      select: { alertId: true },
    })) as { alertId: string }[]
  ).map((n) => n.alertId),
);

const toNotify = (matched as any[]).filter((a) => !alreadyNotified.has(a.id));

if (toNotify.length > 0) {
  const now = new Date();

  // 2. Batch create notifications (skipDuplicates = safety net)
  await db.alertNotification.createMany({
    data: toNotify.map((a: any) => ({ alertId: a.id, cupomId: cupom.id })),
    skipDuplicates: true,
  });

  // 3. Batch update alerts (lastTriggeredAt + triggerCount)
  await db.alert.updateMany({
    where: { id: { in: toNotify.map((a: any) => a.id) } },
    data: { lastTriggeredAt: now, triggerCount: { increment: 1 } },
  });
}`,
    // As três — e únicas — idas ao banco no ciclo inteiro.
    highlightLines: [6, 19, 25],
    note: {
      ptBR: 'As três linhas destacadas são as únicas idas ao banco em todo o ciclo, e nenhuma delas está dentro de um laço — é isso que mantém o custo constante mesmo quando entram milhares de cupons. O skipDuplicates torna a operação idempotente: se o ciclo for reprocessado, ninguém recebe alerta repetido.',
      en: 'The three highlighted lines are the only database roundtrips in the whole cycle, and none of them sits inside a loop — that is what keeps the cost constant whether 100 or 100,000 coupons come in. skipDuplicates makes the operation idempotent: reprocessing a cycle never sends anyone a duplicate alert.',
    },
  },

  retrospective: {
    // ⚠️ RASCUNHO — reescreva com sua opinião real.
    ptBR: `Teria escrito os adapters com testes de contrato desde o começo. Como cada fornecedor tem seu próprio formato, uma mudança silenciosa na API de qualquer um deles só aparece quando o sync quebra em produção — um teste de contrato por adapter pegaria isso antes.

Também teria separado o matching de alertas em um worker próprio desde o início, em vez de acoplá-lo ao ciclo de sync. Hoje os dois compartilham o mesmo destino: se o sync falha, o alerta não sai.

E teria medido antes de otimizar. O N+1 nos upserts eu percebi por sintoma — o banco travando sob carga — não por instrumentação. Com métricas de tempo por etapa do ciclo, teria encontrado mais cedo e com menos adivinhação.`,
    en: `I would have written contract tests for the adapters from the start. Since every provider has its own format, a silent change in any of their APIs only surfaces when the sync breaks in production — one contract test per adapter would catch it earlier.

I would also have split alert matching into its own worker from day one instead of coupling it to the sync cycle. Today the two share a fate: if the sync fails, the alert never goes out.

And I would have measured before optimizing. I noticed the N+1 in the upserts by symptom — the database locking up under load — not through instrumentation. With per-stage timing metrics I would have found it sooner and with less guesswork.`,
  },
};

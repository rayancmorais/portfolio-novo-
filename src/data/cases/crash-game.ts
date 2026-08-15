import type { CaseContent } from './types';

/**
 * ⚠️ REVISAR ANTES DE PUBLICAR
 *
 * 1. Os itens de `alternativas` são inferências — opções que um engenheiro
 *    consideraria nesses cenários, não necessariamente o que você considerou.
 *    Confirme, corrija ou remova cada uma.
 *
 * 2. `snippet.code` está vazio de propósito. Cole código REAL do repositório.
 *
 * 3. `retrospective` é um rascunho. Reescreva com o que você realmente pensa hoje.
 */
export const crashGame: CaseContent = {
  slug: 'crash-game',

  decisions: {
    ptBR: [
      {
        problema:
          'Dois serviços precisam concordar sobre saldo em tempo real: o Game Service processa apostas e cashouts a cada rodada, e o Wallet Service guarda o dinheiro. Se o Game Service chamasse a Wallet por HTTP síncrono, qualquer timeout ou falha parcial deixaria os dois com versões diferentes da verdade — uma aposta debitada e não registrada, ou registrada e não debitada. Em um jogo com dinheiro real, isso é prejuízo direto.',
        alternativas: [
          'HTTP síncrono com retry e idempotency key — mais simples de implementar e depurar, mas mantém os serviços acoplados no tempo: se a Wallet estiver lenta, o jogo trava junto.',
          'Saldo replicado no Game Service, sincronizado periodicamente — leitura rápida, mas cria duas fontes de verdade para o dado mais sensível do sistema.',
        ],
        decisao:
          'Comunicação exclusivamente por RabbitMQ, sem HTTP direto entre os serviços. A Wallet é a única fonte de verdade para saldo, e o Game Service publica intenções em vez de consultar estado. Falhas parciais viram mensagens na fila em vez de inconsistência entre bancos.',
        tradeoff:
          'Consistência eventual em vez de imediata. A interface precisa lidar com o intervalo entre a ação do jogador e a confirmação do saldo, e depurar um fluxo assíncrono é mais trabalhoso que seguir uma chamada HTTP no log. Aceitei em troca de nunca ter duas versões do saldo.',
      },
      {
        problema:
          'As regras do jogo — quando uma aposta é válida, como o multiplicador evolui, o que acontece no cashout, quais limites se aplicam — são a parte do sistema que mais precisa de teste e a que menos deveria depender de infraestrutura. Escritas dentro de services do NestJS com Prisma injetado, cada teste exigiria subir contexto de framework e mockar banco, tornando a suíte lenta e frágil.',
        alternativas: [
          'Services do NestJS com repositórios mockados — padrão comum no framework, mas cada teste carrega o container de injeção de dependência e quebra quando a estrutura de módulos muda.',
          'Testes de integração contra um banco real em container — cobertura mais fiel, porém lentos demais para rodar a cada alteração, o que na prática significa rodar menos.',
        ],
        decisao:
          'Arquitetura em quatro camadas com a camada de domínio em TypeScript puro: zero NestJS, zero Prisma, zero import de framework. As regras de negócio são funções e classes que recebem dados e devolvem decisões. A infraestrutura implementa interfaces definidas pelo domínio, nunca o contrário.',
        tradeoff:
          'Mais código de tradução entre camadas — mapear entidade de domínio para modelo do Prisma e vice-versa é trabalho que um service acoplado não teria. Em projetos pequenos essa cerimônia não se paga; aqui, com regra de negócio densa, sim.',
      },
      {
        problema:
          'Valores monetários em ponto flutuante acumulam erro. Uma aposta de R$ 0,10 multiplicada por 1,07 não resulta exatamente em R$ 0,107, e ao longo de milhares de rodadas a diferença aparece no saldo. Em um sistema financeiro, centavo que some é bug de confiança, não de arredondamento.',
        alternativas: [
          'Number com arredondamento a cada operação — funciona até não funcionar; o erro reaparece assim que uma operação escapa do arredondamento.',
          'Biblioteca de decimal (decimal.js, big.js) — resolve a precisão, mas adiciona dependência e exige disciplina para nunca deixar um valor escapar como number puro.',
        ],
        decisao:
          'Valores monetários como BigInt em centavos, do banco à aplicação: BIGINT no PostgreSQL, BigInt no TypeScript. R$ 1,50 é 150n. Não existe fração, então não existe erro de ponto flutuante. Os DTOs serializam como string, contornando a limitação do JSON.stringify com BigInt.',
        tradeoff:
          'BigInt não se mistura com number: toda conversão para exibição precisa ser explícita, e um esquecimento gera erro de tipo em runtime. A serialização como string também exige que o cliente saiba converter de volta. É atrito constante em troca de exatidão garantida.',
      },
      {
        problema:
          'Um jogo de crash só funciona se o jogador acreditar que o resultado não foi manipulado a favor da casa. Prometer que o sorteio é justo não basta — não há como o jogador verificar, e a suspeita é suficiente para inviabilizar o produto.',
        alternativas: [
          'Confiar no servidor e publicar o histórico de resultados — permite análise estatística ao longo do tempo, mas não prova nada sobre uma rodada específica.',
        ],
        decisao:
          'Provably fair com HMAC-SHA256: o hash do seed do servidor é publicado antes das apostas e o seed é revelado após o crash. Com os dois em mãos, o jogador recalcula o ponto de crash por conta própria e confirma que o valor foi definido antes de qualquer aposta entrar.',
        tradeoff:
          'O mecanismo só tem valor se for compreendido — exige explicar o processo na interface, e a maioria dos jogadores nunca vai verificar. O custo é de comunicação, não de computação; a verificabilidade existe mesmo para quem não usa.',
      },
    ],
    en: [
      {
        problema:
          'Two services have to agree on balance in real time: the Game Service processes bets and cashouts every round, and the Wallet Service holds the money. If the Game Service called the Wallet over synchronous HTTP, any timeout or partial failure would leave the two with different versions of the truth — a bet debited but not recorded, or recorded but not debited. In a real-money game, that is a direct loss.',
        alternativas: [
          'Synchronous HTTP with retries and an idempotency key — simpler to implement and debug, but it keeps the services coupled in time: if the Wallet is slow, the game stalls with it.',
          'Balance replicated into the Game Service and synced periodically — fast reads, but it creates two sources of truth for the most sensitive data in the system.',
        ],
        decisao:
          'Communication exclusively over RabbitMQ, with no direct HTTP between services. The Wallet is the single source of truth for balance, and the Game Service publishes intents rather than querying state. Partial failures become pending messages instead of inconsistency across databases.',
        tradeoff:
          'Eventual instead of immediate consistency. The interface has to handle the gap between the player action and the balance confirmation, and debugging an async flow takes more work than following an HTTP call in the log. I accepted it in exchange for never having two versions of the balance.',
      },
      {
        problema:
          'The game rules — when a bet is valid, how the multiplier evolves, what happens on cashout, which limits apply — are the part of the system that most needs testing and least should depend on infrastructure. Written inside NestJS services with Prisma injected, every test would need to boot framework context and mock the database, making the suite slow and brittle.',
        alternativas: [
          'NestJS services with mocked repositories — the common pattern in the framework, but every test loads the dependency injection container and breaks when the module structure changes.',
          'Integration tests against a real database in a container — more faithful coverage, but too slow to run on every change, which in practice means running them less.',
        ],
        decisao:
          'A four-layer architecture with the domain layer in plain TypeScript: zero NestJS, zero Prisma, zero framework imports. Business rules are functions and classes that take data and return decisions. Infrastructure implements interfaces defined by the domain, never the other way around.',
        tradeoff:
          'More translation code between layers — mapping a domain entity to a Prisma model and back is work a coupled service would not have. In small projects that ceremony does not pay for itself; here, with dense business rules, it does.',
      },
      {
        problema:
          'Monetary values in floating point accumulate error. A R$ 0.10 bet multiplied by 1.07 does not land exactly on R$ 0.107, and across thousands of rounds the difference shows up in the balance. In a financial system, a missing cent is a trust bug, not a rounding one.',
        alternativas: [
          'Number with rounding on every operation — works until it does not; the error comes back the moment one operation escapes the rounding.',
          'A decimal library (decimal.js, big.js) — solves precision, but adds a dependency and demands discipline so no value ever escapes as a plain number.',
        ],
        decisao:
          'Monetary values as BigInt in cents, from the database to the application: BIGINT in PostgreSQL, BigInt in TypeScript. R$ 1.50 is 150n. There is no fraction, so there is no floating-point error. DTOs serialize as strings, working around JSON.stringify not supporting BigInt.',
        tradeoff:
          'BigInt does not mix with number: every conversion for display has to be explicit, and forgetting one throws a type error at runtime. Serializing as a string also requires the client to know how to convert back. It is constant friction in exchange for guaranteed exactness.',
      },
      {
        problema:
          "A crash game only works if the player believes the outcome was not rigged in the house's favour. Promising the draw is fair is not enough — the player has no way to check, and suspicion alone is enough to kill the product.",
        alternativas: [
          'Trust the server and publish the result history — allows statistical analysis over time, but proves nothing about any specific round.',
        ],
        decisao:
          'Provably fair with HMAC-SHA256: the hash of the server seed is published before bets open and the seed is revealed after the crash. With both in hand, the player recomputes the crash point independently and confirms the value was set before any bet came in.',
        tradeoff:
          'The mechanism is only worth something if it is understood — it requires explaining the process in the interface, and most players will never verify it. The cost is communication, not computation; the verifiability is there even for those who never use it.',
      },
    ],
  },

  // Extraído de services/wallets/src/domain/wallet.entity.ts
  snippet: {
    file: 'services/wallets/src/domain/wallet.entity.ts',
    language: 'ts',
    code: `import type { Resultado } from './result.type';

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly jogadorId: string,
    public readonly nomeUsuario: string,
    private _saldo: bigint,
    public readonly criadoEm: Date,
  ) {}

  // … criar() e reconstituir() omitidos

  get saldo(): bigint {
    return this._saldo;
  }

  debitar(valorCentavos: bigint): Resultado<void> {
    if (valorCentavos <= 0n) {
      return { ok: false, erro: 'O valor deve ser positivo' };
    }
    if (this._saldo < valorCentavos) {
      return { ok: false, erro: 'Saldo insuficiente' };
    }
    this._saldo -= valorCentavos;
    return { ok: true, valor: undefined };
  }

  creditar(valorCentavos: bigint): void {
    if (valorCentavos <= 0n) {
      throw new Error('O valor do crédito deve ser positivo');
    }
    this._saldo += valorCentavos;
  }
}`,
    // 1: o único import · 8: saldo como bigint · 18: debitar devolvendo Resultado
    highlightLines: [1, 8, 18],
    note: {
      ptBR: 'A primeira linha é a evidência da decisão 2: o único import do arquivo é um tipo local. Nenhum NestJS, nenhum Prisma — essa classe é testável sem subir nada. O saldo é bigint em centavos, então não existe fração para arredondar, e debitar devolve um Resultado em vez de lançar exceção: saldo insuficiente é resposta esperada do domínio, não erro de infraestrutura.',
      en: 'The first line is the evidence for decision 2: the only import in the file is a local type. No NestJS, no Prisma — this class is testable without booting anything. The balance is a bigint in cents, so there is no fraction to round, and debitar returns a Resultado instead of throwing: insufficient funds is an expected domain answer, not an infrastructure error.',
    },
  },

  retrospective: {
    // ⚠️ RASCUNHO — reescreva com sua opinião real.
    ptBR: `A comunicação assíncrona resolveu a consistência, mas deixou o rastreamento mais difícil do que precisava. Hoje eu teria adicionado um correlation id percorrendo aposta, mensagem e liquidação desde o primeiro dia — sem isso, reconstruir o caminho de uma rodada específica entre dois serviços é trabalho manual.

Também teria escrito os testes E2E antes dos unitários. Os 91 testes de domínio me deram confiança na regra de negócio, mas os primeiros bugs reais apareceram na fronteira entre os serviços — exatamente onde a cobertura chegou por último.

E o Kong em modo DB-less foi uma escolha que me custou tempo: descobri as limitações com upgrade de HTTP para WebSocket já com a integração em andamento, e acabei conectando o WebSocket direto no Game Service. Teria validado essa restrição antes de colocar o gateway no caminho.`,
    en: `Async communication solved consistency but made tracing harder than it needed to be. Today I would have added a correlation id running through bet, message and settlement from day one — without it, reconstructing the path of one specific round across two services is manual work.

I would also have written the E2E tests before the unit ones. The 91 domain tests gave me confidence in the business rules, but the first real bugs showed up at the boundary between services — exactly where coverage arrived last.

And running Kong in DB-less mode cost me time: I found its limitations around HTTP-to-WebSocket upgrades with the integration already underway, and ended up wiring the WebSocket straight into the Game Service. I would have validated that constraint before putting the gateway in the path.`,
  },
};

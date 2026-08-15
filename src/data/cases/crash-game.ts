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
    en: [],
  },

  snippet: {
    // ⚠️ COLE CÓDIGO REAL DO REPOSITÓRIO AQUI.
    // Melhores candidatos, em ordem:
    // 1. A entidade de domínio pura (mostra a ausência total de imports de framework)
    // 2. O cálculo do ponto de crash com HMAC (o mais interessante conceitualmente)
    // 3. Uma operação de saldo com BigInt em centavos
    file: '',
    language: 'ts',
    code: ``,
    highlightLines: [],
    note: {
      ptBR: '',
      en: '',
    },
  },

  retrospective: {
    // ⚠️ RASCUNHO — reescreva com sua opinião real.
    ptBR: `A comunicação assíncrona resolveu a consistência, mas deixou o rastreamento mais difícil do que precisava. Hoje eu teria adicionado um correlation id percorrendo aposta, mensagem e liquidação desde o primeiro dia — sem isso, reconstruir o caminho de uma rodada específica entre dois serviços é trabalho manual.

Também teria escrito os testes E2E antes dos unitários. Os 91 testes de domínio me deram confiança na regra de negócio, mas os primeiros bugs reais apareceram na fronteira entre os serviços — exatamente onde a cobertura chegou por último.

E o Kong em modo DB-less foi uma escolha que me custou tempo: descobri as limitações com upgrade de HTTP para WebSocket já com a integração em andamento, e acabei conectando o WebSocket direto no Game Service. Teria validado essa restrição antes de colocar o gateway no caminho.`,
    en: '',
  },
};

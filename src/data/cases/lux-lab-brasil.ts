import type { CaseContent } from './types';

/**
 * ⚠️ REVISAR ANTES DE PUBLICAR
 *
 * Neste arquivo fui deliberadamente conservador: no máximo DUAS alternativas por
 * decisão, e apenas as que qualquer engenheiro encara de frente nesses cenários.
 * Se você considerou outras na época, ADICIONE — é melhor você acrescentar do
 * que ter de cortar descarte que nunca passou pela sua cabeça.
 *
 * `snippet.code` está vazio de propósito. Cole código REAL do repositório.
 * `retrospective` é rascunho — reescreva com o que você pensa hoje.
 */
export const luxLabBrasil: CaseContent = {
  slug: 'lux-lab-brasil',

  decisions: {
    ptBR: [
      {
        problema:
          'A plataforma vende para Brasil e União Europeia com fornecedores diferentes em cada mercado — BigBuy, Griffati e Printful na Europa, fornecedores nacionais no Brasil. Cada um tem sua própria API de criação de pedido, seu formato de webhook e sua cobertura geográfica. Se o fluxo de pedidos precisasse saber qual fornecedor usar, cada novo mercado ou parceiro significaria mexer no código que processa venda — a parte mais sensível do sistema.',
        alternativas: [
          'Condicionais por país dentro do fluxo de pedidos — funciona com dois fornecedores e vira ingerenciável com cinco, além de concentrar risco justamente no caminho que move dinheiro.',
          'Um serviço separado por fornecedor — isola bem, mas duplica o fluxo de pedido inteiro e obriga a manter consistência entre implementações que deveriam ser idênticas.',
        ],
        decisao:
          'Uma interface Supplier única, implementada por cada fornecedor, com um método que devolve a lista ordenada de fornecedores preferenciais por país de entrega. O fluxo de pedidos pergunta "quem atende este destino?" e trabalha sempre com a mesma abstração. Adicionar fornecedor ou mercado é implementar a interface e registrar a preferência — o fluxo de pedidos não muda.',
        tradeoff:
          'A interface precisa ser o mínimo denominador comum entre fornecedores bem diferentes. Recursos que só um deles oferece ficam fora da abstração ou exigem escape hatch, que corrói o padrão com o tempo.',
      },
      {
        problema:
          'O mesmo produto precisa ser precificado de formas distintas conforme o destino: moeda diferente, margem diferente e imposto diferente — IVA e VAT variam por país da União Europeia, e o Brasil tem sua própria carga. Misturar essas três coisas em um único cálculo torna impossível testar qualquer uma isoladamente e transforma qualquer mudança tributária em risco de quebrar o preço inteiro.',
        alternativas: [
          'Uma função única de precificação recebendo país e retornando o preço final — mais direta de escrever, mas impossível de testar por partes; um erro na alíquota e o teste inteiro falha sem indicar onde.',
          'Preços fixos cadastrados por região — elimina cálculo, mas exige recadastrar tudo a cada mudança de câmbio, margem ou alíquota.',
        ],
        decisao:
          'Pipeline de três etapas isoladas e independentemente testáveis: normalização do preço do fornecedor para a moeda local, cálculo da margem bruta e aplicação da alíquota por país de destino. Cada etapa recebe e devolve dados explícitos, então a alíquota da Espanha pode ser testada sem envolver câmbio ou margem.',
        tradeoff:
          'Mais estrutura para um cálculo que caberia em poucas linhas — em um mercado só, seria over-engineering evidente. A separação só se paga porque são dois mercados com regras tributárias que mudam de forma independente.',
      },
      {
        problema:
          'O assistente de compras com IA precisa responder em streaming para parecer natural, mas o backend roda em AWS Lambda atrás do API Gateway, que encerra conexões em 29 segundos. Uma resposta longa do modelo simplesmente morre no meio, e o usuário vê a mensagem parar sem explicação.',
        alternativas: [
          'Migrar para a WebSocket API do API Gateway, que não tem esse limite — resolve de vez, mas exige gerenciar estado de conexão e reescrever o handler, trabalho desproporcional para validar a feature.',
          'Abandonar o streaming e devolver a resposta completa de uma vez — elimina o problema, mas a espera silenciosa de vários segundos é pior experiência que o texto aparecendo aos poucos.',
        ],
        decisao:
          'Manter o streaming via SSE com um limite explícito de 28 segundos por sessão de chat, imposto no próprio handler. A sessão encerra de forma controlada antes do corte do API Gateway, com a limitação documentada no código e a migração para WebSocket registrada como próximo passo.',
        tradeoff:
          'É uma restrição assumida, não resolvida: conversas longas são interrompidas por design. Aceitei porque o teto tornava a falha previsível e explicável ao usuário, em vez de uma conexão morrendo sem aviso.',
      },
      {
        problema:
          'Credenciais foram expostas acidentalmente em um arquivo .env commitado. O problema imediato era a rotação das chaves, mas o problema real era que nada no processo impedia que acontecesse de novo — a proteção dependia inteiramente de alguém lembrar de conferir antes de cada commit.',
        alternativas: [
          'Confiar no .gitignore e na revisão de código — foi exatamente o que falhou; depende de atenção humana em tarefa repetitiva.',
          'Variáveis apenas no painel do provedor de hospedagem — resolve produção, mas não impede que um segredo entre no repositório durante o desenvolvimento.',
        ],
        decisao:
          'Gitleaks no CI bloqueando qualquer commit que contenha segredo, rotação imediata das credenciais expostas e migração das variáveis sensíveis para o AWS Secrets Manager. A verificação deixou de depender de disciplina e passou a ser condição para o merge.',
        tradeoff:
          'Falsos positivos ocasionais travam o pipeline — strings que parecem chave sem ser exigem allowlist e atenção. Preferi o atrito de um build bloqueado indevidamente ao risco de um segredo vazar de novo.',
      },
    ],
    en: [
      {
        problema:
          'The platform sells to Brazil and the European Union with different suppliers in each market — BigBuy, Griffati and Printful in Europe, domestic suppliers in Brazil. Each has its own order-creation API, webhook format and geographic coverage. If the order flow had to know which supplier to use, every new market or partner would mean touching the code that processes sales — the most sensitive part of the system.',
        alternativas: [
          'Per-country conditionals inside the order flow — fine with two suppliers, unmanageable with five, and it concentrates risk exactly on the path that moves money.',
          'A separate service per supplier — good isolation, but it duplicates the entire order flow and forces you to keep implementations consistent when they should be identical.',
        ],
        decisao:
          'A single Supplier interface implemented by each provider, with a method returning the ordered list of preferred suppliers per delivery country. The order flow asks "who serves this destination?" and always works against the same abstraction. Adding a supplier or a market means implementing the interface and registering the preference — the order flow does not change.',
        tradeoff:
          'The interface has to be the lowest common denominator across quite different suppliers. Features only one of them offers either stay outside the abstraction or need an escape hatch, which erodes the pattern over time.',
      },
      {
        problema:
          'The same product has to be priced differently depending on the destination: different currency, different margin and different tax — IVA and VAT vary across EU countries, and Brazil has its own burden. Mixing those three things into a single calculation makes it impossible to test any of them in isolation and turns every tax change into a risk of breaking the whole price.',
        alternativas: [
          'A single pricing function taking a country and returning the final price — more direct to write, but impossible to test in parts; one wrong rate and the whole test fails without saying where.',
          'Fixed prices registered per region — removes the calculation, but requires re-registering everything on every change in exchange rate, margin or tax rate.',
        ],
        decisao:
          "A three-stage pipeline, isolated and independently testable: normalizing the supplier price into the local currency, computing the gross margin, and applying the destination country's tax rate. Each stage takes and returns explicit data, so the Spanish rate can be tested without involving exchange rates or margin.",
        tradeoff:
          'More structure for a calculation that would fit in a few lines — in a single market it would be obvious over-engineering. The separation only pays off because there are two markets whose tax rules change independently.',
      },
      {
        problema:
          'The AI shopping assistant needs to answer in streaming to feel natural, but the backend runs on AWS Lambda behind the API Gateway, which closes connections at 29 seconds. A long model response simply dies mid-sentence, and the user watches the message stop with no explanation.',
        alternativas: [
          'Move to the API Gateway WebSocket API, which has no such limit — solves it for good, but requires managing connection state and rewriting the handler, disproportionate work just to validate the feature.',
          'Drop streaming and return the full response at once — removes the problem, but several seconds of silent waiting is a worse experience than text appearing progressively.',
        ],
        decisao:
          'Keep streaming over SSE with an explicit 28-second cap per chat session, enforced in the handler itself. The session closes in a controlled way before the API Gateway cuts it off, with the limitation documented in code and the WebSocket migration recorded as the next step.',
        tradeoff:
          'It is an accepted constraint, not a solved problem: long conversations are cut off by design. I accepted it because the cap made the failure predictable and explainable to the user, instead of a connection dying without warning.',
      },
      {
        problema:
          'Credentials were accidentally exposed in a committed .env file. The immediate problem was rotating the keys, but the real problem was that nothing in the process prevented it from happening again — the protection depended entirely on someone remembering to check before each commit.',
        alternativas: [
          'Rely on .gitignore and code review — that is exactly what failed; it depends on human attention in a repetitive task.',
          'Keep variables only in the hosting provider dashboard — solves production, but does not stop a secret from entering the repository during development.',
        ],
        decisao:
          'Gitleaks in CI blocking any commit containing a secret, immediate rotation of the exposed credentials, and moving sensitive variables to AWS Secrets Manager. The check stopped depending on discipline and became a condition for merging.',
        tradeoff:
          'Occasional false positives block the pipeline — strings that look like keys without being one need an allowlist and attention. I preferred the friction of a wrongly blocked build to the risk of another secret leaking.',
      },
    ],
  },

  snippet: {
    // ⚠️ COLE CÓDIGO REAL DO REPOSITÓRIO AQUI.
    // Melhores candidatos, em ordem:
    // 1. A interface Supplier + PreferredForCountry (prova visualmente a decisão 1
    //    e é código Go, o que diferencia dos outros dois cases, ambos TypeScript)
    // 2. As três etapas do pipeline de precificação encadeadas
    // 3. O handler de chat com o timeout explícito de 28s
    file: '',
    language: 'go',
    code: ``,
    highlightLines: [],
    note: {
      ptBR: '',
      en: '',
    },
  },

  retrospective: {
    // ⚠️ RASCUNHO — reescreva com sua opinião real.
    // O parágrafo do .env é o mais forte: é vivido, admite custo e a correção
    // é verificável no CI. Mantenha algo nessa linha.
    ptBR: `O gitleaks entrou depois do incidente, e devia ter entrado antes da primeira linha de código. Hoje é a primeira coisa que configuro em projeto novo — não porque eu confie menos em mim, mas porque proteção que depende de lembrar não é proteção.

O limite de 28 segundos no chat resolveu o sintoma e adiou o problema. Documentei a migração para WebSocket como próximo passo e ela nunca aconteceu — o custo de deixar assim ficou invisível justamente porque a falha virou previsível. Hoje eu teria tratado a restrição do Lambda como critério de escolha da plataforma, não como algo a contornar depois.

E teria começado por um mercado só. Construir para Brasil e Europa ao mesmo tempo multiplicou as decisões — moeda, imposto, fornecedor, gateway — antes de eu ter validado qualquer uma delas em produção. A abstração de fornecedores se provou útil, mas o pipeline de precificação nasceu genérico para um cenário que ainda não existia.`,
    en: `Gitleaks came in after the incident, and it should have been there before the first line of code. Today it is the first thing I set up on a new project — not because I trust myself less, but because protection that depends on remembering is not protection.

The 28-second cap on the chat solved the symptom and postponed the problem. I documented the WebSocket migration as the next step and it never happened — the cost of leaving it became invisible precisely because the failure turned predictable. Today I would have treated the Lambda constraint as a platform-choice criterion, not as something to work around later.

And I would have started with one market. Building for Brazil and Europe at the same time multiplied the decisions — currency, tax, supplier, gateway — before I had validated any of them in production. The supplier abstraction proved useful, but the pricing pipeline was born generic for a scenario that did not exist yet.`,
  },
};

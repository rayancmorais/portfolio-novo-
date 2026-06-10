import { useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";

/* ============================================================================
   CaseStudies — Estudos de Caso (production port of the js/CaseStudies.jsx
   mockup). Layout: alternating two-column rows, each with a browser-chrome
   screenshot frame (vertical parallax) + big case number + PROBLEMA/ABORDAGEM/
   RESULTADO blocks + metrics strip + stack chips.

   Stack: React + styled-components + framer-motion (no new dependencies).
   Tokens via CSS custom properties (--cy, --fg-1, …) with hex fallbacks.

   Screenshots: drop the real images at CASES[].image
   (e.g. public/assets/cases/cupommaniac.png). A missing file degrades to a
   branded placeholder behind the <img>, so nothing breaks.
   ========================================================================== */

/* ---------------------------------------------------------------- data ---- */

interface CaseStudy {
  no: string;
  title: string;
  kind: string;
  year: string;
  domain: string;          // browser-chrome filename
  image?: string;
  problem: string;
  approach: string;
  result: string;
  stack: string[];
  link?: string;
  metrics: [string, string][];
}

const CASES: CaseStudy[] = [
  {
    no: "01",
    title: "CupomManiac",
    kind: "Plataforma de cupons",
    year: "2025",
    domain: "cupommaniac.com.br",
    image: "/assets/cases/cupommaniac.png",
    problem:
      "O mercado brasileiro de cupons é cheio de sites lentos e desatualizados — faltava uma plataforma rápida, com lojas reais e uma comunidade ativa em torno das ofertas.",
    approach:
      "Construí em Next.js 15 com PostgreSQL + Prisma, login via Google OAuth, sistema de comentários por cupom e um seed de produção para popular lojas e ofertas desde o primeiro deploy.",
    result:
      "Uma plataforma no ar, com lojas cadastradas, cupons comentáveis e autenticação social — pronta para escalar a base de usuários.",
    stack: ["Next.js 15", "PostgreSQL", "Prisma", "Google OAuth", "Vercel"],
    link: "https://cupommaniac.com.br",
    metrics: [
      ["OAuth", "login social"],
      ["100%", "SSR + seed"],
      ["∞", "lojas cadastradas"],
    ],
  },
  {
    no: "02",
    title: "Crash Game",
    kind: "Jungle Gaming Challenge",
    year: "2025",
    domain: "jungle-gaming.app",
    image: "/assets/cases/crash-game.png",
    problem:
      "Um jogo crash em tempo real só ganha a confiança do jogador se cada rodada puder ser verificada — não basta prometer que o resultado é justo.",
    approach:
      "Implementei um algoritmo provably fair com hash criptográfico por rodada e sincronizei todos os clientes via WebSocket, mantendo o multiplicador idêntico em tempo real para todo mundo.",
    result:
      "Cada resultado é reproduzível e auditável pelo próprio jogador, com a curva do multiplicador transmitida ao vivo, sem divergência entre as sessões.",
    stack: ["Node.js", "WebSocket", "Provably Fair", "React"],
    link: "https://github.com/rayancmorais/fullstack-challengeRayancm",
    metrics: [
      ["100%", "verificável"],
      ["RT", "via WebSocket"],
      ["1", "fonte de verdade"],
    ],
  },
  {
    no: "03",
    title: "BR Dropshipping",
    kind: "Lux Lab Brasil · e-commerce",
    year: "2024",
    domain: "luxlabbrasil.com.br",
    image: "/assets/cases/brdropshipping.png",
    problem:
      "Lojas de dropshipping no Brasil esbarram no checkout: gateways internacionais quebram a conversão e a gestão de catálogo com fornecedores locais costuma ser manual.",
    approach:
      "Montei a loja em Next.js com checkout nacional via Stripe e integração direta com fornecedores BR, automatizando a sincronização de catálogo e o fluxo de pedidos.",
    result:
      "Um e-commerce com pagamento nacional ponta a ponta e catálogo gerido de forma integrada — menos trabalho manual e checkout pensado para o cliente brasileiro.",
    stack: ["Next.js", "Stripe", "Fornecedores BR"],
    metrics: [
      ["BR", "checkout nacional"],
      ["Auto", "sync de catálogo"],
      ["E2E", "fluxo de pedidos"],
    ],
  },
];

/* ------------------------------------------------------------- motion ---- */

const rowVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 360, damping: 30 },
  },
};

/* gentle vertical parallax on the screenshot (matches the mockup) */
function useParallax(strength = 28) {
  const ref = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${(-progress * strength).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength, reduce]);
  return ref;
}

/* -------------------------------------------------------------- styled ---- */

const Section = styled.section`
  position: relative;
  padding: clamp(4rem, 9vw, 7rem) clamp(1.2rem, 4vw, 2.6rem) clamp(5rem, 10vw, 8rem);
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 3.6rem;
`;

const Eyebrow = styled.span`
  display: block;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--cy, #00f5d4);
`;

const Title = styled.h2`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1, #e6e8ee);
  margin: 0.7rem 0 0.6rem;

  em { font-style: italic; color: var(--cy, #00f5d4); }
`;

const Subtitle = styled.p`
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 1rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.6;
  max-width: 580px;
  margin: 0 auto;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(3.5rem, 8vw, 6rem);
`;

const Row = styled(motion.div)<{ $flip: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: start;
  direction: ${({ $flip }) => ($flip ? "rtl" : "ltr")};

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    direction: ltr;
  }
`;

const Col = styled(motion.div)`
  direction: ltr;
`;

/* bracket-corner frame */
const bracket = css`
  &::before,
  &::after,
  & > .brk-tr,
  & > .brk-bl {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--cy, #00f5d4);
    opacity: 0;
    pointer-events: none;
    z-index: 6;
    transition: opacity 0.3s ease, top 0.3s ease, left 0.3s ease,
      right 0.3s ease, bottom 0.3s ease;
  }
  &::before { top: 9px; left: 9px; border-right: none; border-bottom: none; }
  &::after { bottom: 9px; right: 9px; border-left: none; border-top: none; }
  & > .brk-tr { top: 9px; right: 9px; border-left: none; border-bottom: none; }
  & > .brk-bl { bottom: 9px; left: 9px; border-right: none; border-top: none; }
  &:hover::before { top: 14px; left: 14px; opacity: 0.9; }
  &:hover::after { bottom: 14px; right: 14px; opacity: 0.9; }
  &:hover > .brk-tr { top: 14px; right: 14px; opacity: 0.9; }
  &:hover > .brk-bl { bottom: 14px; left: 14px; opacity: 0.9; }
`;

const Frame = styled.div`
  ${bracket}
  position: relative;
  overflow: hidden;
  background: var(--elev, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-card, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    border-color: var(--cy-35, rgba(0, 245, 212, 0.35));
    box-shadow: 0 0 0 1px rgba(0, 245, 212, 0.14), 0 24px 60px rgba(0, 0, 0, 0.6);
    transform: translateY(-6px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`;

const Chrome = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.7rem 0.9rem;
  background: var(--bg-2, #0b0f14);
  border-bottom: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const Dots = styled.span`
  display: flex;
  gap: 5px;
  i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: block;
  }
  i:nth-child(1) { background: #ff5f57; }
  i:nth-child(2) { background: #febc2e; }
  i:nth-child(3) { background: var(--cy, #00f5d4); }
`;

const FileName = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.66rem;
  color: var(--fg-4, #545b6b);
  margin-left: 4px;
`;

const Shot = styled.div`
  position: relative;
  overflow: hidden;
  height: 340px;
  background: var(--bg-2, #0b0f14);

  img {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 118%;
    object-fit: cover;
    object-position: top;
    will-change: transform;
  }
`;

const Placeholder = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(
    120% 120% at 50% 0%,
    var(--cy-08, rgba(0, 245, 212, 0.08)),
    transparent 70%
  );
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-size: 3rem;
  color: var(--cy-20, rgba(0, 245, 212, 0.25));
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  text-align: left;
`;

const Heading = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
`;

const No = styled.span`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-size: 2.6rem;
  line-height: 1;
  color: var(--cy-20, rgba(0, 245, 212, 0.25));
`;

const CaseTitle = styled.h3`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 2rem;
  line-height: 1.05;
  color: var(--fg-1, #e6e8ee);
  margin: 0;
`;

const Kind = styled.span`
  display: block;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3, #6b7280);
  margin-top: 4px;
`;

const Blocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Block = styled.div`
  display: grid;
  grid-template-columns: 104px 1fr;
  gap: 0.9rem;
  align-items: start;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
`;

const BlockLabel = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cy, #00f5d4);
  padding-top: 3px;
`;

const BlockText = styled.p`
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 0.94rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.7;
  margin: 0;
`;

const Metrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  padding: 0.9rem 0;
  border-top: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
  border-bottom: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricValue = styled.span`
  font-family: var(--font-serif, "Spectral", Georgia, serif);
  font-style: normal;
  font-weight: 500;
  font-size: 1.5rem;
  line-height: 1.1;
  color: var(--cy, #00f5d4);
`;

const MetricLabel = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-4, #545b6b);
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Chip = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--cy-bright, #5cf8e6);
  background: var(--cy-08, rgba(0, 245, 212, 0.08));
  border: 1px solid var(--cy-20, rgba(0, 245, 212, 0.2));
  border-radius: var(--r-chip, 100px);
  padding: 4px 11px;
`;

const Ghost = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  margin-top: 0.2rem;
  padding: 0.65rem 1.4rem;
  border: 1px solid var(--border-strong, rgba(255, 255, 255, 0.16));
  border-radius: var(--r-chip, 100px);
  font-family: var(--font-sans, "Inter", system-ui, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--cy-50, rgba(0, 245, 212, 0.5));
    color: var(--cy-bright, #5cf8e6);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`;

const Private = styled.span`
  align-self: flex-start;
  margin-top: 0.2rem;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--fg-4, #545b6b);
`;

/* ---------------------------------------------------------- subcomponent -- */

function CaseRow({ c, i, reduce }: { c: CaseStudy; i: number; reduce: boolean }) {
  const flip = i % 2 === 1;
  const imgRef = useParallax(28);

  return (
    <Row $flip={flip} variants={reduce ? undefined : rowVariants}>
      {/* screenshot */}
      <Col variants={reduce ? undefined : itemVariants}>
        <Frame>
          <span className="brk-tr" aria-hidden="true" />
          <span className="brk-bl" aria-hidden="true" />
          <Chrome>
            <Dots aria-hidden="true">
              <i />
              <i />
              <i />
            </Dots>
            <FileName>{c.domain}</FileName>
          </Chrome>
          <Shot>
            <Placeholder aria-hidden="true">{c.title.charAt(0)}</Placeholder>
            {c.image && (
              <img
                ref={imgRef}
                src={c.image}
                alt={`${c.title} — screenshot`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </Shot>
        </Frame>
      </Col>

      {/* copy */}
      <Col variants={reduce ? undefined : itemVariants}>
        <Copy>
          <Heading>
            <No aria-hidden="true">{c.no}</No>
            <div>
              <CaseTitle>{c.title}</CaseTitle>
              <Kind>
                {c.kind} · {c.year}
              </Kind>
            </div>
          </Heading>

          <Blocks>
            <Block>
              <BlockLabel>Problema</BlockLabel>
              <BlockText>{c.problem}</BlockText>
            </Block>
            <Block>
              <BlockLabel>Abordagem</BlockLabel>
              <BlockText>{c.approach}</BlockText>
            </Block>
            <Block>
              <BlockLabel>Resultado</BlockLabel>
              <BlockText>{c.result}</BlockText>
            </Block>
          </Blocks>

          <Metrics>
            {c.metrics.map(([v, l]) => (
              <Metric key={l}>
                <MetricValue>{v}</MetricValue>
                <MetricLabel>{l}</MetricLabel>
              </Metric>
            ))}
          </Metrics>

          <Chips>
            {c.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </Chips>

          {c.link ? (
            <Ghost href={c.link} target="_blank" rel="noopener noreferrer">
              Visitar site →
            </Ghost>
          ) : (
            <Private>Repositório privado</Private>
          )}
        </Copy>
      </Col>
    </Row>
  );
}

/* ---------------------------------------------------------- component ---- */

export function CaseStudies() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px 0px" });
  const reduce = useReducedMotion();

  return (
    <Section id="work" aria-labelledby="work-title">
      <Inner>
        <Header
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        >
          <Eyebrow>03 · Selected Work</Eyebrow>
          <Title id="work-title">
            Estudos de <em>Caso</em>
          </Title>
          <Subtitle>
            Alguns builds, contados do jeito que eu penso neles — problema,
            abordagem, resultado.
          </Subtitle>
        </Header>

        <Rows
          ref={ref}
          as={motion.div}
          variants={reduce ? undefined : rowVariants}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : inView ? "show" : "hidden"}
        >
          {CASES.map((c, i) => (
            <CaseRow key={c.no} c={c} i={i} reduce={!!reduce} />
          ))}
        </Rows>
      </Inner>
    </Section>
  );
}

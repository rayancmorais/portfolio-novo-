import { useId, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useReducedMotion } from 'framer-motion';
import type { Architecture, DiagramNode, NodeKind } from '@/data/architecture';

/* ============================================================================
   Diagrama de arquitetura — SVG animado, sem dependência nova.

   Os nós entram em sequência ao aparecer na viewport e as arestas têm o traço
   animado sugerindo fluxo. Em vez de tooltip flutuante, passar o mouse (ou
   tocar) num nó escreve a responsabilidade dele numa faixa fixa abaixo do
   diagrama: funciona igual no toque, não sai da tela e é legível por leitor.

   Abaixo de 768px o SVG dá lugar a uma lista em coluna — diagrama interativo em
   390px frustra mais do que informa.
   ========================================================================== */

const NODE_W = 176;
const NODE_H = 58;
/** Folga entre a borda do nó e a ponta da seta. */
const ARROW_GAP = 9;

interface Point {
  x: number;
  y: number;
}

/**
 * Ponto onde a reta entre dois centros cruza a borda da caixa de destino.
 * Evita que a seta entre por baixo do nó.
 */
function boundaryPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return to;

  const halfW = NODE_W / 2 + ARROW_GAP;
  const halfH = NODE_H / 2 + ARROW_GAP;
  const ratio = Math.min(
    dx === 0 ? Infinity : halfW / Math.abs(dx),
    dy === 0 ? Infinity : halfH / Math.abs(dy)
  );
  return { x: to.x - dx * ratio, y: to.y - dy * ratio };
}

const KIND_COLORS: Record<NodeKind, string> = {
  client: 'var(--fg-2)',
  service: 'var(--cy)',
  infra: 'var(--blue-bright)',
  external: 'var(--fg-3)',
};

/* -------------------------------------------------------------- styled ---- */

const Wrap = styled.div`
  margin: 0;
`;

const Canvas = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* Entrada em CSS, não em framer-motion.
   O `whileInView` do framer depende de IntersectionObserver, que não observa
   elementos filhos de SVG de forma confiável — no WebKit não observa. O
   resultado era `opacity="0"` gravado como atributo e nunca revertido: nós e
   arestas invisíveis, sobrando só os <text> soltos, que não eram animados.

   `animation-fill-mode: backwards` mantém o estado inicial apenas durante o
   delay; terminada a animação o elemento volta ao estilo natural, visível. Se a
   animação não rodar (reduced-motion, motor desligado), nada some. */
const nodeIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

const edgeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const dashFlow = keyframes`
  to { stroke-dashoffset: -24; }
`;

/* O tracejado corre no sentido do fluxo. Fica só nas arestas assíncronas —
   animar tudo vira ruído. */
/* Cada ramo monta a shorthand inteira dentro de um css`` próprio. Interpolar um
   keyframe numa template string comum faz o styled-components lançar em runtime
   — e derruba a página inteira, não só o diagrama. */
const Edge = styled.line<{ $dashed?: boolean; $reduced: boolean; $index: number }>`
  ${({ $dashed, $reduced, $index }) => {
    if ($reduced) return '';
    const delay = `${(0.25 + $index * 0.05).toFixed(2)}s`;
    return $dashed
      ? css`
          animation:
            ${edgeIn} 0.4s ease-out ${delay} backwards,
            ${dashFlow} 1.1s linear infinite;
        `
      : css`
          animation: ${edgeIn} 0.4s ease-out ${delay} backwards;
        `;
  }}
`;

const NodeGroup = styled.g<{ $index: number; $reduced: boolean }>`
  cursor: default;
  transform-origin: 50% 50%;
  transform-box: fill-box;

  ${({ $index, $reduced }) =>
    !$reduced &&
    css`
      animation: ${nodeIn} 0.36s ease-out ${($index * 0.06).toFixed(2)}s backwards;
    `}

  rect {
    transition:
      stroke 0.2s ease,
      fill 0.2s ease;
  }

  &:hover rect,
  &:focus-visible rect {
    stroke: var(--cy);
    fill: var(--elev-2);
  }

  &:focus-visible {
    outline: none;
  }
`;

const Caption = styled.p`
  min-height: 2.6em;
  margin: 1rem 0 0;
  padding: 0.7rem 0.9rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--fg-2);
  background: var(--elev);
  border: 1px solid var(--border-faint);
  border-radius: var(--r-card, 16px);

  strong {
    color: var(--fg-1);
    font-weight: 600;
  }
`;

/* fallback em coluna — mobile */

const Column = styled.ol`
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const Step = styled.li`
  position: relative;
  padding: 0.7rem 0.9rem;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: 12px;

  & + & {
    margin-top: 1.35rem;
  }

  /* conector vertical entre os passos */
  & + &::before {
    content: '';
    position: absolute;
    top: -1.35rem;
    left: 1.4rem;
    width: 1px;
    height: 1.35rem;
    background: var(--cy-35);
  }
`;

const StepLabel = styled.p`
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--fg-1);
`;

const StepRole = styled.p`
  margin: 4px 0 0;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--fg-2);
`;

/* ---------------------------------------------------------- component ---- */

interface ArchitectureDiagramProps {
  architecture: Architecture;
  /** Responsabilidade de cada nó, indexada pelo id. */
  roles: Record<string, string>;
  /** Texto exibido enquanto nenhum nó está selecionado. */
  caption: string;
  title: string;
}

export function ArchitectureDiagram({
  architecture,
  roles,
  caption,
  title,
}: ArchitectureDiagramProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const markerId = useId();

  const { width, height, nodes, edges } = architecture;
  const byId = new Map(nodes.map(node => [node.id, node]));
  const active = activeId ? byId.get(activeId) : undefined;

  const clear = () => setActiveId(null);

  return (
    <Wrap>
      <Canvas viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <defs>
          <marker
            id={`arrow-${markerId}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cy-50)" />
          </marker>
        </defs>

        {edges.map((edge, edgeIndex) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;

          const start = boundaryPoint(to, from);
          const end = boundaryPoint(from, to);
          const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
          const touchesActive = activeId === edge.from || activeId === edge.to;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <Edge
                $dashed={edge.dashed}
                $reduced={!!reduce}
                $index={edgeIndex}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={touchesActive ? 'var(--cy)' : 'var(--cy-35)'}
                strokeWidth={touchesActive ? 2 : 1.4}
                strokeDasharray={edge.dashed ? '6 6' : undefined}
                markerEnd={`url(#arrow-${markerId})`}
                markerStart={edge.bidirectional ? `url(#arrow-${markerId})` : undefined}
              />
              {edge.label && (
                <text
                  x={mid.x}
                  y={mid.y - 7}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="var(--font-mono, monospace)"
                  fill="var(--fg-4)"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node, i) => (
          <NodeGroup
            key={node.id}
            $index={i}
            $reduced={!!reduce}
            tabIndex={0}
            role="button"
            aria-label={`${node.label}: ${roles[node.id] ?? ''}`}
            onMouseEnter={() => setActiveId(node.id)}
            onMouseLeave={clear}
            onFocus={() => setActiveId(node.id)}
            onBlur={clear}
          >
            <rect
              x={node.x - NODE_W / 2}
              y={node.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx="10"
              fill={node.accent ? 'var(--cy-08)' : 'var(--elev)'}
              stroke={node.accent ? 'var(--cy-50)' : 'var(--border-strong)'}
              strokeWidth={node.accent ? 1.6 : 1}
            />
            <text
              x={node.x}
              y={node.sub ? node.y - 3 : node.y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fontFamily="var(--font-sans, sans-serif)"
              fill={KIND_COLORS[node.kind]}
            >
              {node.label}
            </text>
            {node.sub && (
              <text
                x={node.x}
                y={node.y + 15}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--font-mono, monospace)"
                fill="var(--fg-4)"
              >
                {node.sub}
              </text>
            )}
          </NodeGroup>
        ))}
      </Canvas>

      <Column>
        {nodes.map((node: DiagramNode) => (
          <Step key={node.id}>
            <StepLabel>
              {node.label}
              {node.sub ? ` · ${node.sub}` : ''}
            </StepLabel>
            {roles[node.id] && <StepRole>{roles[node.id]}</StepRole>}
          </Step>
        ))}
      </Column>

      <Caption aria-live="polite">
        {active ? (
          <>
            <strong>{active.label}</strong> — {roles[active.id]}
          </>
        ) : (
          caption
        )}
      </Caption>
    </Wrap>
  );
}

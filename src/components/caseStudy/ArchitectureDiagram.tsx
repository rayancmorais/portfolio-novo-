import { useId, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, useReducedMotion } from 'framer-motion';
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

const dashFlow = keyframes`
  to { stroke-dashoffset: -24; }
`;

/* O tracejado corre no sentido do fluxo. Fica só nas arestas assíncronas —
   animar tudo vira ruído. */
const Edge = styled(motion.line)<{ $dashed?: boolean; $reduced: boolean }>`
  ${({ $dashed, $reduced }) =>
    $dashed &&
    !$reduced &&
    css`
      animation: ${dashFlow} 1.1s linear infinite;
    `}
`;

const NodeGroup = styled(motion.g)`
  cursor: default;

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

        {edges.map(edge => {
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
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={touchesActive ? 'var(--cy)' : 'var(--cy-35)'}
                strokeWidth={touchesActive ? 2 : 1.4}
                strokeDasharray={edge.dashed ? '6 6' : undefined}
                markerEnd={`url(#arrow-${markerId})`}
                markerStart={edge.bidirectional ? `url(#arrow-${markerId})` : undefined}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={reduce ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.3 }}
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
            tabIndex={0}
            role="button"
            aria-label={`${node.label}: ${roles[node.id] ?? ''}`}
            onMouseEnter={() => setActiveId(node.id)}
            onMouseLeave={clear}
            onFocus={() => setActiveId(node.id)}
            onBlur={clear}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.34, delay: reduce ? 0 : i * 0.07 }}
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

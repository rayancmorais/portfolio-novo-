import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { LoadingScene } from './LoadingScene';

/* ── data ───────────────────────────────────────────────────────────────────── */

const LOGS = [
  { text: '> Booting flight systems...', done: false },
  { text: '✓ Flight systems online', done: true },
  { text: '> Charting hyperspace route...', done: false },
  { text: '✓ Nav route locked', done: true },
  { text: '> Spooling hyperdrive...', done: false },
  { text: '✓ Hyperdrive charged', done: true },
  { text: '> Jump ready — welcome aboard 🚀', done: true },
];

const STEP = 460;
const TOTAL = LOGS.length * STEP + 500;

/* ── component ─────────────────────────────────────────────────────────────── */

export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOGS.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => {
            setVisibleLogs(i + 1);
            setProgress(Math.round(((i + 1) / LOGS.length) * 100));
          },
          i * STEP + 250
        )
      );
    });

    const exit = setTimeout(() => {
      setExiting(true);
      setTimeout(onFinish, 800);
    }, TOTAL);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(exit);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!exiting && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          transition={{ duration: 0.8, ease: [0.6, 0, 0.9, 0.4] }}
        >
          <SceneLayer>
            <LoadingScene reduced={reduced} />
          </SceneLayer>
          <Scrim aria-hidden />

          <Center>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <PilotHud>
                <RingOuter viewBox="0 0 100 100" aria-hidden>
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="none"
                    stroke="#5ab6ff"
                    strokeWidth="0.6"
                    strokeDasharray="1 3.2"
                    opacity="0.75"
                  />
                </RingOuter>
                <RingMid viewBox="0 0 100 100" aria-hidden>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#7fe0ff"
                    strokeWidth="1"
                    strokeDasharray="30 22"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </RingMid>

                <Ticks aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                </Ticks>

                <Brackets aria-hidden>
                  <Corner $pos="tl" />
                  <Corner $pos="tr" />
                  <Corner $pos="bl" />
                  <Corner $pos="br" />
                </Brackets>

                <AvatarRing>
                  <img src="/images/profilepicture.jpg" alt="Rayan Morais" />
                  <Sweep aria-hidden />
                  <Crosshair aria-hidden>
                    <i />
                    <i />
                  </Crosshair>
                </AvatarRing>

                <LockTag aria-hidden>◦ TRACKING</LockTag>
              </PilotHud>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Name>RAYAN MORAIS</Name>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Subtitle>HYPERDRIVE&nbsp;&nbsp;·&nbsp;&nbsp;INITIALIZING</Subtitle>
            </motion.div>
          </Center>

          <Bottom>
            <Logs>
              {LOGS.slice(0, visibleLogs).map((log, i) => (
                <LogLine
                  key={i}
                  as={motion.p}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  $done={log.done}
                >
                  {log.text}
                </LogLine>
              ))}
            </Logs>

            <PctWrap
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <PctLabel>HYPERDRIVE CHARGE</PctLabel>
              <Pct>{progress}%</Pct>
            </PctWrap>
          </Bottom>

          <ProgressTrack>
            <ProgressFill
              as={motion.div}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </ProgressTrack>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

/* ── keyframes ─────────────────────────────────────────────────────────────── */

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const spinRev = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
`;
const sweep = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const flicker = keyframes`
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
`;

/* ── layout ─────────────────────────────────────────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #04060c;
  overflow: hidden;
`;

const SceneLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 50% 46%, rgba(4, 6, 12, 0.5) 0%, transparent 55%),
    linear-gradient(to top, rgba(4, 6, 12, 0.9) 0%, transparent 26%),
    linear-gradient(to bottom, rgba(4, 6, 12, 0.55) 0%, transparent 16%);
`;

const Center = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
`;

/* ── pilot HUD ──────────────────────────────────────────────────────────────── */

const PilotHud = styled.div`
  position: relative;
  width: 210px;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RingOuter = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: ${spin} 22s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const RingMid = styled.svg`
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  filter: drop-shadow(0 0 4px rgba(90, 200, 255, 0.5));
  animation: ${spinRev} 14s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Ticks = styled.div`
  position: absolute;
  inset: 0;

  span {
    position: absolute;
    width: 2px;
    height: 9px;
    background: #7fe0ff;
    box-shadow: 0 0 6px rgba(90, 200, 255, 0.8);
    left: 50%;
    margin-left: -1px;
  }
  span:nth-child(1) {
    top: -3px;
  }
  span:nth-child(2) {
    bottom: -3px;
  }
  span:nth-child(3) {
    top: 50%;
    left: -3px;
    transform: rotate(90deg);
  }
  span:nth-child(4) {
    top: 50%;
    right: -3px;
    left: auto;
    transform: rotate(90deg);
  }
`;

const Brackets = styled.div`
  position: absolute;
  inset: 22px;
`;

const Corner = styled.span<{ $pos: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(120, 200, 255, 0.7);
  ${({ $pos }) => $pos === 'tl' && 'top: 0; left: 0; border-right: none; border-bottom: none;'}
  ${({ $pos }) => $pos === 'tr' && 'top: 0; right: 0; border-left: none; border-bottom: none;'}
  ${({ $pos }) => $pos === 'bl' && 'bottom: 0; left: 0; border-right: none; border-top: none;'}
  ${({ $pos }) => $pos === 'br' && 'bottom: 0; right: 0; border-left: none; border-top: none;'}
`;

const AvatarRing = styled.div`
  position: relative;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(120, 200, 255, 0.55);
  box-shadow:
    0 0 0 4px rgba(90, 160, 255, 0.08),
    0 0 26px rgba(70, 140, 255, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 18%;
    display: block;
  }
`;

const Sweep = styled.div`
  position: absolute;
  inset: -25%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 300deg,
    rgba(120, 210, 255, 0.35) 355deg,
    rgba(160, 230, 255, 0.55) 360deg
  );
  animation: ${sweep} 3.4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const Crosshair = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  i {
    position: absolute;
    background: rgba(150, 220, 255, 0.4);
  }
  i:nth-child(1) {
    left: 50%;
    top: 42%;
    bottom: 42%;
    width: 1px;
    margin-left: -0.5px;
  }
  i:nth-child(2) {
    top: 50%;
    left: 42%;
    right: 42%;
    height: 1px;
    margin-top: -0.5px;
  }
`;

const LockTag = styled.span`
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--mono, monospace);
  font-size: 0.5rem;
  letter-spacing: 0.24em;
  color: #7fe0ff;
  white-space: nowrap;
  animation: ${flicker} 1.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/* ── identity ───────────────────────────────────────────────────────────────── */

const Name = styled.h1`
  font-family: var(--display, 'Orbitron', sans-serif);
  font-weight: 700;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  letter-spacing: 0.16em;
  line-height: 1.1;
  color: var(--fg-1, #e6e8ee);
  margin: 0;
  text-align: center;
  text-shadow:
    0 0 18px rgba(90, 150, 255, 0.5),
    0 0 44px rgba(130, 90, 255, 0.28);
`;

const Subtitle = styled.p`
  font-family: var(--mono, monospace);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #7f93bf;
  text-align: center;
`;

/* ── bottom HUD ─────────────────────────────────────────────────────────────── */

const Bottom = styled.div`
  position: absolute;
  bottom: 22px;
  left: clamp(1.5rem, 4vw, 3rem);
  right: clamp(1.5rem, 4vw, 3rem);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  z-index: 2;
`;

const Logs = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 480px;
  overflow: hidden;
`;

const LogLine = styled.p<{ $done: boolean }>`
  font-family: var(--mono, monospace);
  font-size: 0.68rem;
  line-height: 1.85;
  white-space: nowrap;
  color: ${({ $done }) => ($done ? '#7fe0ff' : 'var(--fg-2, #8b93a7)')};
  ${({ $done }) => $done && 'text-shadow: 0 0 10px rgba(90, 190, 255, 0.4);'}
`;

const PctWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const PctLabel = styled.span`
  font-family: var(--mono, monospace);
  font-size: 0.52rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #5a6a92;
  white-space: nowrap;
`;

const Pct = styled.span`
  font-family: var(--display, 'Orbitron', sans-serif);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8fd0ff;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(90, 190, 255, 0.5);
`;

/* ── charge bar ─────────────────────────────────────────────────────────────── */

const ProgressTrack = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.05);
`;

const ProgressFill = styled.div`
  height: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, #3e7fe9 0%, #7fe0ff 50%, #9a6cff 100%);
  box-shadow: 0 0 12px rgba(90, 160, 255, 0.7);
`;

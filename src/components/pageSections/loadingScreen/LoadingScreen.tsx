import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

/* ── data ───────────────────────────────────────────────────────────────────── */

const LOGS = [
  { text: '> Scanning resume & credentials...', done: false },
  { text: '✓ Scanning resume & credentials...', done: true },
  { text: '> Loading projects & case studies...', done: false },
  { text: '✓ Loading projects & case studies...', done: true },
  { text: '> Compiling animations & effects...', done: false },
  { text: '✓ Compiling animations & effects...', done: true },
  { text: '> Portfolio ready — welcome 🚀', done: true },
];

const STEP  = 380;
const TOTAL = LOGS.length * STEP + 400;

/* ── component ─────────────────────────────────────────────────────────────── */

export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [progress, setProgress]       = useState(0);
  const [exiting, setExiting]         = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOGS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLogs(i + 1);
          setProgress(Math.round(((i + 1) / LOGS.length) * 100));
        }, i * STEP + 200)
      );
    });

    const exit = setTimeout(() => {
      setExiting(true);
      setTimeout(onFinish, 700);
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
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* atmospheric background */}
          <Aurora />
          <Dots />

          {/* center identity */}
          <Center>
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <AvatarWrap>
                <SpinArc />
                <AvatarMask>
                  <ScanLine />
                  <img src="/images/profilepicture.png" alt="Rayan Morais" />
                </AvatarMask>
              </AvatarWrap>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Name>Rayan Morais</Name>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Subtitle>FULL-STACK DEVELOPER&nbsp;&nbsp;·&nbsp;&nbsp;PORTFOLIO</Subtitle>
            </motion.div>
          </Center>

          {/* bottom panel: logs + percentage */}
          <Bottom>
            <Logs>
              {LOGS.slice(0, visibleLogs).map((log, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    fontFamily:    "var(--mono, 'JetBrains Mono', monospace)",
                    fontSize:      '0.68rem',
                    lineHeight:    1.85,
                    color:         log.done ? '#4ade80' : 'var(--fg-2, #8b93a7)',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {log.text}
                </motion.p>
              ))}
            </Logs>

            <Pct
              as={motion.span}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {progress}%
            </Pct>
          </Bottom>

          {/* cinematic full-width progress bar */}
          <ProgressTrack>
            <ProgressFill
              as={motion.div}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
            />
          </ProgressTrack>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

/* ── keyframes ─────────────────────────────────────────────────────────────── */

const spinArc = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const scan = keyframes`
  0%   { top: -4px; opacity: 0.9; }
  80%  { top: 100%;  opacity: 0.9; }
  100% { top: 100%;  opacity: 0; }
`;

/* ── background ────────────────────────────────────────────────────────────── */

const Aurora = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 65% 55% at 25% 35%, rgba(62,127,233,0.13) 0%, transparent 65%),
    radial-gradient(ellipse 50% 45% at 78% 70%, rgba(0,229,204,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 35% 35% at 60% 10%, rgba(0,229,204,0.06) 0%, transparent 55%);
`;

const Dots = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(0,229,204,0.07) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
`;

/* ── layout ─────────────────────────────────────────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0d1117;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Center = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 5rem;
`;

/* ── avatar ─────────────────────────────────────────────────────────────────── */

const AvatarWrap = styled.div`
  position: relative;
  width: 118px;
  height: 118px;
`;

const SpinArc = styled.div`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #00e5cc 0deg,
    rgba(0,229,204,0.35) 65deg,
    transparent 115deg,
    transparent 360deg
  );
  animation: ${spinArc} 2.6s linear infinite;
`;

const AvatarMask = styled.div`
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  overflow: hidden;
  background: #0d1117;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00e5cc 40%, #5cf3e3 50%, #00e5cc 60%, transparent 100%);
  box-shadow: 0 0 10px rgba(0,229,204,0.8), 0 0 4px rgba(0,229,204,0.4);
  z-index: 2;
  animation: ${scan} 0.9s cubic-bezier(0.4, 0, 0.6, 1) 0.5s both;
`;

/* ── identity ───────────────────────────────────────────────────────────────── */

const Name = styled.h1`
  font-family: var(--serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: 2.4rem;
  letter-spacing: 0.01em;
  line-height: 1.1;
  color: var(--fg-1, #e6e8ee);
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fg-4, #545b6b);
  text-align: center;
`;

/* ── bottom panel ───────────────────────────────────────────────────────────── */

const Bottom = styled.div`
  position: absolute;
  bottom: 18px;
  left: clamp(1.5rem, 4vw, 3rem);
  right: clamp(1.5rem, 4vw, 3rem);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  z-index: 1;
`;

const Logs = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 480px;
  overflow: hidden;
`;

const Pct = styled.span`
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #00e5cc;
  white-space: nowrap;
  padding-bottom: 2px;
`;

/* ── progress bar ───────────────────────────────────────────────────────────── */

const ProgressTrack = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
`;

const ProgressFill = styled.div`
  height: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, #00e5cc 0%, #5cf3e3 100%);
  box-shadow: 0 0 10px rgba(0,229,204,0.55);
`;

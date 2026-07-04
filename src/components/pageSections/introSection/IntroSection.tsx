import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';

const CV_URLS = {
  ptBR: '/pdf/Rayan_Morais_CV_PT_FullStack.pdf',
  en: '/pdf/Rayan_Morais_CV_Eng.pdf',
};

/* ── keyframes ─────────────────────────────────────────────────────────────── */

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const pulseDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.78); }
`;

const glowRing = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(62,127,233,0.22),
                0 0 0 5px rgba(62,127,233,0.07),
                0 0 22px rgba(62,127,233,0.18);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(62,127,233,0.55),
                0 0 0 6px rgba(62,127,233,0.12),
                0 0 38px rgba(62,127,233,0.35);
  }
`;

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const nebulaFlow = keyframes`
  from { background-position: 0% 50%; }
  to   { background-position: 300% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 12px rgba(90, 150, 255, 0.35)); }
  50%      { filter: drop-shadow(0 0 30px rgba(130, 175, 255, 0.65)); }
`;

/* ── motion variant ────────────────────────────────────────────────────────── */

const FADE = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 28,
      delay: i * 0.07,
    },
  }),
};

function Anim({ i, inView, children }: { i: number; inView: boolean; children: React.ReactNode }) {
  return (
    <motion.div custom={i} variants={FADE} initial="hidden" animate={inView ? 'show' : 'hidden'}>
      {children}
    </motion.div>
  );
}

/* ── headline line reveal (clip mask) ─────────────────────────────────────────── */

const HEAD_EASE = [0.16, 1, 0.3, 1] as const;
const HEAD_STAGGER = 0.12;

const LINE_REVEAL = {
  hidden: { y: '100%' },
  show: (i: number) => ({
    y: '0%',
    transition: {
      duration: 0.7,
      ease: HEAD_EASE,
      delay: 0.2 + i * HEAD_STAGGER,
    },
  }),
};

function LineReveal({
  i,
  inView,
  reduced,
  children,
}: {
  i: number;
  inView: boolean;
  reduced: boolean;
  children: React.ReactNode;
}) {
  if (reduced) {
    return <LineMask>{children}</LineMask>;
  }
  return (
    <LineMask>
      <motion.span
        style={{ display: 'block', willChange: 'transform' }}
        custom={i}
        variants={LINE_REVEAL}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        {children}
      </motion.span>
    </LineMask>
  );
}

/* ── marquee data ──────────────────────────────────────────────────────────── */

const STACK = [
  'React',
  'Next.js',
  'Node.js',
  'TypeScript',
  'PostgreSQL',
  'Framer Motion',
  'Fastify',
  'NestJS',
  'Docker',
  'Supabase',
  'Prisma',
  'Vercel',
  'GitHub Actions',
  'Socket.io',
  'Go',
];

/* ── spotlight helpers ─────────────────────────────────────────────────────── */

function handleSpot(e: React.MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
}
function clearSpot(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.removeProperty('--spot-x');
  e.currentTarget.style.removeProperty('--spot-y');
}

/* ── component ─────────────────────────────────────────────────────────────── */

export function IntroSection() {
  const { t } = useTranslation('home');
  const { language } = useLanguage();
  const cvUrl = CV_URLS[language];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <Section ref={ref} id="home">
      <Scrim aria-hidden />

      <Inner>
        <TopBar>
          <Anim i={0} inView={inView}>
            <TermChip>
              <TermDots>
                <i />
                <i />
                <i />
              </TermDots>
              <TermText>
                rayan@dev&nbsp;:&nbsp;~$&nbsp;whoami<Caret>▋</Caret>
              </TermText>
            </TermChip>
          </Anim>
        </TopBar>

        <Grid>
          {/* left: headline */}
          <HeadCol>
            <Anim i={2} inView={inView}>
              <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            </Anim>

            <HeadBlock>
              <LineReveal i={0} inView={inView} reduced={reducedMotion}>
                <Line1>{t('hero.headline_1')}</Line1>
              </LineReveal>
              <LineReveal i={1} inView={inView} reduced={reducedMotion}>
                <Line2>{t('hero.headline_accent')},</Line2>
              </LineReveal>
              <LineReveal i={2} inView={inView} reduced={reducedMotion}>
                <Line3>{t('hero.headline_2')}</Line3>
              </LineReveal>
            </HeadBlock>

            <Anim i={6} inView={inView}>
              <CapsLine>{t('hero.headline_caps')}</CapsLine>
            </Anim>

            <Anim i={7} inView={inView}>
              <Bio dangerouslySetInnerHTML={{ __html: t('hero.bio') }} />
            </Anim>

            <Anim i={8} inView={inView}>
              <CTAs>
                <PrimaryBtn href="#work">{t('hero.cta_primary')}</PrimaryBtn>
                <GhostBtn href={cvUrl} download target="_blank" rel="noopener noreferrer">
                  {t('hero.cta_cv')}
                </GhostBtn>
              </CTAs>
            </Anim>
          </HeadCol>

          {/* right: unified card */}
          <SideCol>
            <Anim i={3} inView={inView}>
              <AvatarCard onMouseMove={handleSpot} onMouseLeave={clearSpot}>
                <Spot aria-hidden />
                <Corners aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                </Corners>
                <PanelHeader>
                  <span>
                    <HDot /> OPERATOR
                  </span>
                  <span>RM · 01</span>
                </PanelHeader>
                <AvatarFrame>
                  <AvatarImg src="/images/profilepicture.jpg" alt="Rayan Morais" />
                </AvatarFrame>
                <AvatarName>{t('hero.name')}</AvatarName>
                <AvatarRole>{t('hero.role')}</AvatarRole>
                <AvailBadge>
                  <PulseDot />
                  {t('hero.available')}
                </AvailBadge>

                <InfoDivider />

                <InfoRows>
                  <InfoRow>
                    <InfoLabel>{t('hero.location_label')}</InfoLabel>
                    <InfoVal>{t('hero.location_value')}</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>{t('hero.focus_label')}</InfoLabel>
                    <InfoValAccent>{t('hero.focus_value')}</InfoValAccent>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>{t('hero.exp_label')}</InfoLabel>
                    <InfoVal>{t('hero.exp_value')}</InfoVal>
                  </InfoRow>
                </InfoRows>
              </AvatarCard>
            </Anim>
          </SideCol>
        </Grid>
      </Inner>

      <MarqueeWrap aria-hidden>
        <MarqueeTrack>
          {[...STACK, ...STACK].map((item, i) => (
            <MarqueeItem key={i}>
              <MarqueeDot>·</MarqueeDot>
              {item}
            </MarqueeItem>
          ))}
        </MarqueeTrack>
      </MarqueeWrap>
    </Section>
  );
}

/* ── background ────────────────────────────────────────────────────────────── */

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(95deg, rgba(6, 9, 18, 0.82) 0%, rgba(6, 9, 18, 0.45) 32%, transparent 58%),
    radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(3, 5, 12, 0.55) 100%);
`;

/* ── layout ─────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  background: transparent;
`;

const Inner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--tight, 1080px);
  margin: 0 auto;
  padding: calc(var(--nav-h, 66px) + clamp(1rem, 3vw, 2.2rem)) 1.5rem clamp(3rem, 6vw, 4rem);
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/* ── terminal chip ───────────────────────────────────────────────────────────── */

const TermChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--bg-2);
  border: 1px solid var(--border-faint);
  border-radius: 8px;
  padding: 0.38rem 0.8rem;
`;

const TermDots = styled.span`
  display: flex;
  gap: 4px;
  i {
    display: block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  i:nth-child(1) {
    background: #ff5f57;
  }
  i:nth-child(2) {
    background: #febc2e;
  }
  i:nth-child(3) {
    background: var(--cy);
  }
`;

const TermText = styled.span`
  font-family: var(--mono);
  font-size: 0.71rem;
  color: var(--fg-2);
  letter-spacing: 0.04em;
`;

const Caret = styled.span`
  color: var(--cy);
  animation: ${blink} 1.1s step-end infinite;
  margin-left: 2px;
`;

const AvailBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.75rem;
  background: var(--blue-15);
  border: 1px solid var(--cy-20);
  border-radius: var(--r-chip);
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--blue-bright);
`;

const PulseDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue-bright);
  flex-shrink: 0;
  animation: ${pulseDot} 2s ease-in-out infinite;
`;

/* ── grid ───────────────────────────────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.65fr 1fr;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

/* ── headline column ─────────────────────────────────────────────────────────── */

const HeadCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Eyebrow = styled.p`
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--cy);
`;

const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const LineMask = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.15em;
  margin-bottom: -0.15em;
`;

const Line1 = styled.span`
  display: block;
  font-family: var(--display);
  font-weight: 500;
  font-size: clamp(1rem, 2.1vw, 1.7rem);
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
`;

const Line2 = styled.span`
  display: block;
  font-family: var(--display);
  font-weight: 900;
  font-size: clamp(2.1rem, 6vw, 4.6rem);
  line-height: 1.04;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  background: linear-gradient(
    100deg,
    #64a0ff 0%,
    #4ac0ff 22%,
    #8a6cff 44%,
    #3e7fe9 66%,
    #64a0ff 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation:
    ${nebulaFlow} 9s linear infinite,
    ${glowPulse} 4.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Line3 = styled.span`
  display: block;
  font-family: var(--display);
  font-weight: 500;
  font-size: clamp(1rem, 2.1vw, 1.6rem);
  line-height: 1.25;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-1);
  text-shadow: 0 0 18px rgba(90, 150, 255, 0.25);
`;

const CapsLine = styled.p`
  font-family: var(--mono);
  font-size: clamp(0.6rem, 1.4vw, 0.85rem);
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--fg-3);
`;

const Bio = styled.p`
  font-size: 0.94rem;
  line-height: 1.75;
  color: var(--fg-2);
  max-width: 520px;

  strong {
    color: var(--fg-1);
    font-weight: 600;
  }
  em {
    font-style: normal;
    color: var(--cy-bright);
  }
`;

const CTAs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PrimaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--cy);
  color: #07162e;
  padding: 0.72rem 1.5rem;
  border-radius: var(--r-chip);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.2s var(--ease),
    background 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: var(--cy-bright);
    box-shadow: var(--glow-cy-sm);
  }
`;

const GhostBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--fg-1);
  border: 1px solid var(--border-strong);
  padding: 0.72rem 1.5rem;
  border-radius: var(--r-chip);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.2s var(--ease),
    border-color 0.2s,
    color 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--cy-50);
    color: var(--cy-bright);
  }
`;

/* ── side column ─────────────────────────────────────────────────────────────── */

const SideCol = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 860px) {
    order: -1;
  }
`;

/* ── spotlight overlay ───────────────────────────────────────────────────────── */

const Spot = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  border-radius: inherit;
  background: radial-gradient(
    340px circle at var(--spot-x, -9999px) var(--spot-y, -9999px),
    rgba(62, 127, 233, 0.14),
    rgba(62, 127, 233, 0.04) 55%,
    transparent 75%
  );
`;

/* ── unified avatar + info card ──────────────────────────────────────────────── */

const AvatarCard = styled.div`
  position: relative;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: var(--r-tile);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: clamp(1.4rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  text-align: center;
  transition:
    border-color 0.3s var(--ease),
    box-shadow 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 14%;
    right: 14%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cy-50), transparent);
    opacity: 0.7;
  }

  &:hover {
    border-color: var(--cy-35);
    box-shadow: var(--shadow-card-hover);
  }
`;

const Corners = styled.div`
  position: absolute;
  inset: 9px;
  pointer-events: none;
  z-index: 4;

  span {
    position: absolute;
    width: 13px;
    height: 13px;
    border: 1px solid var(--cy-35);
  }
  span:nth-child(1) {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }
  span:nth-child(2) {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
  }
  span:nth-child(3) {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
  }
  span:nth-child(4) {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }
`;

const PanelHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 0.54rem;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fg-4);
  padding-bottom: 0.7rem;
  margin-bottom: 0.2rem;
  border-bottom: 1px solid var(--border-faint);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const HDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cy);
  box-shadow: 0 0 6px var(--cy);
  animation: ${pulseDot} 2s ease-in-out infinite;
`;

const AvatarFrame = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  animation: ${glowRing} 3s ease-in-out infinite;
  flex-shrink: 0;
  margin-bottom: 0.2rem;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 18%;
`;

const AvatarName = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: var(--fg-1);
`;

const AvatarRole = styled.p`
  font-family: var(--mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-4);
`;

const InfoDivider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--border);
  margin: 0.4rem 0 0.1rem;
`;

const InfoRows = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-left: 0.7rem;
  border-left: 2px solid var(--cy-20);
  transition: border-color 0.25s var(--ease);

  &:hover {
    border-left-color: var(--cy-50);
  }
`;

const InfoLabel = styled.p`
  font-family: var(--mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-4);

  &::before {
    content: '';
    display: inline-block;
    width: 7px;
    height: 1px;
    margin-right: 7px;
    vertical-align: middle;
    background: var(--cy);
    opacity: 0.7;
  }
`;

const InfoVal = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg-1);
`;

const InfoValAccent = styled(InfoVal)`
  color: var(--cy-bright);
`;

/* ── marquee ─────────────────────────────────────────────────────────────────── */

const MarqueeWrap = styled.div`
  position: relative;
  z-index: 1;
  overflow: hidden;
  padding: 1rem 0;
  border-top: 1px solid var(--border-faint);
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
`;

const MarqueeTrack = styled.div`
  display: flex;
  gap: 0;
  width: max-content;
  animation: ${marqueeScroll} 40s linear infinite;
`;

const MarqueeItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0 1.2rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--fg-3);
  white-space: nowrap;
`;

const MarqueeDot = styled.span`
  color: var(--cy-20);
  font-size: 1rem;
`;

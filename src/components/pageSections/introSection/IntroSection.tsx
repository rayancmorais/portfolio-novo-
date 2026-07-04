import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
    box-shadow: 0 0 0 2px rgba(0,229,204,0.22),
                0 0 0 5px rgba(0,229,204,0.07),
                0 0 22px rgba(0,229,204,0.18);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(0,229,204,0.55),
                0 0 0 6px rgba(0,229,204,0.12),
                0 0 38px rgba(0,229,204,0.35);
  }
`;

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const rainFall = keyframes`
  from { transform: translateY(-20px); }
  to   { transform: translateY(135vh); }
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

/* ── rain data ─────────────────────────────────────────────────────────────── */

const RAIN_LINES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${3 + i * 3.3}%`,
  width: `${1 + (i % 2)}px`,
  height: `${60 + ((i * 37) % 180)}px`,
  duration: `${5.5 + ((i * 0.27) % 7)}s`,
  delay: `${-((i * 0.41) % 6)}s`,
  opacity: 0.05 + (i % 8) * 0.025,
}));

function RainBackground() {
  return (
    <RainWrap aria-hidden>
      {RAIN_LINES.map(l => (
        <RainLine
          key={l.id}
          style={{
            left: l.left,
            width: l.width,
            height: l.height,
            animationDuration: l.duration,
            animationDelay: l.delay,
            opacity: l.opacity,
          }}
        />
      ))}
    </RainWrap>
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

  return (
    <Section ref={ref} id="home">
      <AuroraBg />
      <DotGrid />
      <RainBackground />

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
              <Anim i={3} inView={inView}>
                <Line1>{t('hero.headline_1')}</Line1>
              </Anim>
              <Anim i={4} inView={inView}>
                <Line2>{t('hero.headline_accent')},</Line2>
              </Anim>
              <Anim i={5} inView={inView}>
                <Line3>{t('hero.headline_2')}</Line3>
              </Anim>
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
                <AvatarFrame>
                  <AvatarImg src="/images/profilepicture.png" alt="Rayan Morais" />
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

const AuroraBg = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 60% at 15% 40%, rgba(62, 127, 233, 0.11) 0%, transparent 65%),
    radial-gradient(ellipse 55% 50% at 85% 70%, rgba(0, 229, 204, 0.09) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 55% 10%, rgba(0, 229, 204, 0.06) 0%, transparent 55%);
`;

const DotGrid = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(0, 229, 204, 0.09) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
`;

const RainWrap = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
`;

const RainLine = styled.div`
  position: absolute;
  top: -240px;
  background: var(--cy);
  border-radius: 1px;
  animation: ${rainFall} linear infinite;
`;

/* ── layout ─────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: var(--bg);
`;

const Inner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--tight, 1080px);
  margin: 0 auto;
  padding: clamp(5.5rem, 11vw, 8rem) 1.5rem clamp(3rem, 6vw, 4rem);
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
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
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

const Line1 = styled.span`
  display: block;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  line-height: 1.15;
  color: var(--fg-2);
`;

const Line2 = styled.span`
  display: block;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.8rem, 7.5vw, 5.8rem);
  line-height: 0.98;
  letter-spacing: -0.01em;
  background: linear-gradient(130deg, var(--cy) 0%, var(--cy-bright) 55%, var(--cy-deep) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Line3 = styled.span`
  display: block;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.3rem, 2.8vw, 2.1rem);
  line-height: 1.2;
  color: var(--fg-1);
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
  color: #062b27;
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
    rgba(0, 229, 204, 0.14),
    rgba(0, 229, 204, 0.04) 55%,
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

  &:hover {
    border-color: var(--cy-35);
    box-shadow: var(--shadow-card-hover);
  }
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
`;

const InfoLabel = styled.p`
  font-family: var(--mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-4);
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

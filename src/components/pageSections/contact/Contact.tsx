import { useRef, useState, type FormEvent } from 'react';
import styled, { css } from 'styled-components';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ============================================================================
   Contact — name / email / message form (no backend) + social links.
   Eyebrow "08 · Contato". React + styled-components + framer-motion.
   Tokens via CSS custom properties with hex fallbacks. No new dependencies.

   The form does not POST anywhere: on submit it shows an inline success
   state. Wire `handleSubmit` to your provider (Formspree, Resend, …) later.
   ========================================================================== */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 360, damping: 30 },
  },
};

const Section = styled.section`
  position: relative;
  padding: clamp(4rem, 9vw, 7rem) clamp(1.2rem, 4vw, 2.6rem);
`;

const Inner = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.005em;
  line-height: 1.04;
  color: var(--fg-1, #e6e8ee);
  margin: 0.7rem 0 0.6rem;

  em {
    font-style: italic;
    color: var(--cy, #00f5d4);
  }
`;

const Subtitle = styled.p`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 1rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.6;
  max-width: 520px;
  margin: 0 auto;
`;

const Layout = styled(motion.div)`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.2rem;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const bracket = css`
  &::before,
  &::after,
  & > .brk-tr,
  & > .brk-bl {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
    border: 1.5px solid var(--cy, #00f5d4);
    opacity: 0;
    pointer-events: none;
    z-index: 5;
    transition:
      opacity 0.3s ease,
      top 0.3s ease,
      left 0.3s ease,
      right 0.3s ease,
      bottom 0.3s ease;
  }
  &::before {
    top: 9px;
    left: 9px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: 9px;
    right: 9px;
    border-left: none;
    border-top: none;
  }
  & > .brk-tr {
    top: 9px;
    right: 9px;
    border-left: none;
    border-bottom: none;
  }
  & > .brk-bl {
    bottom: 9px;
    left: 9px;
    border-right: none;
    border-top: none;
  }
  &:hover::before {
    top: 13px;
    left: 13px;
    opacity: 0.9;
  }
  &:hover::after {
    bottom: 13px;
    right: 13px;
    opacity: 0.9;
  }
  &:hover > .brk-tr {
    top: 13px;
    right: 13px;
    opacity: 0.9;
  }
  &:hover > .brk-bl {
    bottom: 13px;
    left: 13px;
    opacity: 0.9;
  }
`;

const cardBase = css`
  position: relative;
  background: var(--elev, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-card, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

const FormCard = styled(motion.form)`
  ${cardBase}
  ${bracket}
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.8rem 1.8rem 1.9rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const FieldLabel = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-4, #545b6b);
`;

const inputStyles = css`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 0.92rem;
  color: var(--fg-1, #e6e8ee);
  background: var(--bg-2, rgba(255, 255, 255, 0.02));
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  width: 100%;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: var(--fg-4, #545b6b);
  }

  &:focus {
    outline: none;
    border-color: var(--cy-50, rgba(0, 245, 212, 0.5));
    box-shadow: 0 0 0 3px var(--cy-08, rgba(0, 245, 212, 0.08));
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const Textarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 120px;
`;

const Submit = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
  margin-top: 0.2rem;
  padding: 0.75rem 1.6rem;
  border: none;
  border-radius: var(--r-chip, 100px);
  background: var(--cy, #00f5d4);
  color: #052b27;
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 0 0.6rem rgba(0, 245, 212, 0.45);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const Sent = styled.p`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--success, #4ade80);
  margin: 0.2rem 0 0;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const SideCard = styled(motion.div)`
  ${cardBase}
  ${bracket}
  padding: 1.6rem 1.6rem 1.5rem;
`;

const SideTitle = styled.span`
  display: block;
  font-family: var(--font-serif, 'Spectral', Georgia, serif);
  font-style: italic;
  font-size: 1.3rem;
  color: var(--fg-1, #e6e8ee);
  margin-bottom: 0.4rem;
`;

const SideText = styled.p`
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  font-size: 0.86rem;
  color: var(--fg-2, #8b93a7);
  line-height: 1.6;
  margin: 0 0 1.2rem;
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: var(--r-chip, 100px);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: var(--cy-50, rgba(0, 245, 212, 0.5));
    color: var(--cy, #00f5d4);
    background: var(--cy-08, rgba(0, 245, 212, 0.08));
  }
`;

const Arrow = styled.span`
  color: var(--fg-4, #545b6b);
  ${SocialLink}:hover & {
    color: var(--cy, #00f5d4);
  }
`;

export function Contact() {
  const { t } = useTranslation('home');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const response = await fetch('https://formspree.io/f/xdavdvwk', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      setSent(true);
      form.reset();
    }
  };

  return (
    <Section id="contact" aria-labelledby="contact-title">
      <Inner>
        <Header>
          <Title id="contact-title">
            {t('contact.title_1')} <em className="accent-sci">{t('contact.title_accent')}</em>
          </Title>
          <Subtitle>{t('contact.subtitle')}</Subtitle>
        </Header>

        <Layout
          ref={ref}
          variants={reduce ? undefined : containerVariants}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : inView ? 'show' : 'hidden'}
        >
          <FormCard variants={reduce ? undefined : itemVariants} onSubmit={handleSubmit} noValidate>
            <span className="brk-tr" aria-hidden="true" />
            <span className="brk-bl" aria-hidden="true" />

            <Field>
              <FieldLabel>{t('contact.label_name')}</FieldLabel>
              <Input
                name="name"
                type="text"
                placeholder={t('contact.placeholder_name')}
                required
                autoComplete="name"
              />
            </Field>

            <Field>
              <FieldLabel>{t('contact.label_email')}</FieldLabel>
              <Input
                name="email"
                type="email"
                placeholder={t('contact.placeholder_email')}
                required
                autoComplete="email"
              />
            </Field>

            <Field>
              <FieldLabel>{t('contact.label_message')}</FieldLabel>
              <Textarea name="message" placeholder={t('contact.placeholder_message')} required />
            </Field>

            <Submit type="submit" disabled={sent}>
              {sent ? t('contact.btn_sent') : t('contact.btn_send')}
            </Submit>
            {sent && <Sent>{t('contact.sent_feedback')}</Sent>}
          </FormCard>

          <Side>
            <SideCard variants={reduce ? undefined : itemVariants}>
              <span className="brk-tr" aria-hidden="true" />
              <span className="brk-bl" aria-hidden="true" />
              <SideTitle>{t('contact.side_title')}</SideTitle>
              <SideText>{t('contact.side_text')}</SideText>
              <Links>
                <SocialLink
                  href="https://github.com/rayancmorais"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub · @rayancmorais
                  <Arrow aria-hidden="true">↗</Arrow>
                </SocialLink>
                <SocialLink
                  href="https://www.linkedin.com/in/rayancmorais"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn · Rayan Morais
                  <Arrow aria-hidden="true">↗</Arrow>
                </SocialLink>
                <SocialLink href="mailto:rayan_cm2021@icloud.com">
                  {t('contact.link_email')}
                  <Arrow aria-hidden="true">↗</Arrow>
                </SocialLink>
              </Links>
            </SideCard>
          </Side>
        </Layout>
      </Inner>
    </Section>
  );
}

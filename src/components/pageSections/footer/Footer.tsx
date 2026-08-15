import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { scrollToTop, useSectionNavigation } from '@/hooks/useSectionNavigation';

/* ============================================================================
   Footer — wordmark + nav links + copyright. React + styled-components.
   Tokens via CSS custom properties with hex fallbacks. No new dependencies.
   ========================================================================== */

const NAV_ITEMS = [
  { key: 'nav_work', href: '#work' },
  { key: 'nav_github', href: '#github' },
  { key: 'nav_ecosystem', href: '#ecosystem' },
  { key: 'nav_projects', href: '#projects' },
  { key: 'nav_services', href: '#services' },
  { key: 'nav_contact', href: '#contact' },
] as const;

const Wrap = styled.footer`
  position: relative;
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  padding: 2.6rem clamp(1.2rem, 4vw, 2.6rem);
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
`;

const Wordmark = styled.a`
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;

  span.dot {
    color: var(--cy, #00f5d4);
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
`;

const NavLink = styled.a`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-2, #8b93a7);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--cy, #00f5d4);
  }
`;

const Copy = styled.span`
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  color: var(--fg-4, #545b6b);
  width: 100%;
  text-align: center;
  padding-top: 1.6rem;
  margin-top: 0.4rem;
  border-top: 1px solid var(--border-faint, rgba(255, 255, 255, 0.05));
`;

export function Footer() {
  const { t } = useTranslation('home');
  const goToSection = useSectionNavigation();

  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTop();
  };

  return (
    <Wrap>
      <Inner>
        <Wordmark href="#home" onClick={scrollTop} aria-label={t('footer.aria_top')}>
          RAYAN<span className="dot">.</span>
        </Wordmark>

        <Nav aria-label={t('footer.aria_nav')}>
          {NAV_ITEMS.map(({ key, href }) => (
            <NavLink
              key={href}
              href={href}
              onClick={e => {
                e.preventDefault();
                goToSection(href.slice(1));
              }}
            >
              {t(`footer.${key}`)}
            </NavLink>
          ))}
        </Nav>

        <Copy>{t('footer.copyright', { year: new Date().getFullYear() })}</Copy>
      </Inner>
    </Wrap>
  );
}

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';

const NAV_LINKS = [
  { key: 'ecosystem', href: '#ecosystem' },
  { key: 'selectedWork', href: '#work' },
];

const CV_URLS = {
  ptBR: '/pdf/Rayan_Morais_CV_PT_FullStack.pdf',
  en:   '/pdf/Rayan_Morais_CV_Eng.pdf',
};

export function Navbar() {
  const { t } = useTranslation('navbar');
  const { language, toggleLanguage } = useLanguage();
  const cvUrl = CV_URLS[language];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 66, behavior: 'smooth' });
  };

  return (
    <Nav $scrolled={scrolled}>
      <Inner>
        <Logo href="#">RAYAN<Dot>.</Dot></Logo>

        <Links>
          {NAV_LINKS.map(({ key, href }) => (
            <NavLink key={href} href={href} onClick={(e) => handleNavClick(e, href)}>
              {t(key)}
            </NavLink>
          ))}
        </Links>

        <Controls>
          <LangBtn onClick={toggleLanguage}>
            {language === 'ptBR' ? 'EN' : 'PT'}
          </LangBtn>
          <CtaPill href={cvUrl} download rel="noopener">
            <Download size={13} />
            Download CV
          </CtaPill>
        </Controls>
      </Inner>
    </Nav>
  );
}

const Nav = styled.nav<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-h, 66px);
  background: ${({ $scrolled }) =>
    $scrolled ? 'rgba(13,17,23,0.72)' : 'transparent'};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(18px)' : 'none')};
  -webkit-backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(18px)' : 'none')};
  border-bottom: 1px solid ${({ $scrolled }) =>
    $scrolled ? 'var(--border, rgba(255,255,255,0.08))' : 'transparent'};
  transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
`;

const Inner = styled.div`
  max-width: var(--container, 1200px);
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Logo = styled.a`
  font-family: var(--mono, monospace);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;
  white-space: nowrap;
`;

const Dot = styled.span`
  color: var(--cy, #00e5cc);
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  font-family: var(--mono, monospace);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-2, #8b93a7);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--cy-bright, #5cf3e3);
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LangBtn = styled.button`
  padding: 0 0.75rem;
  height: 32px;
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
  background: transparent;
  color: var(--fg-2, #8b93a7);
  font-family: var(--mono, monospace);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: var(--cy, #00e5cc);
    border-color: var(--cy-50, rgba(0,229,204,0.5));
  }
`;

const CtaPill = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 1.1rem;
  height: 34px;
  background: var(--cy, #00e5cc);
  color: #062b27;
  border-radius: var(--r-chip, 100px);
  font-family: var(--sans, sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: var(--cy-bright, #5cf3e3);
    box-shadow: var(--glow-cy-sm, 0 0 0.6rem rgba(0,229,204,0.45));
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

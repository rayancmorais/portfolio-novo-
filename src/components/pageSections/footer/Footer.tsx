import styled from "styled-components";

/* ============================================================================
   Footer — wordmark + nav links + copyright. React + styled-components.
   Tokens via CSS custom properties with hex fallbacks. No new dependencies.
   ========================================================================== */

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Ecossistema", href: "#ecosystem" },
  { label: "Projetos", href: "#projects" },
  { label: "GitHub", href: "#github" },
  { label: "Serviços", href: "#services" },
  { label: "Contato", href: "#contact" },
];

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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--fg-1, #e6e8ee);
  text-decoration: none;

  span.dot { color: var(--cy, #00f5d4); }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
`;

const NavLink = styled.a`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-2, #8b93a7);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover { color: var(--cy, #00f5d4); }
`;

const Copy = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
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
  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Wrap>
      <Inner>
        <Wordmark href="#home" onClick={scrollTop} aria-label="Rayan — topo">
          RAYAN<span className="dot">.</span>
        </Wordmark>

        <Nav aria-label="Navegação do rodapé">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </Nav>

        <Copy>
          © 2025 Rayan Morais · Construído com React, Vite &amp; styled-components
        </Copy>
      </Inner>
    </Wrap>
  );
}

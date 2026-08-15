import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

/* O rodapé navega para a home quando a âncora não existe na rota atual, então
   precisa de contexto de Router. */
const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'footer.aria_top': 'Rayan — back to top',
        'footer.aria_nav': 'Footer navigation',
        'footer.nav_work': 'Case studies',
        'footer.nav_ecosystem': 'Ecosystem',
        'footer.nav_projects': 'Projects',
        'footer.nav_github': 'GitHub',
        'footer.nav_services': 'Services',
        'footer.nav_contact': 'Contact',
        'footer.copyright': '© {{year}} Rayan Morais · Built with React, Vite & styled-components',
      };
      const template = map[key] ?? key;
      return template.replace(/{{(\w+)}}/g, (_, name) => String(options?.[name] ?? ''));
    },
  }),
}));

describe('Footer', () => {
  it('renders "Rayan Morais" in the copyright', () => {
    renderFooter();
    expect(screen.getByText(/Rayan Morais/)).toBeInTheDocument();
  });

  it('renders the current copyright year', () => {
    renderFooter();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderFooter();
    expect(screen.getByText('Case studies')).toBeInTheDocument();
    expect(screen.getByText('Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});

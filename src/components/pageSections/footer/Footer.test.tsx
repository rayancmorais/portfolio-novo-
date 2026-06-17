import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'footer.aria_top': 'Rayan — back to top',
        'footer.aria_nav': 'Footer navigation',
        'footer.nav_ecosystem': 'Ecosystem',
        'footer.nav_projects': 'Projects',
        'footer.nav_github': 'GitHub',
        'footer.nav_services': 'Services',
        'footer.nav_contact': 'Contact',
        'footer.copyright': '© 2025 Rayan Morais · Built with React, Vite & styled-components',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('Footer', () => {
  it('renders "Rayan Morais" in the copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/Rayan Morais/)).toBeInTheDocument();
  });

  it('renders the copyright year', () => {
    render(<Footer />);
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CommandPalette } from '@/components/commandPalette/CommandPalette';

interface CommandPaletteContextValue {
  open: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

/**
 * Dono do estado da paleta e do atalho global ⌘K / Ctrl+K. Precisa ficar dentro
 * do Router: os comandos navegam entre rotas.
 */
export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(current => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <AnimatePresence>{isOpen && <CommandPalette onClose={close} />}</AnimatePresence>
    </CommandPaletteContext.Provider>
  );
}

// hooks de contexto exportados junto com o Provider é padrão React
// eslint-disable-next-line react-refresh/only-export-components
export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used inside CommandPaletteProvider');
  return ctx;
}

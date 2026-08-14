import { useEffect, useState } from 'react';

/**
 * Só mostra o loader se o carregamento passar deste tempo. Abaixo disso a
 * pessoa vai direto ao conteúdo, sem ver piscada. Atrasa o loader, nunca o
 * conteúdo.
 */
const LOADER_APPEARANCE_DELAY_MS = 200;

interface PageLoadingState {
  ready: boolean;
  showLoader: boolean;
}

/**
 * Liga o loader ao carregamento real da página, sem duração própria: ele existe
 * apenas enquanto o `load` do browser não terminou e some no instante em que
 * termina. Volta pronto de cara quando a página vem do cache ou de navegação
 * de volta.
 */
export function usePageLoading(): PageLoadingState {
  const [ready, setReady] = useState(() => document.readyState === 'complete');
  const [pastAppearanceDelay, setPastAppearanceDelay] = useState(false);

  useEffect(() => {
    if (ready) return;

    const handleLoad = () => setReady(true);
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [ready]);

  useEffect(() => {
    if (ready) return;

    const timer = setTimeout(() => setPastAppearanceDelay(true), LOADER_APPEARANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  return { ready, showLoader: !ready && pastAppearanceDelay };
}

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { LoadingScreen } from '@/components/pageSections/loadingScreen/LoadingScreen';
import { Home } from '@/pages/Home';
import { useLenis } from '@/hooks/useLenis';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useIdleReady } from '@/hooks/useIdleReady';
import { CommandPaletteProvider } from '@/contexts/CommandPaletteContext';

/* Fora da home: só baixa quando alguém abre um estudo de caso. */
const CaseStudyPage = lazy(() =>
  import('@/pages/CaseStudyPage').then(m => ({ default: m.CaseStudyPage }))
);

/* O fundo carrega three + @react-three/fiber: 235 KB gzip, mais que o resto do
   site somado. Sendo decoração, fica fora do caminho crítico duas vezes — é um
   chunk à parte e o import só dispara quando o navegador fica ocioso, então
   nunca disputa banda com o conteúdo. Vale em qualquer tamanho de tela. */
const SpaceScene = lazy(() =>
  import('@/components/pageSections/introSection/SpaceScene').then(m => ({
    default: m.SpaceScene,
  }))
);

export default function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const { showLoader } = usePageLoading();
  const backgroundReady = useIdleReady();

  useLenis();

  return (
    <>
      {backgroundReady && (
        <Suspense fallback={null}>
          <SpaceScene reduced={reducedMotion} />
        </Suspense>
      )}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background: 'rgba(9, 12, 20, 0.34)',
        }}
      />
      <LoadingScreen visible={showLoader} />
      <CommandPaletteProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/case/:slug" element={<CaseStudyPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </CommandPaletteProvider>
    </>
  );
}

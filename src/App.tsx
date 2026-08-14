import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { SpaceScene } from '@/components/pageSections/introSection/SpaceScene';
import { LoadingScreen } from '@/components/pageSections/loadingScreen/LoadingScreen';
import { Home } from '@/pages/Home';
import { useLenis } from '@/hooks/useLenis';
import { usePageLoading } from '@/hooks/usePageLoading';

/* Fora da home: só baixa quando alguém abre um estudo de caso. */
const CaseStudyPage = lazy(() =>
  import('@/pages/CaseStudyPage').then(m => ({ default: m.CaseStudyPage }))
);

export default function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const { showLoader } = usePageLoading();

  useLenis();

  return (
    <>
      <SpaceScene reduced={reducedMotion} />
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
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/case/:slug" element={<CaseStudyPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </>
  );
}

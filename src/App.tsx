import { useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { SpaceScene } from '@/components/pageSections/introSection/SpaceScene';
import { LoadingScreen } from '@/components/pageSections/loadingScreen/LoadingScreen';
import { Navbar } from '@/components/pageSections/navbar/Navbar';
import { IntroSection } from '@/components/pageSections/introSection/IntroSection';
import { TechStack } from '@/components/pageSections/techStack/TechStack';
import { CaseStudies } from '@/components/pageSections/caseStudies/CaseStudies';
import { Projects } from '@/components/pageSections/projects/Projects';
import { GitHubStats } from '@/components/pageSections/githubStats/GitHubStats';
import { Services } from '@/components/pageSections/services/Services';
import { Testimonials } from '@/components/pageSections/testimonialsSection/Testimonials';
import { Contact } from '@/components/pageSections/contact/Contact';
import { Footer } from '@/components/pageSections/footer/Footer';
import { useLenis } from '@/hooks/useLenis';

export default function App() {
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion() ?? false;

  useLenis();

  const handleLoadingFinish = useCallback(() => {
    setLoading(false);
  }, []);

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
      {loading && <LoadingScreen onFinish={handleLoadingFinish} />}
      {!loading && (
        <>
          <Navbar />
          <main>
            <IntroSection />
            <TechStack />
            <CaseStudies />
            <Projects />
            <GitHubStats />
            <Services />
            <Testimonials />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}

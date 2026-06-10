import { useCallback, useState } from 'react';
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

  useLenis();

  const handleLoadingFinish = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
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

import { Navbar } from '@/components/pageSections/navbar/Navbar';
import { IntroSection } from '@/components/pageSections/introSection/IntroSection';
import { TechStack } from '@/components/pageSections/techStack/TechStack';
import { CaseStudies } from '@/components/pageSections/caseStudies/CaseStudies';
import { Projects } from '@/components/pageSections/projects/Projects';
import { GitHubStats } from '@/components/pageSections/githubStats/GitHubStats';
import { Services } from '@/components/pageSections/services/Services';
import { Contact } from '@/components/pageSections/contact/Contact';
import { Footer } from '@/components/pageSections/footer/Footer';

export function Home() {
  return (
    <>
      <Navbar />
      <main>
        <IntroSection />
        <CaseStudies />
        <GitHubStats />
        <TechStack />
        <Projects />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

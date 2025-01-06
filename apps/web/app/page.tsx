import { CTASection } from '@/components/pages/home/cta';
import { FeaturesSection } from '@/components/pages/home/features';
import { HeroSection } from '@/components/pages/home/hero';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}

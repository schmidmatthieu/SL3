import { CTASection } from '@/components/sections/cta';
import { FeaturesSection } from '@/components/sections/features';
import { HeroSection } from '@/components/sections/hero';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}

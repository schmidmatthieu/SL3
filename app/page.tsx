import { HeroSection } from '@/components/sections/hero';
import { FeaturesSection } from '@/components/sections/features';
import { CTASection } from '@/components/sections/cta';

export default function Home() {
  return (
    <main className="relative">
      <div className="responsive-container">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </main>
  );
}
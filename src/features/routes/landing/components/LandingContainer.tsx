'use client';

import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { AppPreviewSection } from './AppPreviewSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export const LandingContainer = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white'>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <AppPreviewSection />
      <CTASection />
      <Footer />
    </div>
  );
};

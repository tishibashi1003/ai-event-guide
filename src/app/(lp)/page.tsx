import {
  Header,
  HeroSection,
  FeaturesSection,
  AppPreviewSection,
  CTASection,
  Footer,
} from '@/features/routes/landing/components';

export default function LandingPage() {
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
}

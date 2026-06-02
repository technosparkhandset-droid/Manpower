import React from 'react';
import HeroSection from '../components/home/HeroSection';
import PlatformActivityStats from '../components/home/PlatformActivityStats';
import HowItWorks from '../components/home/HowItWorks';
import TrustedCategories from '../components/home/TrustedCategories';
import SpecialistZone from '../components/home/SpecialistZone';
import MerchantHub from '../components/home/MerchantHub';
import ContactBusiness from '../components/home/ContactBusiness';
import RealTimeVisitorBadge from '../components/home/RealTimeVisitorBadge';
import { MessageSquare } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <HeroSection />
      
      {/* Platform Real-Time Activity & Stats Widgets (Synced with Database counts) */}
      <PlatformActivityStats />

      {/* Guide: How it Works? Step grid */}
      <HowItWorks />

      <TrustedCategories />
      <SpecialistZone />
      <MerchantHub />

      {/* Contact & Support Channels + Business Digitalization banner */}
      <ContactBusiness />

      {/* Floating Real-Time Live Visitor Badge */}
      <RealTimeVisitorBadge />

      {/* Floating 1-Click WhatsApp Support */}
      <a
        href="https://wa.me/8801717968098?text=Hello%20Admin%2C%20I%20am%20contacting%20you%20from%20the%20Smart%20Verified%20Manpower%20Platform%20hotline."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center animate-bounce duration-1000 group hover:scale-105 active:scale-95 border-2 border-white dark:border-slate-800"
        title="Admin WhatsApp Support Hotline"
        id="floating-whatsapp-btn"
      >
        <MessageSquare className="w-6 h-6 fill-current text-white shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-black text-xs uppercase tracking-wider text-white pl-0 group-hover:pl-2 whitespace-nowrap">
          Support Hotline
        </span>
      </a>
    </div>
  );
};

export default HomePage;

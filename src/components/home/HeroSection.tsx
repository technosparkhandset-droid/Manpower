import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Briefcase, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const statBadges = [
    { icon: Users, label: t('hero.statsWorkers'), color: 'bg-blue-100/10 text-blue-100' },
    { icon: Briefcase, label: t('hero.statsEmployers'), color: 'bg-blue-100/10 text-blue-100' },
    { icon: Star, label: t('hero.statsJobs'), color: 'bg-blue-100/10 text-blue-100' }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 py-16 sm:py-24" id="hero-section">
      
      {/* Dynamic Grid Background Overlay mimicking Bento Grid blueprint */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#4f46e5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Pulsing Accent Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-lg border border-blue-500/20 mb-4">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span>Verified Node Connection</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight mb-4 animate-fade-in font-bangla">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-semibold">
          {t('hero.subtitle')}
        </p>

        {/* Search Bar Section - Striking, Much Larger and Highlighted inside a glowing bento-box container */}
        <div className="my-10 p-1 rounded-[28px] bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 shadow-2xl max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
          <div className="rounded-[24px] bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-inner">
            
            {/* Highly Eye-Catching Bangla Headline inside search compartment */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-bangla">
                {t('common.toggleLang') === 'English' ? 'কর্মী বা দক্ষতার অনুসন্ধান' : 'Find Your Specialized Service Worker'}
              </h3>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500 animate-pulse" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 sm:py-5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-gray-800 text-sm sm:text-base font-bold rounded-2xl text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-4 focus:ring-orange-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl transition-all duration-300 focus:outline-none shrink-0 active:scale-95 cursor-pointer shadow-xl shadow-orange-500/30 border-b-4 border-red-800/40"
              >
                🔍 {t('hero.searchBtn')}
              </button>
            </form>

            {/* Popular Shortcut Search Pills to grab immediate attention and boost click-through */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs">
              <span className="font-extrabold text-neutral-400 dark:text-neutral-500 text-[10px] uppercase tracking-wider">
                {t('common.toggleLang') === 'English' ? 'জনপ্রিয় খুঁজুন:' : 'Fast Keywords:'}
              </span>
              {[
                { label: 'ইলেকট্রিশিয়ান', value: 'electrician' },
                { label: 'ডাক্তার', value: 'doctor' },
                { label: 'ঠিকাদার', value: 'contractor' },
                { label: 'মুদি দোকান', value: 'grocery_retail' },
                { label: 'রাজমিস্ত্রি', value: 'construction' }
              ].map((shortcut) => (
                <button
                  key={shortcut.value}
                  type="button"
                  onClick={() => {
                    setQuery(shortcut.label);
                    navigate(`/workers?search=${encodeURIComponent(shortcut.label)}`);
                  }}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/35 dark:border-orange-900/40 rounded-xl font-bold font-bangla tracking-wide transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  #{shortcut.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Counters / Stats - Bento Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {statBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-gray-500/5 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{badge.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default HeroSection;

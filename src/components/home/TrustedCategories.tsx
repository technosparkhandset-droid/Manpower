import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Zap, Home, Briefcase, ShieldAlert, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TrustedCategories: React.FC = () => {
  const { t } = useLanguage();

  const categories = [
    {
      key: 'construction',
      icon: HardHat,
      color: 'bg-orange-500',
      tag: 'construction',
      hoverBorder: 'hover:border-orange-500'
    },
    {
      key: 'electrical',
      icon: Zap,
      color: 'bg-yellow-500',
      tag: 'electrician',
      hoverBorder: 'hover:border-yellow-500'
    },
    {
      key: 'household',
      icon: Home,
      color: 'bg-emerald-500',
      tag: 'cleaning_services',
      hoverBorder: 'hover:border-emerald-500'
    },
    {
      key: 'officeSupport',
      icon: Briefcase,
      color: 'bg-indigo-500',
      tag: 'office_support',
      hoverBorder: 'hover:border-indigo-500'
    },
    {
      key: 'emergency',
      icon: ShieldAlert,
      color: 'bg-red-500',
      tag: 'emergency_services',
      hoverBorder: 'hover:border-red-500'
    },
    {
      key: 'training',
      icon: GraduationCap,
      color: 'bg-teal-500',
      tag: 'training_development',
      hoverBorder: 'hover:border-teal-500'
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-905 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800" id="trusted-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-2.5 py-1 text-[10px] font-black tracking-widest text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2 uppercase border border-blue-100/35 dark:border-blue-800/35">
            Core Trade Fields
          </span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-bangla mb-1.5 md:text-3xl">
            {t('categories.sectionTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-lg mx-auto">
            {t('categories.sectionSub')}
          </p>
        </div>

        {/* Categories Grid - Bento Grid Arrangement */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.key}
                to={`/workers?category=${c.tag}`}
                className={`flex flex-col items-center justify-center p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bento-card-glow group ${c.hoverBorder || ''} hover:border-2`}
              >
                <div className={`w-11 h-11 rounded-xl ${c.color} text-white flex items-center justify-center mb-3 shadow shadow-blue-500/10 transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-black text-gray-850 dark:text-gray-200 text-center leading-snug font-bangla">
                  {t(`categories.${c.key}`)}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default TrustedCategories;

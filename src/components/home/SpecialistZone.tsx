import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Smile, Ruler, Building } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SpecialistZone: React.FC = () => {
  const { t } = useLanguage();

  const specialistsList = [
    {
      key: 'generalPhysician',
      icon: Stethoscope,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30',
      tag: 'general_physician'
    },
    {
      key: 'dentist',
      icon: Smile,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30',
      tag: 'dentist_specialist'
    },
    {
      key: 'civilEngineer',
      icon: Ruler,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
      tag: 'civil_engineer'
    },
    {
      key: 'contractor',
      icon: Building,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
      tag: 'construction'
    }
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-905 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800" id="specialist-zone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-2.5 py-1 text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2 uppercase border border-blue-100/35 dark:border-blue-800/35">
            {t('specialists.sectionTitle')}
          </span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-bangla mb-1.5 md:text-3xl">
            {t('specialists.sectionTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-lg mx-auto">
            {t('specialists.sectionSub')}
          </p>
        </div>

        {/* Specialists Grid - Bento-style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {specialistsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`p-6 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center shadow-sm hover:shadow-lg bento-card-glow transition-all duration-300 min-h-[190px]`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner mb-4 ${item.color} transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-gray-950 dark:text-white mb-1 font-bangla">
                    {t(`specialists.${item.key}`)}
                  </h3>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase mb-4">
                    Professional
                  </span>
                </div>
                
                <Link
                  to={`/workers?category=${item.tag}`}
                  className="w-full text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all border border-blue-100 dark:border-blue-900/35"
                >
                  {t('common.viewAll')}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SpecialistZone;

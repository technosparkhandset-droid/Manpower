import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Pill, Compass } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MerchantHub: React.FC = () => {
  const { t, isBN } = useLanguage();

  const businessCards = [
    {
      key: 'grocery',
      icon: ShoppingBag,
      gradient: 'from-emerald-400 to-teal-600',
      tag: 'grocery_retail',
      descBN: 'নিত্যপ্রয়োজনীয় মুদি ও স্টোর সামগ্রী',
      descEN: 'Daily household grocery and retail services'
    },
    {
      key: 'pharmacy',
      icon: Pill,
      gradient: 'from-blue-400 to-indigo-600',
      tag: 'pharmacy_medicine',
      descBN: 'জরুরি ওষুধ ও ফার্মা সেবা২৪ ঘণ্টা উন্মুক্ত',
      descEN: 'Prescribed medicines and medical goods'
    },
    {
      key: 'landServices',
      icon: Compass,
      gradient: 'from-amber-400 to-orange-600',
      tag: 'land_services',
      descBN: 'জমি রেজিষ্ট্রেশন, জরিপ ও দলিল লেখক',
      descEN: 'Land deeds, surveys, and local transfers representation'
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-905 transition-colors duration-350 border-b border-gray-100 dark:border-gray-800" id="merchant-hub-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-2.5 py-1 text-[10px] font-black tracking-widest text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2 uppercase border border-blue-100/35 dark:border-blue-800/35">
            Merchant & Corporate Hub
          </span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-bangla mb-1.5 md:text-3xl">
            {t('merchants.sectionTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-lg mx-auto">
            {t('merchants.sectionSub')}
          </p>
        </div>

        {/* Business Grid - Interactive Bento Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businessCards.map((b) => {
            const Icon = b.icon;
            return (
              <Link
                key={b.key}
                to={`/workers?category=${b.tag}`}
                className="group relative overflow-hidden rounded-2xl p-6 bg-slate-900 border border-slate-800 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[170px] flex flex-col justify-between bento-card-glow"
              >
                {/* Background overlay gradient - Bento Accent Color */}
                <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />

                {/* Glass effect container */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3.5 border border-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-black tracking-tight mb-1 font-bangla text-white">
                    {t(`merchants.${b.key}`)}
                  </h3>
                  <p className="text-[11px] text-white/80 font-medium leading-relaxed font-bangla">
                    {isBN ? b.descBN : b.descEN}
                  </p>
                </div>

                <div className="relative flex items-center justify-between text-white/90 text-xs font-black pt-4 border-t border-white/10 mt-4 uppercase tracking-wider">
                  <span>{t('common.viewAll')}</span>
                  <span className="translate-x-0 group-hover:translate-x-1.5 transition-all">➔</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default MerchantHub;

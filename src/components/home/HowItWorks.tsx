import React from 'react';
import { UserPlus, ToggleLeft, Search, PhoneCall, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HowItWorks: React.FC = () => {
  const { isBN } = useLanguage();

  const steps = [
    {
      num: '১',
      numEN: '1',
      icon: UserPlus,
      titleBN: 'কর্মী নিবন্ধন',
      titleEN: 'Worker Registration',
      subtitleBN: 'প্রোফাইল তৈরি',
      subtitleEN: 'Create profile',
      borderColor: 'border-blue-200 dark:border-blue-900',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400',
    },
    {
      num: '২',
      numEN: '2',
      icon: ToggleLeft,
      titleBN: 'তথ্য যাচাই',
      titleEN: 'Info Verification',
      subtitleBN: 'NID ভেরিফিকেশন',
      subtitleEN: 'NID Verification',
      borderColor: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400',
    },
    {
      num: '৩',
      numEN: '3',
      icon: Search,
      titleBN: 'কাজ খোঁজা',
      titleEN: 'Search for Work',
      subtitleBN: 'পছন্দের কাজ শুরু',
      subtitleEN: 'Start preferred jobs',
      borderColor: 'border-amber-200 dark:border-amber-900',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400',
    },
    {
      num: '৪',
      numEN: '4',
      icon: PhoneCall,
      titleBN: 'যোগাযোগ',
      titleEN: 'Get in Touch',
      subtitleBN: 'সহজ কানেক্টিভিটি',
      subtitleEN: 'Easy connectivity',
      borderColor: 'border-[#14b8a6]/20',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400',
    },
    {
      num: '৫',
      numEN: '5',
      icon: CheckSquare,
      titleBN: 'কাজ সম্পন্ন',
      titleEN: 'Jobs Completed',
      subtitleBN: 'রেটিং ও ফিডব্যাক',
      subtitleEN: 'Rating & Feedback',
      borderColor: 'border-emerald-200 dark:border-emerald-900',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400',
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-905 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800" id="how-it-works-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded mb-3 uppercase">
            Operating System
          </span>
          <h2 className="text-3xl font-black text-slate-905 dark:text-white font-bangla tracking-tight mb-2 md:text-4xl">
            {isBN ? 'কিভাবে কাজ করে?' : 'How It Works?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-semibold font-bangla">
            {isBN 
              ? 'খুব সহজে দক্ষ কর্মী খুঁজে পাওয়া এবং কাজ শুরু করার একটি সুশৃঙ্খল ডিজিটাল ধাপসমূহ।' 
              : 'Seamlessly find skilled manpower and start tasks in a few structural digital steps.'}
          </p>
        </div>

        {/* Steps Grid displaying the cards formatted as in Screenshot 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((st, sIdx) => {
            const IconComponent = st.icon;
            return (
              <div
                key={sIdx}
                className={`p-6 bg-white dark:bg-gray-850 rounded-3xl border ${st.borderColor} flex flex-col justify-between items-center text-center shadow-xs transition-transform duration-300 hover:-translate-y-1 hover:shadow-md bento-card-glow ${sIdx === 4 ? 'col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Visual Step bubble digit */}
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-bangla mb-4">
                  {isBN ? st.num : st.numEN}
                </div>

                {/* Styled icon box */}
                <div className={`p-3 rounded-2xl mb-4 ${st.badgeBg} flex items-center justify-center border border-current/5`}>
                  <IconComponent className="w-6 h-6 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white font-bangla tracking-wide">
                    {isBN ? st.titleBN : st.titleEN}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold font-bangla">
                    {isBN ? st.subtitleBN : st.subtitleEN}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;

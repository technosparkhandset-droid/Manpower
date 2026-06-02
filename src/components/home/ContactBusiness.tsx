import React from 'react';
import { Phone, MessageSquare, ArrowRight, ShieldCheck, Landmark } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const ContactBusiness: React.FC = () => {
  const { isBN } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-905 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800" id="contact-business-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Quick Support & Contact Details */}
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest text-[#d97706] bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-500/10 uppercase">
              Quick Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-909 dark:text-white tracking-tight leading-tight font-bangla">
              {isBN ? 'আমাদের সাথে যোগাযোগ করুন' : 'Contact Support & Help'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed font-bangla">
              {isBN 
                ? 'যেকোনো প্রশ্ন বা সহযোগিতার জন্য সরাসরি কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ পাঠান। আমরা ২৪/৭ আপনাদের সেবায় নিয়োজিত।' 
                : 'For any queries, collaboration, or instant support, call us directly or post a message over our verified WhatsApp desk.'}
            </p>

            {/* Support cards list */}
            <div className="space-y-4 pt-2">
              
              {/* Card 1: Direct Call */}
              <a
                href="tel:+8801733777473"
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all group hover:scale-[1.01]"
              >
                <div className="p-3.5 rounded-xl bg-zinc-900 group-hover:bg-amber-500 text-white shrink-0 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">
                    {isBN ? 'সকাল ৯টা - রাত ৯টা (সরাসরি কল)' : '9:00 AM - 9:00 PM (Direct Line)'}
                  </span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-wider">
                    ০১৭৩৩-৭৭৭৪৭৩
                  </span>
                </div>
              </a>

              {/* Card 2: WhatsApp Chat */}
              <a
                href="https://wa.me/8801717968098?text=Hello%20Admin%2C%20I%20am%20contacting%20you%20from%20the%20Smart%20Verified%20Manpower%20Platform%20hotline."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all group hover:scale-[1.01]"
              >
                <div className="p-3.5 rounded-xl bg-zinc-900 group-hover:bg-emerald-500 text-white shrink-0 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">
                    {isBN ? '২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট' : '24/7 WhatsApp Hotline'}
                  </span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-wider">
                    ০১৭১৭-৯৬৮০৯৮
                  </span>
                </div>
              </a>

            </div>
          </div>

          {/* Right Column: Digitalize Your Business Preview Mockup card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white dark:bg-gray-850 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden bento-card-glow flex flex-col justify-between min-h-[360px]">
              
              <div>
                {/* Badge decoration */}
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-orange-500 flex items-center justify-center border border-orange-100 dark:border-orange-900/10 mb-6 shadow-inner">
                  <Landmark className="w-5 h-5" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-snug font-bangla mb-4">
                  {isBN ? 'আপনার ব্যবসা ডিজিটালাইজ করুন' : 'Digitalize Your Local Business'}
                </h3>
                
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed font-bangla mb-8">
                  {isBN 
                    ? 'আমাদের বিশেষজ্ঞ কন্ট্রাক্টর টিমের সাথে যুক্ত হয়ে আপনার প্রজেক্ট পরিচালনা করুন স্মার্টলি। দক্ষ জনবল নিয়োগ এখন আগের চেয়েও সহজ।' 
                    : 'Partner up with our expert contractor squad to handle projects, recruit local workers effortlessly, and scale your merchant trade.'}
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-gray-100 font-black text-[10px] sm:text-xs tracking-widest uppercase transition-all rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-lg active:ring active:ring-slate-400/20"
                >
                  <span>{isBN ? 'মার্চেন্ট হিসাবে যুক্ত হোন' : 'Join as Merchant'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SECURE PARTNERSHIP PROGRAM</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactBusiness;

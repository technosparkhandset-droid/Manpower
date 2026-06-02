import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 transition-colors duration-300" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">MH</span>
              </div>
              <span className="text-white font-extrabold text-md tracking-tight">
                {t('nav.siteName')}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Office Address */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{t('footer.office')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+88 01717968098</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>support@manpowerhub.com</span>
              </li>
            </ul>
          </div>

          {/* Social Platforms / Links */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg border border-gray-700/50 cursor-pointer">
                Facebook
              </span>
              <span className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg border border-gray-700/50 cursor-pointer">
                WhatsApp Live
              </span>
              <span className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg border border-gray-700/50 cursor-pointer">
                Ecosystem
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed pt-2">
              কুষ্টিয়া ও খুলনা ভিত্তিক ডিজিটাল ম্যাচমেকার প্ল্যাটফর্ম। দ্রুত সেবা পেতে আমাদের সাথে সংযুক্ত থাকুন।
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-850 mt-10 pt-6 text-center">
          <p className="text-[10px] text-gray-500 hover:text-gray-400 transition-colors">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

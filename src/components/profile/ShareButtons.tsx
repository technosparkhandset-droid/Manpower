import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ShareButtonsProps {
  slug: string;
  fullName: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ slug, fullName }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/#/workers?profile=${slug}`;

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/profiles/${slug}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
    } catch (e) {
      // silent catch
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      trackShare('native');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareFacebook = () => {
    trackShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareWhatsApp = () => {
    trackShare('whatsapp');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${fullName} এর ডিজিটাল প্রোফাইল কার্ড দেখুন: ${profileUrl}`)}`, '_blank');
  };

  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800" id="share-buttons-control">
      <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
        <Share2 className="w-3.5 h-3.5 text-blue-500" />
        <span>{t('share.label')}</span>
      </h3>
      
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border
            ${copied 
              ? 'bg-emerald-500 text-white border-emerald-500' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {copied ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? t('share.copied') : t('share.copyLink')}</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareFacebook}
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/15 text-[#1877F2] transition-colors border border-[#1877F2]/20 cursor-pointer"
        >
          <span>Facebook</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/15 text-[#25D366] transition-colors border border-[#25D366]/20 cursor-pointer"
        >
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;

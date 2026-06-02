import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeToggleProps {
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
      title={isDark ? t('common.lightMode') : t('common.darkMode')}
      className={`
        relative inline-flex items-center gap-2 rounded-full font-semibold
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${compact
          ? 'p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'px-3.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750'
        }
        text-gray-700 dark:text-gray-300
      `}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600" />
        )}
      </span>
      {!compact && (
        <span className="hidden sm:inline">
          {isDark ? t('common.lightMode') : t('common.darkMode')}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

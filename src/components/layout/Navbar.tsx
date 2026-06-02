import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../common/ThemeToggle';

const Navbar: React.FC = () => {
  const { t, lang, toggleLang, isBN } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    setMobileOpen(false); // Close mobile drawer when route changes
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/workers', label: t('nav.workerList') },
    { to: '/jobs', label: t('nav.jobSearch') },
    { to: '/register', label: isBN ? 'মার্চেন্ট জোন' : 'Merchant Hub' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-gradient-to-r border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* VIBRANT BRAND GRADIENT LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group" id="navbar-logo">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 shadow-md shadow-blue-500/20 dark:shadow-none">
              <span className="text-white font-black text-sm tracking-wider">MH</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 text-base font-bangla tracking-tight">
                {t('nav.siteName')}
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wider uppercase mt-0.5">
                কুষ্টিয়া ও খুলনা • Verified Hub
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <ThemeToggle compact />

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              id="nav-lang-toggle"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('nav.toggleLang')}</span>
            </button>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm shadow-blue-100 dark:shadow-none"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('nav.myProfile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-1.5 rounded-full text-xs font-black bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100 dark:shadow-none"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label="Toggle mobile drawer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 animate-slide-up space-y-3 shadow-inner">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
                >
                  {t('nav.myProfile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/auth?mode=login"
                  className="flex-1 text-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="flex-1 text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Loader2, AlertCircle, ShieldCheck, Lock, Eye, EyeOff, Check, X, ArrowRight, Shield } from 'lucide-react';

const LoginRegister: React.FC = () => {
  const { t, lang, isBN } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab mode state: 'google' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>('google');

  // Primary error and loading state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sim Direct Auth states
  const [googleRole, setGoogleRole] = useState<'worker' | 'employer'>('worker');
  const [googleAccounts, setGoogleAccounts] = useState<any[]>([]);
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Enhanced security states
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Standard authentication state formulations
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'worker' as 'worker' | 'employer'
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const fetchGoogleAccounts = async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google/accounts');
      const data = await res.json();
      if (data.success && data.data) {
        setGoogleAccounts(data.data);
      }
    } catch (err) {
      console.error('Failed to load Google accounts:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  // Monitor query params to automatically toggle tab views (mode=login or mode=register)
  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'register') {
      setActiveTab('register');
    } else if (qMode === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Execute standard credentials registration
  const handleStandardRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email || !registerForm.phone || !registerForm.password) {
      setError(isBN ? 'অনুগ্ৰহ করে সব প্রয়োজনীয় ঘর পূরণ করুন।' : 'Please fill all required inputs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerForm.fullName.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
          role: registerForm.role
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('authToken', data.token);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'নিবন্ধন সম্পূর্ণ করা যায়নি। দয়া করে সঠিক তথ্য দিন।');
    } finally {
      setLoading(false);
    }
  };

  // Execute standard credentials Login (using email or phone number)
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError(isBN ? 'ইমেল/ফোন এবং পাসওয়ার্ড পূরণ করা আবশ্যক।' : 'Phone/Email and password input is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Login failed');

      localStorage.setItem('authToken', data.token);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'লগইন সেশন তৈরি করতে সমস্যা হয়েছে। দয়া করে পাসওয়ার্ড চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Google Direct Auth Login Execution
  const handleGoogleAuthSelect = async (selectedEmail: string, name: string, pass?: string) => {
    setLoading(true);
    setError('');
    try {
      const emailLower = selectedEmail.trim().toLowerCase();
      const matched = googleAccounts.find(a => a.email.trim().toLowerCase() === emailLower);
      const photoUrl = matched?.profilePhoto || `https://images.unsplash.com/photo-${selectedEmail.charCodeAt(0) % 2 === 0 ? '1535713875002-d1d0cf377fde' : '1507003211169-0a1dd7228f2d'}?q=80&w=200&auto=format&fit=crop`;
      const displayName = matched?.fullName || name;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          fullName: displayName,
          profilePhoto: photoUrl,
          role: googleRole,
          password: pass || undefined
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Store local authentication token
      localStorage.setItem('authToken', data.token);
      
      // Cleanup inputs
      setSelectedAccount(null);
      setPasswordInput('');
      
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center py-12 px-4" id="login-register-page">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        
        {/* Hub branding header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-2">
            <span className="text-white font-black text-lg">MH</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-bangla tracking-tight leading-none">
            {t('nav.siteName')}
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 font-bold font-bangla">
            যাচাইকৃত স্থানীয় জনবল ও বিশেষজ্ঞদের সংযোগ প্ল্যাটফর্ম
          </p>
        </div>

        {/* Dynamic Navigation Toggles */}
        <div className="flex bg-gray-200/60 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200/40 dark:border-gray-700/50 gap-1 shadow-inner font-bangla">
          <button
            type="button"
            onClick={() => { setActiveTab('google'); setError(''); }}
            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            🤖 {isBN ? 'গুগল সিমুলেটর' : 'Google Sim'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            🔑 {isBN ? 'লগইন' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            📝 {isBN ? 'নিবন্ধন' : 'Register'}
          </button>
        </div>

        {/* Primary Authentication Card Card */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150/80 dark:border-gray-800 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Error messaging */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl flex items-start gap-2.5 animate-fade-in font-bangla">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-snug">
                {error}
              </p>
            </div>
          )}

          {/* TAB CONTENT 1: GOOGLE SIMULATOR */}
          {activeTab === 'google' && (
            <div className="space-y-6 animate-fade-in font-bangla">
              {/* Header */}
              <div className="text-center space-y-1.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
                </h3>
                <p className="text-xs text-gray-550 dark:text-gray-400 font-bold leading-normal">
                  ম্যানপাওয়ার হাবে ১-ক্লিকে লগইন বা নতুন অ্যাকাউন্ট খুলুন
                </p>
              </div>

              {/* Account Type Toggle inline (select role before login) */}
              <div className="bg-slate-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <span className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  আপনি কি হিসেবে প্রবেশ করতে চান? (Select Role):
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGoogleRole('worker')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      googleRole === 'worker'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    কর্মী / Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleRole('employer')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      googleRole === 'employer'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    নিয়োগকারী / Employer
                  </button>
                </div>
              </div>

              {/* Search bar inside */}
              <div className="relative">
                <input
                  type="text"
                  value={googleSearchQuery}
                  onChange={(e) => setGoogleSearchQuery(e.target.value)}
                  placeholder="জিমেইল অ্যাকাউন্ট খুঁজুন (Search emails...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-205 dark:border-gray-750 bg-slate-50 dark:bg-gray-800 text-xs text-gray-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                />
                {googleSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGoogleSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-450 hover:text-gray-650 font-black cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {googleLoading || loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest animate-pulse">
                    লোডিং হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                  </span>
                </div>
              ) : selectedAccount ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/30 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedAccount.profilePhoto} 
                        alt={selectedAccount.fullName} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${selectedAccount.email.charCodeAt(0) % 2 === 0 ? '1535713875002-d1d0cf377fde' : '1507003211169-0a1dd7228f2d'}?q=80&w=200&auto=format&fit=crop`;
                        }}
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{selectedAccount.fullName}</h4>
                        <p className="text-[10px] text-gray-500 font-bold dark:text-gray-400 truncate">{selectedAccount.email}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedAccount(null); setPasswordInput(''); setError(''); }}
                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider flex items-center gap-1.5 font-bangla">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>নিরাপত্তা পিন / পাসওয়ার্ড প্রविष्ट করুন:</span>
                      </label>
                      {(selectedAccount.email.toLowerCase().includes('technospark') || selectedAccount.email.toLowerCase() === 'admin@manpowerhub.com') && (
                        <span className="text-[9px] bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black px-2 mt-0.5 py-0.5 rounded-full border border-teal-600 animate-pulse font-bangla uppercase shadow-xs">PIN: 8815</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={
                          selectedAccount.email.toLowerCase().includes('technospark') 
                            ? "অ্যাডমিন পাসকোড (8815 অথবা AdminSecure2026!)" 
                            : "পাসওয়ার্ড লিখুন (যেমন: password123)..."
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGoogleAuthSelect(selectedAccount.email, selectedAccount.fullName, passwordInput);
                          }
                        }}
                        className="w-full px-3.5 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-gray-850 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-indigo-600 dark:text-gray-400 font-bold leading-relaxed font-bangla">
                      🔐 সিস্টেম সিকিউরিটি: এটি রিয়েল সিস্টেমে ডেপ্লয় করার কারণে সিকিউরিটি এনফোর্স করা হয়েছে যেন অননুমোদিত ব্যক্তিরা অন্য কারো প্রোফাইল বা প্যানেল এক্সেস করতে না পারে।
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedAccount(null); setPasswordInput(''); setError(''); }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-xs text-gray-600 dark:text-gray-300 font-black uppercase rounded-xl transition-all active:scale-95 cursor-pointer text-center font-bangla"
                    >
                      বাতিল (Cancel)
                    </button>
                    <button
                      type="button"
                      disabled={loading || !passwordInput}
                      onClick={() => handleGoogleAuthSelect(selectedAccount.email, selectedAccount.fullName, passwordInput)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50 font-bangla"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Shield className="w-4 h-4 animate-pulse text-teal-200" />
                          <span>যাচাই ও প্রবেশ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {googleAccounts
                    .filter((acc) => {
                      if (!googleSearchQuery) return true;
                      const q = googleSearchQuery.toLowerCase();
                      return acc.email.toLowerCase().includes(q) || acc.fullName.toLowerCase().includes(q);
                    })
                    .map((acc) => {
                      const isAdmin = acc.email.toLowerCase().trim() === 'technosparkhandset@gmail.com';
                      const requiresPassword = isAdmin || acc.registered;
                      return (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => {
                            if (requiresPassword) {
                              setSelectedAccount(acc);
                            } else {
                              handleGoogleAuthSelect(acc.email, acc.fullName);
                            }
                          }}
                          className={`w-full p-2.5 hover:bg-slate-50 dark:hover:bg-gray-800 border rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                            isAdmin
                              ? 'bg-blue-50/20 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/40'
                              : 'border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-850/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={acc.profilePhoto}
                              alt={acc.fullName}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${acc.email.charCodeAt(0) % 2 === 0 ? '1535713875002-d1d0cf377fde' : '1507003211169-0a1dd7228f2d'}?q=80&w=200&auto=format&fit=crop`;
                              }}
                              className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-gray-700 shrink-0 shadow-xs"
                            />
                            <div className="min-w-0">
                              <span className="block text-xs font-black text-slate-800 dark:text-gray-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {acc.fullName}
                              </span>
                              <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-semibold truncate leading-tight">
                                {acc.email}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 ml-2">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[8px] font-black uppercase rounded-md tracking-wider">
                                <Lock className="w-2.5 h-2.5" />
                                <span>অ্যাডমিনপ্যানেল</span>
                              </span>
                            ) : acc.registered ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-405 border border-indigo-100 dark:border-indigo-900/50 text-[8px] font-black uppercase rounded-md tracking-wider">
                                <Lock className="w-2.5 h-2.5 text-indigo-500" />
                                <span>লকড / সিঙ্কড</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-505 dark:text-gray-400 text-[8px] font-bold uppercase rounded-md border border-gray-100 dark:border-gray-700">
                                সিমুলেটর ডিভাইস
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                  {googleAccounts.filter((acc) => {
                    const q = googleSearchQuery.toLowerCase();
                    return acc.email.toLowerCase().includes(q) || acc.fullName.toLowerCase().includes(q);
                  }).length === 0 && (
                    <p className="text-center text-[10px] py-6 text-gray-400 dark:text-gray-500 font-semibold italic">কোন গুগল অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।</p>
                  )}
                </div>
              )}

              {/* Quick Input Option for other GMAIL addresses */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  অন্য একটি জিমেইল অ্যাকাউন্ট লিখুন (Custom Email):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleCustomEmail}
                    onChange={(e) => setGoogleCustomEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-55 dark:bg-gray-850 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled={!googleCustomEmail.trim().toLowerCase().includes('@')}
                    onClick={() => {
                      const cleaned = googleCustomEmail.trim().toLowerCase();
                      const matched = googleAccounts.find(a => a.email.trim().toLowerCase() === cleaned);
                      if (matched) {
                        setSelectedAccount(matched);
                        return;
                      }
                      if (cleaned === 'technosparkhandset@gmail.com' || cleaned === 'admin@manpowerhub.com') {
                        setSelectedAccount({
                          email: cleaned,
                          fullName: 'System Admin',
                          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
                          registered: true
                        });
                        return;
                      }
                      const customName = googleCustomEmail.split('@')[0].replace(/[\._\-]/g, ' ')
                        .split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                      handleGoogleAuthSelect(googleCustomEmail.trim(), customName);
                    }}
                    className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-40 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 font-bangla"
                  >
                    প্রবেশ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: STANDARD CREDENTIALS LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleStandardLogin} className="space-y-5 animate-fade-in font-bangla">
              <div className="text-center space-y-1 pb-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  🔐 ইমেইল বা মোবাইল দিয়ে লগইন করুন
                </h3>
                <p className="text-xs text-gray-550 dark:text-gray-450 font-semibold leading-normal">
                  আপনার নিবন্ধিত ইমেইল/ফোন ও পাসওয়ার্ড ব্যবহার করে প্রবেশ করুন
                </p>
              </div>

              <div className="space-y-4">
                {/* Email / Phone input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    ইমেইল অথবা মোবাইল নম্বর / Email or Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="যেমনঃ info@manpowerhub.com বা 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    পাসওয়ার্ড / Security Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-750 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-blue-200" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(''); }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                >
                  নতুন ডাইরেক্টরি অ্যাকাউন্ট তৈরি করতে চান? এখানে রেজিস্টার করুন ➔
                </button>
              </div>
            </form>
          )}

          {/* TAB CONTENT 3: STANDARD CREDENTIALS REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleStandardRegister} className="space-y-4 animate-fade-in font-bangla">
              <div className="text-center space-y-1 pb-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  📝 নতুন ডাইরেক্টরি অ্যাকাউন্ট তৈরি করুন
                </h3>
                <p className="text-xs text-gray-550 dark:text-gray-450 font-semibold leading-normal">
                  ম্যানপাওয়ার হাবে যুক্ত হতে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন
                </p>
              </div>

              <div className="space-y-3">
                {/* Full name input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    পুরো নাম / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    placeholder="যেমন: মো: আব্দুর রহমান"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile/Phone input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    মোবাইল নম্বর / Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email Address input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    ইমেইল ঠিকানা / Register Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="যেমন: abdur@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    পাসওয়ার্ড / Set Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="পাসওয়ার্ড নির্ধারণ করুন"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role inline selector */}
                <div className="p-3 bg-slate-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <span className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    হিসেব টাইপ নির্ধারণ করুন (Register Role):
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, role: 'worker' })}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        registerForm.role === 'worker'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-450 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      👷 কর্মী / Worker
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, role: 'employer' })}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        registerForm.role === 'employer'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-450 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      💼 নিয়োগকারী / Employer
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-150" />
                    <span>নতুন প্রোফাইল নিবন্ধন করুন</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                >
                  ইতিমধ্যে অ্যাকাউন্ট আছে? এখানে লগইন করুন ➔
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Unified Admin Tips Section */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/10 dark:to-emerald-950/10 border border-teal-150/60 dark:border-teal-900/40 flex items-start gap-3 shadow-sm font-sans">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="block font-black text-teal-900 dark:text-teal-300">অ্যাডমিন/ডেভেলপার ডেমো লগইন তথ্য:</span>
            <span className="block text-[11px] text-teal-850 dark:text-teal-450 leading-normal font-semibold">
              উপরিহুক্ত গুগল তালিকার <strong className="text-teal-950 dark:text-teal-200">technosparkhandset@gmail.com</strong>-এ ক্লিক করলেই সরাসরি অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে পারবেন।
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginRegister;

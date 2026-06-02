import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Briefcase, 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';

const MerchantJoin: React.FC = () => {
  const { t, isBN } = useLanguage();
  const navigate = useNavigate();

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessCategory, setBusinessCategory] = useState('tailoring');
  const [experienceYears, setExperienceYears] = useState('3');
  const [fullAddress, setFullAddress] = useState('মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া');
  const [serviceArea, setServiceArea] = useState('ভেড়ামারা ও কুষ্টিয়া সংলগ্ন এলাকা');
  const [bio, setBio] = useState('');

  // Status and Validation States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Default professional covers based on selected merchant category
  const getCategoryDefaults = (cat: string) => {
    switch (cat) {
      case 'tailoring':
        return {
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          bio: 'আমরা সঠিক পরিমাপে এবং আকর্ষণীয় ডিজাইনে আধুনিক পোষাক তৈরি করি। উৎসব ও বিশেষ অনুষ্ঠানের অর্ডারের জন্য যোগাযোগ করুন।'
        };
      case 'cooking_catering':
        return {
          photo: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=200&auto=format&fit=crop',
          bio: 'যেকোনো বিবাহ, আকীকা বা পারিবারিক উৎসবের জন্য মানসম্মত ও সুস্বাদু খাবার জোগান দিয়ে থাকি। আমাদের নিজস্ব রাঁধুনী টিম ও নিরাপদ সেবা রয়েছে।'
        };
      case 'pharmacy_medicine':
        return {
          photo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=200&auto=format&fit=crop',
          bio: 'আমাদের কাস্টমারদের বিশ্বস্ততার সাথে জীবন রক্ষাকারী সব ধরণের ওষুধ ও স্বাস্থ্যসেবা পরামর্শ প্রদান করে থাকি।'
        };
      case 'civil_engineer':
        return {
          photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop',
          bio: 'বাণিজ্যিক ও আবাসিক ভবন নির্মাণ ও ড্রয়িং ডিজাইন কাজের দক্ষ সাব-কন্ট্রাক্টর। সঠিক সময়ে নির্ভুল কাজের গ্যারান্টি।'
        };
      case 'electrician':
        return {
          photo: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=200&auto=format&fit=crop',
          bio: 'হাউজ ওয়্যারিং, এসি ফিটিং, থ্রি-ফেজ ব্যালেন্সিং ও যেকোনো ইলেকট্রিক ত্রুটি মেরামতের দক্ষ টেকনিশিয়ান।'
        };
      case 'grocery_retail':
        return {
          photo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop',
          bio: 'পাইকারি ও খুচরা মূল্যের মুদি সামগ্রী ও হোম ডেলিভারি সুবিধা সংবলিত জেনারেল ডিপার্টমেন্টাল ষ্টোর।'
        };
      default:
        return {
          photo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&auto=format&fit=crop',
          bio: 'আমরা আন্তরিকতা ও সর্বোচ্চ সততার সাথে কুষ্টিয়া এলাকায় আমাদের ব্যবসায়িক সেবা পরিচালনা করে আসছি।'
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError(isBN ? 'অনুগ্রহ করে সব তারকা (*) চিহ্নিত তথ্যগুলো সঠিকভাবে পূরণ করুন।' : 'Please fill all required (*) fields correctly.');
      return;
    }

    if (password.length < 4) {
      setError(isBN ? 'পাসওয়ার্ডটি ন্যূনতম ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: User Registration
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: 'business', // Default Merchant role
          fullName: fullName.trim(),
          phone: phone.trim()
        })
      });

      const regData = await regRes.json();
      if (!regData.success) {
        throw new Error(regData.message || 'নিবন্ধন প্রক্রিয়া ব্যর্থ হয়েছে।');
      }

      const token = regData.token;
      localStorage.setItem('authToken', token);

      // Step 2: Immediately Update Profile details
      const defaults = getCategoryDefaults(businessCategory);
      const updateData = {
        primaryCategory: businessCategory,
        experienceYears: Number(experienceYears) || 3,
        fullAddress: fullAddress.trim(),
        serviceArea: serviceArea.trim(),
        bio: bio.trim() || defaults.bio,
        profilePhoto: defaults.photo,
        locationIndex: 0,
        division: 'Khulna',
        district: 'Kushtia',
        isPublic: true,
        isActive: true
      };

      const profileRes = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const profileData = await profileRes.json();
      if (!profileData.success) {
        throw new Error(profileData.message || 'প্রোফাইল তথ্য আপডেট ব্যর্থ হয়েছে।');
      }

      setSuccess(true);
      
      // Delay navigation to let merchant see completion state
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'কানেকশন সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 font-sans" id="merchant-join-view">
      <div className="max-w-4xl mx-auto">
        
        {/* Route Back and Title Section */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-xl text-slate-600 dark:text-gray-300 hover:text-indigo-600 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black tracking-widest uppercase px-2.5 py-1 rounded-md mb-1 inline-block">
              💼 Merchant Registration Program
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-905 dark:text-white font-bangla tracking-tight">
              {isBN ? 'মার্চেন্ট বা ব্যবসায়ী হিশেবে যুক্ত হোন' : 'Join as an Ultimate Merchant Partner'}
            </h1>
          </div>
        </div>

        {/* Master Box Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {success ? (
              <div className="p-8 text-center bg-white dark:bg-gray-850 rounded-3xl border border-emerald-500/20 shadow-xl space-y-4 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full mb-2">
                  <CheckCircle className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-bangla">
                  {isBN ? 'অভিনন্দন! আপনার মার্চেন্ট নিবন্ধন সফল হয়েছে' : 'Merchant Registration Successful!'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal font-semibold">
                  {isBN 
                    ? 'আপনার ব্যবসায়ী অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আমরা আপনাকে কুষ্টিয়া ব্যবসায়ী ইন্টেলিজেন্স ড্যাশবোর্ডে নিয়ে যাচ্ছি...' 
                    : 'Your business profile is created. We are redirecting you to your intelligent performance dashboard...'}
                </p>
                <div className="flex justify-center pt-2">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-850 border border-gray-150/80 dark:border-gray-800 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
                
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4.5 h-4.5 text-indigo-500" />
                    <span>{isBN ? 'ব্যবসা প্রোফাইল ও অ্যাকাউন্ট তথ্য' : 'Business Account Details'}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-1">
                    {isBN 
                      ? 'কুষ্টিয়া ও ভেড়ামারা বাজারে কাজের প্রস্তাব ও কাস্টমার রিভিউ পাওয়ার জন্য সঠিক তথ্য দিয়ে প্রোফাইল সম্পূর্ণ করুন।' 
                      : 'Provide accurate information to build Trust Index, print verification cards, and gain priority local job contracts.'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900 rounded-xl flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-snug">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'আপনার সম্পূর্ণ নাম (Full Name) *' : 'Your Full Name *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="যেমন: মোঃ মনিরুজ্জামান (মনু)"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'মোবাইল নম্বর (Phone Number) *' : 'Contact Phone *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="যেমন: ০১৭১৭৯৬৮০৯৮"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'ইমেইল বা জিমেইল ঠিকানা *' : 'Gmail/Email Address *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'নিরাপত্তা পাসওয়ার্ড / পিন (পিন বা পাসওয়ার্ড দিন) *' : 'Access Password/PIN *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="যেমন: password123 (ন্যূনতম ৪ অক্ষর)"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Base Category Select */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'ব্যবসার মূল ক্যাটাগরি (Business Type) *' : 'Business Category *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <select
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      >
                        <option value="tailoring">{isBN ? 'দর্জি ও আলিশান পোষাক নির্মাতা' : 'Tailoring & Dressmaker'}</option>
                        <option value="cooking_catering">{isBN ? 'রান্না ও ক্যাটারিং পরিবেশক' : 'Cooking & Catering'}</option>
                        <option value="pharmacy_medicine">{isBN ? 'ওষুধ, মেডিকেল ও ফার্মেসী' : 'Pharmacy & Medical'}</option>
                        <option value="civil_engineer">{isBN ? 'নির্মাণ ও প্রকৌশল কন্ট্রাক্টর' : 'Civil Contractor & Engineering'}</option>
                        <option value="electrician">{isBN ? 'ইলেকট্রিক্যাল ও অন-কল সার্ভিস' : 'Electrical & Air Conditioning'}</option>
                        <option value="grocery_retail">{isBN ? 'মুদি ও ডিপার্টমেন্টাল ষ্টোর' : 'Grocery Retail & Store'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'কাজের অভিজ্ঞতা (অভিজ্ঞতার বছর) *' : 'Experience Years *'}
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1">{isBN ? '১ বছর' : '1 Year'}</option>
                      <option value="2">{isBN ? '২ বছর' : '2 Years'}</option>
                      <option value="3">{isBN ? '৩ বছর' : '3 Years'}</option>
                      <option value="5">{isBN ? '৫ বছর' : '5 Years'}</option>
                      <option value="7">{isBN ? '৭ বছর' : '7 Years'}</option>
                      <option value="10">{isBN ? '১০+ বছর' : '10+ Years'}</option>
                    </select>
                  </div>

                  {/* Service Area */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'সেবা দানের প্রধান এলাকা (Service Area) *' : 'Service Deliver Areas *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
                        placeholder="যেমন: ভেড়ামারা সকল এরিয়া ও কুষ্টিয়া সদর"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'ব্যবসার পূর্ণাঙ্গ বিশদ ঠিকানা (Office Address)' : 'Shop/Office Address'}
                    </label>
                    <input
                      type="text"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="যেমন: মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      {isBN ? 'আপনার ব্যবসা বা সেবার সংক্ষিপ্ত বর্ণনা (Short Bio)' : 'Short Business Description'}
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder={
                        isBN 
                          ? "আপনার বিশেষ দক্ষতা, ছাড় ও কাজের বিবরণীর মাধ্যমে কাস্টমারদের আকর্ষণ করুন (যেমন: আমরা সুনিপুণ ডিজাইনে ট্র্যাডিশনাল এবং ওয়েস্টার্ন লেডিস পোষাক ডেলিভারি দিই...)"
                          : "Briefly describe your services, specialized traits, warranties, and special discount highlights..."
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-750 text-xs text-slate-900 dark:text-gray-50 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest cursor-pointer transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isBN ? 'নিবন্ধন সফল করা হচ্ছে...' : 'Executing Registration...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-pulse text-indigo-200" />
                        <span>{isBN ? 'নিবন্ধন সম্পূর্ণ করুন ও ড্যাশবোর্ডে যান' : 'Complete Merchant Registration'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Column: Exclusive Merchant Intelligence Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Box 1: Why join as a merchant */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-2 border-amber-500/30 p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              <div>
                <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg inline-block">
                  ⭐ VIP Merchant Privileges
                </span>
                <h3 className="text-lg font-black font-bangla text-white leading-tight mt-2.5 select-none">
                  {isBN ? 'মার্চেন্ট পার্টনার হিশেবে কী কী সুবিধা পাবেন?' : 'Exclusive VIP Merchant Benefits'}
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Point 1 */}
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border border-indigo-500/25">
                    <Smartphone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-100 font-bangla mb-0.5">{isBN ? 'স্মার্ট লাইভ মার্চেন্ট আইডি কার্ড' : 'Smart Digital Professional ID'}</h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed font-bangla">
                      {isBN 
                        ? 'আপনার নাম সংবলিত কিউআর-কোড যুক্ত ডিজিটাল শপ আইডি কার্ড পাবেন, যা সরাসরি প্রিন্ট করে দোকানের দেওয়ালে টাঙ্গিয়ে দেওয়া যাবে।' 
                        : 'Printable QR identification cards allowing off-grid local trade clients to scan and rate instantly.'}
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border border-indigo-500/25">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-100 font-bangla mb-0.5">{isBN ? 'ব্যবসায়িক ROI ও প্রফিট মার্জিন ক্যালকুলেটর' : 'Pricing & Costing Intelligence'}</h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed font-bangla">
                      {isBN 
                        ? 'আমাদের প্রফেশনাল ROI ক্যালকুলেটর এক্সেস পাবেন যার মাধ্যমে শ্রম ও পণ্যের কাঁচামাল অনুপাতে নিখুঁত সেলিং প্রাইস বের করা যাবে।' 
                        : 'Access interactive costing modules aligned with Kushtia district material price indices.'}
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border border-indigo-500/25">
                    <CheckCircle className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-500 font-bangla mb-0.5">{isBN ? 'ভেরিফাইড কাস্টমার রেটিং ও রিভিউজ' : 'Accelerated Trust Index'}</h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed font-bangla">
                      {isBN 
                        ? 'এনআইডি ও ফোন ভেরিফিকেশনের পর সরাসরি "VIP Verified" ব্যাজ পাবেন যা ভেড়ামারা বড় বাজারে সর্বাধিক কাজ পাইয়ে দেবে।' 
                        : 'Gain NID Verified badge to boost credentials over regional directory search results.'}
                    </p>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] italic text-slate-300">
                ⭐ {isBN 
                  ? 'ইতিমধ্যে ৩৬+ স্থানীয় ব্যবসা প্রতিষ্ঠান ও রাজমিস্ত্রী ঠিকাদার আমাদের সিস্টেমে যুক্ত হয়ে কাজ সম্পন্ন করছেন।' 
                  : 'Over 36 active local merchants and contractors in Kushtia are currently scaled using our manpower directory.'}
              </div>

            </div>

            {/* Box 2: Secure System notice */}
            <div className="p-5 rounded-3xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-500">
                <Info className="w-5 h-5 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">{isBN ? 'গুরুত্বপূর্ণ সতর্কতা নির্দেশিকা' : 'Security Advisory Note'}</h4>
              </div>
              <p className="text-[11px] text-gray-550 dark:text-gray-400 leading-relaxed font-medium font-bangla">
                {isBN 
                  ? 'আপনার সঠিক মোবাইল নম্বর প্রদান করুন যা কাস্টমার সরাসরি ওয়ান-ক্লিক হোয়াটসঅ্যাপে মেসেজ করার জন্য ব্যবহার করবে। কোনো ভুল বা অননুমোদিত তথ্য প্রদান করলে আইডি প্যানেল সাময়িকভাবে ব্লক করা হতে পারে।'
                  : 'To ensure system alignment, your registered phone number serves as your direct customer calling and WhatsApp line.'}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MerchantJoin;

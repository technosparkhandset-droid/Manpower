import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Search, MapPin, Briefcase, Calendar, DollarSign, PlusCircle, MessageSquare } from 'lucide-react';
import { BANGLADESH_LOCATIONS, DIVISIONS_LIST } from '../data/bangladeshData';

interface Job {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  division: string;
  district: string;
  serviceArea?: string;
  budget: string | number;
  contactPhone: string;
  contactEmail?: string;
  postedByName: string;
  createdAt: string;
  status: 'open' | 'closed';
}

const JobBoard: React.FC = () => {
  const { t, isBN } = useLanguage();
  const { isDark } = useTheme();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Available categories (mapping translations keys dynamically)
  const categoryKeys = [
    { key: 'electrician', bn: 'ইলেকট্রিশিয়ান', en: 'Electrician' },
    { key: 'tailoring', bn: 'দর্জি ও ফ্যাশন', en: 'Tailor & Fashion' },
    { key: 'healthcare', bn: 'স্বাস্থ্যসেবা', en: 'Healthcare' },
    { key: 'construction', bn: 'নির্মাণ শ্রমিক', en: 'Construction' },
    { key: 'general_physician', bn: 'সাধারণ চিকিৎসক', en: 'Physician' },
    { key: 'pharmacy_medicine', bn: 'ফার্মেসি ও ঔষধ', en: 'Pharmacy' },
    { key: 'beauty_fashion', bn: 'বিউটি ও ফ্যাশন', en: 'Beauty & Fashion' }
  ];

  // Load jobs from server
  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = `/api/jobs?`;
      if (category) query += `category=${category}&`;
      if (selectedDivision) query += `division=${selectedDivision}&`;
      if (selectedDistrict) query += `district=${selectedDistrict}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(query);
      const output = await res.json();
      if (output.success) {
        setJobs(output.data);
      } else {
        setError('ডাটাবেজ থেকে জব লোড করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('সার্ভার যোগাযোগে ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Record analytics visit
    fetch('/api/analytics/ping', { method: 'POST' }).catch(() => {});
  }, [category, selectedDivision, selectedDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedDivision('');
    setSelectedDistrict('');
  };

  // Get current districts based on selected division
  const districtsAvailable = selectedDivision 
    ? BANGLADESH_LOCATIONS[selectedDivision.toLowerCase()]?.districts || [] 
    : [];

  return (
    <div className="py-8 min-h-screen bg-slate-50 dark:bg-gray-905 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-slate-100 dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
              {isBN ? 'লাইভ জব বোর্ড' : 'Live Job Board'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight">
              {isBN ? 'লাইভ কাজের চাহিদা ও নোটিশ বোর্ড' : 'Live Job Listings & Needs'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-50 font-medium">
              {isBN 
                ? 'সারা দেশ থেকে গ্রাহকদের সরাসরি পোস্ট করা কাজের বিবরণী দেখুন এবং সরাসরি যোগাযোগ করুন।' 
                : 'Browse direct local labor requirements and instantly connect with dynamic recruiters.'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 relative z-10 flex gap-3">
            <a 
              href="#/profile" 
              className="px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBN ? 'আমার জব পোস্ট করুন' : 'Post Available Job'}</span>
            </a>
          </div>
        </div>

        {/* Bento Board Layout / Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Filters - Bento Card */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-5">
            <div className="pb-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-gray-200">
                {isBN ? 'ফিল্টার সমূহ' : 'Filter Options'}
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isBN ? 'সব মুছুন' : 'Clear All'}
              </button>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                {isBN ? 'কীওয়ার্ড সার্চ' : 'Search Keyword'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isBN ? 'রুম ওয়ারিং, সেলাই কাজ...' : 'e.g. Wiring, Tailor...'}
                  className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-slate-900 text-xs font-semibold rounded-xl text-slate-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Division Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                {isBN ? 'বিভাগ (Divisions)' : 'Select Division'}
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full px-2 py-2 bg-gray-50 dark:bg-slate-900 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-750 text-slate-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="">{isBN ? 'সকল বিভাগ' : 'All Divisions'}</option>
                {DIVISIONS_LIST.map((div) => (
                  <option key={div.key} value={div.en}>
                    {isBN ? div.bn : div.en}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter (Conditional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                {isBN ? 'জেলা (Districts)' : 'Select District'}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedDivision}
                className="w-full px-2 py-2 bg-gray-50 dark:bg-slate-900 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-750 text-slate-900 dark:text-gray-100 focus:outline-none disabled:opacity-50"
              >
                <option value="">{isBN ? 'সকল জেলা' : 'All Districts'}</option>
                {districtsAvailable.map((dist, idx) => (
                  <option key={idx} value={dist.en}>
                    {isBN ? dist.bn : dist.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                {isBN ? 'কাজের ধরণ' : 'Select Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 dark:bg-slate-900 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-750 text-slate-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="">{isBN ? 'সকল কাজের ধরণ' : 'All Trade Categories'}</option>
                {categoryKeys.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {isBN ? cat.bn : cat.en}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => { fetchJobs(); }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer"
            >
              {isBN ? 'সার্চ এপ্লাই করুন' : 'Apply Search'}
            </button>
          </div>

          {/* Right Core JobList Area */}
          <div className="lg:col-span-3 space-y-4">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-xs font-bold text-gray-500">{isBN ? 'জব তালিকা লোড হচ্ছে...' : 'Streaming active jobs...'}</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30">
                <span className="text-xs font-bold">{error}</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">
                  {isBN ? 'কোন কাজের চাহিদা খুঁজে পাওয়া যায়নি' : 'No Active Job Postings'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold max-w-sm mx-auto mb-4">
                  {isBN 
                    ? 'আপনার নির্বাচিত এলাকায় এই মুহূর্তে কোনো পোস্ট করা কাজ নেই। নতুন পোস্ট করার চেষ্টা করুন।' 
                    : 'Currently there are no dynamic jobs in this specific division or trade field. Check back later!'}
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  {isBN ? 'সকল ফিল্টার রিসেট' : 'Reset All Filters'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {isBN ? `${jobs.length}টি লাইভ সচল কাজ পাওয়া গেছে` : `${jobs.length} Active Jobs Streaming`}
                  </span>
                </div>

                {jobs.map((job) => (
                  <div 
                    key={job.id}
                    className="p-6 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 bento-card-glow flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge Metadata Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black uppercase tracking-wider rounded-lg">
                            {categoryKeys.find(c => c.key === job.category)?.bn || job.category}
                          </span>
                          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/35 dark:border-blue-900/20 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>
                              {(() => {
                                const parts = [];
                                if (job.union) parts.push(job.union);
                                if (job.thana) parts.push(job.thana);
                                if (job.district) parts.push(job.district);
                                if (job.division) parts.push(job.division);
                                if (parts.length > 0) return parts.join(', ');
                                return `${job.district}, ${job.division}`;
                              })()}
                            </span>
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(job.createdAt).toLocaleDateString(isBN ? 'bn-BD' : 'en-US')}</span>
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight leading-snug font-bangla">
                        {job.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-relaxed font-bangla whitespace-pre-line">
                        {job.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest">
                          {isBN ? 'প্রস্তাবিত বাজেট / বেতন' : 'Offered Budget'}
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span>{job.budget}</span>
                        </span>
                      </div>

                      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                        {/* Custom Contacts */}
                        <div className="text-left sm:text-right text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-1 sm:mb-0">
                          <span className="block font-black text-slate-700 dark:text-slate-300 text-xs font-bangla">
                            {job.postedByName}
                          </span>
                          <span className="block text-[9px] tracking-wider uppercase">
                            {job.contactPhone}
                          </span>
                        </div>

                        <a
                          href={`tel:${job.contactPhone}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-wider uppercase text-[10px] rounded-xl text-center active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                        >
                          {isBN ? 'কল করুন' : 'Direct Call'}
                        </a>

                        <a
                          href={`https://wa.me/8801717968098?text=${encodeURIComponent(`Hello Admin, I am interested in applying/inquiring about the job: "${job.title}" posted by ${job.postedByName}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-800 dark:border-gray-700 font-black tracking-wider uppercase text-[10px] rounded-xl text-center active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default JobBoard;

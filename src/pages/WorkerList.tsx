import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LOCATIONS_BN, LOCATIONS_EN } from '../data/translations';
import { BANGLADESH_LOCATIONS, DIVISIONS_LIST } from '../data/bangladeshData';
import { Star, MapPin, Briefcase, Award, Eye, X, Phone, UserCheck, ShieldCheck, MessageSquare, Printer } from 'lucide-react';
import ShareButtons from '../components/profile/ShareButtons';
import Spinner from '../components/common/Spinner';
import { WorkerCardSkeleton } from '../components/common/Skeleton';

const calculateCompletenessForProfile = (p: any) => {
  let totalFields = 10;
  let filledFields = 0;

  if (p.fullName && p.fullName.trim().length > 0) filledFields++;
  if (p.phone && p.phone.trim().length > 0) filledFields++;
  if (p.bio && p.bio.trim().length > 10) filledFields++;
  if (p.profilePhoto && p.profilePhoto.trim().length > 0 && !p.profilePhoto.includes('unsplash.com/photo-1515713875002-d1d0cf377fde') && !p.profilePhoto.includes('unsplash.com/photo-1535713875002-d1d0cf377fde')) filledFields++;
  if (p.age && String(p.age).trim().length > 0) filledFields++;
  if (p.gender && p.gender.trim().length > 0) filledFields++;
  if (p.serviceArea && p.serviceArea.trim().length > 0) filledFields++;
  if (p.nidNumber && p.nidNumber.trim().length > 0) filledFields++;
  if (p.primaryCategory && p.primaryCategory.trim().length > 0) filledFields++;
  if (p.experienceYears && String(p.experienceYears).trim().length > 0 && Number(p.experienceYears) > 0) filledFields++;

  const pct = Math.floor((filledFields / totalFields) * 100);
  return Math.min(pct, 100);
};

interface Profile {
  id: string;
  fullName: string;
  phone: string;
  age?: number;
  gender?: string;
  locationIndex: number | null;
  fullAddress?: string;
  role: string;
  primaryCategory?: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  jobsCompleted: number;
  bio: string;
  socialLinks: { facebook?: string; linkedin?: string; website?: string };
  profilePhoto: string;
  slug: string;
  verification: { nidVerified: boolean; skillVerified: boolean; trustedWorker: boolean; premiumUser: boolean; approved: boolean; phoneVerified: boolean };
  profileViews: number;
  isPremium: boolean;
  reviews?: any[];
}

const WorkerList: React.FC = () => {
  const { t, isBN } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Visitor rating states
  const [visitorRating, setVisitorRating] = useState<number>(5);
  const [submitRatingSuccess, setSubmitRatingSuccess] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Review states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const handleSubmitReview = async (profileId: string) => {
    if (!reviewComment.trim()) {
      setReviewError(isBN ? 'অনুগ্রহ করে আপনার মূল্যবান মতামত বা মন্তব্য লিখুন।' : 'Please write your valuable comment.');
      return;
    }
    setSubmittingReview(true);
    setReviewSuccess('');
    setReviewError('');
    try {
      const res = await fetch(`/api/profiles/${profileId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          reviewerPhone,
          rating: visitorRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(isBN ? 'মতামত ও রেটিং সফলভাবে যুক্ত করা হয়েছে!' : 'Review and rating submitted successfully!');
        setReviewComment('');
        setReviewerName('');
        setReviewerPhone('');
        
        // Update local object states immediately
        if (selectedProfile) {
          setSelectedProfile(data.data);
        }
        setProfiles(prevList => prevList.map(p => {
          if (p.id === data.data.id) {
            return data.data;
          }
          return p;
        }));
        setTimeout(() => setReviewSuccess(''), 4000);
      } else {
        setReviewError(data.message || 'ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error('Failed to submit review', e);
      setReviewError(isBN ? 'সংযোগ ত্রুটি।' : 'Connection error.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (profileId: string, reviewId: string) => {
    if (!window.confirm(isBN ? 'আপনি কি নিশ্চিতভাবে এই মতামতটি ডিলিট করতে চান?' : 'Are you sure you want to delete this review?')) {
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(isBN ? 'লগইন টোকেন পাওয়া যায়নি।' : 'Login token not found.');
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Update states
        if (selectedProfile) {
          setSelectedProfile(data.data);
        }
        setProfiles(prevList => prevList.map(p => {
          if (p.id === data.data.id) {
            return data.data;
          }
          return p;
        }));
        alert(isBN ? 'মতামত সফলভাবে ডিলেট করা হয়েছে!' : 'Review deleted successfully!');
      } else {
        alert(data.message || 'ডিলেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error('Failed to delete review', e);
      alert(isBN ? 'সার্ভার ত্রুটি।' : 'Server error.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [selectedProfile]);

  const handleSubmitVisitorRating = async (profileId: string) => {
    setSubmittingRating(true);
    setSubmitRatingSuccess('');
    try {
      const res = await fetch(`/api/profiles/${profileId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratingValue: visitorRating })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitRatingSuccess(isBN ? 'রেটিং সফলভাবে যুক্ত করা হয়েছে!' : 'Rating submitted successfully!');
        
        // Update local object states immediately
        if (selectedProfile) {
          setSelectedProfile(prev => prev ? { ...prev, rating: data.data.rating } : null);
        }
        setProfiles(prevList => prevList.map(p => {
          if (p.id === profileId || p.slug === profileId) {
            return { ...p, rating: data.data.rating };
          }
          return p;
        }));
        setTimeout(() => setSubmitRatingSuccess(''), 4000);
      }
    } catch (e) {
      console.error('Failed to register visitor rating', e);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Filter state
  const [roleFilter, setRoleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Extract from URL parameters on feed mount
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    if (urlCategory) setCategoryFilter(urlCategory);
    if (urlSearch) setSearchKeyword(urlSearch);
  }, [searchParams]);

  // Handle URL-based single profile preview on mount or query change
  useEffect(() => {
    const profileSlug = searchParams.get('profile');
    if (profileSlug) {
      const match = profiles.find(p => p.slug === profileSlug || p.id === profileSlug);
      if (match) {
        setSelectedProfile(match);
      } else {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        fetch(`/api/profiles/${profileSlug}`, { headers })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSelectedProfile(data.data);
            }
          })
          .catch(err => console.error('Failed to load deep-link profile:', err));
      }
    }
  }, [searchParams, profiles]);

  // Load verified public directory
  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams();
      if (roleFilter) q.set('role', roleFilter);
      if (categoryFilter) q.set('category', categoryFilter);
      if (divisionFilter) q.set('division', divisionFilter);
      if (districtFilter) q.set('district', districtFilter);
      if (searchKeyword) q.set('search', searchKeyword);

      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/profiles?${q.toString()}`, { headers });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
        setError('');
      } else {
        setError(data.message || (isBN ? 'সার্ভার থেকে তথ্য পাওয়া যায়নি।' : 'No data received from server.'));
      }
    } catch (e: any) {
      console.error("Failed to load talents:", e);
      setError(isBN ? 'সার্ভার যোগাযোগে ত্রুটি ঘটেছে।' : 'Server communication error.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, categoryFilter, divisionFilter, districtFilter, searchKeyword, isBN]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  // Clear filters
  const resetFilters = () => {
    setRoleFilter('');
    setCategoryFilter('');
    setDivisionFilter('');
    setDistrictFilter('');
    setSearchKeyword('');
    setSearchParams({});
  };

  // Open detailing profile modal and fetch fresh info to trigger view analytics track
  const handleOpenStatsModal = async (profile: Profile) => {
    try {
      setSelectedProfile(profile);
      // Fetch fresh to trigger view increment in backend
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/profiles/${profile.slug}`, { headers });
      const data = await res.json();
      if (data.success) {
        setSelectedProfile(data.data);
      }
    } catch (e) {
      // silent catch
    }
  };

  const categoriesKeys = [
    'krishikaj', 'local_delivery', 'agriculture_farming', 'beauty_fashion', 'electrician', 'construction',
    'civil_engineer', 'land_services', 'helper', 'plumber', 'painter',
    'carpenter', 'ac_technician', 'driver', 'security_guard', 'cleaning_services',
    'cooking_catering', 'tailoring', 'photography', 'computer_it', 'office_support',
    'healthcare', 'education_tutoring', 'delivery_logistics', 'emergency_services',
    'training_development', 'grocery_retail', 'pharmacy_medicine', 'general_physician',
    'dentist_specialist'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-905 transition-colors duration-300 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-950 dark:text-white font-bangla mb-2">
            {t('workerList.title')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold max-w-lg mx-auto">
            {t('workerList.subtitle')}
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white dark:bg-gray-850 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2">
            <span>বিভাগ ফিল্টার / Filter Controls</span>
            {(roleFilter || categoryFilter || divisionFilter || districtFilter || searchKeyword) && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-red-500 hover:text-red-400 transition-colors uppercase cursor-pointer"
              >
                ফিল্টার মুছুন / Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Search Keyword */}
            <input
              type="text"
              placeholder="কীওয়ার্ড দিয়ে সার্চ..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('workerList.allRoles')}</option>
              {['worker', 'business', 'doctor', 'dentist', 'contractor'].map((rl) => (
                <option key={rl} value={rl}>{t('roles', rl)}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('workerList.allCats')}</option>
              {categoriesKeys.map((key) => (
                <option key={key} value={key}>{t('jobCategories', key)}</option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setDistrictFilter('');
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">সকল বিভাগ / All Divisions</option>
              {DIVISIONS_LIST.map((div) => (
                <option key={div.key} value={div.en}>{div.bn} / {div.en}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              disabled={!divisionFilter}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            >
              <option value="">সকল জেলা / All Districts</option>
              {divisionFilter && (BANGLADESH_LOCATIONS[divisionFilter.toLowerCase()]?.districts || []).map((dist: any) => (
                <option key={dist.en} value={dist.en}>{dist.bn} / {dist.en}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8" id="profiles-skeleton-grid">
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-gray-850 rounded-[32px] border-2 border-red-150 dark:border-red-900/30 shadow-xl max-w-lg mx-auto p-8 space-y-5 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full text-red-500 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-bangla">
              {isBN ? 'সার্ভার পাওয়া যায়নি বা ব্যাকএন্ড সক্রিয় হচ্ছে' : 'Connection Standby / Loading API Backend'}
            </h3>
            <p className="text-xs text-gray-550 dark:text-gray-400 font-bold leading-relaxed max-w-sm mx-auto">
              {error}
            </p>
            <div className="pt-2">
              <button
                onClick={() => loadDirectory()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-xs font-black rounded-2xl cursor-pointer shadow-md inline-flex items-center gap-2 font-bangla"
              >
                <span>{isBN ? 'পুনরায় চেষ্টা করুন' : 'Refresh Connection'}</span>
              </button>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
            <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm max-w-xs mx-auto">
              {t('workerList.noResults')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8" id="profiles-grid">
            {profiles.map((p) => {
              const locationLabel = (() => {
                const parts: string[] = [];
                if (p.union) parts.push(p.union);
                if (p.thana) parts.push(p.thana);
                if (p.district) parts.push(p.district);
                if (p.division) parts.push(p.division);
                if (parts.length > 0) return parts.join(', ');
                return p.division 
                  ? `${p.district ? p.district + ', ' : ''}${p.division}`
                  : (p.locationIndex !== null && p.locationIndex !== undefined ? (isBN ? LOCATIONS_BN[p.locationIndex] : LOCATIONS_EN[p.locationIndex]) : 'বাংলাদেশ');
              })();
              
              // Custom category helper
              const categoryBn = t('jobCategories', p.primaryCategory || '');
              
              // Custom accent border classes by role
              let categoryAccentClass = 'border-slate-100 dark:border-neutral-800 shadow-sm';
              if (p.isPremium) {
                categoryAccentClass = 'border-blue-500 shadow-lg shadow-blue-500/5 hover:border-blue-600';
              } else if (p.role === 'doctor' || p.role === 'dentist') {
                categoryAccentClass = 'border-sky-305 dark:border-sky-905 shadow-sm hover:border-sky-500';
              } else if (p.role === 'worker') {
                categoryAccentClass = 'border-emerald-305 dark:border-emerald-905 shadow-sm hover:border-emerald-550';
              } else if (p.role === 'business' || p.role === 'contractor') {
                categoryAccentClass = 'border-purple-305 dark:border-purple-905 shadow-sm hover:border-purple-500';
              }

              return (
                <div
                  key={p.id}
                  className={`relative bg-white dark:bg-neutral-900 rounded-[32px] border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${categoryAccentClass}`}
                >
                  <div className="p-6">
                    {/* Header Layout directly mirroring the mock image */}
                    <div className="flex gap-4 items-start">
                      {/* Left Column: Image with floating WhatsApp and Role badges */}
                      <div className="relative shrink-0 select-none">
                        {/* Green WhatsApp Badge as requested */}
                        <a 
                          href={`https://wa.me/${p.phone?.replace(/[^0-9]/g, '') || '8801717968098'}?text=Hello%20${encodeURIComponent(p.fullName)}%2C%20I%20contact%20you%20from%20ManpowerHub.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute -top-1.5 -left-1.5 z-10 w-7 h-7 bg-white dark:bg-neutral-800 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 shadow-md hover:scale-110 active:scale-95 transition-transform"
                          title="WhatsApp Direct Link"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.004 2c-5.51 0-9.99 4.49-9.99 10 0 1.95.56 3.77 1.53 5.31L2 22l4.83-1.6c1.47.82 3.14 1.28 4.91 1.28 5.51 0 10.01-4.49 10.01-10s-4.5-10-10.01-10zm0 1.5c4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5c-1.63 0-3.15-.46-4.45-1.26l-.32-.2-2.92.97.99-2.85-.2-.31C3.81 15.65 3.5 13.89 3.5 12c0-4.69 3.81-8.5 8.5-8.5zm-.01 2.5a.75.75 0 0 0-.75.75c0 .35.09.68.25.96l-.96.96a2.25 2.25 0 0 1-1.59-.66.75.75 0 1 0-1.06 1.06c.6.6 1.4.92 2.25.92.85 0 1.65-.32 2.25-.92a.75.75 0 1 0-1.06-1.06c-.3.3-.7.48-1.14.48-.44 0-.84-.18-1.14-.48l.96-.96c.28.16.61.25.96.25a.75.75 0 1 0 0-1.5z"/>
                          </svg>
                        </a>

                        {/* Purple Role Badge */}
                        <div className="absolute top-6 -left-1.5 z-10 w-7 h-7 bg-white dark:bg-neutral-800 border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-600 shadow-md">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>

                        <img
                          src={p.profilePhoto || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop`}
                          alt={p.fullName}
                          referrerPolicy="no-referrer"
                          className="w-24 h-24 rounded-[24px] object-cover border border-neutral-100 dark:border-neutral-800 shadow"
                        />
                        {/* Pulsing Green Online Status Dot Indicator */}
                        {p.isActive !== false && (
                          <div className="absolute bottom-0 right-0 z-10 w-4.5 h-4.5 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow" title={isBN ? 'বর্তমানে অনলাইন' : 'Online Now'}>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white dark:border-neutral-900" />
                          </div>
                        )}
                      </div>

                      {/* Right Column: Stack of Colorful Badges */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1 bg-blue-600 text-white rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider w-fit shrink-0">
                          <span className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-blue-600 text-[8px] font-black mr-0.5">✓</span>
                          {isBN ? 'ভেরিফাইড প্রোফাইল' : 'Verified Profile'}
                        </div>

                        {p.verification?.nidVerified && (
                          <div className="flex items-center gap-1 bg-emerald-600 text-white rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider w-fit shrink-0">
                            <span className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-emerald-600 text-[8px] font-black mr-0.5">✓</span>
                            {isBN ? 'এনআইডি যাচাইকৃত' : 'NID Verified'}
                          </div>
                        )}

                        {p.verification?.skillVerified && (
                          <div className="flex items-center gap-1 bg-purple-600 text-white rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider w-fit shrink-0">
                            <span className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-purple-600 text-[8px] mr-0.5">🏆</span>
                            {isBN ? 'দক্ষতা যাচাইকৃত' : 'Skills Verified'}
                          </div>
                        )}

                        <div className="flex items-center gap-1 bg-rose-600 text-white rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider w-fit shrink-0 animate-pulse">
                          <span className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-rose-600 text-[8px] mr-0.5">⚡</span>
                          {isBN ? 'বিশ্বস্ত' : 'Trusted'}
                        </div>
                      </div>
                    </div>

                    {/* Age Badge aligned beautifully */}
                    <div className="flex justify-end mt-2">
                      <span className="bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 font-extrabold px-3 py-1 rounded-xl text-[10px] uppercase tracking-wide border border-orange-100/30">
                        {p.age || 30} {isBN ? 'বছর বয়স' : 'Years Old'}
                      </span>
                    </div>

                    {/* Core Worker Identity Header */}
                    <div className="mt-4">
                      <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-bangla tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-2 flex-wrap">
                        <span>{p.fullName}</span>
                        {p.isActive !== false && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-black tracking-tight px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {isBN ? 'অনলাইন' : 'Online'}
                          </span>
                        )}
                      </h2>
                      {p.primaryCategory ? (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider mt-0.5 shrink-0 flex items-center gap-1">
                          <span>⚙️</span>
                          <span>{categoryBn} {isBN && `-${p.primaryCategory === 'cleaning_services' ? ' ক্লিনার' : ''}`}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-neutral-400 font-black tracking-widest uppercase mt-0.5">{t('roles', p.role)}</p>
                      )}
                    </div>

                    {/* Stars and Completed Jobs row with custom badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-bold">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <span className="text-[13px]">★★★★☆</span>
                        <span className="text-neutral-550 dark:text-neutral-400">({p.rating?.toFixed(1) || '4.0'})</span>
                      </div>

                      <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide border border-amber-100/30">
                        {isBN ? 'অ্যাডমিন রিভিউড' : 'Admin Reviewed'}
                      </span>

                      <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/15 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-amber-150/30">
                        💼 {p.jobsCompleted || 20} {isBN ? 'টি কাজ' : 'Jobs Done'}
                      </span>
                    </div>

                    {/* Public Profile Completeness Tracker Bar */}
                    <div className="mt-4 p-3 bg-indigo-50/20 dark:bg-slate-900/30 border border-indigo-100/30 dark:border-indigo-950/40 rounded-2xl">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-500 mb-1.5 tracking-wider">
                        <span>{isBN ? 'প্রোফাইল সম্পূর্ণতা' : 'Completeness Report'}</span>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{calculateCompletenessForProfile(p)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${calculateCompletenessForProfile(p)}%` }}
                        />
                      </div>
                    </div>

                    {/* Bio Description Highlight */}
                    {p.bio && (
                      <div className="relative mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/50 border border-neutral-100 dark:border-neutral-800/65 text-xs italic text-neutral-700 dark:text-neutral-300 font-medium font-bangla whitespace-pre-line leading-relaxed shadow-inner">
                        "{p.bio}"
                      </div>
                    )}

                    {/* Service Areas dynamic list */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.serviceAreasList && p.serviceAreasList.length > 0 ? (
                        p.serviceAreasList.map((area, index) => (
                          <span key={index} className="text-[10px] font-extrabold px-2.5 py-1 bg-sky-50/50 dark:bg-slate-900 border border-sky-150/40 dark:border-sky-950 rounded-lg text-sky-700 dark:text-sky-400 shadow-sm font-bangla">
                            {area}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-sky-50/50 dark:bg-slate-900 border border-sky-150/40 dark:border-sky-950 rounded-lg text-sky-700 dark:text-sky-400 shadow-sm font-bangla">
                            {p.serviceArea || (isBN ? 'ভেড়ামারা সকল এরিয়া' : 'Bheramara All Areas')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer layout: Location + Elegant full width bottom button */}
                  <div className="px-6 pb-6 pt-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 px-3 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-850 text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{locationLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenStatsModal(p)}
                      className="w-full text-center py-3.5 bg-neutral-950 hover:bg-neutral-8 00 dark:bg-neutral-50 dark:text-neutral-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>{isBN ? 'প্রোফাইল দেখুন' : 'Show Profile'}</span>
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* IMMERSIVE PROFILE DETAILS DRAWER/MODAL OVERLAY */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-fade-in" id="profile-detailed-modal">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
              
              {/* Top Banner Row */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">
                  {t('roles', selectedProfile.role)} / {t('jobCategories', selectedProfile.primaryCategory || '')}
                </span>
                
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    title={isBN ? "প্রোফাইল প্রিন্ট করুন" : "Print Profile"}
                    className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer flex items-center justify-center border border-gray-100 dark:border-gray-700 font-bold text-[10px]"
                  >
                    <Printer className="w-4 h-4 mr-1 shrink-0" />
                    <span>{isBN ? "প্রিন্ট" : "Print"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setSubmitRatingSuccess('');
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full transition-colors focus:outline-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Main Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={selectedProfile.profilePhoto || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200`}
                      alt={selectedProfile.fullName}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover border border-gray-105 dark:border-gray-700 shadow-md"
                    />
                    {selectedProfile.isActive !== false && (
                      <span className="absolute bottom-0 right-0 z-10 w-4 h-4 bg-white dark:bg-neutral-850 rounded-full flex items-center justify-center shadow" title={isBN ? 'বর্তমানে অনলাইন' : 'Online Now'}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-white dark:border-neutral-900" />
                      </span>
                    )}
                  </div>
                  
                  <div className="text-center sm:text-left space-y-1.5 min-w-0">
                    <h2 className="text-xl font-black text-gray-950 dark:text-white font-bangla flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span>{selectedProfile.fullName}</span>
                      {selectedProfile.isActive !== false && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {isBN ? 'অ্যাক্টিভ অনলাইন' : 'Active Online'}
                        </span>
                      )}
                    </h2>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star 
                          key={st} 
                          className={`w-3.5 h-3.5 ${st <= Math.round(selectedProfile.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
                        ({selectedProfile.rating?.toFixed(1) || '4.0'})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>
                          {(() => {
                            const parts = [];
                            if (selectedProfile.union) parts.push(selectedProfile.union);
                            if (selectedProfile.thana) parts.push(selectedProfile.thana);
                            if (selectedProfile.district) parts.push(selectedProfile.district);
                            if (selectedProfile.division) parts.push(selectedProfile.division);
                            if (parts.length > 0) return parts.join(', ');
                            return selectedProfile.division
                              ? `${selectedProfile.district ? selectedProfile.district + ', ' : ''}${selectedProfile.division}`
                              : (selectedProfile.locationIndex !== null && selectedProfile.locationIndex !== undefined ? (isBN ? LOCATIONS_BN[selectedProfile.locationIndex] : LOCATIONS_EN[selectedProfile.locationIndex]) : 'বাংলাদেশ');
                          })()}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        <span>{selectedProfile.experienceYears} {t('workerList.years')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges / Verifications list */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-xl flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400">{isBN ? 'অনুমোদিত কর্মী' : 'Approved Worker'}</h4>
                      <p className="text-[9px] text-emerald-600 font-semibold">{isBN ? 'এনআইডি ছবি সহ' : 'with NID Photo upload'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-950 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400">{isBN ? 'স্মার্ট ভেরিফাইড' : 'Smart Verified'}</h4>
                      <p className="text-[9px] text-blue-600 font-semibold">Verified Member</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Visitor Live Rating & Review Form */}
                <div className="p-5 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 dark:border-amber-950/40 rounded-[24px] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider flex items-center gap-1.5 font-bangla">
                      <span>⭐</span>
                      <span>রেটিং ও মতামত প্রদান করুন / Write a Review</span>
                    </h3>
                    <span className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-black uppercase">Visitor Tool</span>
                  </div>
                  
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal font-bold font-bangla">
                    আপনার রিভিউ ও মূল্যবান মতামত সরাসরি কর্মীর প্রোফাইলে যুক্ত হবে এবং অন্যরা দেখতে পারবে।
                  </p>

                  <div className="space-y-3">
                    {/* Visitor inputs: Name and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                          আপনার নাম / Your Name ({isBN ? 'ঐচ্ছিক' : 'Optional'})
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder={isBN ? "যেমন: আব্দুর রহমান" : "e.g., Abdur Rahman"}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                          মোবাইল নাম্বার / Mobile Number ({isBN ? 'ঐচ্ছিক' : 'Optional'})
                        </label>
                        <input
                          type="text"
                          value={reviewerPhone}
                          onChange={(e) => setReviewerPhone(e.target.value)}
                          placeholder="e.g., 017XXXXXXXX"
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Star Selection Row */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                        রেটিং নির্বাচন করুন / Select Star Rating
                      </label>
                      <div className="flex items-center gap-1 bg-white dark:bg-neutral-850 px-3 py-1.5 rounded-xl border border-neutral-100 dark:border-neutral-700 w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setVisitorRating(star)}
                            className={`text-2xl transition-all hover:scale-125 cursor-pointer ${
                              star <= visitorRating ? 'text-amber-500 drop-shadow' : 'text-neutral-200 dark:text-neutral-705'
                            }`}
                            title={`${star} Star`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 ml-2 mt-0.5">
                          {visitorRating}.0
                        </span>
                      </div>
                    </div>

                    {/* Comment Area */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                        আপনার মন্তব্য / Your Review comment
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={isBN ? "কর্মীর কাজ, আচরণ এবং সার্ভিস সম্পর্কে আপনার অভিজ্ঞতা লিখুন..." : "Describe your experience with the worker's quality, behavior, etc..."}
                        className="w-full p-3 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                      />
                    </div>

                    {reviewError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold font-bangla">
                        ⚠ {reviewError}
                      </div>
                    )}

                    {reviewSuccess && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold font-bangla">
                        ✓ {reviewSuccess}
                      </div>
                    )}

                    <button
                      onClick={() => handleSubmitReview(selectedProfile.id)}
                      disabled={submittingReview}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer block text-center border-b-2 border-orange-700"
                    >
                      {submittingReview ? 'রিভিউ সাবমিট হচ্ছে...' : 'রিভিউ ও রেটিং সাবমিট করুন (Submit Review)'}
                    </button>
                  </div>
                </div>

                {/* Reviews & Comments List */}
                <div className="p-5 bg-gray-50/50 dark:bg-neutral-900/40 border border-gray-100/50 dark:border-gray-800/50 rounded-[24px] space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-wider font-bangla flex items-center gap-1.5">
                      <span>💬</span>
                      <span>সকল রিভিউ ও মন্তব্য ({selectedProfile.reviews?.length || 0}) / Reviews & Comments</span>
                    </h3>
                  </div>

                  {(!selectedProfile.reviews || selectedProfile.reviews.length === 0) ? (
                    <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 font-bangla font-semibold">
                      এই কর্মীর প্রোফাইলে এখনও কোনো পাবলিক রিভিউ বা মন্তব্য করা হয়নি। প্রথম রিভিউটি আপনিই লিখুন!
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-gray-150/50 dark:divide-gray-800/40">
                      {selectedProfile.reviews.map((rev: any) => (
                        <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800 dark:text-white font-bangla">
                                {rev.reviewerName}
                              </span>
                              {rev.reviewerPhone && (
                                <span className="text-[10px] text-gray-400 font-mono tracking-tight font-semibold">
                                  ({isAdmin ? rev.reviewerPhone : (rev.reviewerPhone.substring(0, 5) + '******')})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex text-amber-500 text-[10px]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < rev.rating ? 'text-amber-500 font-bold' : 'text-gray-300 dark:text-gray-750'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-450 font-semibold font-mono">
                                {new Date(rev.createdAt).toLocaleDateString(isBN ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-650 dark:text-gray-350 font-bold font-bangla leading-relaxed bg-white dark:bg-neutral-850 p-3 rounded-2xl border border-gray-150/40 dark:border-gray-800">
                            {rev.comment}
                          </p>
                          
                          {/* Admin management control */}
                          {isAdmin && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleDeleteReview(selectedProfile.id, rev.id)}
                                className="text-[9px] text-red-605 hover:text-red-500 bg-red-500/5 dark:bg-red-950/20 hover:bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                🗑️ {isBN ? 'মতামত ডিলেট করুন (Admin)' : 'Delete Review (Admin)'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual Completeness Monitor */}
                <div className="p-4 bg-indigo-50/20 dark:bg-slate-900/30 border border-indigo-100/30 dark:border-indigo-950/40 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-500 tracking-wider font-sans">
                    <span>{isBN ? 'প্রোফাইল তথ্য সম্পূর্ণতা রিপোর্ট' : 'Profile Completeness Report'}</span>
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{calculateCompletenessForProfile(selectedProfile)}% Completed</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${calculateCompletenessForProfile(selectedProfile)}%` }}
                    />
                  </div>
                </div>

                {/* Plain Text Styled Bio */}
                <div className="space-y-2 font-sans">
                  <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    বায়োগ্রাফি এবং পরিচিতি / BIO Details
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-semibold whitespace-pre-line font-bangla">
                      {selectedProfile.bio || 'প্রোফাইল বিবরণী এখনো তৈরি করা হয়নি।'}
                    </p>
                  </div>
                </div>

                {/* Secure Contact & Address detailing cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider font-sans">যোগাযোগের নম্বর / Call Direct</h4>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center animate-pulse">
                        <Phone className="w-4 h-4" />
                      </div>
                      <a 
                        href={`tel:${selectedProfile.phone}`} 
                        className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline tracking-wide"
                      >
                        {selectedProfile.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider font-sans">সম্পূর্ণ ঠিকানা / Address</h4>
                    <p className="text-xs font-bold text-gray-750 dark:text-gray-300 font-bangla">
                      {selectedProfile.fullAddress || [selectedProfile.union, selectedProfile.thana, selectedProfile.district, selectedProfile.division].filter(Boolean).join(', ') || 'কুষ্টিয়া, বাংলাদেশ।'}
                    </p>
                  </div>
                </div>

                {/* SECURE ADMIN NID VERIFICATION PORTAL SECTION */}
                {isAdmin ? (
                  <div className="p-5 bg-rose-50/40 dark:bg-red-950/10 border border-rose-100 dark:border-red-950 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
                      <h4 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest font-sans">🔐 এডমিন সিকিউরিটি গার্ড (Admin NID Desk)</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">NID নাম্বার (National ID NUmber):</div>
                      <div className="text-sm font-black text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 inline-block px-3 py-1 rounded border border-neutral-200 dark:border-neutral-700">
                        {selectedProfile.nidNumber || 'সংযুক্ত নেই (N/A)'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500">NID Front (সামনের দিক):</div>
                        {selectedProfile.nidPhotoFront ? (
                          <img 
                            src={selectedProfile.nidPhotoFront} 
                            alt="NID Front" 
                            className="w-full h-24 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 hover:scale-[1.05] transition-transform cursor-zoom-in"
                          />
                        ) : (
                          <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] text-neutral-400 font-bold border border-dashed border-neutral-300">
                            আপলোড করা নেই
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500">NID Back (পেছনের দিক):</div>
                        {selectedProfile.nidPhotoBack ? (
                          <img 
                            src={selectedProfile.nidPhotoBack} 
                            alt="NID Back" 
                            className="w-full h-24 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 hover:scale-[1.05] transition-transform cursor-zoom-in"
                          />
                        ) : (
                          <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] text-neutral-400 font-bold border border-dashed border-neutral-300">
                            আপলোড করা নেই
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Direct 1-Click Support WhatsApp Connection */}
                <div className="p-1">
                  <a
                    href={`https://wa.me/8801717968098?text=${encodeURIComponent(`Hello Admin, I am contacting you from the profile of Worker ${selectedProfile.fullName} [ID: ${selectedProfile.id} / SLUG: ${selectedProfile.slug}].`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    id="whatsapp-contact-admin"
                  >
                    <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                    <span>এডমিনের মাধ্যমে ইজারাদায় যোগাযোগ করুন (WhatsApp Admin)</span>
                  </a>
                </div>

                {/* Specialties tags */}
                {selectedProfile.specialties && selectedProfile.specialties.length > 0 && (
                  <div className="space-y-2 font-sans">
                    <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">পেশাদার বিশেষত্ব / Specialized Areas</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProfile.specialties.map((tag) => (
                        <span key={tag} className="text-[10px] px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-300 font-bold rounded-lg border border-gray-200/40 uppercase">
                          {t('jobCategories', tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Control */}
                <ShareButtons slug={selectedProfile.slug} fullName={selectedProfile.fullName} />

              </div>

              {/* Bottom analytics view counts */}
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{selectedProfile.profileViews} views</span>
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">Manpower Hub Pro Card</span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerList;

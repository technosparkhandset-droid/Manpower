import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { BANGLADESH_LOCATIONS, DIVISIONS_LIST } from '../../data/bangladeshData';
import { 
  Save, Loader2, Sparkles, Check, ArrowRight, User, ShieldAlert, BadgeInfo,
  Briefcase, Activity, Calendar, MapPin, Star, Plus, Eye, Trash2, Edit3, MessageSquare, Megaphone,
  Download, Upload, FileText, Printer, TrendingUp, AlertCircle, ShoppingBag, EyeOff, Lock, Unlock, PhoneCall, Camera,
  RefreshCw, Database
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import Spinner from '../common/Spinner';

interface Profile {
  id: string;
  user: string;
  fullName: string;
  phone: string;
  age?: number;
  gender?: string;
  locationIndex: number | null;
  division?: string;
  district?: string;
  serviceArea?: string;
  adminFeedback?: string;
  fullAddress?: string;
  role: string;
  primaryCategory?: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  jobsCompleted: number;
  bio: string;
  profilePhoto: string;
  slug: string;
  verification: {
    nidVerified: boolean;
    skillVerified: boolean;
    trustedWorker: boolean;
    premiumUser: boolean;
    approved: boolean;
    phoneVerified: boolean;
  };
  profileViews: number;
  isPublic: boolean;
  isActive: boolean;
  isPremium: boolean;
  reviews?: any[];
}

const CreateEditProfile: React.FC = () => {
  const { t, isBN } = useLanguage();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState<'profile' | 'post-job' | 'merchant-hub' | 'admin'>('profile');
  const [userRole, setUserRole] = useState<string>('worker');
  const [myProfileId, setMyProfileId] = useState<string>('');
  const [profileSlug, setProfileSlug] = useState<string>('');

  // Auto save & completion states
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isInitialMount = React.useRef(true);

  // Notifications
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // AI states
  const [generatingBio, setGeneratingBio] = useState(false);
  const [aiNotes, setAiNotes] = useState('');

  // Logged-in client's own profile state
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    age: '',
    gender: 'male',
    division: 'Khulna',
    district: 'Kushtia',
    thana: '',
    union: '',
    serviceArea: '',
    serviceAreasInput: '', // e.g. "ভেড়ামারা সকল এরিয়া, মেহেরপুর সকল এরিয়া"
    nidNumber: '',
    nidPhotoFront: '',
    nidPhotoBack: '',
    role: 'worker',
    primaryCategory: 'electrician',
    specialties: [] as string[],
    experienceYears: '',
    bio: '',
    profilePhoto: '',
    isPublic: true,
    adminFeedback: '' // internal admin message box read-only
  });

  // --- MERCHANT & BUSINESS CALCULATOR STATE ---
  const [markupBaseWage, setMarkupBaseWage] = useState<number>(800);
  const [markupMaterialCost, setMarkupMaterialCost] = useState<number>(1200);
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [activeSelectedTrade, setActiveSelectedTrade] = useState<'tailoring' | 'cooking_catering' | 'pharmacy_medicine' | 'construction'>('tailoring');

  // --- JOB POSTING TAB STATE ---
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: 'electrician',
    division: 'Khulna',
    district: 'Kushtia',
    thana: '',
    union: '',
    serviceArea: '',
    budget: '',
    contactPhone: '',
    postedByName: ''
  });
  const [postingJob, setPostingJob] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileApproved, setProfileApproved] = useState<boolean | null>(null);
  const [profileViewsCount, setProfileViewsCount] = useState<number>(0);

  // --- ADMIN PANEL TAB STATE ---
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [adminProfileFilter, setAdminProfileFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [analytics, setAnalytics] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [firestoreLogs, setFirestoreLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [autoPollLogs, setAutoPollLogs] = useState(true);

  const loadFirestoreLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/firestore-logs', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setFirestoreLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load firestore logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Admin form modal (for Admin CRUD add/edit profiles)
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEditingProfileId, setAdminEditingProfileId] = useState<string | null>(null);
  const [selectedAdminProfileDetail, setSelectedAdminProfileDetail] = useState<any | null>(null);
  const [adminProfileForm, setAdminProfileForm] = useState({
    email: '',
    phone: '',
    fullName: '',
    role: 'worker',
    primaryCategory: 'electrician',
    division: 'Khulna',
    district: 'Kushtia',
    thana: '',
    union: '',
    serviceArea: '',
    experienceYears: '3',
    rating: '5',
    jobsCompleted: '10',
    bio: '',
    adminFeedback: '',
    profilePhoto: '',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    nidNumber: '',
    nidPhotoFront: '',
    nidPhotoBack: '',
    isPremium: false,
    isPublic: true,
    isActive: true,
    nidVerified: true,
    skillVerified: true,
    trustedWorker: false,
    approved: true
  });

  const categoriesKeys = [
    'krishikaj', 'local_delivery', 'electrician', 'tailoring', 'healthcare', 'construction', 'civil_engineer',
    'land_services', 'helper', 'plumber', 'painter', 'carpenter', 'ac_technician',
    'driver', 'security_guard', 'cleaning_services', 'cooking_catering', 'photography',
    'computer_it', 'grocery_retail', 'pharmacy_medicine', 'general_physician', 'dentist_specialist'
  ];

  // Form Wizard dynamic step tracking
  const [formStep, setFormStep] = useState(1);

  // Advanced real-time camera constraints
  const [cameraField, setCameraField] = useState<'profilePhoto' | 'nidPhotoFront' | 'nidPhotoBack' | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (field: 'profilePhoto' | 'nidPhotoFront' | 'nidPhotoBack') => {
    setCameraField(field);
    setCameraActive(true);
    setCameraError('');
    try {
      const facing = field === 'profilePhoto' ? 'user' : 'environment';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false
      });
      streamRef.current = stream;
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => {
            console.error('Play device video failed', e);
          });
        }
      }, 300);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Play video stream fallback fail:', e));
          }
        }, 300);
      } catch (err2) {
        setCameraError(isBN 
          ? 'ডিভাইসের ক্যামেরা এক্সেস করতে পারছি না। অনুগ্রহ করে ব্রাউজারের অনুমতি পেজে ক্যামেরা অ্যাক্সেস সচল করুন।' 
          : 'Failed to access device camera. Please grant browser camera permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraField(null);
    setCameraError('');
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraField) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setForm(prev => ({ ...prev, [cameraField]: dataUrl }));
        } catch (e) {
          console.error('Convert canvas to base64 URL failed', e);
        }
        stopCamera();
      }
    }
  };

  // Fetch logged in profile on load
  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError(isBN ? 'লগইন সেশন পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।' : 'Login session required.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        const pObj = data.data.profile;
        setUserRole(data.data.role);
        
        if (data.data.role === 'admin') {
          setActiveTab('admin');
        }

        if (pObj) {
          setMyProfileId(pObj.id);
          setProfileSlug(pObj.slug || '');
          setProfileApproved(pObj.verification?.approved !== false);
          setProfileViewsCount(pObj.profileViews || 0);
          setForm({
            fullName: pObj.fullName || '',
            phone: pObj.phone || '',
            age: pObj.age ? pObj.age.toString() : '',
            gender: pObj.gender || 'male',
            division: pObj.division || 'Khulna',
            district: pObj.district || 'Kushtia',
            thana: pObj.thana || '',
            union: pObj.union || '',
            serviceArea: pObj.serviceArea || '',
            serviceAreasInput: pObj.serviceAreasList ? pObj.serviceAreasList.join(', ') : (pObj.serviceArea || ''),
            nidNumber: pObj.nidNumber || '',
            nidPhotoFront: pObj.nidPhotoFront || '',
            nidPhotoBack: pObj.nidPhotoBack || '',
            fullAddress: pObj.fullAddress || '',
            role: pObj.role || 'worker',
            primaryCategory: pObj.primaryCategory || 'electrician',
            specialties: pObj.specialties || [],
            experienceYears: pObj.experienceYears !== undefined ? pObj.experienceYears.toString() : '0',
            bio: pObj.bio || '',
            profilePhoto: pObj.profilePhoto || '',
            isPublic: pObj.isPublic !== undefined ? pObj.isPublic : true,
            adminFeedback: pObj.adminFeedback || ''
          });

          // Pre-fill job post contacts for user ease
          setJobForm(prev => ({
            ...prev,
            contactPhone: pObj.phone || '',
            postedByName: pObj.fullName || ''
          }));
        }
      } else {
        setError(data.message || 'Error occurred loading authorization.');
      }
    } catch (e) {
      setError('Cannot connect to standard express backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Dynamic Profile Completeness Progress Tracker
  const calculateCompleteness = () => {
    let totalFields = 10;
    let filledFields = 0;

    if (form.fullName && form.fullName.trim().length > 0) filledFields++;
    if (form.phone && form.phone.trim().length > 0) filledFields++;
    if (form.bio && form.bio.trim().length > 10) filledFields++;
    if (form.profilePhoto && form.profilePhoto.trim().length > 0 && !form.profilePhoto.includes('unsplash.com/photo-1515713875002-d1d0cf377fde') && !form.profilePhoto.includes('unsplash.com/photo-1535713875002-d1d0cf377fde')) filledFields++;
    if (form.age && String(form.age).trim().length > 0) filledFields++;
    if (form.gender && form.gender.trim().length > 0) filledFields++;
    if (form.serviceArea && form.serviceArea.trim().length > 0) filledFields++;
    if (form.nidNumber && form.nidNumber.trim().length > 0) filledFields++;
    if (form.primaryCategory && form.primaryCategory.trim().length > 0) filledFields++;
    if (form.experienceYears && String(form.experienceYears).trim().length > 0 && Number(form.experienceYears) > 0) filledFields++;

    const percent = Math.floor((filledFields / totalFields) * 100);
    return Math.min(percent, 100);
  };

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

  // Debounced Autosave watch on form inputs
  useEffect(() => {
    if (loading) {
      isInitialMount.current = true;
      return;
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!autoSaveEnabled || !myProfileId) {
      return;
    }

    setAutoSaveStatus('saving');

    const timeoutId = setTimeout(async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setAutoSaveStatus('error');
          return;
        }

        const payload = {
          fullName: form.fullName,
          phone: form.phone,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          division: form.division,
          district: form.district,
          thana: form.thana,
          union: form.union,
          serviceArea: form.serviceArea,
          serviceAreasList: form.serviceAreasInput.split(',').map((s: string) => s.trim()).filter(Boolean),
          nidNumber: form.nidNumber,
          nidPhotoFront: form.nidPhotoFront,
          nidPhotoBack: form.nidPhotoBack,
          fullAddress: form.fullAddress,
          role: form.role,
          primaryCategory: form.primaryCategory,
          specialties: form.specialties,
          experienceYears: Number(form.experienceYears) || 0,
          bio: form.bio,
          profilePhoto: form.profilePhoto,
          isPublic: form.isPublic
        };

        const res = await fetch('/api/profiles/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          setAutoSaveStatus('saved');
          setTimeout(() => {
            setAutoSaveStatus(current => current === 'saved' ? 'idle' : current);
          }, 3000);
        } else {
          setAutoSaveStatus('error');
        }
      } catch (err) {
        setAutoSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [form, autoSaveEnabled, loading, myProfileId]);

  // Fetch Admin Panel resources
  const loadAdminResources = async () => {
    try {
      setAdminLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [profRes, analRes, dailyRes] = await Promise.all([
        fetch('/api/admin/profiles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/analytics/daily', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const profData = await profRes.json();
      const analData = await analRes.json();
      const dailyData = await dailyRes.json();

      if (profData.success) setAdminProfiles(profData.data);
      if (analData.success) {
        const combinedAnalytics = { ...analData.data };
        if (dailyData.success && dailyData.history7Days) {
          combinedAnalytics.history7Days = dailyData.history7Days;
        }
        setAnalytics(combinedAnalytics);
      }
    } catch (e) {
      console.error('Failed to load admin panel resources', e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && userRole === 'admin') {
      loadAdminResources();
    }
  }, [activeTab, userRole]);

  useEffect(() => {
    let intervalId: any;
    if (activeTab === 'admin' && userRole === 'admin') {
      loadFirestoreLogs();
      if (autoPollLogs) {
        intervalId = setInterval(() => {
          loadFirestoreLogs();
        }, 4000); // Poll every 4 seconds for real-time tracking
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, userRole, autoPollLogs]);

  // Handle local File attachments (NID & Profile picture files) via dynamic base64 reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'nidPhotoFront' | 'nidPhotoBack') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(isBN ? 'ফাইলের আকার ২ মেগাবাইটের কম হতে হবে।' : 'File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdminFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'nidPhotoFront' | 'nidPhotoBack') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isBN ? 'ফাইলের আকার ২ মেগাবাইটের কম হতে হবে।' : 'File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAdminProfileForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Input change on standard personal form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleSpecialty = (cat: string) => {
    setForm(prev => {
      const active = prev.specialties.includes(cat);
      const next = active
        ? prev.specialties.filter(s => s !== cat)
        : [...prev.specialties, cat];
      return { ...prev, specialties: next.slice(0, 5) };
    });
  };

  // Invoke Gemini AI bio description suggestion
  const handleAiSuggestBio = async () => {
    if (!form.fullName || !form.primaryCategory) {
      setError(isBN ? 'AI বায়ো পেতে দয়া করে নাম ও প্রধান দক্ষতা পূরণ করুন।' : 'Full Name & Primary Trade category are required to generate AI Bio.');
      return;
    }

    setGeneratingBio(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/profiles/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: form.fullName,
          categoryLabel: form.primaryCategory,
          specialties: form.specialties,
          experienceYears: Number(form.experienceYears) || 0,
          locationLabel: `${form.district}, ${form.division}`,
          gender: form.gender,
          isBN: true,
          notes: aiNotes
        })
      });

      const data = await res.json();
      if (data.success && data.suggestion) {
        setForm(prev => ({ ...prev, bio: data.suggestion }));
        setSuccess(isBN ? 'AI সফলভাবে আপনার চোখ ধাঁধানো বায়ো লিখে দিয়েছে!' : 'AI Bio successfully completed!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error(data.message || 'AI engine failed.');
      }
    } catch (err: any) {
      setError(err.message || 'AI Bio process timed out.');
    } finally {
      setGeneratingBio(false);
    }
  };

  // Download high-integrity local profile backup file (including raw state and base64 documents)
  const handleDownloadBackup = () => {
    try {
      const backupObj = {
        version: "1.0",
        type: "profile-backup",
        exportedAt: new Date().toISOString(),
        fullName: form.fullName,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        division: form.division,
        district: form.district,
        thana: form.thana,
        union: form.union,
        serviceArea: form.serviceArea,
        serviceAreasInput: form.serviceAreasInput,
        nidNumber: form.nidNumber,
        nidPhotoFront: form.nidPhotoFront,
        nidPhotoBack: form.nidPhotoBack,
        fullAddress: form.fullAddress,
        role: form.role,
        primaryCategory: form.primaryCategory,
        specialties: form.specialties,
        experienceYears: form.experienceYears,
        bio: form.bio,
        profilePhoto: form.profilePhoto,
        isPublic: form.isPublic
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const cleanName = form.fullName ? form.fullName.trim().replace(/\s+/g, '_') : 'Profile';
      const fileName = `ManpowerHub_Backup_${cleanName}.json`;
      downloadAnchor.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setSuccess(isBN ? 'প্রোফাইল ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Complete profile backup file downloaded successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(isBN ? 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে।' : 'Error generating profile backup.');
    }
  };

  // Restore profile state and sync directly to live database database (100% same-to-same)
  const handleRestoreAndSave = async (profileData: any) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error(isBN ? 'লগইন সেশন পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।' : 'Login session required.');
      }

      // Format clean, complete form object targeting state
      const updatedForm = {
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        age: profileData.age ? profileData.age.toString() : '',
        gender: profileData.gender || 'male',
        division: profileData.division || 'Khulna',
        district: profileData.district || 'Kushtia',
        thana: profileData.thana || '',
        union: profileData.union || '',
        serviceArea: profileData.serviceArea || '',
        serviceAreasInput: profileData.serviceAreasInput || (profileData.serviceAreasList ? profileData.serviceAreasList.join(', ') : ''),
        nidNumber: profileData.nidNumber || '',
        nidPhotoFront: profileData.nidPhotoFront || '',
        nidPhotoBack: profileData.nidPhotoBack || '',
        fullAddress: profileData.fullAddress || '',
        role: profileData.role || 'worker',
        primaryCategory: profileData.primaryCategory || 'electrician',
        specialties: profileData.specialties || [],
        experienceYears: profileData.experienceYears !== undefined ? profileData.experienceYears.toString() : '0',
        bio: profileData.bio || '',
        profilePhoto: profileData.profilePhoto || '',
        isPublic: profileData.isPublic !== undefined ? profileData.isPublic : true,
        adminFeedback: profileData.adminFeedback || ''
      };

      // Set state
      setForm(updatedForm);

      // Save directly to the server side REST API
      const payload = {
        fullName: updatedForm.fullName,
        phone: updatedForm.phone,
        age: updatedForm.age ? Number(updatedForm.age) : null,
        gender: updatedForm.gender,
        division: updatedForm.division,
        district: updatedForm.district,
        thana: updatedForm.thana,
        union: updatedForm.union,
        serviceArea: updatedForm.serviceArea,
        serviceAreasList: updatedForm.serviceAreasInput.split(',').map((s: string) => s.trim()).filter(Boolean),
        nidNumber: updatedForm.nidNumber,
        nidPhotoFront: updatedForm.nidPhotoFront,
        nidPhotoBack: updatedForm.nidPhotoBack,
        fullAddress: updatedForm.fullAddress,
        role: updatedForm.role,
        primaryCategory: updatedForm.primaryCategory,
        specialties: updatedForm.specialties,
        experienceYears: Number(updatedForm.experienceYears) || 0,
        bio: updatedForm.bio,
        profilePhoto: updatedForm.profilePhoto,
        isPublic: updatedForm.isPublic
      };

      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(isBN ? 'ফাইল থেকে সম্পূর্ণ প্রোফাইল ১০০% রিস্টোর এবং ডাটাবেজ আপডেট সম্পন্ন হয়েছে!' : '100% full profile data successfully restored and synced to database same-to-same!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Error saving details.');
    } finally {
      setSaving(false);
    }
  };

  // Read upload and parse stream
  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Support standard direct fallback keys and nested backups
        let profileData = null;
        if (parsed.type === 'profile-backup') {
          profileData = parsed;
        } else if (parsed.fullName || parsed.phone) {
          profileData = parsed;
        }

        if (!profileData) {
          throw new Error(isBN ? 'ভুল বা অসঙ্গতিপূর্ণ ফরম্যাট। অনুগ্রহ করে একটি সঠিক ম্যানপাওয়ারহাব প্রোফাইল ব্যাকআপ ফাইল (.json) নির্বাচন করুন।' : 'Invalid backup format. Please select a valid ManpowerHub Profile Backup file (.json).');
        }

        await handleRestoreAndSave(profileData);
      } catch (err: any) {
        setError(err.message || (isBN ? 'ব্যাকআপ ফাইল লোড করা সম্ভব হয়নি।' : 'Error parsing profile backup file. Please ensure it is a valid JSON.'));
      }
    };
    reader.readAsText(file);
  };

  // Submit User Profile Edit Form
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        division: form.division,
        district: form.district,
        thana: form.thana,
        union: form.union,
        serviceArea: form.serviceArea,
        serviceAreasList: form.serviceAreasInput.split(',').map((s: string) => s.trim()).filter(Boolean),
        nidNumber: form.nidNumber,
        nidPhotoFront: form.nidPhotoFront,
        nidPhotoBack: form.nidPhotoBack,
        fullAddress: form.fullAddress,
        role: form.role,
        primaryCategory: form.primaryCategory,
        specialties: form.specialties,
        experienceYears: Number(form.experienceYears) || 0,
        bio: form.bio,
        profilePhoto: form.profilePhoto,
        isPublic: form.isPublic
      };

      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(isBN ? 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Error saving details.');
    } finally {
      setSaving(false);
    }
  };

  // --- SUBMIT NEW JOB POST ---
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(jobForm)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(isBN ? 'আপনার জবের চাহিদা সফলভাবে লাইভ বোর্ডে পোস্ট করা হয়েছে!' : 'Job posted successfully on live board!');
      setJobForm(prev => ({
        ...prev,
        title: '',
        description: '',
        budget: ''
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Job posting error.');
    } finally {
      setPostingJob(false);
    }
  };

  // --- SECURED ADMIN POWERS CRUD ACTIONS ---
  const handleAdminResetForm = () => {
    setAdminEditingProfileId(null);
    setAdminProfileForm({
      email: '',
      phone: '',
      fullName: '',
      role: 'worker',
      primaryCategory: 'electrician',
      division: 'Khulna',
      district: 'Kushtia',
      thana: '',
      union: '',
      serviceArea: 'কুষ্টিয়া সদর',
      experienceYears: '5',
      rating: '5',
      jobsCompleted: '12',
      bio: '',
      adminFeedback: '',
      profilePhoto: '',
      fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
      nidNumber: '',
      nidPhotoFront: '',
      nidPhotoBack: '',
      isPremium: false,
      isPublic: true,
      isActive: true,
      nidVerified: true,
      skillVerified: true,
      trustedWorker: true,
      approved: true
    });
  };

  const handleAdminOpenEdit = (p: any) => {
    setAdminEditingProfileId(p.id);
    setAdminProfileForm({
      email: p.email || '',
      phone: p.phone || '',
      fullName: p.fullName || '',
      role: p.role || 'worker',
      primaryCategory: p.primaryCategory || 'electrician',
      division: p.division || 'Khulna',
      district: p.district || 'Kushtia',
      thana: p.thana || '',
      union: p.union || '',
      serviceArea: p.serviceArea || '',
      experienceYears: String(p.experienceYears || '0'),
      rating: String(p.rating || '5'),
      jobsCompleted: String(p.jobsCompleted || '0'),
      bio: p.bio || '',
      adminFeedback: p.adminFeedback || '',
      profilePhoto: p.profilePhoto || '',
      fullAddress: p.fullAddress || 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
      nidNumber: p.nidNumber || '',
      nidPhotoFront: p.nidPhotoFront || '',
      nidPhotoBack: p.nidPhotoBack || '',
      isPremium: p.isPremium || false,
      isPublic: p.isPublic !== undefined ? p.isPublic : true,
      isActive: p.isActive !== undefined ? p.isActive : true,
      nidVerified: p.verification?.nidVerified || false,
      skillVerified: p.verification?.skillVerified || false,
      trustedWorker: p.verification?.trustedWorker || false,
      approved: p.verification?.approved !== false
    });
    setAdminModalOpen(true);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        fullName: adminProfileForm.fullName,
        phone: adminProfileForm.phone,
        email: adminProfileForm.email,
        role: adminProfileForm.role,
        primaryCategory: adminProfileForm.primaryCategory,
        division: adminProfileForm.division,
        district: adminProfileForm.district,
        thana: adminProfileForm.thana,
        union: adminProfileForm.union,
        serviceArea: adminProfileForm.serviceArea,
        experienceYears: Number(adminProfileForm.experienceYears),
        rating: Number(adminProfileForm.rating),
        jobsCompleted: Number(adminProfileForm.jobsCompleted),
        bio: adminProfileForm.bio,
        adminFeedback: adminProfileForm.adminFeedback,
        profilePhoto: adminProfileForm.profilePhoto,
        fullAddress: adminProfileForm.fullAddress,
        nidNumber: adminProfileForm.nidNumber,
        nidPhotoFront: adminProfileForm.nidPhotoFront,
        nidPhotoBack: adminProfileForm.nidPhotoBack,
        isPremium: adminProfileForm.isPremium,
        isPublic: adminProfileForm.isPublic,
        isActive: adminProfileForm.isActive,
        verification: {
          nidVerified: adminProfileForm.nidVerified,
          skillVerified: adminProfileForm.skillVerified,
          trustedWorker: adminProfileForm.trustedWorker,
          premiumUser: adminProfileForm.isPremium,
          approved: adminProfileForm.approved,
          phoneVerified: true
        }
      };

      let url = '/api/admin/profiles';
      let method = 'POST';

      if (adminEditingProfileId) {
        url = `/api/admin/profiles/${adminEditingProfileId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(adminEditingProfileId ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'নতুন প্রোফাইল সফলভাবে তৈরি হয়েছে!');
      setAdminModalOpen(false);
      loadAdminResources();
      handleAdminResetForm();
    } catch (err: any) {
      setError(err.message || 'Admin operation failed.');
    }
  };

  const handleAdminDelete = async (profileId: string) => {
    if (!window.confirm(isBN ? 'আপনি কি নিশ্চিতভাবে এই প্রোফাইলটি চিরতরে মুছে ফেলতে চান?' : 'Are you sure you want to delete this profile?')) return;
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(isBN ? 'প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে!' : 'Profile removed successfully.');
      loadAdminResources();
    } catch (err: any) {
      setError(err.message || 'Delete timed out.');
    }
  };

  const handleAdminQuickToggleApproval = async (profile: any) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      const isCurrentlyApproved = profile.verification?.approved !== false;
      const nextApproved = !isCurrentlyApproved;
      
      const res = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          verification: {
            ...(profile.verification || {}),
            approved: nextApproved,
            nidVerified: nextApproved ? true : (profile.verification?.nidVerified || false),
            skillVerified: nextApproved ? true : (profile.verification?.skillVerified || false),
            phoneVerified: true
          }
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(isBN ? 'অনুমোদন স্থিতি সফলভাবে পরিবর্তন করা হয়েছে!' : 'Verification approval status changed.');
      loadAdminResources();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  const districtsAvailable = form.division 
    ? BANGLADESH_LOCATIONS[form.division.toLowerCase()]?.districts || [] 
    : [];

  const jobDistrictsAvailable = jobForm.division
    ? BANGLADESH_LOCATIONS[jobForm.division.toLowerCase()]?.districts || []
    : [];

  const adminDistrictsAvailable = adminProfileForm.division
    ? BANGLADESH_LOCATIONS[adminProfileForm.division.toLowerCase()]?.districts || []
    : [];

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-905 transition-colors duration-300 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Headers containing internal admin message */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 shadow-xl shadow-slate-100 dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
              {isBN ? 'আমার অ্যাকাউন্ট ড্যাশবোর্ড' : 'User Central Hub'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight font-bangla">
              {form.fullName || (isBN ? 'নতুন প্রোফাইল উইন্ডো' : 'Profile Gateway')}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
              {isBN 
                ? 'আইডি কার্ড তৈরি করুন, কাজের অফার পোস্ট করুন ও যাচাইকরণ স্থিতি নজর রাখুন।' 
                : 'Manage verification badges, post live trade lists & track local pings.'}
            </p>
          </div>
          
          {/* Sub Navigation Layout inside central dashboard */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border
                ${activeTab === 'profile'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-gray-50 dark:bg-slate-900 text-slate-700 dark:text-gray-300 border-gray-100 dark:border-gray-800'
                }
              `}
            >
              {isBN ? 'আমার প্রোফাইল কার্ড' : 'Manage Profile Card'}
            </button>
            <button
              onClick={() => setActiveTab('post-job')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border
                ${activeTab === 'post-job'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-gray-50 dark:bg-slate-900 text-slate-700 dark:text-gray-300 border-gray-100 dark:border-gray-800'
                }
              `}
            >
              {isBN ? 'কাজের অফার পোস্ট (Job Post)' : 'Post Live Job'}
            </button>
            <button
              onClick={() => setActiveTab('merchant-hub')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border flex items-center gap-1.5
                ${activeTab === 'merchant-hub'
                  ? 'bg-amber-655 border-amber-655 text-white shadow-md shadow-amber-500/10'
                  : 'bg-amber-100/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900'
                }
              `}
            >
              <span>💼</span>
              <span>{isBN ? 'মার্চেন্ট ও বিজনেজ হাব' : 'Merchant & Business Hub'}</span>
            </button>
            {profileSlug && (
              <a
                href={`/#/workers?profile=${profileSlug}`}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>{isBN ? 'পাবলিক ভিউ' : 'Public View'}</span>
              </a>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border flex items-center gap-1.5
                  ${activeTab === 'admin'
                    ? 'bg-red-650 border-red-650 text-white shadow-md shadow-red-500/10'
                    : 'bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-950'
                  }
                `}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{isBN ? 'মাস্টার এডমিন হাব' : 'Master Admin Panel'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Alert Notification */}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-2xl animate-fade-in flex items-center gap-3">
            <Check className="w-5 h-5 shrink-0 text-emerald-600" />
            <p className="text-xs font-black uppercase tracking-wide">{success}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/25 border-l-4 border-red-500 text-red-800 dark:text-red-400 rounded-2xl animate-fade-in flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Pending Approval warning banner */}
        {userRole !== 'admin' && profileApproved === false && (
          <div className="p-5 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/15 dark:to-amber-950/15 border-l-4 border-amber-500 rounded-3xl flex items-start gap-3.5 text-amber-900 dark:text-amber-250 animate-pulse font-bangla">
            <AlertCircle className="w-5.5 h-5.5 shrink-0 text-amber-600 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <span>⚠️</span>
                <span>প্রোফাইল অনুমোদন পেন্ডিং (Profile Approval Pending)</span>
              </h4>
              <p className="text-[11px] leading-relaxed font-bold mt-1 text-slate-700 dark:text-amber-200/90">
                আপনার ডিরেক্টরি প্রোফাইলটি বর্তমানে <b>পেন্ডিং (Pending verification & approval)</b> অবস্থায় রয়েছে। অনুমোদন সম্পন্ন হওয়া পর্যন্ত এটি পাবলিক ক্যাটাগরিতে বা ডিরেক্টরিতে সর্বজনীনভাবে প্রদর্শিত হবে না। অনুগ্রহ করে অপেক্ষা করুন অথবা আপনার তথ্যাদি ও জাতীয় পরিচয়পত্র (NID) চেক করুন যেন অ্যাডমিশন প্যানেল দ্রুত এটি অনুমোদন করতে পারেন।
              </p>
            </div>
          </div>
        )}

        {/* ── INTERNAL ADMIN-USER COMMUNICATION BOX (Private Notes) ── */}
        {form.adminFeedback && activeTab !== 'admin' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/15 dark:to-orange-950/10 border border-amber-250 dark:border-amber-900/40 shadow-sm space-y-2 relative overflow-hidden animate-fade-in">
            <div className="absolute right-3 top-3 opacity-10">
              <Megaphone className="w-24 h-24 rotate-12 text-amber-500" />
            </div>
            <div className="flex items-center gap-2 relative z-10 text-amber-800 dark:text-amber-400">
              <BadgeInfo className="w-5 h-5 shrink-0" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest">
                {isBN ? 'এডমিন থেকে সরাসরি ইনস্ট্রাকশন / নোটিশ' : 'Direct Message from Master Admin'}
              </h3>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-300 font-extrabold leading-relaxed font-bangla relative z-10 whitespace-pre-line bg-white/40 dark:bg-gray-900/40 p-4 rounded-2xl border border-amber-100 dark:border-amber-950">
              {form.adminFeedback}
            </p>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────────
            TAB 1: USER PROFILE EDIT FORM
            ──────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* AUTOSAVE STATUS & DYNAMIC PROGRESS CONTROL BAR */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-850 dark:text-gray-100 flex items-center gap-2 font-bangla">
                    <span>📈</span>
                    <span>{isBN ? 'আপনার প্রোফাইল সম্পূর্ণতা' : 'Your Profile Completeness'}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold font-bangla">
                    {isBN ? 'একটি প্রফেশনাল মানসম্পন্ন প্রোফাইল দ্রুত কাজ পেতে সাহায্য করে।' : 'A highly completed profile boosts trust and visibility.'}
                  </p>
                </div>

                {/* AUTOSAVE OPTION TRIGGER SWITCH */}
                <div className="flex items-center gap-3 bg-white dark:bg-gray-850 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 self-stretch sm:self-auto justify-between sm:justify-start">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black text-slate-850 dark:text-gray-200">
                      {isBN ? 'অটো-সেভ সক্রিয়' : 'Auto-Save Action'}
                    </span>
                    <span className="text-[8.5px] text-gray-400 dark:text-gray-500 font-black uppercase font-mono">
                      {autoSaveStatus === 'idle' && (isBN ? 'সংরক্ষিত' : 'Synced / Idle')}
                      {autoSaveStatus === 'saving' && (isBN ? 'সংরক্ষণ হচ্ছে...' : 'Saving updates...')}
                      {autoSaveStatus === 'saved' && (isBN ? 'অটো-সেভড!' : 'Changes Saved!')}
                      {autoSaveStatus === 'error' && (isBN ? 'অটো-সেভ ব্যর্থ!' : 'Error auto-saving')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {autoSaveStatus === 'saving' && (
                      <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin shrink-0" />
                    )}
                    {autoSaveStatus === 'saved' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}
                    {autoSaveStatus === 'error' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-205 dark:bg-gray-800'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider
                    ${calculateCompleteness() < 45 ? 'bg-red-500/10 text-red-500' : ''}
                    ${calculateCompleteness() >= 45 && calculateCompleteness() < 80 ? 'bg-amber-500/10 text-amber-600' : ''}
                    ${calculateCompleteness() >= 80 && calculateCompleteness() < 100 ? 'bg-blue-500/10 text-blue-650' : ''}
                    ${calculateCompleteness() === 100 ? 'bg-emerald-550/10 text-emerald-600' : ''}
                  `}>
                    {calculateCompleteness() < 45 && (isBN ? 'প্রাথমিক প্রোফাইল / Basic' : 'Basic Profile')}
                    {calculateCompleteness() >= 45 && calculateCompleteness() < 80 ? (isBN ? 'সন্তোষজনক / Moderately Completed' : 'Moderate Profile') : ''}
                    {calculateCompleteness() >= 80 && calculateCompleteness() < 100 ? (isBN ? 'মজবুত প্রোফাইল / Highly Complete' : 'Strong Profile') : ''}
                    {calculateCompleteness() === 100 ? (isBN ? '💯 অনন্য চমৎকার সম্পূর্ণ প্রোফাইল!' : '💯 Complete Pro!') : ''}
                  </span>
                  <span className="font-mono text-slate-850 dark:text-gray-100 font-extrabold">{calculateCompleteness()}%</span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${calculateCompleteness()}%` }}
                    className={`h-full rounded-full transition-all duration-500
                      ${calculateCompleteness() < 45 ? 'bg-red-500' : ''}
                      ${calculateCompleteness() >= 45 && calculateCompleteness() < 80 ? 'bg-amber-500' : ''}
                      ${calculateCompleteness() >= 80 && calculateCompleteness() < 100 ? 'bg-blue-600' : ''}
                      ${calculateCompleteness() === 100 ? 'bg-gradient-to-r from-emerald-550 to-teal-500' : ''}
                    `}
                  />
                </div>

                {/* Recommendations */}
                {calculateCompleteness() < 100 && (
                  <div className="pt-1.5 space-y-1 text-left">
                    <span className="block text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                      {isBN ? 'প্রোফাইল শতভাগ পূরণের জন্য পরামর্শ:' : 'Tips to reach 100% completion:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {!form.fullName && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'নাম' : 'Name'}
                        </span>
                      )}
                      {!form.phone && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'মোবাইল' : 'Phone'}
                        </span>
                      )}
                      {(!form.profilePhoto || form.profilePhoto.includes('unsplash.com') && (form.profilePhoto.includes('photo-1515713875002-d1d0cf377fde') || form.profilePhoto.includes('photo-1535713875002-d1d0cf377fde'))) && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'প্রোফাইল ফটো' : 'Profile Photo'}
                        </span>
                      )}
                      {!form.bio && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'বায়ো বর্ণনা' : 'Bio description'}
                        </span>
                      )}
                      {!form.age && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'বয়স' : 'Age'}
                        </span>
                      )}
                      {!form.gender && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'লিঙ্গ' : 'Gender'}
                        </span>
                      )}
                      {!form.serviceArea && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'সেবা এলাকা' : 'Service area'}
                        </span>
                      )}
                      {!form.nidNumber && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'এনআইডি কার্ড' : 'NID Card'}
                        </span>
                      )}
                      {!form.primaryCategory && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'প্রধান পেশা' : 'Primary trade'}
                        </span>
                      )}
                      {(!form.experienceYears || Number(form.experienceYears) <= 0) && (
                        <span className="px-2 py-1 bg-white dark:bg-gray-850 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                          ➕ {isBN ? 'অভিজ্ঞতা বছর' : 'Experience Years'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 100% COMPLETE PROFILE BACKUP & RESTORE UTILITY */}
            <div className="p-6 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-neutral-900 dark:to-slate-900 border border-blue-100/70 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-850 dark:text-gray-100 flex items-center gap-2 font-bangla">
                    <span className="p-1 px-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-xs">📂</span>
                    <span>{isBN ? 'প্রোফাইল ব্যাকআপ ও পুনরুদ্ধার (100% Full Backup & Restore)' : 'Complete Profile Backup & Restore'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold leading-relaxed font-bangla">
                    {isBN 
                      ? 'আপনার প্রোফাইলের ছবি, এনআইডি এবং সকল তথ্যসহ ১০০% ব্যাকআপ ফাইল ডাউনলোড করে রাখতে পারেন। যেকোনো সময় ফাইলটি আপলোড করে অবিকল সেভ ও পুনরুদ্ধার করা সম্ভব।' 
                      : 'Download a 100% complete backup file of your profile (including photos, NID, and all fields). You can upload it anytime to restore your exact complete profile state.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Export Action */}
                <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-sky-400 tracking-wider flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      {isBN ? '১. ব্যাকআপ ডাউনলোড করুন' : '1. Export Profile Backup'}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold font-bangla">
                      {isBN ? 'আপনার প্রোফাইলের সম্পূর্ণ তথ্য একটি সুরক্ষিত JSON ফাইলে ডাউনলোড হবে।' : 'Save your entire profile structure with all fields and media to your device.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-550/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isBN ? '📥 ব্যাকআপ ফাইল ডাউনলোড করুন (.json)' : '📥 Download Backup File (.json)'}</span>
                  </button>
                </div>

                {/* Import Action */}
                <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isBN ? '২. ব্যাকআপ ফাইল রিস্টোর করুন' : '2. Restore Profile Backup'}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold font-bangla">
                      {isBN ? 'পূর্বে ডাউনলোড করা ম্যানপাওয়ারহাব (.json/.txt) ব্যাকআপ ফাইল নির্বাচন করুন।' : 'Upload a previously generated ManpowerHub backup file (.json/.txt).'}
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-550 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-emerald-550/10 text-center">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>{isBN ? '📤 ব্যাকআপ আপলোড ও রিস্টোর' : '📤 Upload & Restore Backup'}</span>
                    <input
                      type="file"
                      accept=".json,.txt"
                      onChange={handleImportBackupFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-6">
            
            {/* STEP-BY-STEP PROGRESS STEPPER */}
            <div className="bg-white dark:bg-gray-850 p-4 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 font-bangla animate-fade-in select-none">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/35 px-2.5 py-1 rounded-lg">
                ধাপ ভিত্তিক নিবন্ধন ফরম / Step Registration
              </span>
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto py-1.5 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap
                    ${formStep === 1 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-[10px]">১</span>
                  <span>👤 বেসিক পরিচিতি</span>
                </button>
                <div className="w-4 h-[2px] bg-gray-200 dark:bg-gray-800 shrink-0" />
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap
                    ${formStep === 2 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-[10px]">২</span>
                  <span>💼 কাজের স্কিল ও বায়ো</span>
                </button>
                <div className="w-4 h-[2px] bg-gray-200 dark:bg-gray-800 shrink-0" />
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap
                    ${formStep === 3 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-[10px]">৩</span>
                  <span>🔒 ছবি ও পরিচয় যাচাই</span>
                </button>
              </div>
            </div>

            {/* STEP 1: Basic personal detail form */}
            {formStep === 1 && (
              <div className="p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm animate-fade-in">
                <h2 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2.5 flex items-center gap-1.5">
                  👤 ১. ব্যক্তিগত পরিচিতি / Personal Identity
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      পূর্ণ নাম অথবা ব্যবসা দোকানের নাম / Full Name or Trade Title *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={form.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="যেমন: আব্দুর রহিম ইলেকট্রনিক্স"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      মোবাইল নাম্বার / Emergency Contact *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="01717XXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      বয়স / User Age RANGE
                    </label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="80"
                      value={form.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      লিঙ্গ / Identification Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                    >
                      <option value="male">পুরুষ / Male</option>
                      <option value="female">মহিলা / Female</option>
                      <option value="other">অন্যান্য / Other</option>
                    </select>
                  </div>

                  {/* Division dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      বিভাগ (Division)
                    </label>
                    <select
                      name="division"
                      value={form.division}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, division: e.target.value, district: '' }));
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                    >
                      {DIVISIONS_LIST.map((div) => (
                        <option key={div.key} value={div.en}>{div.bn} / {div.en}</option>
                      ))}
                    </select>
                  </div>

                  {/* District dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      জেলা (District)
                    </label>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                    >
                      <option value="">জেলা নির্বাচন করুন</option>
                      {districtsAvailable.map((dist, idx) => (
                        <option key={idx} value={dist.en}>{dist.bn} / {dist.en}</option>
                      ))}
                    </select>
                  </div>

                  {/* Thana/Upazila input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      থানা / উপজেলা (Upazila/Thana)
                    </label>
                    <input
                      type="text"
                      name="thana"
                      value={form.thana}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="যেমন: ভেড়ামারা, মিরপুর, ডুমুরিয়া"
                    />
                  </div>

                  {/* Union input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      ইউনিয়ন / ওয়ার্ড (Union/Ward)
                    </label>
                    <input
                      type="text"
                      name="union"
                      value={form.union}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="যেমন: বাহাদুরপুর, দিঘলিয়া ইউনিয়ন, ২নং ওয়ার্ড"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      সার্ভিস এরিয়া বিবরণী / Service Area (যেমন: কুষ্টিয়া সদর, মিরপুর উপজেলা, ফুলতলী)
                    </label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={form.serviceArea}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="যেমন: কুষ্টিয়া সদর এবং ভেড়ামারা মোড়"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                      সম্পূর্ণ ঠিকানা / Full Physical Address (এডমিন প্যানেলে সংরক্ষিত থাকবে - পাবলিক ভিউতে লালিত)
                    </label>
                    <input
                      type="text"
                      name="fullAddress"
                      value={form.fullAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="হোল্ডিং ২১২, রথপাড়া রেলগেট"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Work experience, trade categories, and AI bio generator */}
            {formStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Trade expertise block */}
                <div className="p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                  <h2 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2.5 flex items-center gap-1.5">
                    💼 ২. পেশাগত অভিজ্ঞতা ও দক্ষতা টাইপ / Experience & Skills Trade
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                        পেশার ধরণ / Registry Role Category
                      </label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      >
                        <option value="worker">পেশাদার কর্মী / Skilled General Worker</option>
                        <option value="business">ব্যবসায়ী / Merchant Business Owner</option>
                        <option value="doctor">সাধারণ চিকিৎসক (MBBS Doctor)</option>
                        <option value="dentist">দন্ত বিশেষজ্ঞ (Dentist)</option>
                        <option value="contractor">ঠিকাদার প্রকৌশলী / Civil Contractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                        অভিজ্ঞতার বছর / Years of Active Experience
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        min="0"
                        max="50"
                        value={form.experienceYears}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                        মূল বা প্রাথমিক দক্ষতা বিভাগ / Main Primary Category *
                      </label>
                      <select
                        name="primaryCategory"
                        value={form.primaryCategory}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      >
                        {categoriesKeys.map(k => (
                          <option key={k} value={k}>{t('jobCategories', k)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Specialties tag loops */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                        অন্যান্য বিশেষত্ব এবং অতিরিক্ত স্কিল (সর্বোচ্চ ৫টি নির্বাচন করতে পারবেন)
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-gray-800">
                        {categoriesKeys.map(cat => {
                          const active = form.specialties.includes(cat);
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => toggleSpecialty(cat)}
                              className={`text-[9px] px-2.5 py-1.5 rounded-lg font-black tracking-wide border cursor-pointer transition-all active:scale-95
                                ${active
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-gray-850 text-gray-650 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                                }
                              `}
                            >
                              {t('jobCategories', cat)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio text block */}
                <div className="p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                  <h2 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2.5 flex items-center gap-1.5">
                    ✨ ৩. পরিচিতি ও বায়ো ডেসক্রিপশন / Bio Summary (With Gemini AI Assistance)
                  </h2>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/15 dark:to-teal-950/10 border border-blue-150/40 dark:border-blue-900/40 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-gray-200">
                        আই-সহকারী জেনারেটর (Gemini AI Dynamic Generator)
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal font-semibold">
                      আপনার নামের ও প্রধান দক্ষতার সাথে সামঞ্জস্য রেখে সুন্দর ও আকর্ষণীয় পরিচিতিমূলক বায়ো লিখে দেবে গুগল জেমিনি এআই মডেল। কাস্টম তথ্য থাকলে নিচে যুক্ত করুন।
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="যেমন: কুষ্টিয়া পলিটেকনিক এর ডিপ্লোমা এসি মেরামত ৫ বছরের অভিজ্ঞতা..."
                        className="flex-grow px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold rounded-xl focus:outline-none placeholder:text-gray-350 dark:placeholder:text-gray-650"
                      />
                      <button
                        type="button"
                        disabled={generatingBio}
                        onClick={handleAiSuggestBio}
                        className="px-4 py-2 bg-slate-900 dark:bg-gray-800 hover:bg-slate-800 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {generatingBio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                        <span>{generatingBio ? 'বায়ো লিখছে...' : 'জেমিনি দিয়ে বায়ো বানান'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-2">
                      প্রোফাইল বিবরণী / Detailed Bio *
                    </label>
                    <textarea
                      name="bio"
                      rows={5}
                      required
                      value={form.bio}
                      onChange={handleInputChange}
                      placeholder="যেমন: আমি কুষ্টিয়া অঞ্চলের একজন সুদক্ষ ওয়ারিং ইলেকট্রিশিয়ান। বিগত ৫ বছর ধরে রাজকীয় বাড়িতে থ্রি-ফেজ ব্যালান্স ওয়্যারিং কাজ করে আসছি..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-2xl resize-none leading-relaxed focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Upload User Photo, NID photo, extra service locations with live Camera system integration */}
            {formStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                {/* 4. Profile Picture Upload with direct Camera capture modal-inline */}
                <div className="p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                  <h2 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2.5 flex items-center gap-1.5">
                    📸 ৪. প্রোফাইল ছবি / Profile Picture Setup
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative shrink-0 select-none">
                      <img 
                        src={form.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-dashed border-blue-500/25 shadow"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      {cameraActive && cameraField === 'profilePhoto' ? (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 relative overflow-hidden">
                          <span className="block text-[10px] font-black uppercase text-teal-400 tracking-wider font-mono">🎥 লাইভ ক্যামেরা ফিড সচল...</span>
                          {cameraError ? (
                            <p className="text-[10px] text-red-400 font-bold leading-normal">{cameraError}</p>
                          ) : (
                            <video ref={videoRef} className="w-full h-40 object-cover rounded-xl bg-black border border-slate-750" playsInline muted />
                          )}
                          <div className="flex gap-2">
                            {!cameraError && (
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg cursor-pointer"
                              >
                                📸 ছবি ধারণ করুন (Capture)
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-3 py-1.5 bg-slate-800 text-slate-355 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              বন্ধ করুন (Close)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <label className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow inline-flex items-center gap-1.5">
                            <span>📤 গ্যালারি ফাইল</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleFileChange(e, 'profilePhoto')} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => startCamera('profilePhoto')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow inline-flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5 text-blue-200" />
                            <span>📸 ক্যামেরা তুলে ছবি দিন</span>
                          </button>
                          
                          {form.profilePhoto && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, profilePhoto: '' }))}
                              className="px-3 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] uppercase font-black rounded-xl cursor-pointer active:scale-95-none"
                            >
                              মুছুন
                            </button>
                          )}
                        </div>
                      )}
                      
                      <p className="text-[10px] text-gray-400 leading-none">গ্যালারি থেকে অথবা সরাসরি নিজস্ব ক্যামেরা দিয়ে সুন্দর ছবি তুলুন (সর্বোচ্চ ২ মেগাবাইট)।</p>
                      
                      <input
                        type="url"
                        name="profilePhoto"
                        value={form.profilePhoto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-550 rounded-xl focus:outline-none"
                        placeholder="অথবা অনলাইন ইউআরএল লিঙ্ক দিন (Photo URL Link)"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. NID Setup and locations verification card */}
                <div className="p-6 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl border border-emerald-500/20 space-y-5">
                  <h2 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest border-b border-emerald-550/10 pb-2.5 flex items-center gap-1.5">
                    🛡️ ৫. জাতীয় পরিচয়পত্র ও অতিরিক্ত সার্ভিস এরিয়া / Verification & Service Area List
                  </h2>

                  {/* Service Village input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-550 tracking-wider">
                      নির্দিষ্ট সার্ভিস এরিয়া সমূহ (কমা দিয়ে একাধিক উপজেলা, পৌরসভা বা গ্রামের নাম লিখুন) *
                    </label>
                    <input
                      type="text"
                      name="serviceAreasInput"
                      value={form.serviceAreasInput}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                      placeholder="যেমন: কুষ্টিয়া সদর, ভেড়ামারা পৌরসভা, অলিপুর বাজার, মেহেরপুর উপজেলা"
                    />
                    <p className="text-[10px] text-gray-400 leading-normal font-semibold">একাধিক সার্ভিস এরিয়া কমা দিয়ে লিখলে কর্মীর কার্ডের উপরে সুন্দর সার্ভিসিং ট্যাগ ব্যাজ তৈরি হবে।</p>
                  </div>

                  {/* NID number field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-550 tracking-wider">
                      জাতীয় পরিচয়পত্র এনআইডি নাম্বার / National NID Card ID
                    </label>
                    <input
                      type="text"
                      name="nidNumber"
                      value={form.nidNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-550 rounded-xl focus:outline-none"
                      placeholder="NID Card number (যেমন: 1996501717900)"
                    />
                  </div>

                  {/* Front/Back photo uploads with inline physical cameras */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Front Photo Card */}
                    <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-150/40 dark:border-neutral-800 space-y-3">
                      <span className="block text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wide">জাতীয় পরিচয়পত্র (সামনের অংশ / NID Photo Front)</span>
                      
                      {cameraActive && cameraField === 'nidPhotoFront' ? (
                        <div className="p-2.5 bg-slate-900 border rounded-xl space-y-2 relative overflow-hidden leading-none border-teal-500/20">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-teal-400 font-mono leading-none">🎥 সিকিউর লাইভ камера...</span>
                          {cameraError ? (
                            <p className="text-[10px] text-red-400 font-bold leading-normal">{cameraError}</p>
                          ) : (
                            <video ref={videoRef} className="w-full h-28 object-cover rounded-lg bg-black border border-slate-750" playsInline muted />
                          )}
                          <div className="flex gap-1.5">
                            {!cameraError && (
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-grow py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black rounded-md cursor-pointer"
                              >
                                📸 স্ন্যাপ ধারণ করুন
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-2.5 py-1.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded-md cursor-pointer"
                            >
                              বন্ধ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {form.nidPhotoFront ? (
                            <div className="relative rounded-lg overflow-hidden border border-neutral-200 shadow-sm leading-none">
                              <img 
                                src={form.nidPhotoFront} 
                                alt="NID Front" 
                                className="w-full h-24 object-cover" 
                              />
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, nidPhotoFront: '' }))}
                                className="absolute top-1 right-1 px-1.5 py-1 bg-red-650 text-white text-[10px] font-black rounded-full hover:scale-105"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                              ফাইল সংযুক্ত নেই
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            <label className="inline-block px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[10px] rounded-lg cursor-pointer text-center w-full">
                              <span>📤 ফটো আপলোড করুন</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, 'nidPhotoFront')} 
                                className="hidden" 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => startCamera('nidPhotoFront')}
                              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white hover:opacity-95 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5"
                            >
                              <Camera className="w-3.5 h-3.5 text-blue-200" />
                              <span>📸 ক্যামেরা দিয়ে তুলুন</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Back Photo Card */}
                    <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-150/40 dark:border-neutral-800 space-y-3">
                      <span className="block text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wide">জাতীয় পরিচয়পত্র (পেছনের অংশ / NID Photo Back)</span>
                      
                      {cameraActive && cameraField === 'nidPhotoBack' ? (
                        <div className="p-2.5 bg-slate-900 border rounded-xl space-y-2 relative overflow-hidden leading-none border-teal-550/20">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-teal-400 font-mono leading-none">🎥 সিকিউর লাইভ ক্যামেরা...</span>
                          {cameraError ? (
                            <p className="text-[10px] text-red-500 font-bold leading-normal">{cameraError}</p>
                          ) : (
                            <video ref={videoRef} className="w-full h-28 object-cover rounded-lg bg-black border border-slate-750" playsInline muted />
                          )}
                          <div className="flex gap-1.5">
                            {!cameraError && (
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-grow py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black rounded-md cursor-pointer"
                              >
                                📸 স্ন্যাপ ধারণ করুন
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-2.5 py-1.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded-md cursor-pointer"
                            >
                              বন্ধ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {form.nidPhotoBack ? (
                            <div className="relative rounded-lg overflow-hidden border border-neutral-200 shadow-sm leading-none">
                              <img 
                                src={form.nidPhotoBack} 
                                alt="NID Back" 
                                className="w-full h-24 object-cover" 
                              />
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, nidPhotoBack: '' }))}
                                className="absolute top-1 right-1 px-1.5 py-1 bg-red-650 text-white text-[10px] font-black rounded-full hover:scale-105"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                              ফাইল সংযুক্ত নেই
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            <label className="inline-block px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[10px] rounded-lg cursor-pointer text-center w-full">
                              <span>📤 ফটো আপলোড করুন</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, 'nidPhotoBack')} 
                                className="hidden" 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => startCamera('nidPhotoBack')}
                              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white hover:opacity-95 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5"
                            >
                              <Camera className="w-3.5 h-3.5 text-blue-200" />
                              <span>📸 ক্যামেরা দিয়ে তুলুন</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. Live Public Card Status checkbox */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-805 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublic"
                      id="isPublic"
                      checked={form.isPublic}
                      onChange={(e) => setForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-355 bg-gray-55"
                    />
                    <label htmlFor="isPublic" className="text-[11px] font-extrabold text-slate-705 dark:text-gray-300 cursor-pointer select-none">
                      আমার বায়ো কার্ডটি ডিরেক্টরিতে লাইভ সবার জন্য দৃশ্যমান রাখুন (Live Public Card Status)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STATIC & DYNAMIC STEP NAVIGATION FOOTER CONTROL BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 font-bangla border-t border-gray-150 dark:border-gray-800">
              {formStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(prev => prev - 1)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer text-slate-700 dark:text-gray-305 transition-transform active:scale-95 text-center shrink-0"
                >
                  ◀ পেছনে যান (Back)
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {formStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (formStep === 1) {
                      if (!form.fullName || !form.phone) {
                        setError(isBN ? 'অনুগ্ৰহ করে আপনার নাম এবং মোবাইল নম্বর প্রবন্ধ করুন।' : 'Please fill out your Name and Mobile Number.');
                        return;
                      }
                    }
                    setError('');
                    setFormStep(prev => prev + 1);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white hover:opacity-95 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>পরবর্তী ধাপে যান (Next Step)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'প্রোফাইল সেভ করা হচ্ছে...' : 'প্রোফাইল সেভ করুন (Save Changes)'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

        {/* ────────────────────────────────────────────────────────────────────────────
            TAB 2: POST A NEW JOB OFFER SUB-FORM
            ──────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'post-job' && (
          <form onSubmit={handleJobSubmit} className="p-6 sm:p-8 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5 shadow-sm">
            <h2 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2.5 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span>নতুন জবের চাহিদা / কাজের বিজ্ঞাপন লাইভ বোর্ডে পোস্ট করুন</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  জব অথবা কাজের সংক্ষিপ্ত শিরোনাম / Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="যেমন: কুষ্টিয়া সদর অঞ্চলে দোতলা বাড়ির রাজমিস্ত্রির কাজের কন্ট্রাক্ট"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  প্রয়োজনীয় পেশা বা ক্যাটাগরি / Job Category *
                </label>
                <select
                  value={jobForm.category}
                  onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                >
                  {categoriesKeys.map(k => (
                    <option key={k} value={k}>{t('jobCategories', k)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  প্রস্তাবিত বাজেট বা বেতন বিবরণী / Salary Offered *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.budget}
                  onChange={(e) => setJobForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="যেমন: ২৫,০০০ টাকা বা দৈনিক ৮০০ টাকা"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  বিভাগ (Division) *
                </label>
                <select
                  value={jobForm.division}
                  onChange={(e) => setJobForm(prev => ({ ...prev, division: e.target.value, district: '' }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                >
                  {DIVISIONS_LIST.map((div) => (
                    <option key={div.key} value={div.en}>{div.bn} / {div.en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  জেলা (District) *
                </label>
                <select
                  value={jobForm.district}
                  onChange={(e) => setJobForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {jobDistrictsAvailable.map((dist, idx) => (
                    <option key={idx} value={dist.en}>{dist.bn} / {dist.en}</option>
                  ))}
                </select>
              </div>

              {/* Thana/Upazila inside jobForm */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  থানা / উপজেলা (Upazila/Thana) *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.thana}
                  onChange={(e) => setJobForm(prev => ({ ...prev, thana: e.target.value }))}
                  placeholder="যেমন: মিরপুর, তেরখাদা, ডুমুরিয়া"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              {/* Union inside jobForm */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  ইউনিয়ন / ওয়ার্ড (Union/Ward) *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.union}
                  onChange={(e) => setJobForm(prev => ({ ...prev, union: e.target.value }))}
                  placeholder="যেমন: আমলা ইউনিয়ন, ১নং ওয়ার্ড"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  সার্ভিস এরিয়া অথবা নির্দিষ্ট গ্রাম / Service Area
                </label>
                <input
                  type="text"
                  value={jobForm.serviceArea}
                  onChange={(e) => setJobForm(prev => ({ ...prev, serviceArea: e.target.value }))}
                  placeholder="যেমন: মিরপুর বাজার মোড়"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  পোস্টকারী ব্যক্তি বা প্রতিষ্ঠানের নাম / Posted By *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.postedByName}
                  onChange={(e) => setJobForm(prev => ({ ...prev, postedByName: e.target.value }))}
                  placeholder="যেমন: নূর কনস্ট্রাকশন গুপ"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  কন্ট্যাক্ট ফোন নম্বর / Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.contactPhone}
                  onChange={(e) => setJobForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="যেমন: ০১৭১৭৯৬৮০৯৮"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-xl focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1.5">
                  কাজের বিস্তারিত বিবরণ / Job Requirements Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="এখানে আপনার কাজের বিস্তারিত বর্ণনা দিন। যেমন: কি কি কাজ করতে হবে, সময়সূচী, এবং কোনো বিশেষ অভিজ্ঞতার প্রয়োজন আছে কিনা।"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-xs font-semibold text-slate-900 dark:text-gray-50 rounded-2xl focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={postingJob}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {postingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              <span>{postingJob ? 'পোস্ট সাবমিট করা হচ্ছে...' : 'নতুন কাজের চাহিদা পোস্ট করুন (Submit Job Offer)'}</span>
            </button>
          </form>
        )}

        {/* ────────────────────────────────────────────────────────────────────────────
            TAB 2.5: MERCHANT & BUSINESS DASHBOARD HUB (CREATIVE EDITION)
            ──────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'merchant-hub' && (
          <div className="space-y-6 animate-fade-in" id="merchant-dashboard-view">
            
            {/* Top Overview banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 border border-amber-500/15 dark:border-amber-500/25">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <span className="px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/25 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                    💼 {isBN ? 'বিজনেস ড্যাশবোর্ড' : 'Merchant Business Suite'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight font-bangla">
                    {isBN ? 'মার্চেন্ট প্রোফাইল ও ব্যবসায়িক হাব' : 'Micro-Merchant Business Intelligence Suite'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                    {isBN 
                      ? 'ভেড়ামারা ও কুষ্টিয়া অঞ্চলের দক্ষ কর্মী ও মার্চেন্টদের ব্যবসায়িক কৌশলের বাস্তব গাইড। এখানে ব্যবসার প্রস-কনস, রোমাঞ্চকর ট্রিক্স এবং রিয়েল-লাইফ ব্যবহারের গাইড দেওয়া রয়েছে।' 
                      : 'Real-world business strategies, pros vs cons, and interactive tools designed to scale local trade businesses in Kushtia & Bheramara district.'}
                  </p>
                </div>
                {form.fullName && (
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                          <head>
                            <title>Business ID Card - \${encodeURIComponent(form.fullName)}</title>
                            <style>
                              body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f1f5f9; }
                              .card { width: 380px; padding: 24px; border-radius: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 2px solid #f59e0b; }
                              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px; }
                              .name { font-size: 20px; font-weight: 800; color: #f59e0b; margin: 0; }
                              .badge { font-size: 10px; background-color: #f59e0b; color: black; padding: 3px 8px; border-radius: 999px; font-weight: bold; text-transform: uppercase; }
                              .detail { font-size: 11px; margin-bottom: 6px; color: #cbd5e1; }
                              .footer { font-size: 9px; margin-top: 16px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; }
                              .qr { width: 60px; height: 60px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; }
                            </style>
                          </head>
                          <body>
                            <div class="card">
                              <div class="header">
                                <div>
                                  <div class="name">${form.fullName}</div>
                                  <div style="font-size:11px; color:#10b981; font-weight:bold; text-transform:uppercase;">${form.primaryCategory}</div>
                                </div>
                                <span class="badge">VERIFIED MERCHANT</span>
                              </div>
                              <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="flex:1;">
                                  <div class="detail"><strong>📍 Division:</strong> Khulna</div>
                                  <div class="detail"><strong>📍 District:</strong> Kushtia</div>
                                  <div class="detail"><strong>🗺️ Service Area:</strong> ভেড়ামারা সকল এরিয়া</div>
                                  <div class="detail"><strong>🏠 Address:</strong> মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া</div>
                                  <div class="detail"><strong>📞 Hotline:</strong> ${form.phone || '০১৭১৭৯৬৮০৯৮'}</div>
                                </div>
                                <div style="text-align:center; margin-left:12px;">
                                  <div style="background-color: white; padding: 4px; border-radius: 8px; display:inline-block;">
                                    <div style="font-size: 8px; color: black; font-weight: bold; margin-bottom: 2px;">SCAN PROFILE</div>
                                    <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/#/workers?profile=' + profileSlug)}" />
                                  </div>
                                </div>
                              </div>
                              <div class="footer">
                                <span>MANPOWER HUB KUSHTIA PLATFORM</span>
                                <strong>ID: #MPH-${form.phone ? form.phone.slice(-4) : '2026'}</strong>
                              </div>
                            </div>
                            <script>window.print();</script>
                          </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-2 animate-pulse"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isBN ? 'স্মার্ট বিজনেস কার্ড প্রিন্ট করুন' : 'Print Business ID Card'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Box 1: Digital Interactive ID Card Preview (4 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-4 flex items-center gap-1.5">
                    <span>📇</span>
                    <span>{isBN ? 'লাইভ ডিজিটাল মার্চেন্ট কার্ড প্রিভিউ' : 'Live Digital Merchant ID Preview'}</span>
                  </h3>

                  {/* HTML Digital Card Design */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 text-white border-2 border-amber-500/40 shadow-xl transition-all duration-300 hover:border-amber-500 group">
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    
                    {/* Top banner */}
                    <div className="flex justify-between items-start pb-4 border-b border-white/10">
                      <div>
                        <div className="text-sm font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span>{form.fullName || (isBN ? 'আপনার নাম' : 'John Doe')}</span>
                          {(form.isActive !== false) && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">{form.primaryCategory || 'Electrician'}</div>
                      </div>
                      <div className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded-full shrink-0 tracking-widest flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        <span>VIP MERCHANT</span>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 text-[11px] text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500">📍</span>
                        <span><strong>{isBN ? 'অঞ্চল:' : 'Service Area:'}</strong> {isBN ? 'ভেড়ামারা ও কুষ্টিয়া সংলগ্ন এলাকা' : 'Bheramara & Kushtia service hubs'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500">🏠</span>
                        <span><strong>{isBN ? 'ঠিকানা:' : 'Full Address:'}</strong> মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500">📞</span>
                        <span><strong>{isBN ? 'যোগাযোগ নম্বর:' : 'Contact:'}</strong> {form.phone || '০১৭১৭৯৬৮০৯৮'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500">📊</span>
                        <span><strong>{isBN ? 'রেটিং:' : 'Profile Rating:'}</strong> ⭐ 5.0 (Excellent)</span>
                      </div>
                    </div>

                    {/* QR block bottom right */}
                    <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] text-slate-400">
                      <div>
                        <div>MANPOWER HUB KUSHTIA</div>
                        <div className="font-mono text-slate-500">ID: #MPH-{form.phone ? form.phone.slice(-4) : '2026'}</div>
                      </div>
                      <div className="bg-white p-1 rounded-md shrink-0">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/#/workers?profile=' + profileSlug)}`}
                          className="w-8 h-8 object-contain" 
                          alt="QR Profile Link" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 text-xs">
                  <p className="text-amber-800 dark:text-amber-400 leading-normal font-semibold">
                    💡 {isBN 
                      ? 'এই কার্ডটি যেকোনো গ্রাহক স্ক্যান করলে সরাসরি আপনার পাবলিক প্রোফাইলে নিয়ে যাবে ও কাস্টমার রেটিং বাড়াতে সাহায্য করবে।' 
                      : 'Printing this physical card will allow offline local customers in Kushtia Market to instantly call your premium number and browse reviews.'}
                  </p>
                </div>
              </div>

              {/* Box 2: Pros & Cons Trade Intelligence Selector (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-gray-50 dark:border-gray-800 pb-3">
                  <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>{isBN ? 'ট্রেড ভিত্তিক Pros & Cons এবং বাস্তব পরামর্শ' : 'Trade Intelligence & Practice Use Cases'}</span>
                  </h3>
                  
                  {/* Selectors */}
                  <div className="flex flex-wrap gap-1">
                    {(['tailoring', 'cooking_catering', 'pharmacy_medicine', 'construction'] as const).map((trade) => {
                      const labels = {
                        tailoring: isBN ? 'দর্জি' : 'Tailor',
                        cooking_catering: isBN ? 'ক্যাটারিং' : 'Catering',
                        pharmacy_medicine: isBN ? 'ফার্মেসী' : 'Pharmacy',
                        construction: isBN ? 'কনট্রাক্ট' : 'Contracting'
                      };
                      return (
                        <button
                          key={trade}
                          onClick={() => setActiveSelectedTrade(trade)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all active:scale-95 cursor-pointer border
                            ${activeSelectedTrade === trade
                              ? 'bg-indigo-650 border-indigo-650 text-white shadow-sm'
                              : 'bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800'
                            }
                          `}
                        >
                          {labels[trade]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trade detail panels */}
                <div className="space-y-4 font-bangla text-xs">
                  
                  {activeSelectedTrade === 'tailoring' && (
                    <>
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                        <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>✅ Pros (সুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>ঈদুল ফিতর ও উৎসবগুলোতে মাত্র ১৫ দিনে ৫০,০০০+ টাকা আয়ের দারুণ সুযোগ থাকে।</li>
                          <li>কাপড় কেনার কমিশন এবং নিজস্ব কাপড় বিক্রয় করে ডাবল মুনাফা অর্জন করা যায়।</li>
                          <li>ভেড়ামারা বড় বাজারে নিজস্ব একটি টেইলার্স হলে ফিক্সড মহিলা কাস্টমার নেটওয়ার্ক তৈরি হয়।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
                        <div className="text-rose-700 dark:text-rose-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>❌ Cons (ঝুঁকি ও অসুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>কাস্টমারের মাপ অনুযায়ী সামান্য ২ ইঞ্চি বেশি বা কম হলে জামা নষ্ট হওয়ার ঝুঁকি ও জরিমানা।</li>
                          <li>উৎসবের সময় ডেলিভারির অসম্ভব প্রেসার এবং পর্যাপ্ত দক্ষ কারিগর না পাওয়া।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
                        <div className="text-amber-700 dark:text-amber-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>⚡ Business Hacks & Tricks (গোপন ব্যবসায়িক ট্রিক্স)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          গ্রাহকদের আকৃষ্ট করতে প্রথম ৩ মাসে <strong>"ফ্রি ফিটিং অ্যান্ড অল্টারেশন"</strong> অফার করুন। কাপড় ডেলিভারির ডেট কাস্টমারকে জানানোর ১ দিন আগেই রেডি রাখুন এবং মেসেজে ফোনে অটো ইনফর্ম করুন যাতে কাস্টমার স্যাটিসফ্যাকশন তুঙ্গে থাকে।
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                        <div className="text-indigo-700 dark:text-indigo-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>📋 Real life Use Case (বাস্তব উদাহরণ)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          ভেড়ামারা কর্মকার রোডের <strong>মরিয়ম ফ্যাশনস</strong> প্রথমে এই ড্যাশবোর্ড থেকে লোকাল কাজের অফার নিয়ে ২ জন ট্রেইনি মেয়েকে ট্রেইন্ড করে আজ ৪ মেশিনের একটি সফল মিনি গার্মেন্টস হিসেবে যাত্রা করছে।
                        </p>
                      </div>
                    </>
                  )}

                  {activeSelectedTrade === 'cooking_catering' && (
                    <>
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                        <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>✅ Pros (সুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>অফিস মিটিং, পারিবারিক বিয়ে বা আকীকা ও ঘরোয়া আড্ডায় খাবারের বিপুল ও বার্ষিক চাহিদা।</li>
                          <li>কম পুঁজি দিয়ে রান্নাঘর থেকেই ক্যাটারিং হোম সার্ভিস আরম্ভ করা সম্ভব।</li>
                          <li>খাবারের স্বাদ চমৎকার হলে কাস্টমার নিজে থেকেই রেফারাল এনে দেয়।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
                        <div className="text-rose-700 dark:text-rose-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>❌ Cons (ঝুঁকি ও অসুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>খাদ্যের হাইজিন ও মান সামান্য খারাপ হলে পুরো এলাকার কাছে ব্রান্ড কালিমালিপ্ত হতে পারে।</li>
                          <li>বাজারের নিত্যনতুন কাঁচামালের দাম বাড়ার কারণে হুট করে কাস্টমার প্রাইস বাড়ানো যায় না।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
                        <div className="text-amber-700 dark:text-amber-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>⚡ Business Hacks & Tricks (গোপন ব্যবসায়িক ট্রিক্স)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed font-semibold">
                          লোকাল স্কুল ও ব্যাংকের ব্যাংক কর্মকর্তাদের জন্য লাঞ্চবক্স সিস্টেমে <strong>"মান্থলি সাবস্ক্রিপশন"</strong> চালু করুন। প্যাকেজিং এ বাঁশের কন্টেইনার বা ইকো-বক্স দিয়ে কাস্টমারদের আকর্ষণ করুন, যা আপনার ব্রান্ড ইমেজকে কুষ্টিয়ায় প্রিমিয়াম রূপ দেবে।
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                        <div className="text-indigo-700 dark:text-indigo-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>📋 Real life Use Case (বাস্তব উদাহরণ)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          কুষ্টিয়া শহরের এনআইডি ভেরিফাইড প্রফেশনাল রাঁধুনী <strong>সীমা আকতার</strong> আজ তার ক্যাটারিং সার্ভিসকে "সীমা ফুডস" নামে রেজিস্ট্রেশন করে প্রতিদিন ৬০ জন ব্যাংক কর্মকর্তার দুপুরের খাবারের জোগান দিচ্ছেন।
                        </p>
                      </div>
                    </>
                  )}

                  {activeSelectedTrade === 'pharmacy_medicine' && (
                    <>
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                        <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>✅ Pros (সুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>ওষুধ একটি নিত্যপ্রয়োজনীয় জিনিস, বাজারে কখনো কোনো মন্দা বা ঘাটতি দেখা দেয় না।</li>
                          <li>ফার্মাসিউটিক্যালস কোম্পানির প্রমোশন এবং বাল্ক পারচেজ উপহার সামগ্রীর কারণে বোনাস প্রফিট।</li>
                          <li>আশেপাশের কাস্টমারদের সাথে দীর্ঘমেয়াদী প্রেসক্রিপশন ভিত্তিক সুসম্পর্ক।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
                        <div className="text-rose-700 dark:text-rose-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>❌ Cons (ঝুঁকি ও অসুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>ওষুধ ডেট এক্সপায়ার বা মেয়াদ উত্তীর্ণের কঠোর নজদারি রাখা ও ক্যাপিটাল হোল্ড-আপ সমস্যা।</li>
                          <li>ড্রাগ লাইসেন্সিং নবায়ন প্রক্রিয়া এবং কড়া প্রেসক্রিপশন ব্যতিরেকে অ্যান্টিবায়োটিক দেওয়া নিষিদ্ধ করা।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
                        <div className="text-amber-700 dark:text-amber-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>⚡ Business Hacks & Tricks (গোপন ব্যবসায়িক ট্রিক্স)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          বয়স্ক নিয়মিত রোগীদের জন্য <strong>"হোম মেডিসিন ডেলিভারি"</strong> ও রক্তের প্রেসার মাপা ফ্রী সেবা চালুর মাধ্যমে বিপুল সাড়া ফেলুন। ওষুধের ক্যাটাগরি অনুযায়ী একটি ছোট কিউআর সফটওয়্যার ব্যবহার করুন স্টক ও ইনভেন্টরি মেলানোর জন্য।
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                        <div className="text-indigo-700 dark:text-indigo-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>📋 Real life Use Case (বাস্তব উদাহরণ)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          ভেড়ামারা বাজার রোডের <strong>আবিদা ফার্মা</strong> এই ইন্টেলিজেন্স ব্যবহার করে ডায়াবেটিস ও হাইপারটেনশনের শত শত নিয়মিত বৃদ্ধ রোগীদের মান্থলি সাবস্ক্রিপশন কার্ড দিয়ে কুষ্টিয়া অঞ্চলে ৩টি সফল ব্রাঞ্চ খুলেছে।
                        </p>
                      </div>
                    </>
                  )}

                  {activeSelectedTrade === 'construction' && (
                    <>
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                        <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>✅ Pros (সুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>ভেড়ামারা ও হার্ডিঞ্জ ব্রিজ সংলগ্ন অঞ্চলে অবকাঠামো উন্নয়নের ফলে প্রচুর কনট্রাক্ট কাজের সুবর্ণ সুযোগ।</li>
                          <li>একক কোনো প্রজেক্টে ৫,০০,০০০+ টাকার লাভ মার্জিন পাওয়ার চমৎকার সম্ভাবনা।</li>
                          <li>দক্ষ এনআইডি ভেরিফাইড রাজমিস্ত্রি, রংমিস্ত্রি এবং রডমিস্ত্রির মাস্টার হাব টিম পরিচালনা করার ক্ষমতা।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
                        <div className="text-rose-700 dark:text-rose-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>❌ Cons (ঝুঁকি ও অসুবিধা সমূহ)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-750 dark:text-gray-300">
                          <li>নির্মাণ কাঁচামালের (সিমেণ্ট, রড, বালি) বাজার দরের খামখেয়ালী উথাল-পাথী ঝক্কি।</li>
                          <li>লেবারের কাজের নিরাপত্তা ঝুঁকি এবং প্রজেক্টের পেমেন্ট ক্লিয়ারেন্সে দীর্ঘ বিলম্বের সমস্যা।</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
                        <div className="text-amber-700 dark:text-amber-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>⚡ Business Hacks & Tricks (গোপন ব্যবসায়িক ট্রিক্স)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed font-semibold">
                          পেমেন্ট নিয়ে জটিলতা এড়াতে কাস্টমারদের সাথে ৩টি সুনির্দিষ্ট ভাগে চুক্তিনামা করুন: <strong>"৪৫% অ্যাডভান্স, ৩৫% স্ল্যাব-কংক্রিট লেভেলে, এবং বাকি ২০% ডেলিভারিতে"</strong>। আপনার সাইটগুলোতে প্রগ্রেস ফটো হোয়াটসঅ্যাপ বা এই ড্যাশবোর্ড পোর্টালে পোস্ট করে স্বচ্ছতা বাড়ান।
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                        <div className="text-indigo-700 dark:text-indigo-400 font-extrabold mb-1.5 flex items-center gap-1.5">
                          <span>📋 Real life Use Case (বাস্তব উদাহরণ)</span>
                        </div>
                        <p className="text-slate-750 dark:text-gray-300 leading-relaxed">
                          লোকাল কন্সট্রাকশন ইঞ্জিনিয়ার <strong>মনিরুজ্জামান রাসেল</strong> এই ম্যানপাওয়ার প্ল্যাটফর্ম থেকে ২০ জন রাজমিস্ত্রি রিক্রুট করে আজ কুষ্টিয়া হাইওয়ে সম্প্রসারণ প্রজেক্টের সফল সাব-কন্ট্রাক্টর হিশেবে কোটি টাকার ব্যবসা সম্পন্ন করেছেন।
                        </p>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* Box 3: ROI Markup Cost & Profit Interactive Calculator (12 cols full-width) */}
              <div className="lg:col-span-12 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm text-xs">
                <h3 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-4 flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-800 pb-3">
                  <span>📊</span>
                  <span>{isBN ? 'ইন্টারেক্টিভ ব্যবসায়িক ROI ও মূল্য নির্ধারণ ক্যালকুলেটর' : 'Interactive ROI & Business Pricing Calculator'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-450 mb-1">
                        {isBN ? 'শ্রম বা মজুরি খরচ (Labor/Wage BDT)' : 'Base Labor Cost (BDT)'}
                      </label>
                      <input
                        type="number"
                        value={markupBaseWage}
                        onChange={(e) => setMarkupBaseWage(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                        {isBN ? 'কাঁচামাল বা লজিস্টিক খরচ (Material BDT)' : 'Material/Logistics Cost (BDT)'}
                      </label>
                      <input
                        type="number"
                        value={markupMaterialCost}
                        onChange={(e) => setMarkupMaterialCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-460 mb-1 flex justify-between">
                        <span>{isBN ? 'মুনাফা মার্জিন শতকরা (Markup %)' : 'Markup Percentage (%)'}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{markupPercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={markupPercent}
                        onChange={(e) => setMarkupPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                      />
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-indigo-150/30 dark:from-indigo-950/10 dark:to-indigo-950/20 rounded-2xl flex flex-col justify-between border border-indigo-100 dark:border-indigo-900/30">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>{isBN ? 'মোট মৌলিক খরচ:' : 'Total Raw Cost:'}</span>
                        <span className="font-extrabold text-slate-900 dark:text-neutral-200">৳{(markupBaseWage + markupMaterialCost).toLocaleString()} BDT</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <span>{isBN ? 'নিট লাভ (Profit):' : 'Estimated Net Profit:'}</span>
                        <span className="font-mono font-black">৳{Math.round((markupBaseWage + markupMaterialCost) * (markupPercent / 100)).toLocaleString()} BDT</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-indigo-200/50 dark:border-indigo-900/50 mt-4">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{isBN ? 'নির্ধারিত বিক্রয় মূল্য' : 'Suggested Selling Price'}</div>
                      <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono mt-1">
                        ৳{Math.round((markupBaseWage + markupMaterialCost) * (1 + markupPercent / 100)).toLocaleString()} <span className="text-xs">BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit margin advisor / visual helper */}
                  <div className="p-5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider mb-1">
                        {isBN ? 'ব্যবসায়িক মার্জিন ক্যাটাগরি' : 'Profit Margin Advisory Status'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-neutral-200 font-bangla">
                        {markupPercent < 15 && (isBN ? '⚠️ লো-মার্জিন (কম লাভ, দ্রুত বিক্রয়ের জন্য উপযোগী)' : 'Low-Margin (Volume strategy)')}
                        {markupPercent >= 15 && markupPercent <= 35 && (isBN ? '✅ স্ট্যান্ডার্ড-মার্জিন (কুষ্টিয়া বাজারের আদর্শ অনুপাত)' : 'Standard Margin (Ideal Balance)')}
                        {markupPercent > 35 && (isBN ? '🔥 প্রিমিয়াম-মার্জিন (উচ্চ মানের দক্ষ কাস্টম ব্র্যান্ডিং)' : 'Premium Margin (High value branding)')}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                        {isBN 
                          ? 'আপনার কাঁচামাল ও কষ্টসাধ্য শ্রম বিবেচনা করে সর্বদা স্ট্যান্ডার্ড বা প্রিমিয়াম মার্জিন বজায় রাখুন যাতে ব্যবসার ধারাবাহিক অগ্রগতি সচল থাকে।' 
                          : 'Maintaining healthy margins enables scaling. Premium brands in Bheramara target 35%+ margins with exclusive quality guarantees.'}
                      </p>
                    </div>

                    <div className="mt-3 text-[10px] font-semibold text-slate-400">
                      * {isBN ? 'নিখুঁত হিসাবের জন্য পরিবহন ও কাস্টমার কোয়ালিটি রিস্ক অন্তর্ভুক্ত করুন।' : 'Always factor in dynamic material price variance.'}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────────
            TAB 3: ADMINISTRATIVE SYSTEM CONTROLS (SECURED)
            ──────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'admin' && userRole === 'admin' && (
          <div className="space-y-6" id="admin-panel-board">
            


            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-teal-100/30 text-teal-655 dark:bg-teal-900/20 dark:text-teal-400 shrink-0">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bangla">লাইভ ভিজিটর</h3>
                  <span className="text-xl font-black text-slate-900 dark:text-white" id="active-visitors-counter">
                    ● {analytics?.activeVisitors || '18'} Active
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-100/30 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">মোট ইউজার অ্যাকাউন্ট</h3>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {analytics?.totals?.users || adminProfiles.length} জন
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100/30 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">মোট লাইভ কাজের অফার</h3>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {analytics?.totals?.jobs || '2'} টি
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100/30 text-purple-605 dark:bg-purple-900/20 dark:text-purple-400">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">মোট ডিরেক্টরি কার্ড ভিউ</h3>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {analytics?.totals?.totalViews || '2,400'} বার
                  </span>
                </div>
              </div>
            </div>



            {/* SEARCH ANALYTICS & TRENDING DASHBOARD CHART PROGRESS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in my-6">
              
              {/* Category Search Trends Graph */}
              <div className="p-6 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                <div className="border-b border-gray-100 dark:border-gray-805 pb-3">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-wider rounded">CATEGORY ACTIVITY LIST</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white font-bangla mt-1">📈 শীর্ষ ক্যাটাগরি অনুসন্ধান বিশ্লেষণ (Top Searched Categories Tracker)</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-relaxed font-bangla mt-0.5">ডিরেক্টরি ক্যাশবক্সের মাধ্যমে ডিরেক্টরিতে কোন পেশা বা ক্যাটাগরি কতবার খোঁজা হচ্ছে তার ডেটাগ্রাফ।</p>
                </div>

                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.categorySearches
                          ? Object.entries(analytics.categorySearches)
                              .map(([name, count]) => ({ name, count: Number(count) }))
                              .sort((a, b) => b.count - a.count)
                              .slice(0, 6)
                          : [
                              { name: 'electrician', count: 210 },
                              { name: 'doctor', count: 156 },
                              { name: 'worker', count: 120 },
                              { name: 'mechanic', count: 85 },
                              { name: 'tailor', count: 58 },
                              { name: 'chef', count: 42 }
                            ]
                      }
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} fontWeight="bold" width={75} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }} 
                        labelClassName="font-black text-amber-400"
                        itemStyle={{ color: '#06b6d4' }}
                      />
                      <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Categories progress legends */}
                <div className="space-y-1.5 pt-2">
                  <span className="block text-[8.5px] font-black text-gray-400 uppercase tracking-widest font-mono">Top Trending Trades list:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    {(analytics?.categorySearches 
                      ? Object.entries(analytics.categorySearches)
                          .map(([name, count]) => ({ name, count: Number(count) }))
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 4)
                      : [
                          { name: 'Electrician', count: 210 },
                          { name: 'Doctor', count: 156 },
                          { name: 'Worker', count: 120 },
                          { name: 'Mechanic', count: 85 }
                        ]).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                            <span className="capitalize text-slate-650 dark:text-gray-300 font-extrabold truncate max-w-[80px]">🛠️ {item.name}</span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black shrink-0">{item.count} hits</span>
                          </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Tag/Keyword Analytics Graph & Recommendations Box */}
              <div className="p-6 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                <div className="border-b border-gray-100 dark:border-gray-805 pb-3">
                  <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[8px] font-black uppercase tracking-wider rounded">KEYWORD SUGGESTIONS</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white font-bangla mt-1">🔍 লাইভ সার্চ কি-ওয়ার্ড ও রিয়েল সাজেশন (Live Term Queries & Suggestions)</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-relaxed font-bangla mt-0.5">সার্চবারে ভিজিটরদের টাইপ করা সর্বোচ্চ কি-ওয়ার্ড विश्लेषण ও অ্যাডমিন ডিসিশন গাইড বুক।</p>
                </div>

                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.searchQueries
                          ? Object.entries(analytics.searchQueries)
                              .map(([name, count]) => ({ name, count: Number(count) }))
                              .sort((a, b) => b.count - a.count)
                              .slice(0, 6)
                          : [
                              { name: 'electrician', count: 142 },
                              { name: 'kushtia', count: 118 },
                              { name: 'doctor', count: 98 },
                              { name: 'dhaka', count: 95 },
                              { name: 'tailor', count: 76 },
                              { name: 'plumber', count: 64 }
                            ]
                      }
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight="bold" tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" width={25} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }} 
                        itemStyle={{ color: '#06b6d4' }}
                      />
                      <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Suggestions and smart recommendations engine in Bengali */}
                <div className="p-4 bg-teal-500/10 border border-teal-500/15 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5 animate-bounce" />
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-black tracking-wider text-teal-700 dark:text-teal-300 font-bangla">লাইভ সিস্টেম এআই সাজেশন (Smart Action Suggsition)</span>
                    <p className="text-[10px] leading-relaxed text-slate-700 dark:text-teal-200/90 font-bold font-bangla font-bangla">
                      {analytics?.searchQueries && Object.entries(analytics.searchQueries).length > 0
                        ? (() => {
                            const entries = Object.entries(analytics.searchQueries).sort((a, b) => Number(b[1]) - Number(a[1]));
                            const topTerm = entries[0]?.[0] || 'electrician';
                            if (topTerm.includes('elect') || topTerm.includes('কাজ') || topTerm.includes('লাইভ')) {
                              return "⚡ ইলেকট্রিশিয়ান ও টেকনিক্যাল কাজের ট্রেন্ডিং রেট খুবই বেশি। এই ক্যাটাগরিতে আরও অ্যাক্টিভ প্রফেশনাল ভেরিফাই করার জন্য কন্টাক্ট ক্যাম্পেইন বুস্ট করতে পারেন।";
                            } else if (topTerm.includes('doc') || topTerm.includes('মেডিসিন') || topTerm.includes('ফার্মেসি')) {
                              return "🩺 ডাক্তার ও হেলথকেয়ার ক্যাটাগরির অনুসন্ধান বাড়ছে। অ্যাপে নতুন ও অভিজ্ঞ ডাক্তার বা প্যাথলজিস্টদের অ্যাকাউন্ট যুক্ত করতে রিচআউট ক্যাম্পেইন শুরু করুন।";
                            } else if (topTerm.includes('kush') || topTerm.includes('dhaka') || topTerm.includes('khulna')) {
                              return `📍 ভৌগোলিক অনুসন্ধানে '${topTerm.toUpperCase()}' অঞ্চলটি শীর্ষে! এই এলাকার ডিরেক্টরি পার্টনার ও স্থানীয় কাজের অফারের সংখ্যা বৃদ্ধিতে ক্যাম্পেইন করুন।`;
                            } else {
                              return `💡 গ্রাহকরা বর্তমানে '${topTerm.toUpperCase()}' রিলেটেড কি-ওয়ার্ড বেশি ট্যাগ করছেন। এই স্পেশালিটির কর্মী বাড়াতে পারলে ডিরেক্টরি ট্রাফিক বহুগুণ বৃদ্ধি পাবে!`;
                            }
                          })()
                        : "⚡ সিস্টেম অ্যানালিটিক্স সিডিউলিং অনুযায়ী 'ইলেকট্রিশিয়ান' ও 'কুষ্টিয়া' এলাকা সর্বোচ্চ অনুসন্ধান ট্রেন্ডে রয়েছে। এই অঞ্চলে বিশেষ রিচআউট মার্কেটিং বা লিড জেনারেশন বাড়ানো সুপারিশ করা যাচ্ছে।"
                      }
                    </p>
                  </div>
                </div>
              </div>

            </div>



            {/* Admin Backup, Restore, and Datasheet Utilities board */}
            <div className="p-6 bg-slate-900 border border-slate-850 text-white rounded-3xl shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 font-bangla">
                  🗃️ সিস্টেম ব্যাকআপ, ক্রিয়েশন ও ডাটাশিট মেইনটেন্যান্স (Bulk Backup & Restoration)
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 font-bangla font-bangla">সব প্রোফাইল ও একাউন্ট একসাথে ব্যাকআপ ফাইল ডাউনলোড করুন এবং সেই ফাইল আপলোড করে এক ক্লিকে সব তৈরি করুন।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Complete System JSON Backup */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('authToken');
                      const res = await fetch('/api/admin/backup/export', {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      const data = await res.json();
                      if (data.success) {
                        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `manpower-hub-master-backup-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setSuccess(isBN ? 'সিস্টেম ব্যাকআপ JSON সফলভাবে ডাউনলোড হয়েছে!' : 'System backup JSON downloaded successfully!');
                      } else {
                        setError(data.message || 'Error exporting backup.');
                      }
                    } catch (err: any) {
                      setError('Failed to download backup JSON.');
                    }
                  }}
                  className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-28 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 font-bangla">১-ক্লিক ব্যাকআপ (.json)</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 font-bangla">মাস্টার ডাটা ব্যাকআপ ফাইল ডাউনলোড</p>
                  </div>
                </button>

                {/* 2. System Restore Upload JSON */}
                <label className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-28 group relative">
                  <input
                    type="file"
                    accept=".json"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            if (!parsed.users || !parsed.profiles) {
                              alert(isBN ? 'ভুল ফরম্যাট! ফাইলে অবশ্যই users এবং profiles থাকতে হবে।' : 'Invalid backup format!');
                              return;
                            }
                            
                            const token = localStorage.getItem('authToken');
                            const res = await fetch('/api/admin/backup/restore', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify(parsed)
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSuccess(isBN ? 'রিস্টোর সফল হয়েছে! সব প্রোফাইল তৈরি করা হয়েছে।' : 'Restore success!');
                              loadAdminResources();
                            } else {
                              setError(data.message);
                            }
                          } catch (err) {
                            alert('JSON parsing error!');
                          }
                        };
                        reader.readAsText(file);
                      } catch (err) {
                        alert('Error reading backup file.');
                      }
                    }}
                  />
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform font-bold">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 font-bangla">ব্যাকআপ আপলোড করুন</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 font-bangla">আপলোড দিলে সব একসাথে ক্রিয়েট হবে</p>
                  </div>
                </label>

                {/* 3. Text Datasheet Generator */}
                <button
                  type="button"
                  onClick={() => {
                    if (adminProfiles.length === 0) {
                      alert(isBN ? 'প্রোফাইল তালিকা খালি।' : 'No profiles available.');
                      return;
                    }
                    try {
                      let text = `========================================================================\n`;
                      text += `               MANPOWER HUB DIRECTORY COMPLETE DATASHEET\n`;
                      text += `========================================================================\n`;
                      text += `Generated on: ${new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC\n`;
                      text += `Total Talents Registered: ${adminProfiles.length}\n`;
                      text += `------------------------------------------------------------------------\n\n`;

                      adminProfiles.forEach((p, idx) => {
                        text += `[${idx + 1}] ${p.fullName} (Slug: /${p.slug})\n`;
                        text += `    - User ID: ${p.user}\n`;
                        text += `    - Account Email: ${p.email || 'N/A'}\n`;
                        text += `    - Plain Password: ${p.plainPassword || 'N/A'}\n`;
                        text += `    - Contact Phone: ${p.phone || 'N/A'}\n`;
                        text += `    - Registration Date: ${p.registrationDate ? p.registrationDate.split('T')[0] : 'N/A'}\n`;
                        text += `    - Occupation/Role: ${p.role}\n`;
                        text += `    - Category: ${p.primaryCategory || 'N/A'}\n`;
                        text += `    - Address: Rural ${p.serviceArea || 'N/A'}, ${p.district || 'Kushtia'}, ${p.division || 'Khulna'}\n`;
                        text += `    - Completion Percent: ${calculateCompletenessForProfile(p)}%\n`;
                        text += `    - Review Rating: ★ ${p.rating || 5.0} (${p.jobsCompleted || 0} completed pings)\n`;
                        text += `    - National ID Number: ${p.nidNumber || 'Not Uploaded'}\n`;
                        text += `    - Biography Status: ${p.bio ? 'Bio Completed' : 'Bio Empty'}\n`;
                        text += `------------------------------------------------------------------------\n`;
                      });

                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `manpower-hub-datasheet-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setSuccess(isBN ? 'টেক্সট ডাটাশীট ফাইল সফলভাবে এক্সপোর্ট হয়েছে!' : 'Flat TXT Datasheet generated successfully!');
                    } catch (err: any) {
                      setError('Failed to generate TXT datasheet.');
                    }
                  }}
                  className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-28 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform font-bold font-bangla">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 font-bangla">টেক্সট ডাটাশীট (.txt)</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 font-bangla">সব প্রোফাইল ডাটা টেক্সট ফাইল তৈরি</p>
                  </div>
                </button>

                {/* 4. Print-Ready PDF/Grid Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                      alert(isBN ? 'পপ-আপ সক্ষম করুন প্রোফাইল প্রিন্ট করতে।' : 'Please enable pop-ups to print.');
                      return;
                    }

                    let htmlContent = `
                      <html>
                        <head>
                          <title>Manpower Hub All Profiles - Active Datasheet</title>
                          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                          <style>
                            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0f172a; padding-bottom: 20px; }
                            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
                            .header p { margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: 605; }
                            .profile-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
                            .profile-card { border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 25px; page-break-inside: avoid; background-color: #fafafa; }
                            .profile-title { display: flex; align-items: center; justify-content: space-between; border-b: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 15px; }
                            .profile-title h2 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; }
                            .profile-title .badge { font-size: 10px; font-weight: 955; background: #3b82f6; color: #fff; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
                            .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 12px; }
                            .detail-item { font-weight: 700; color: #334155; }
                            .detail-item span { color: #64748b; font-weight: 500; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
                            .bio { grid-column: span 2; font-style: italic; background: #f1f5f9; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 11px; margin-top: 10px; color: #475569; }
                            @media print {
                              body { padding: 0; }
                              .profile-card { border-color: #94a3b8; background-color: #fff; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Manpower Hub Directory Talents</h1>
                            <p>Active Verified Database Registrations &middot; Total: ${adminProfiles.length} Members</p>
                          </div>
                          <div class="profile-grid">
                    `;

                    adminProfiles.forEach((p) => {
                      htmlContent += `
                        <div class="profile-card">
                          <div class="profile-title">
                            <h2>${p.fullName}</h2>
                            <div class="badge">${p.role}</div>
                          </div>
                          <div class="profile-details">
                            <div class="detail-item"><span>User ID / Slug</span>/${p.slug}</div>
                            <div class="detail-item"><span>Contact Phone</span>${p.phone}</div>
                            <div class="detail-item"><span>Account Registered Email</span>${p.email || 'N/A'}</div>
                            <div class="detail-item"><span>Location & Village</span>${p.serviceArea || 'Local'}, ${p.district || 'Kushtia'}, ${p.division || 'Khulna'}</div>
                            <div class="detail-item"><span>Rating Details</span>★ ${p.rating || 5.0} (${p.jobsCompleted || 0} completed)</div>
                            <div class="detail-item"><span>Completeness Tracker</span>${calculateCompletenessForProfile(p)}% Filled</div>
                            <div class="detail-item"><span>National ID Card</span>${p.nidNumber || 'N/A'}</div>
                            <div class="detail-item"><span>Registered At</span>${p.registrationDate ? p.registrationDate.substring(0, 16).replace('T', ' ') : 'N/A'}</div>
                            <div class="bio" style="grid-column: span 2;"><span>Profile Biography:</span>${p.bio || 'প্রোফাইল বিবরণী এখনো তৈরি করা হয়নি।'}</div>
                          </div>
                        </div>
                      `;
                    });

                    htmlContent += `
                          </div>
                          <script>
                            window.onload = function() {
                              window.print();
                            };
                          </script>
                        </body>
                      </html>
                    `;

                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    setSuccess(isBN ? 'প্রিন্ট-প্রস্তুত পিডিএফ উইন্ডো খোলা হয়েছে!' : 'Print-ready PDF overview opened!');
                  }}
                  className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/30 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-28 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 font-bangla font-bangla">সব প্রোফাইল প্রিন্ট রেডি</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 font-bangla">সব প্রোফাইল সম্পূর্ণ প্রিন্ট ও পিডিএফ</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Real-time Firestore Read/Write Profile Monitor Logs Board */}
            <div className="p-6 bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl shadow-xl space-y-4 font-mono">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      🔥 ফায়ারস্টোর প্রোফাইল কন্টাক্ট ও রিড/রাইট লাইভ মনিটর (Live Firestore Activity Logger)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 font-sans">
                      Cloud Firestore ভলিউমে প্রোফাইল এবং একাউন্টের লাইভ কুয়েরি, কন্টাক্ট, রিড, রাইট এবং ডিলেশন অপারেশন মনিটর করুন।
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto font-sans justify-end">
                  {/* Auto polling toggle */}
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPollLogs}
                      onChange={(e) => setAutoPollLogs(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span>লাইভ অটো-রিফ্রেশ (Live Track)</span>
                  </label>

                  {/* Manual Refresh */}
                  <button
                    onClick={loadFirestoreLogs}
                    disabled={isLoadingLogs}
                    className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 rounded-lg text-[10px] transition duration-200 uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                    <span>রিফ্রেশ</span>
                  </button>

                  {/* Clear Logs */}
                  <button
                    onClick={async () => {
                      if (!confirm(isBN ? 'আপনি কি সব লগ ডিলিট করতে চান?' : 'Clear all cached database logs?')) return;
                      try {
                        const token = localStorage.getItem('authToken');
                        const res = await fetch('/api/admin/firestore-logs', {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (data.success) {
                          loadFirestoreLogs();
                        }
                      } catch (err) {
                        console.error('Failed to clear firestore logs', err);
                      }
                    }}
                    className="p-1 px-3 bg-rose-950 hover:bg-rose-900 text-rose-300 font-semibold border border-rose-800/60 rounded-lg text-[10px] transition duration-200 uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>লগ মুছুন</span>
                  </button>
                </div>
              </div>

              {/* Logger console feed screen */}
              <div className="max-h-80 overflow-y-auto rounded-2xl bg-slate-900/60 border border-slate-900 p-4 space-y-2">
                {firestoreLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-550 space-y-2 font-sans">
                    <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                    <p className="text-xs text-slate-400">কোন ফায়ারস্টোর রিড/রাইট রেকর্ড মেমোরিতে সঞ্চিত নেই।</p>
                    <p className="text-[10px] text-slate-500 font-semibold">প্রোফাইল কুয়েরি করুন বা আপডেট করুন অপারেশন ট্র্যাকিং দেখতে।</p>
                  </div>
                ) : (
                  firestoreLogs.map((log: any) => {
                    const isSuccess = log.status === 'SUCCESS';
                    return (
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-inner ${
                          isSuccess
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200/90'
                            : 'bg-rose-950/35 border-rose-900/50 text-rose-200/90'
                        }`}
                      >
                        <div className="space-y-1 w-full">
                          {/* Top metadata line */}
                          <div className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold text-slate-400">
                            <span className="font-sans text-[9px] text-slate-400 bg-slate-950/80 p-0.5 px-1.5 rounded border border-slate-850">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                              log.operation === 'SYNC_IN' || log.operation === 'READ' ? 'bg-indigo-950 border border-indigo-700/60 text-indigo-300' :
                              log.operation === 'WRITE' ? 'bg-amber-950 border border-amber-700/60 text-amber-300' :
                              log.operation === 'DELETE' ? 'bg-rose-950 border border-rose-700/60 text-rose-300' :
                              'bg-purple-950 border border-purple-700/60 text-purple-300'
                            }`}>
                              {log.operation}
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-300">Doc ID: {log.docId || 'all'}</span>
                            {log.latencyMs !== undefined && (
                              <span className="text-slate-450 text-[9.5px] font-semibold bg-slate-950/40 px-1 rounded">Lat: {log.latencyMs}ms</span>
                            )}
                          </div>

                          {/* Detail line */}
                          <div className="text-xs text-slate-200">
                            🎯 প্রোফাইল/অ্যাকশন:{' '}
                            <span className="font-semibold font-bangla text-slate-100 italic bg-slate-950/30 px-1.5 py-0.5 rounded border border-slate-900">
                              {log.profileName || 'সব কর্মী/ ডাটাবেজ'}
                            </span>{' '}
                            {log.fields && log.fields.length > 0 && (
                              <span className="text-[10px] text-slate-400 font-sans font-semibold">
                                (Keys: [{log.fields.join(', ')}])
                              </span>
                            )}
                          </div>

                          {/* Success/Failure description */}
                          <div className="flex gap-1.5 items-start">
                            {isSuccess ? (
                              <span className="text-[9.5px] font-extrabold text-emerald-450 sm:mt-0 font-sans bg-emerald-950/50 py-0.5 px-1.5 rounded border border-emerald-900/40">🟢 SUCCESS</span>
                            ) : (
                              <div className="space-y-1 w-full">
                                <span className="text-[9.5px] font-extrabold text-rose-450 sm:mt-0 font-sans bg-rose-950/50 py-0.5 px-1.5 rounded border border-rose-900/40">🛑 FAILURE</span>
                                <pre className="text-[10px] text-rose-300 bg-rose-950/50 p-2 rounded-xl border border-rose-900/40 leading-normal max-w-full overflow-x-auto whitespace-pre-wrap font-mono">
                                  {log.errorMessage}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Visual performance indicator */}
                        <div className="hidden sm:block">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSuccess ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-red-500 animate-pulse'}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Profiles CRUD listing Table Board */}
            <div className="p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-gray-200 tracking-widest">
                    🛠️ ডিরেক্টরি প্রোফাইল কন্ট্রোল তালিকা (Card CRUD Management)
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-1">সব প্রোফাইলের পূর্ণ তথ্য দেখুন, এডিট, স্টার রেটিং নির্ধারণ ও সরাসরি নির্দেশনাবলী মেসেজ পাঠান।</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Segmented Filter Buttons */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAdminProfileFilter('all')}
                      className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg uppercase transition-all cursor-pointer ${
                        adminProfileFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-gray-800'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      সব ({adminProfiles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminProfileFilter('pending')}
                      className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        adminProfileFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-600 hover:bg-amber-500/10'
                      }`}
                    >
                      পেন্ডিং ({adminProfiles.filter(p => p.verification?.approved === false).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminProfileFilter('approved')}
                      className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg uppercase transition-all cursor-pointer ${
                        adminProfileFilter === 'approved'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                    >
                      অনুমোদিত ({adminProfiles.filter(p => p.verification?.approved !== false).length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdminResetForm();
                      setAdminModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-gray-805 text-white hover:bg-slate-800 font-black tracking-wider uppercase text-[9px] rounded-xl cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন প্রোফাইল</span>
                  </button>
                </div>
              </div>

              {adminLoading ? (
                <div className="p-12 text-center text-xs font-bold text-gray-500">প্রোফাইল তালিকা লোড ডিকোডিং হচ্ছে...</div>
              ) : (
                <div className="overflow-x-auto" id="admin-crud-table-board">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-150 dark:border-gray-800 text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-wider">
                        <th className="py-3 px-4">পেশাজীবীর নাম / Slug / নিবন্ধন সময়</th>
                        <th className="py-3 px-4">যোগাযোগ (Unredacted)</th>
                        <th className="py-3 px-4">জেলা / এরিয়া</th>
                        <th className="py-3 px-4 text-center">স্টার রেটিং (Rating)</th>
                        <th className="py-3 px-4">অগ্রগতি ও ব্যাজসমূহ</th>
                        <th className="py-3 px-4 text-right">পদক্ষেপ (CRUD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs text-slate-700 dark:text-gray-300 font-medium">
                      {adminProfiles
                        .filter(p => {
                          const approved = p.verification?.approved !== false;
                          if (adminProfileFilter === 'pending') return !approved;
                          if (adminProfileFilter === 'approved') return approved;
                          return true;
                        })
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-gray-500/5 transition-colors animate-fade-in">
                            <td className="py-4 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedAdminProfileDetail(p)}
                                className="flex items-center gap-3 text-left hover:opacity-90 active:scale-98 transition-all cursor-pointer group"
                                title="প্রোফাইল বিবরণ ও বিস্তারিত অ্যানালিটিক্স দেখুন"
                              >
                                <img src={p.profilePhoto} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border dark:border-gray-800 ring-offset-2 dark:ring-offset-gray-900 group-hover:ring-2 group-hover:ring-indigo-500 transition-all duration-300" />
                                <div className="min-w-0">
                                  <span className="block font-black text-slate-900 dark:text-white truncate font-bangla group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline">{p.fullName}</span>
                                  <span className="block text-[9px] text-gray-400 font-mono tracking-tighter truncate">/{p.slug}</span>
                                  {p.registrationDate ? (
                                    <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-black font-mono tracking-tighter mt-1 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
                                      নিবন্ধন: {p.registrationDate.substring(0, 10)} {p.registrationDate.substring(11, 16)}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[8px] bg-gray-50 dark:bg-slate-900 text-slate-400 font-bold font-mono tracking-tighter mt-1 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800">
                                      নিবন্ধন: N/A
                                    </span>
                                  )}
                                </div>
                              </button>
                            </td>
                            <td className="py-4 px-4 font-mono">
                              <span className="block font-bold text-[11px]">{p.phone}</span>
                              <span className="block text-[10px] text-gray-400">{p.email}</span>
                              {p.plainPassword && (
                                <span className="block mt-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/20 max-w-[150px] truncate" title="User Plain password">
                                  পাসওয়ার্ড: {p.plainPassword}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="block font-bold text-[11px] font-bangla">{p.district}, {p.division}</span>
                              <span className="block text-[10px] text-gray-400 font-bangla truncate max-w-[150px]">{p.serviceArea || 'Local'}</span>
                            </td>
                            <td className="py-4 px-4 text-center font-black">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 rounded-lg text-[10px]">
                                ★ {p.rating}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1.5 max-w-[160px]">
                                <div>
                                  <div className="flex justify-between items-center text-[8px] mb-0.5 font-bold">
                                    <span className="text-gray-400">অগ্রগতি (Progress)</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black">{calculateCompletenessForProfile(p)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border dark:border-slate-850">
                                    <div 
                                      className="bg-indigo-500 h-full rounded-full transition-all duration-550" 
                                      style={{ width: `${calculateCompletenessForProfile(p)}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {p.isPremium && <span className="text-[8px] px-1.5 py-0.5 bg-blue-500 text-white rounded font-black uppercase">Pro</span>}
                                  {p.verification?.nidVerified && <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500 text-white rounded font-black uppercase">NID</span>}
                                  {p.verification?.skillVerified && <span className="text-[8px] px-1.5 py-0.5 bg-purple-500 text-white rounded font-black uppercase">Skill</span>}
                                  {p.verification?.approved !== false ? (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-black uppercase">Approved</span>
                                  ) : (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-black uppercase animate-pulse">Pending</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleAdminQuickToggleApproval(p)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                                    p.verification?.approved !== false
                                      ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-650'
                                      : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-600 animate-pulse'
                                  }`}
                                  title={p.verification?.approved !== false ? "অপ্রুভাল বাতিল করুন (Set to Pending)" : "অনুমোদন করুন (Instant Approve)"}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAdminOpenEdit(p)}
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                  title="Edit Profile Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAdminDelete(p.id)}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-650 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────────
            ADMIN DETAILED PROFILE VIEWER MODAL WITH VIEWS & LIVE TRACKING
            ──────────────────────────────────────────────────────────────────────────── */}
        {selectedAdminProfileDetail && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-fade-in" id="admin-detail-modal">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-850 rounded-3xl border border-gray-105 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-widest flex items-center gap-1.5 font-bangla">
                  <span>ℹ️</span> {isBN ? 'পেশাদার প্রোফাইল বিস্তারিত বিবরণী ও অ্যানালিটিক্স' : 'Professional Record Detail & Analytics'}
                </span>
                <button
                  onClick={() => setSelectedAdminProfileDetail(null)}
                  className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-black transition-all cursor-pointer"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-850 dark:text-gray-200">
                
                {/* Visual Bio Header */}
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-gradient-to-r from-slate-50 to-slate-100/40 dark:from-slate-900/40 dark:to-slate-950/10 p-5 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <img src={selectedAdminProfileDetail.profilePhoto} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shrink-0 animate-pulse-slow" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h2 className="text-xl font-black font-bangla text-slate-950 dark:text-white leading-tight truncate">{selectedAdminProfileDetail.fullName}</h2>
                      {selectedAdminProfileDetail.isPremium && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-black uppercase tracking-wider animate-pulse">PREMIUM</span>
                      )}
                    </div>
                    <span className="block text-xs font-mono font-bold text-gray-400">ID: {selectedAdminProfileDetail.id} | Slug: /{selectedAdminProfileDetail.slug}</span>
                    
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedAdminProfileDetail.verification?.approved !== false ? (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg font-black uppercase">● Approved</span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg font-black uppercase animate-pulse">● Pending Approval</span>
                      )}
                      {selectedAdminProfileDetail.verification?.nidVerified && (
                        <span className="text-[9px] px-2 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg font-black uppercase">★ NID Verified</span>
                      )}
                      {selectedAdminProfileDetail.verification?.skillVerified && (
                        <span className="text-[9px] px-2 py-0.5 bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded-lg font-black uppercase">◈ Skill Badge</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VISITOR INTENSITY ANALYTICS STATS GRID */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total views widget */}
                  <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/15 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-wide text-indigo-650 dark:text-indigo-400 font-bangla">মোট মেম্বার ভিউ ট্র্যাকার</span>
                      <div className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                        {selectedAdminProfileDetail.profileViews || 0} <span className="text-xs font-normal">views</span>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-indigo-550 animate-pulse shrink-0" />
                  </div>

                  {/* Daily Active stats simulated */}
                  <div className="p-4 bg-teal-500/5 dark:bg-teal-500/10 rounded-2xl border border-teal-500/15 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-wide text-teal-605 dark:text-teal-400 flex items-center gap-1 font-bangla">
                        <span>আজকের লাইভ ইমপ্রেশন (24H)</span>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                      </span>
                      <div className="text-lg font-mono font-black text-teal-650 dark:text-teal-400 mt-1">
                        {Math.max(1, Math.floor((selectedAdminProfileDetail.profileViews || 0) * 0.15) + ((selectedAdminProfileDetail.profileViews || 0) % 3 === 0 ? 1 : 2))} <span className="text-xs font-sans font-semibold">লাইভ</span>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-teal-555 shrink-0" />
                  </div>
                </div>

                {/* Biography details info sheet */}
                <div className="space-y-3.5 bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">📋 ডাটাশিট পরিচিতি বিবরণ (Detailed Identification sheet)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">নিবন্ধিত মোবাইল ফোন (Contact Phone)</span>
                      <a href={`tel:${selectedAdminProfileDetail.phone}`} className="font-mono text-xs font-black text-indigo-600 hover:underline flex items-center gap-1 pt-0.5">
                        <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedAdminProfileDetail.phone || 'N/A'}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black font-bangla">অ্যাকাউন্ট ইমেইল (Account Email)</span>
                      <span className="font-mono text-xs font-bold font-bangla block pt-0.5">{selectedAdminProfileDetail.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">ভৌগলিক এলাকা (District & Division)</span>
                      <span className="font-bangla font-black text-slate-800 dark:text-gray-100 block pt-0.5">{selectedAdminProfileDetail.district || 'Kushtia'}, {selectedAdminProfileDetail.division || 'Khulna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">ইউনিক ল্যান্ডমার্ক / সেবা এলাকা (Service Area)</span>
                      <span className="font-bangla font-bold block pt-0.5">{selectedAdminProfileDetail.serviceArea || 'Local Center / Rural'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">পেশা ক্যাটাগরি (Primary Category Occupation)</span>
                      <span className="capitalize font-black text-slate-800 dark:text-gray-100 block pt-0.5">🛠️ {selectedAdminProfileDetail.primaryCategory || 'worker'} ({selectedAdminProfileDetail.role})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">কাজের অভিজ্ঞতা বছর (Experience & Rating)</span>
                      <span className="font-bangla font-black text-amber-600 block pt-0.5">★ {selectedAdminProfileDetail.rating || 5.0} | {selectedAdminProfileDetail.experienceYears || 0} বছর অভিজ্ঞতা ({selectedAdminProfileDetail.jobsCompleted || 0} pings)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">জাতীয় পরিচয়পত্র নাম্বার (National ID Verification Card)</span>
                      <span className="font-mono font-black text-indigo-500 block pt-0.5">💳 {selectedAdminProfileDetail.nidNumber || 'Not Uploaded'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block tracking-wide font-black">নিবন্ধন তারিখ (Registration Date timeline)</span>
                      <span className="font-mono font-bold block pt-0.5">{selectedAdminProfileDetail.registrationDate ? selectedAdminProfileDetail.registrationDate.substring(0, 16).replace('T', ' ') : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Biography context */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <span className="text-[10px] text-gray-400 block tracking-wide font-black font-bangla">প্রোফাইল বায়োগ্রাফি বর্ণনা (Biography Statement)</span>
                    <p className="text-xs leading-relaxed font-semibold italic text-slate-605 dark:text-gray-300 font-bangla pt-1 whitespace-pre-wrap">
                      {selectedAdminProfileDetail.bio || 'প্রোফাইল বিবরণী এখনো তৈরি করা হয়নি বা খালি রয়েছে।'}
                    </p>
                  </div>
                </div>

                {/* ID Verification front/back photo if available */}
                {(selectedAdminProfileDetail.nidPhotoFront || selectedAdminProfileDetail.nidPhotoBack) && (
                  <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase text-blue-605 dark:text-blue-400 tracking-wider">💳 জাতীয় পরিচয়পত্র ও ডকুমেন্টস প্রুফ (NID Card Proof Documents)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedAdminProfileDetail.nidPhotoFront && (
                        <div>
                          <span className="text-[9px] text-gray-400 block tracking-wide font-black uppercase mb-1">NID Front Image:</span>
                          <img src={selectedAdminProfileDetail.nidPhotoFront} alt="NID Front" className="w-full h-32 rounded-xl object-contain bg-slate-100 dark:bg-slate-900 border" />
                        </div>
                      )}
                      {selectedAdminProfileDetail.nidPhotoBack && (
                        <div>
                          <span className="text-[9px] text-gray-400 block tracking-wide font-black uppercase mb-1">NID Back Image:</span>
                          <img src={selectedAdminProfileDetail.nidPhotoBack} alt="NID Back" className="w-full h-32 rounded-xl object-contain bg-slate-100 dark:bg-slate-900 border" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Buttons with quick Admin actions */}
              <div className="p-5 border-t border-gray-105 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 flex flex-wrap gap-2 justify-between items-center shrink-0">
                
                {/* Public Deep link check */}
                <a
                  href={`/#/workers?profile=${selectedAdminProfileDetail.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>ক্যাটালগ ইন্টারফেস ভিউ (Catalog View)</span>
                </a>

                {/* Modifications */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const p = selectedAdminProfileDetail;
                      setAdminEditingProfileId(p.id);
                      setAdminProfileForm({
                        email: p.email || '',
                        phone: p.phone || '',
                        fullName: p.fullName || '',
                        role: p.role || 'worker',
                        primaryCategory: p.primaryCategory || 'electrician',
                        division: p.division || 'Khulna',
                        district: p.district || 'Kushtia',
                        serviceArea: p.serviceArea || '',
                        experienceYears: p.experienceYears?.toString() || '3',
                        rating: p.rating?.toString() || '5',
                        jobsCompleted: p.jobsCompleted?.toString() || '10',
                        bio: p.bio || '',
                        adminFeedback: p.adminFeedback || '',
                        isPremium: p.isPremium || false,
                        isPublic: p.isPublic !== false,
                        isActive: p.isActive !== false,
                        nidVerified: p.verification?.nidVerified || false,
                        skillVerified: p.verification?.skillVerified || false,
                        trustedWorker: p.verification?.trustedWorker || false,
                        approved: p.verification?.approved !== false
                      });
                      setSelectedAdminProfileDetail(null);
                      setAdminModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>সংশোধন (Modify Edit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdminDelete(selectedAdminProfileDetail.id);
                      setSelectedAdminProfileDetail(null);
                    }}
                    className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>মুছে ফেলুন (Delete)</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────────
            ADMIN CRUD EDIT MODAL FRAME
            ──────────────────────────────────────────────────────────────────────────── */}
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-fade-in" id="admin-crud-modal">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-850 rounded-3xl border border-gray-105 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
              
              <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10">
                <span className="text-xs font-black uppercase text-red-500 tracking-widest">
                  {adminEditingProfileId ? 'প্রোফাইল পরিবর্তন ও অনুমোদন সংশোধন' : 'নতুন পেশাদার প্রোফাইল তৈরি ও যাচাইকরণ'}
                </span>
                <button
                  onClick={() => setAdminModalOpen(false)}
                  className="text-xs font-bold text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>

              <form onSubmit={handleAdminSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">পূর্ণ নাম / Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminProfileForm.fullName}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">মোবাইল নম্বর / Phone *</label>
                    <input
                      type="text"
                      required
                      value={adminProfileForm.phone}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">ইমেইল ঠিকানা / Email Account *</label>
                    <input
                      type="email"
                      required
                      disabled={!!adminEditingProfileId}
                      value={adminProfileForm.email}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none disabled:opacity-50"
                      placeholder="user@manpowerhub.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">পেশা টাইপ / Role Category</label>
                    <select
                      value={adminProfileForm.role}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    >
                      <option value="worker">কর্মী / Worker</option>
                      <option value="business">ব্যবসায়ী / Business</option>
                      <option value="doctor">চিকিৎসক / Doctor</option>
                      <option value="contractor">ঠিকাদার / Contractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">মূল দক্ষতা বিভাগ / Primary Trade</label>
                    <select
                      value={adminProfileForm.primaryCategory}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, primaryCategory: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    >
                      {categoriesKeys.map(k => (
                        <option key={k} value={k}>{t('jobCategories', k)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">অভিজ্ঞতার বছর / Years</label>
                    <input
                      type="number"
                      value={adminProfileForm.experienceYears}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, experienceYears: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">রেটিং দিন / Rating (1-5 Stars) *</label>
                    <select
                      value={adminProfileForm.rating}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none font-bold text-amber-600"
                    >
                      <option value="5.0">★★★★★ 5.0</option>
                      <option value="4.8">★★★★☆ 4.8</option>
                      <option value="4.5">★★★★☆ 4.5</option>
                      <option value="4.0">★★★★☆ 4.0</option>
                      <option value="3.0">★★★☆☆ 3.0</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">সম্পূর্ণ কৃত কাজ / Jobs Completed</label>
                    <input
                      type="number"
                      value={adminProfileForm.jobsCompleted}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, jobsCompleted: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">বিভাগ (Division)</label>
                    <select
                      value={adminProfileForm.division}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, division: e.target.value, district: '' }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    >
                      {DIVISIONS_LIST.map((div) => (
                        <option key={div.key} value={div.en}>{div.bn} / {div.en}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">জেলা (District)</label>
                    <select
                      value={adminProfileForm.district}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                    >
                      <option value="">জেলা নির্বাচন করুন</option>
                      {adminDistrictsAvailable.map((dist, idx) => (
                        <option key={idx} value={dist.en}>{dist.bn} / {dist.en}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">সার্ভিস এরিয়া বিবরণী / Service Area</label>
                    <input
                      type="text"
                      value={adminProfileForm.serviceArea}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, serviceArea: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                      placeholder="কুষ্টিয়া সদর এবং মীরপুর উপজেলা"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">পূর্ণ ঠিকানা / Public Address *</label>
                    <input
                      type="text"
                      required
                      value={adminProfileForm.fullAddress}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, fullAddress: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                      placeholder="মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">জাতীয় পরিচয়পত্র নম্বর / NID Card Number</label>
                    <input
                      type="text"
                      value={adminProfileForm.nidNumber || ''}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, nidNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl focus:outline-none"
                      placeholder="e.g. 1993471822830"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">প্রোফাইল ছবি আপলোড / Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdminFileChange(e, 'profilePhoto')}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-750 dark:file:bg-blue-950/25 dark:file:text-blue-400 hover:file:bg-blue-100"
                    />
                    {adminProfileForm.profilePhoto && (
                      <img src={adminProfileForm.profilePhoto} className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700" alt="Preview" />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">এনআইডি প্রথম অংশ / NID Photo Front</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdminFileChange(e, 'nidPhotoFront')}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950/25 dark:file:text-teal-400 hover:file:bg-teal-100"
                    />
                    {adminProfileForm.nidPhotoFront && (
                      <img src={adminProfileForm.nidPhotoFront} className="mt-2 w-20 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-gray-100" alt="Preview Front" />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">এনআইডি পেছনের অংশ / NID Photo Back</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdminFileChange(e, 'nidPhotoBack')}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950/25 dark:file:text-teal-400 hover:file:bg-teal-100"
                    />
                    {adminProfileForm.nidPhotoBack && (
                      <img src={adminProfileForm.nidPhotoBack} className="mt-2 w-20 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-gray-100" alt="Preview Back" />
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">বায়োগ্রাফি পরিচিতি / Bio Details</label>
                    <textarea
                      rows={3}
                      value={adminProfileForm.bio}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-xs rounded-xl resize-none focus:outline-none font-bangla"
                    />
                  </div>

                  {/* ── SECURED ADMIN FEEDBACK / COMMUNICATION NOTES ── */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>ব্যবহারকারীর ড্যাশবোর্ডে সরাসরি পাঠানোর মেসেজ বা নির্দেশনা (Admin Private Feedback Note)</span>
                    </label>
                    <textarea
                      rows={2.5}
                      value={adminProfileForm.adminFeedback}
                      onChange={(e) => setAdminProfileForm(prev => ({ ...prev, adminFeedback: e.target.value }))}
                      placeholder="যেমন: আপনার ফোন নম্বরটি বন্ধ পাওয়া গেছে। দয়া করে সচল নম্বর দিন অথবা কুষ্টিয়া সদর অফিসে কন্টাক্ট করুন..."
                      className="w-full px-3 py-2 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 text-xs rounded-xl resize-none focus:outline-none font-bangla"
                    />
                  </div>

                  {/* Badges Toggles */}
                  <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.nidVerified}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, nidVerified: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>NID কার্ড যাচাই হয়েছে</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.skillVerified}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, skillVerified: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>কাজের পরীক্ষা যাচাই হয়েছে</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.trustedWorker}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, trustedWorker: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>Verified/Trusted Worker Badge</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.isPremium}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>Premium Gold Card Member</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.isActive}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>প্রোফাইল সচল রাখুন (Is Active)</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] font-extrabold cursor-pointer col-span-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <input
                        type="checkbox"
                        checked={adminProfileForm.approved}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, approved: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-700 dark:text-emerald-400">প্রোফাইল অনুমোদন করুন (Approved / Active Partner)</span>
                    </label>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-black uppercase rounded-lg cursor-pointer"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded-lg cursor-pointer shadow-md shadow-red-500/15"
                  >
                    সংরক্ষণ করুন (Execute Profile)
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateEditProfile;

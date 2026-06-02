import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { User, Profile, UserRole, Job } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let adminDb: any = null;

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = admin.apps.length === 0 ? admin.initializeApp({
      projectId: config.projectId,
    }) : admin.app();
    adminDb = getFirestore(app, config.firestoreDatabaseId || '(default)');
    console.log('🔥 Firebase Admin Firestore initialized successfully for Project:', config.projectId);
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

interface Schema {
  users: Record<string, any>; // Record of user ID -> User & { passwordHash: string }
  profiles: Record<string, Profile>;
  jobs: Record<string, Job>;
  analytics: {
    dailyVisitors: Record<string, number>; // date YYYY-MM-DD -> count
    registrations: Record<string, number>; // date YYYY-MM-DD -> count
  };
}

// Pre-hashed passwords for seed users
const SEED_PASSHASH = bcrypt.hashSync('password123', 10);
const ADMIN_PASSHASH = bcrypt.hashSync('AdminSecure2026!', 10);

const ALLOWED_NUMBERS = ['01717968098', '01644549105', '01733777473'];

export function sanitizePhoneNumber(phone: string, idForFallback?: string): string {
  const cleanPhone = (phone || '').trim().replace(/[- ]/g, '');
  if (ALLOWED_NUMBERS.includes(cleanPhone)) {
    return cleanPhone;
  }
  // Fallback to one of the 3 allowed numbers consistently
  const idx = idForFallback ? (idForFallback.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % ALLOWED_NUMBERS.length) : 0;
  return ALLOWED_NUMBERS[idx];
}

const SEED_USERS = [
  { id: 'usr_admin', email: 'admin@manpowerhub.com', role: 'admin' as UserRole, passwordHash: ADMIN_PASSHASH, plainPassword: 'AdminSecure2026!', isActive: true, createdAt: new Date().toISOString() },
  { id: 'usr_1', email: 'dr.masud@manpowerhub.com', role: 'doctor' as UserRole, passwordHash: SEED_PASSHASH, plainPassword: 'password123', isActive: true, createdAt: new Date().toISOString() },
  { id: 'usr_2', email: 'jesmin.tailor@manpowerhub.com', role: 'worker' as UserRole, passwordHash: SEED_PASSHASH, plainPassword: 'password123', isActive: true, createdAt: new Date().toISOString() },
  { id: 'usr_3', email: 'rahim.electrician@manpowerhub.com', role: 'worker' as UserRole, passwordHash: SEED_PASSHASH, plainPassword: 'password123', isActive: true, createdAt: new Date().toISOString() },
  { id: 'usr_4', email: 'amit.engineer@manpowerhub.com', role: 'contractor' as UserRole, passwordHash: SEED_PASSHASH, plainPassword: 'password123', isActive: true, createdAt: new Date().toISOString() },
  { id: 'usr_5', email: 'care.pharmacy@manpowerhub.com', role: 'business' as UserRole, passwordHash: SEED_PASSHASH, plainPassword: 'password123', isActive: true, createdAt: new Date().toISOString() }
];

const SEED_PROFILES: Profile[] = [
  {
    id: 'prof_admin',
    user: 'usr_admin',
    fullName: 'সিস্টেম এডমিন (System Admin)',
    phone: '01717968098',
    age: 30,
    gender: 'male',
    locationIndex: 0,
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'All Over Bangladesh',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'admin',
    specialties: ['emergency_services'],
    experienceYears: 10,
    rating: 5.0,
    jobsCompleted: 99,
    bio: 'ম্যানপাওয়ার হাব প্ল্যাটফর্মের প্রধান রক্ষণাবেক্ষণকারী ও যাচাইকারী এডমিন কর্মকর্তা।',
    socialLinks: { website: 'https://manpowerhub.com' },
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    slug: 'system-admin',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: true, premiumUser: true, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 100,
    shareCount: { facebook: 10, whatsapp: 10, messenger: 10, native: 10, total: 40 },
    isPublic: true,
    isActive: true,
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_1',
    user: 'usr_1',
    fullName: 'ডা. মাসুদ রানা (Dr. Masud Rana)',
    phone: '01644549105',
    age: 42,
    gender: 'male',
    locationIndex: 0,
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'কুষ্টিয়া সদর',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'doctor',
    primaryCategory: 'general_physician',
    specialties: ['healthcare', 'emergency_services'],
    experienceYears: 15,
    rating: 4.9,
    jobsCompleted: 340,
    bio: 'আমি কুষ্টিয়া সদর এলাকার একজন অভিজ্ঞ সাধারণ চিকিৎসক। বিগত ১৫ বছর ধরে আমি কুষ্টিয়া জেনারেল হাসপাতাল এবং আমার নিজস্ব চেম্বারে কুষ্টিয়ার সাধারণ মানুষকে আন্তরিক ও সুদক্ষ চিকিৎসা সেবা প্রদান করে আসছি। যেকোনো জরুরি স্বাস্থ্য পরামর্শ বা সেবার জন্য বিনা দ্বিধায় যোগাযোগ করুন।',
    socialLinks: { facebook: 'https://facebook.com/drmasud', website: 'https://masud-health.com.bd' },
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    slug: 'dr-masud-rana',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: true, premiumUser: true, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 1240,
    shareCount: { facebook: 45, whatsapp: 52, messenger: 12, native: 15, total: 124 },
    isPublic: true,
    isActive: true,
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_2',
    user: 'usr_2',
    fullName: 'জেসমিন আক্তার (Jesmin Akter)',
    phone: '01733777473',
    age: 28,
    gender: 'female',
    locationIndex: 5,
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'ভেড়ামারা ও রথপাড়া',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'worker',
    primaryCategory: 'tailoring',
    specialties: ['beauty_fashion'],
    experienceYears: 6,
    rating: 4.8,
    jobsCompleted: 180,
    bio: 'ভেড়ামারা অঞ্চলের একজন পেশাদার দর্জি ও ফ্যাশন ডিজাইনার। আমি কুটির শিল্প ও মেয়েদের আধুনিক পোশাক তৈরির দীর্ঘ ৬ বছরের অভিজ্ঞতা সম্পন্ন। সঠিক মাপ ও সময়মতো কাজ বুঝিয়ে দেওয়া আমার মূল বৈশিষ্ট্য।',
    socialLinks: { facebook: 'https://facebook.com/jesmintailor' },
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    slug: 'jesmin-tailoring',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: true, premiumUser: false, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 412,
    shareCount: { facebook: 12, whatsapp: 19, messenger: 5, native: 4, total: 40 },
    isPublic: true,
    isActive: true,
    isPremium: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_3',
    user: 'usr_3',
    fullName: 'আব্দুর রহিম (Rahim Uddin)',
    phone: '01717968098',
    age: 35,
    gender: 'male',
    locationIndex: 6,
    division: 'Khulna',
    district: 'Khulna',
    serviceArea: 'খুলনা সিটি কর্পোরেশন এলাকা',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'worker',
    primaryCategory: 'electrician',
    specialties: ['ac_technician', 'emergency_services'],
    experienceYears: 8,
    rating: 4.7,
    jobsCompleted: 215,
    bio: 'হাউজ ওয়্যারিং, থ্রি-ফেজ ব্যালেন্সিং, এসি রিপেয়ার ও সব ধরণের ইলেকট্রিক যন্ত্রাংশ মেরামত করার সুদক্ষ মিস্ত্রি। আমি খুলনা শহরের যেকোনো এলাকাতেই হোম সার্ভিস দিয়ে থাকি। সততা এবং কাজের গুণগত মান আমার প্রথম লক্ষ্য।',
    socialLinks: {},
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    slug: 'rahim-electrician-khulna',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: false, premiumUser: false, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 320,
    shareCount: { facebook: 8, whatsapp: 10, messenger: 2, native: 3, total: 23 },
    isPublic: true,
    isActive: true,
    isPremium: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_4',
    user: 'usr_4',
    fullName: 'অমিত কুমার বিশ্বাস (Amit Kumar)',
    phone: '01644549105',
    age: 38,
    gender: 'male',
    locationIndex: 3,
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'মিরপুর ও ভেড়ামারা',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'contractor',
    primaryCategory: 'civil_engineer',
    specialties: ['construction', 'land_services'],
    experienceYears: 11,
    rating: 4.9,
    jobsCompleted: 42,
    bio: 'বাণিজ্যিক ও আবাসিক ভবন নির্মাণ ও ড্রয়িং-ডিজাইন কাজের প্রকৌশলী ও ঠিকাদার। ডিজাইন থেকে শুরু করে রাজমিস্ত্রি পরিচালনা ও সম্পূর্ণ রাজকীয় বাড়ি বুঝিয়ে দেওয়ার নির্ভরযোগ্য প্রতিষ্ঠান। মিরপুর ও বিআরবি ক্যাবলস সংলগ্ন অঞ্চলে কাজ করে থাকি।',
    socialLinks: { linkedin: 'https://linkedin.com/in/amitengineer', website: 'https://amitconstruction.bd' },
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    slug: 'amit-civil-engineer',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: true, premiumUser: true, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 852,
    shareCount: { facebook: 34, whatsapp: 41, messenger: 10, native: 8, total: 93 },
    isPublic: true,
    isActive: true,
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_5',
    user: 'usr_5',
    fullName: 'কেয়ার ফার্মা (Care Pharmacy)',
    phone: '01733777473',
    age: 32,
    gender: 'other',
    locationIndex: 0,
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'কুষ্টিয়া জেলা',
    fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
    role: 'business',
    primaryCategory: 'pharmacy_medicine',
    specialties: ['grocery_retail', 'emergency_services'],
    experienceYears: 5,
    rating: 4.9,
    jobsCompleted: 850,
    bio: 'কুষ্টিয়া সদর হাসপাতালের সম্মুখে অবস্থিত একটি বিশ্বস্ত ফার্মেসী ও মেডিসিন শপ। আমরা ২৪ ঘণ্টাই কুষ্টিয়ার মানুষের সুবিধার্থে জরুরি জীবন রক্ষাকারী ইনজেকশন, ল্যাব টেস্ট পরামর্শ ও মেডিসিন হোম ডেলিভারির সাহায্য করে থাকি।',
    socialLinks: { facebook: 'https://facebook.com/carepharmacykushtia' },
    profilePhoto: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=200&auto=format&fit=crop',
    slug: 'care-pharmacy-med',
    verification: { nidVerified: true, skillVerified: true, trustedWorker: true, premiumUser: true, approved: true, phoneVerified: true, approvedAt: new Date().toISOString() },
    profileViews: 990,
    shareCount: { facebook: 50, whatsapp: 30, messenger: 15, native: 12, total: 107 },
    isPublic: true,
    isActive: true,
    isPremium: true,
    createdAt: new Date().toISOString()
  }
];

const SEED_JOBS: Record<string, Job> = {
  job_1: {
    id: 'job_1',
    userId: 'usr_3',
    title: 'জরুরি বাড়ির ওয়্যারিং এবং ফ্যান ইনস্টলেশন',
    description: 'আমার নতুন তৈরি দোতলা বাড়ির জন্য সম্পূর্ণ হাউজ ওয়্যারিং করতে হবে। রাজমিস্ত্রির পাইপ ড্রয়িং করা শেষ। ৮টি ফ্যান ও ৪২টি লাইট পয়েন্ট বসাতে হবে। খুলনার দক্ষ ইলেকট্রিশিয়ান প্রয়োজন।',
    category: 'electrician',
    division: 'Khulna',
    district: 'Khulna',
    serviceArea: 'খুলনা সদর',
    budget: '২৫,০০০ টাকা',
    contactPhone: '01811223344',
    contactEmail: 'rahim.electrician@manpowerhub.com',
    postedByName: 'নূর কনস্ট্রাকশন গ্রুপ',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    status: 'open'
  },
  job_2: {
    id: 'job_2',
    userId: 'usr_2',
    title: '৫০ জন কর্মীর জন্য কাস্টম কারখানার ইউনিফর্ম',
    description: 'আমাদের ভেড়ামারা ডেকোরেশন কারখানার জন্য ৫০ সেট নতুন কটন ইউনিফর্ম সেলাই করা আবশ্যক। ডিজাইন ও কাপড় আমরা সরবরাহ করব। গুণগত সেলাই সম্পন্ন কারিগর আবশ্যক।',
    category: 'tailoring',
    division: 'Khulna',
    district: 'Kushtia',
    serviceArea: 'ভেড়ামারা',
    budget: '১৫,০০০ টাকা',
    contactPhone: '01998765432',
    contactEmail: 'jesmin.tailor@manpowerhub.com',
    postedByName: 'এপেক্স ফ্যাশন ভেড়ামারা',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'open'
  }
};

class DBStore {
  public schema!: Schema;
  private db: admin.firestore.Firestore | null = adminDb;
  public activityLogs: { id: string; name: string; actionBn: string; actionEn: string; time: string; timestamp: number }[] = [
    {
      id: 'log_seed_1',
      name: 'আলী হাসান (Ali Hasan)',
      actionBn: 'নতুন দক্ষ ইলেকট্রিশিয়ান হিশেবে জয়েন করেছেন',
      actionEn: 'registered as a new skilled Electrician',
      time: '১ মিনিট আগে',
      timestamp: Date.now() - 60000
    },
    {
      id: 'log_seed_2',
      name: 'সালাম এন্টারপ্রাইজ (Salam)',
      actionBn: 'নতুন রাজমিস্ত্রি সহযোগী কাজের অফার পোস্ট করেছেন',
      actionEn: 'posted a masonry assistant job opening',
      time: '১০ মিনিট আগে',
      timestamp: Date.now() - 600000
    },
    {
      id: 'log_seed_3',
      name: 'সিস্টেম এডমিন (System Admin)',
      actionBn: 'ডা. মাসুদ রানা এর আইডি ভেরিফিকেশন সম্পন্ন করেছেন',
      actionEn: 'approved identity verification of Dr. Masud Rana',
      time: '৩২ মিনিট আগে',
      timestamp: Date.now() - 32 * 60000
    }
  ];

  public addActivityLog(name: string, actionBn: string, actionEn: string) {
    const id = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLog = {
      id,
      name,
      actionBn,
      actionEn,
      time: 'এইমাত্র',
      timestamp: Date.now()
    };
    this.activityLogs.unshift(newLog);
    if (this.activityLogs.length > 30) {
      this.activityLogs = this.activityLogs.slice(0, 30);
    }
  }

  constructor() {
    this.init();
    this.syncFromFirestore();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const initialSchema: Schema = {
      users: SEED_USERS.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}),
      profiles: SEED_PROFILES.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      jobs: SEED_JOBS,
      analytics: {
        dailyVisitors: {},
        registrations: {}
      }
    };

    // Populate past 7 days seed analytics
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // realistic curve
      initialSchema.analytics.dailyVisitors[dateStr] = 120 + Math.floor(Math.random() * 80);
      initialSchema.analytics.registrations[dateStr] = 2 + Math.floor(Math.random() * 4);
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
      this.schema = initialSchema;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);

        // Ensure backward compatibility extensions
        if (!this.schema.jobs) {
          this.schema.jobs = SEED_JOBS;
        }
        if (!this.schema.analytics) {
          this.schema.analytics = { dailyVisitors: {}, registrations: {} };
        }
        if (!this.schema.analytics.dailyVisitors) {
          this.schema.analytics.dailyVisitors = {};
        }
        if (!this.schema.analytics.registrations) {
          this.schema.analytics.registrations = {};
        }

        // Loop to ensure the rolling 7 days calendar window is populated with realistic metrics
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if (!this.schema.analytics.dailyVisitors[dateStr]) {
            this.schema.analytics.dailyVisitors[dateStr] = 85 + Math.floor(Math.random() * 75);
          }
          if (!this.schema.analytics.registrations[dateStr]) {
            this.schema.analytics.registrations[dateStr] = 1 + Math.floor(Math.random() * 3);
          }
        }

        // Retrofill plainPassword for users if missing
        if (this.schema.users) {
          Object.keys(this.schema.users).forEach(id => {
            const user = this.schema.users[id];
            if (!user.plainPassword) {
              user.plainPassword = user.email === 'admin@manpowerhub.com' ? 'AdminSecure2026!' : 'password123';
            }
          });
        }

        // Programmatically enforce Admin presence inside DB file in case it was overwritten/cleared
        let adminUser = Object.values(this.schema.users).find((u: any) => u.email === 'admin@manpowerhub.com');
        if (!adminUser) {
          this.schema.users['usr_admin'] = SEED_USERS[0];
          this.schema.profiles['prof_admin'] = SEED_PROFILES[0];
        }

        // Enforce divisions, districts, custom serviceArea, allowed numbers, and correct address values on all profiles
        Object.keys(this.schema.profiles).forEach(id => {
          const profile = this.schema.profiles[id];
          profile.fullAddress = 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া';
          profile.phone = sanitizePhoneNumber(profile.phone || '', profile.id);
          const matchedSeed = SEED_PROFILES.find(sp => sp.id === id);
          if (matchedSeed) {
            if (!profile.division) profile.division = matchedSeed.division || 'Khulna';
            if (!profile.district) profile.district = matchedSeed.district || 'Kushtia';
            if (!profile.serviceArea) profile.serviceArea = matchedSeed.serviceArea || 'ভেড়ামারা সকল এরিয়া';
          }
        });

        this.save();
      } catch (e) {
        console.error("Failed to parse database, reset with updated seeds:", e);
        fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
        this.schema = initialSchema;
      }
    }
  }

  private async syncFromFirestore() {
    if (!this.db) return;
    try {
      console.log('🔄 Syncing local memory database with Cloud Firestore...');
      
      const usersSnap = await this.db.collection('users').get();
      usersSnap.forEach((doc) => {
        this.schema.users[doc.id] = doc.data();
      });

      const profilesSnap = await this.db.collection('profiles').get();
      profilesSnap.forEach((doc) => {
        const profile = doc.data() as Profile;
        profile.fullAddress = 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া';
        profile.phone = sanitizePhoneNumber(profile.phone || '', profile.id);
        this.schema.profiles[doc.id] = profile;
      });

      const jobsSnap = await this.db.collection('jobs').get();
      jobsSnap.forEach((doc) => {
        this.schema.jobs[doc.id] = doc.data() as Job;
      });

      const analyticsDoc = await this.db.collection('analytics').doc('counters').get();
      if (analyticsDoc.exists) {
        const data = analyticsDoc.data() || {};
        if (!this.schema.analytics) {
          this.schema.analytics = { dailyVisitors: {}, registrations: {} };
        }
        if (data.dailyVisitors) this.schema.analytics.dailyVisitors = data.dailyVisitors;
        if (data.registrations) this.schema.analytics.registrations = data.registrations;
      }

      console.log(`✅ Cloud Firestore Sync successful: Synced ${usersSnap.size} users, ${profilesSnap.size} profiles, ${jobsSnap.size} jobs.`);

      if (usersSnap.size === 0) {
        console.log('🌱 Cloud Firestore is empty. Uploading in-memory seed data to Firestore...');
        await this.syncToFirestore();
      } else {
        this.saveLocally();
      }
    } catch (err: any) {
      console.error('❌ Failed syncing database from Firestore:', err.message || err);
      console.warn('⚠️ Cloud Firestore sync is disabled (possibly due to missing IAM permissions or uncreated database). Standing by with local standalone memory JSON DB.');
      this.db = null;
    }
  }

  private async syncToFirestore() {
    if (!this.db) return;
    try {
      const batchSize = 100;
      let batch = this.db.batch();
      let count = 0;

      for (const [id, user] of Object.entries(this.schema.users)) {
        batch.set(this.db.collection('users').doc(id), user);
        count++;
        if (count >= batchSize) {
          await batch.commit();
          batch = this.db.batch();
          count = 0;
        }
      }

      for (const [id, profile] of Object.entries(this.schema.profiles)) {
        batch.set(this.db.collection('profiles').doc(id), profile);
        count++;
        if (count >= batchSize) {
          await batch.commit();
          batch = this.db.batch();
          count = 0;
        }
      }

      for (const [id, job] of Object.entries(this.schema.jobs || {})) {
        batch.set(this.db.collection('jobs').doc(id), job);
        count++;
        if (count >= batchSize) {
          await batch.commit();
          batch = this.db.batch();
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      await this.db.collection('analytics').doc('counters').set(this.schema.analytics || { dailyVisitors: {}, registrations: {} });
      console.log('🌱 Initial database uploaded to Cloud Firestore successfully.');
    } catch (err) {
      console.error('Failed seeding to Firestore:', err);
    }
  }

  private saveLocally() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json locally:', e);
    }
  }

  private save() {
    this.saveLocally();
  }

  // --- Core Methods ---

  public getUsersList(): any[] {
    return Object.values(this.schema.users);
  }

  public getProfilesList(): Profile[] {
    return Object.values(this.schema.profiles);
  }

  public getUserById(id: string): any | null {
    return this.schema.users[id] || null;
  }

  public getUserByEmail(email: string): any | null {
    const list = this.getUsersList();
    const clean = email.trim().toLowerCase();
    return list.find((u) => u.email.trim().toLowerCase() === clean) || null;
  }

  public getProfileByUserId(userId: string): Profile | null {
    const list = this.getProfilesList();
    return list.find((p) => p.user === userId) || null;
  }

  public getProfileBySlug(slug: string): Profile | null {
    const list = this.getProfilesList();
    return list.find((p) => p.slug === slug) || null;
  }

  public createUser(email: string, passwordHash: string, role: UserRole, fullName: string, phone: string, plainPassword?: string): { user: any, profile: Profile } {
    const idNum = Object.keys(this.schema.users).length + 10;
    const userId = `usr_${idNum}`;
    const profId = `prof_${idNum}`;

    const newUser = {
      id: userId,
      email: email.trim().toLowerCase(),
      role,
      passwordHash,
      plainPassword: plainPassword || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const cleanName = fullName.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug || 'user-' + idNum;
    let counter = 1;
    while (this.getProfileBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newProfile: Profile = {
      id: profId,
      user: userId,
      fullName: cleanName,
      phone: sanitizePhoneNumber(phone, userId),
      role,
      specialties: [],
      locationIndex: 0,
      division: 'Khulna', // Default starting division
      district: 'Kushtia', // Default starting district
      serviceArea: 'কুষ্টিয়া সদর', // Default service area text
      fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
      experienceYears: 0,
      rating: 5.0,
      jobsCompleted: 0,
      bio: '',
      socialLinks: {},
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', // Stock placeholder
      slug,
      verification: {
        nidVerified: false,
        skillVerified: false,
        trustedWorker: false,
        premiumUser: false,
        approved: email.trim().toLowerCase() === 'technosparkhandset@gmail.com' || email.trim().toLowerCase() === 'admin@manpowerhub.com',
        phoneVerified: false
      },
      profileViews: 0,
      shareCount: { facebook: 0, whatsapp: 0, messenger: 0, native: 0, total: 0 },
      isPublic: true,
      isActive: true,
      isPremium: false,
      createdAt: new Date().toISOString()
    };

    this.schema.users[userId] = newUser;
    this.schema.profiles[profId] = newProfile;
    
    this.addActivityLog(cleanName, 'প্ল্যাটফর্মে নতুন অ্যাকাউন্ট নিবন্ধন সম্পন্ন করেছেন', 'successfully registered their profile account');
    this.trackRegistration();
    this.save();

    if (this.db) {
      this.db.collection('users').doc(userId).set(newUser).catch((e: any) => console.error('Firestore user creation write error:', e));
      this.db.collection('profiles').doc(profId).set(newProfile).catch((e: any) => console.error('Firestore profile creation write error:', e));
    }

    return { user: newUser, profile: newProfile };
  }

  public updateProfile(userId: string, updateData: Partial<Profile>): Profile | null {
    const profile = this.getProfileByUserId(userId);
    if (!profile) return null;

    if (updateData.phone) {
      updateData.phone = sanitizePhoneNumber(updateData.phone, profile.user);
    }
    updateData.fullAddress = 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া';

    Object.assign(profile, updateData);
    this.addActivityLog(profile.fullName, 'নিজের প্রোফাইল বা ব্যবসার বিবরণী আপডেট করেছেন', 'updated their profile or business descriptors');
    this.save();
    
    if (this.db) {
      this.db.collection('profiles').doc(profile.id).set(profile).catch((e: any) => console.error('Firestore updateProfile write error:', e));
    }
    
    return profile;
  }

  public incrementProfileViews(slug: string): void {
    const profile = this.getProfileBySlug(slug);
    if (profile) {
      profile.profileViews = (profile.profileViews || 0) + 1;
      this.save();
      if (this.db) {
        this.db.collection('profiles').doc(profile.id).update({ profileViews: profile.profileViews }).catch((e: any) => console.error('Firestore view increment error:', e));
      }
    }
  }

  public trackShare(slug: string, platform: 'facebook' | 'whatsapp' | 'messenger' | 'native'): void {
    const profile = this.getProfileBySlug(slug);
    if (profile) {
      if (!profile.shareCount) {
        profile.shareCount = { facebook: 0, whatsapp: 0, messenger: 0, native: 0, total: 0 };
      }
      profile.shareCount[platform] = (profile.shareCount[platform] || 0) + 1;
      profile.shareCount.total = 
        (profile.shareCount.facebook || 0) +
        (profile.shareCount.whatsapp || 0) +
        (profile.shareCount.messenger || 0) +
        (profile.shareCount.native || 0);
      this.save();
      if (this.db) {
        this.db.collection('profiles').doc(profile.id).update({ shareCount: profile.shareCount }).catch((e: any) => console.error('Firestore trackShare write error:', e));
      }
    }
  }

  // --- Job Posts CRUD ---

  public getJobsList(): Job[] {
    return Object.values(this.schema.jobs || {});
  }

  public createJob(userId: string, jobData: Omit<Job, 'id' | 'userId' | 'createdAt' | 'status'>): Job {
    const jobId = `job_${Date.now()}`;
    const newJob: Job = {
      ...jobData,
      id: jobId,
      userId,
      createdAt: new Date().toISOString(),
      status: 'open'
    };

    if (!this.schema.jobs) {
      this.schema.jobs = {};
    }
    this.schema.jobs[jobId] = newJob;
    this.addActivityLog(newJob.postedByName || 'সম্মানিত ইউজার', `নতুন কাজের নিয়োগ বিজ্ঞপ্তি "${newJob.title}" পোস্ট করেছেন`, `published a new job offer "${newJob.title}"`);
    this.save();
    if (this.db) {
      this.db.collection('jobs').doc(jobId).set(newJob).catch((e: any) => console.error('Firestore createJob write error:', e));
    }
    return newJob;
  }

  public deleteJob(jobId: string): boolean {
    if (this.schema.jobs && this.schema.jobs[jobId]) {
      delete this.schema.jobs[jobId];
      this.save();
      if (this.db) {
        this.db.collection('jobs').doc(jobId).delete().catch((e: any) => console.error('Firestore deleteJob error:', e));
      }
      return true;
    }
    return false;
  }

  public updateJobStatus(jobId: string, status: 'open' | 'closed'): boolean {
    if (this.schema.jobs && this.schema.jobs[jobId]) {
      this.schema.jobs[jobId].status = status;
      this.save();
      if (this.db) {
        this.db.collection('jobs').doc(jobId).update({ status }).catch((e: any) => console.error('Firestore updateJobStatus write error:', e));
      }
      return true;
    }
    return false;
  }

  // --- Visitor & Registration Analytics ---

  public trackVisitor(): void {
    const today = new Date().toISOString().split('T')[0];
    if (!this.schema.analytics) {
      this.schema.analytics = { dailyVisitors: {}, registrations: {} };
    }
    if (!this.schema.analytics.dailyVisitors) {
      this.schema.analytics.dailyVisitors = {};
    }
    this.schema.analytics.dailyVisitors[today] = (this.schema.analytics.dailyVisitors[today] || 0) + 1;
    this.save();
    if (this.db) {
      this.db.collection('analytics').doc('counters').set(this.schema.analytics).catch((e: any) => console.error('Firestore trackVisitor write error:', e));
    }
  }

  public trackRegistration(): void {
    const today = new Date().toISOString().split('T')[0];
    if (!this.schema.analytics) {
      this.schema.analytics = { dailyVisitors: {}, registrations: {} };
    }
    if (!this.schema.analytics.registrations) {
      this.schema.analytics.registrations = {};
    }
    this.schema.analytics.registrations[today] = (this.schema.analytics.registrations[today] || 0) + 1;
    this.save();
    if (this.db) {
      this.db.collection('analytics').doc('counters').set(this.schema.analytics).catch((e: any) => console.error('Firestore trackRegistration write error:', e));
    }
  }

  public trackSearch(searchQuery?: string, categoryQuery?: string) {
    if (!this.schema.analytics) {
      this.schema.analytics = { dailyVisitors: {}, registrations: {} };
    }
    const anal = this.schema.analytics as any;
    if (!anal.searchQueries) {
      anal.searchQueries = {};
    }
    if (!anal.categorySearches) {
      anal.categorySearches = {};
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      if (q && q.length > 1) {
        anal.searchQueries[q] = (anal.searchQueries[q] || 0) + 1;
      }
    }

    if (categoryQuery) {
      const cat = categoryQuery.toLowerCase().trim();
      if (cat && cat.length > 1) {
        anal.categorySearches[cat] = (anal.categorySearches[cat] || 0) + 1;
      }
    }
    this.save();
  }

  public getAnalyticsSummary(): any {
    const today = new Date().toISOString().split('T')[0];
    
    // Build real-time active visitor tracker dynamically
    // Seeded base of active users fluctuating naturally
    const hrs = new Date().getHours();
    const multiplier = hrs >= 22 || hrs <= 6 ? 0.4 : 1.2; // naturally drop at night
    const activeVisitors = Math.floor((15 + Math.random() * 12) * multiplier);

    // Get rolling last 7 days keys
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const visitorsData = last7Days.map(date => ({
      date: date.substring(5), // MM-DD
      visitors: this.schema.analytics.dailyVisitors[date] || 0,
      registrations: this.schema.analytics.registrations[date] || 0
    }));

    // Seed defaults in case empty
    const anal = this.schema.analytics as any;
    const baseSearchQueries = anal.searchQueries && Object.keys(anal.searchQueries).length > 0
      ? anal.searchQueries
      : {
          'electrician': 142,
          'doctor': 98,
          'tailor': 76,
          'plumber': 64,
          'driver': 52,
          'mason': 45,
          'kushtia': 118,
          'dhaka': 95,
          'carpenter': 38,
          'mechanic': 31
        };

    const baseCategorySearches = anal.categorySearches && Object.keys(anal.categorySearches).length > 0
      ? anal.categorySearches
      : {
          'electrician': 210,
          'doctor': 156,
          'worker': 120,
          'mechanic': 85,
          'contractor': 72,
          'business': 64,
          'tailor': 58,
          'chef': 42
        };

    return {
      activeVisitors,
      history7Days: visitorsData,
      searchQueries: baseSearchQueries,
      categorySearches: baseCategorySearches,
      totals: {
        users: Object.keys(this.schema.users).length,
        profiles: Object.keys(this.schema.profiles).length,
        jobs: Object.keys(this.schema.jobs || {}).length,
        totalViews: Object.values(this.schema.profiles).reduce((acc, p) => acc + (p.profileViews || 0), 0)
      }
    };
  }

  // --- Admin Powers ---

  public adminAddProfile(profileData: any): Profile {
    const idNum = Object.keys(this.schema.users).length + 20;
    const userId = `usr_adm_${idNum}`;
    const profId = `prof_adm_${idNum}`;

    const passwordHash = bcrypt.hashSync('password123', 10);
    const newUser = {
      id: userId,
      email: profileData.email.trim().toLowerCase(),
      role: profileData.role || 'worker',
      passwordHash,
      plainPassword: 'password123',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const cleanName = profileData.fullName.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug || 'worker-' + idNum;
    let counter = 1;
    while (this.getProfileBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newProfile: Profile = {
      id: profId,
      user: userId,
      fullName: cleanName,
      phone: sanitizePhoneNumber(profileData.phone || '', userId),
      role: profileData.role || 'worker',
      specialties: profileData.specialties || [],
      locationIndex: profileData.locationIndex ?? 0,
      division: profileData.division || 'Khulna',
      district: profileData.district || 'Kushtia',
      serviceArea: profileData.serviceArea || 'Local Area',
      fullAddress: 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া',
      nidNumber: profileData.nidNumber || '',
      nidPhotoFront: profileData.nidPhotoFront || '',
      nidPhotoBack: profileData.nidPhotoBack || '',
      experienceYears: Number(profileData.experienceYears) || 0,
      rating: Number(profileData.rating) || 5.0,
      jobsCompleted: Number(profileData.jobsCompleted) || 0,
      bio: profileData.bio || '',
      socialLinks: profileData.socialLinks || {},
      profilePhoto: profileData.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      slug,
      adminFeedback: profileData.adminFeedback || '',
      verification: profileData.verification || {
        nidVerified: profileData.nidVerified ?? true,
        skillVerified: profileData.skillVerified ?? true,
        trustedWorker: profileData.trustedWorker ?? true,
        premiumUser: profileData.isPremium ?? false,
        approved: profileData.approved ?? true,
        phoneVerified: true
      },
      profileViews: Math.floor(Math.random() * 50),
      shareCount: { facebook: 0, whatsapp: 0, messenger: 0, native: 0, total: 0 },
      isPublic: profileData.isPublic ?? true,
      isActive: profileData.isActive ?? true,
      isPremium: profileData.isPremium ?? false,
      createdAt: new Date().toISOString()
    };

    this.schema.users[userId] = newUser;
    this.schema.profiles[profId] = newProfile;
    this.save();
    if (this.db) {
      this.db.collection('users').doc(userId).set(newUser).catch((e: any) => console.error('Firestore adminAddProfile user write error:', e));
      this.db.collection('profiles').doc(profId).set(newProfile).catch((e: any) => console.error('Firestore adminAddProfile profile write error:', e));
    }
    return newProfile;
  }

  public adminUpdateProfile(profileId: string, profileData: Partial<Profile>): Profile | null {
    const profile = this.schema.profiles[profileId];
    if (!profile) return null;

    if (profileData.phone) {
      profileData.phone = sanitizePhoneNumber(profileData.phone, profile.user);
    }
    profileData.fullAddress = 'মধ্যবাজার, কর্মকার রোড, ভেড়ামারা, কুষ্টিয়া';

    Object.assign(profile, profileData);
    
    // Keep user's email synced with user roles if edited
    if (profileData.role) {
      const user = this.schema.users[profile.user];
      if (user) {
        user.role = profileData.role;
        if (this.db) {
          this.db.collection('users').doc(user.id).set(user).catch((e: any) => console.error(e));
        }
      }
    }

    this.save();
    if (this.db) {
      this.db.collection('profiles').doc(profileId).set(profile).catch((e: any) => console.error('Firestore adminUpdateProfile error:', e));
    }
    return profile;
  }

  public adminDeleteProfile(profileId: string): boolean {
    let profile = this.schema.profiles[profileId];
    let key = profileId;
    if (!profile) {
      const found = Object.entries(this.schema.profiles).find(([k, p]) => p.id === profileId);
      if (found) {
        key = found[0];
        profile = found[1];
      }
    }

    if (profile) {
      const userId = profile.user;
      delete this.schema.profiles[key];
      if (userId && this.schema.users[userId]) {
        delete this.schema.users[userId];
        if (this.db) {
          this.db.collection('users').doc(userId).delete().catch((e: any) => console.error('Firestore delete user error:', e));
        }
      }
      this.save();
      if (this.db) {
        this.db.collection('profiles').doc(key).delete().catch((e: any) => console.error('Firestore adminDeleteProfile error:', e));
      }
      return true;
    }
    return false;
  }

  public adminBulkRestore(users: any[], profiles: any[]): void {
    for (const u of users) {
      if (u && u.id) {
        this.schema.users[u.id] = {
          id: u.id,
          email: u.email,
          role: u.role || 'worker',
          passwordHash: u.passwordHash || bcrypt.hashSync('password123', 10),
          plainPassword: u.plainPassword || 'password123',
          isActive: u.isActive !== false,
          createdAt: u.createdAt || new Date().toISOString()
        };
      }
    }

    for (const p of profiles) {
      if (p && p.id && p.user) {
        this.schema.profiles[p.id] = {
          id: p.id,
          user: p.user,
          fullName: p.fullName || 'Unnamed',
          phone: p.phone || '',
          role: p.role || 'worker',
          specialties: p.specialties || [],
          locationIndex: p.locationIndex ?? 0,
          division: p.division || 'Khulna',
          district: p.district || 'Kushtia',
          serviceArea: p.serviceArea || '',
          experienceYears: Number(p.experienceYears) || 0,
          rating: Number(p.rating) || 5.0,
          jobsCompleted: Number(p.jobsCompleted) || 0,
          bio: p.bio || '',
          socialLinks: p.socialLinks || {},
          profilePhoto: p.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          slug: p.slug || `user-${p.id}`,
          adminFeedback: p.adminFeedback || '',
          verification: p.verification || {
            nidVerified: true,
            skillVerified: true,
            trustedWorker: true,
            premiumUser: false,
            approved: true,
            phoneVerified: true
          },
          profileViews: p.profileViews || 0,
          shareCount: p.shareCount || { facebook: 0, whatsapp: 0, messenger: 0, native: 0, total: 0 },
          isPublic: p.isPublic !== false,
          isActive: p.isActive !== false,
          isPremium: p.isPremium || false,
          createdAt: p.createdAt || new Date().toISOString()
        };
      }
    }

    this.save();

    if (this.db) {
      for (const u of users) {
        if (u && u.id) {
          this.db.collection('users').doc(u.id).set(this.schema.users[u.id]).catch((e: any) => console.error(e));
        }
      }
      for (const p of profiles) {
        if (p && p.id) {
          this.db.collection('profiles').doc(p.id).set(this.schema.profiles[p.id]).catch((e: any) => console.error(e));
        }
      }
    }
  }
}

export const dbStore = new DBStore();
export type { Schema };

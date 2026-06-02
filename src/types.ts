/**
 * Domain Models for Manpower Hub
 */

export type UserRole = 'worker' | 'employer' | 'business' | 'doctor' | 'dentist' | 'contractor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  website?: string;
}

export interface VerificationStatus {
  nidVerified: boolean;
  skillVerified: boolean;
  trustedWorker: boolean;
  premiumUser: boolean;
  approved: boolean;
  phoneVerified: boolean;
  approvedAt?: string | null;
}

export interface ShareCount {
  facebook: number;
  whatsapp: number;
  messenger: number;
  native: number;
  total: number;
}

export interface Profile {
  id: string;
  user: string; // Linked User ID
  fullName: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  locationIndex: number | null; // index into LOCATIONS array
  division?: string;
  district?: string;
  thana?: string; // Upazila/Thana Name
  union?: string; // Union Council Name
  serviceArea?: string;
  serviceAreasList?: string[]; // Multiple service villages/upazilas e.g. ["ভেড়ামারা সকল এরিয়া", "মেহেরপুর সকল এরিয়া"]
  nidNumber?: string; // NID Card Number
  nidPhotoFront?: string; // Base64 or URL
  nidPhotoBack?: string; // Base64 or URL
  adminFeedback?: string;
  fullAddress?: string;
  role: UserRole;
  primaryCategory?: string; // e.g. 'electrician'
  specialties: string[]; // List of other categories
  experienceYears: number;
  rating: number;
  jobsCompleted: number;
  bio: string;
  socialLinks: SocialLinks;
  profilePhoto: string;
  slug: string;
  verification: VerificationStatus;
  profileViews: number;
  shareCount: ShareCount;
  isPublic: boolean;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerPhone?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  division: string;
  district: string;
  thana?: string;
  union?: string;
  serviceArea?: string;
  budget: string | number;
  contactPhone: string;
  contactEmail?: string;
  postedByName: string; // Name of shop/user posting
  createdAt: string;
  status: 'open' | 'closed';
}

export interface LocationData {
  locationIndex: number;
  bn: string;
  en: string;
}

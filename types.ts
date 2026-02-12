

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added phone number
  role: UserRole;
  purchasedCourses: string[]; // array of course IDs
  completedLessons: Record<string, string[]>; // CourseID -> Array of completed LessonIDs
  joinedDate?: string; // ISO Date string
  lastLogin?: string; // ISO Date string
}

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'info' | 'alert' | 'success';
}

export interface LessonResource {
    id: string;
    title: string;
    url: string;
    type: 'video' | 'file' | 'upload';
}

export interface Lesson {
  id: string;
  title: string;
  description?: string; // Video/Lesson description
  type: 'video' | 'pdf' | 'quiz'; // Primary type
  duration?: string; // e.g., "10:00"
  contentUrl?: string; // Legacy/Single URL (kept for backward compat, but resources should be used)
  resources?: LessonResource[]; // New: Multiple resources
  isFree?: boolean; // Preview enabled
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number; // Optional discount price
  instructor: string;
  thumbnail: string;
  rating: number;
  studentsCount: number;
  sections: Section[];
  category: string;
  reviews: Review[]; // Array of reviews
}

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // 1-100
  expiryDate: string; // ISO Date string
  specificCourseId?: string; // If undefined/empty, applies to all courses
}

export interface PaymentMethodConfig {
    id: string;
    type: 'visa' | 'vodafone' | 'fawry' | 'subscription';
    nameAr: string;
    nameEn: string;
    isEnabled: boolean;
    descriptionAr?: string;
    descriptionEn?: string;
}

export type SiteTheme = 'default' | 'ramadan' | 'eid-fitr' | 'eid-adha' | 'custom';

export interface SiteSettings {
    vodafoneWalletNumber: string;
    supportEmail: string;
    paymentMethods: PaymentMethodConfig[];
    siteTheme: SiteTheme;
    // UI Customization
    brandName: string;
    primaryColor: string;
    secondaryColor: string;
    heroImageUrls: string[]; // Changed to array for slider support
    heroTitleAr: string;
    heroTitleEn: string;
    heroSubtitleAr: string;
    heroSubtitleEn: string;
    showStudentCount: boolean; // New setting
}

export enum PaymentMethod {
  VISA = 'visa',
  VODAFONE_CASH = 'vodafone',
  FAWRY = 'fawry',
  SUBSCRIPTION = 'subscription'
}
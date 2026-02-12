import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Course, UserRole, CartItem, Review, SiteSettings, Coupon, PaymentMethodConfig, SystemNotification } from '../types';
import { sendMockEmail } from '../services/mockEmailService';

// --- INDEXED DB HELPERS (For Persistent Large Storage) ---
const DB_NAME = 'AlbazLMS';
const STORE_COURSES = 'courses';
const STORE_USERS = 'users'; // New Store for Users
const DB_VERSION = 2; // Incremented Version

const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_COURSES)) {
        db.createObjectStore(STORE_COURSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
    };
  });
};

// Generic DB Get All
const dbGetAll = async (storeName: string) => {
  try {
      const db = await openDB();
      return new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
  } catch (e) {
      console.error(`DB Get Error (${storeName}):`, e);
      return [];
  }
};

// Generic DB Save Item
const dbSaveItem = async (storeName: string, item: any) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.put(item);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error(`DB Save Error (${storeName}):`, e);
    }
};

// Generic DB Delete Item
const dbDeleteItem = async (storeName: string, id: string) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error(`DB Delete Error (${storeName}):`, e);
    }
}

// --- TRANSLATIONS ---
const translations = {
  ar: {
    brand: "الباز",
    searchPlaceholder: "ابحث عن كورس...",
    cart: "السلة",
    login: "دخول",
    logout: "خروج",
    myCourses: "كورساتي",
    dashboard: "لوحة التحكم",
    homeHeroTitle: "تعلم مهارات المستقبل",
    homeHeroSubtitle: "في مكان واحد",
    homeHeroDesc: "منصة الباز توفر لك أفضل الكورسات التعليمية في البرمجة، التصميم، التسويق، وغيرها بأسعار تنافسية.",
    browseBtn: "تصفح الكورسات",
    teachBtn: "ابدأ التدريس",
    latestCourses: "أحدث الكورسات",
    noCourses: "لا توجد كورسات مطابقة لبحثك حالياً.",
    filters: { all: "الكل", programming: "برمجة", design: "تصميم", marketing: "تسويق" },
    course: {
      student: "طالب",
      free: "مجاني",
      currency: "ج.م",
      buyNow: "شراء الآن",
      addToCart: "أضف للسلة",
      continueLearning: "تابع التعلم",
      moneyBack: "ضمان استرجاع الأموال لمدة 30 يومًا",
      instructor: "بواسطة",
      updated: "تاريخ التحديث",
      content: "محتوى الكورس",
      noContent: "لا يوجد محتوى مضاف حتى الآن.",
      aiSummary: "ملخص الذكاء الاصطناعي",
      aiChat: "مساعد الكورس",
      recommended: "كورسات مقترحة لك",
      reviews: "آراء الطلاب",
      addReview: "أضف تقييمك",
      submitReview: "نشر التقييم",
      rating: "التقييم",
      commentPlaceholder: "اكتب رأيك هنا...",
      discount: "خصم"
    },
    cartPage: {
      empty: "السلة فارغة",
      summary: "ملخص الطلب",
      total: "الإجمالي",
      paymentMethod: "اختر وسيلة الدفع",
      pay: "إتمام الدفع",
      chatToPay: "تواصل للدفع",
      success: "تم الدفع بنجاح!",
      successDesc: "تم إضافة الكورسات إلى حسابك بنجاح.",
      backHome: "العودة للرئيسية",
      remove: "حذف",
      haveCoupon: "لديك كوبون خصم؟",
      apply: "تطبيق",
      couponApplied: "تم تطبيق الخصم",
      invalidCoupon: "كوبون غير صالح أو منتهي",
      discountValue: "قيمة الخصم"
    },
    loginPage: {
      title: "تسجيل الدخول",
      registerTitle: "إنشاء حساب جديد",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني أو الهاتف",
      phone: "رقم الهاتف",
      password: "كلمة المرور",
      submit: "دخول",
      registerSubmit: "تسجيل حساب",
      noAccount: "ليس لديك حساب؟",
      haveAccount: "لديك حساب بالفعل؟",
      register: "سجل الآن",
      login: "سجل دخولك",
      errorNotFound: "هذا الحساب غير موجود، يرجى إنشاء حساب جديد",
      errorWrongPass: "كلمة المرور غير صحيحة",
      errorExists: "البريد الإلكتروني أو الهاتف مسجل بالفعل",
      errorEmpty: "يرجى ملء جميع الحقول",
      loggedIn: "أنت مسجل دخول بالفعل كـ",
      goToProfile: "تعديل الملف الشخصي",
      logout: "تسجيل خروج",
      rememberMe: "تذكرني"
    },
    admin: {
      title: "لوحة تحكم الإدارة",
      addCourse: "إضافة كورس",
      viewCourses: "عرض الكورسات",
      courseName: "اسم الكورس",
      price: "السعر",
      students: "الطلاب",
      actions: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      save: "حفظ التغييرات",
      publish: "نشر الكورس",
      newCourse: "إضافة كورس جديد",
      editCourse: "تعديل الكورس",
      courseTitle: "عنوان الكورس",
      courseDesc: "وصف الكورس",
      discountPrice: "سعر الخصم (اختياري)",
      dropVideo: "سحب وإفلات الفيديوهات هنا",
      thumbnail: "صورة الكورس",
      imagePreview: "معاينة الصورة",
      settings: "الإعدادات",
      paymentSettings: "إعدادات الدفع",
      vodafoneNumber: "رقم محفظة فودافون كاش",
      updateSettings: "تحديث الإعدادات",
      coupons: "الكوبونات",
      addCoupon: "إضافة كوبون",
      code: "الكود",
      discountPercent: "نسبة الخصم",
      expiryDate: "تاريخ الانتهاء",
      specificCourse: "مخصص لكورس (اختياري)",
      allCourses: "كل الكورسات",
      couponCreated: "تم إنشاء الكوبون بنجاح",
      users: "المستخدمين",
      userEmail: "البيانات",
      userRole: "الصلاحية",
      joinedCourses: "الكورسات المشترك بها",
      loginAs: "دخول كـ",
      changePass: "تغيير كلمة المرور",
      manageCourses: "إدارة الكورسات",
      searchUser: "بحث بالاسم، الإيميل، أو الهاتف...",
      userDataUpdated: "تم تحديث بيانات المستخدم",
      coursesUpdated: "تم تحديث اشتراكات المستخدم",
      managePaymentMethods: "إدارة طرق الدفع",
      methodNameAr: "الاسم (عربي)",
      methodNameEn: "الاسم (إنجليزي)",
      isEnabled: "مفعل",
      deleteUserConfirm: "هل أنت متأكد من حذف هذا المستخدم نهائياً؟",
      siteTheme: "ثيم الموقع (للمناسبات)",
      broadcast: "إرسال إشعار",
      joinedDate: "تاريخ التسجيل",
      lastLogin: "آخر ظهور"
    },
    profile: {
        title: "الملف الشخصي",
        updateSuccess: "تم تحديث البيانات بنجاح",
        update: "تحديث البيانات"
    }
  },
  en: {
    brand: "Albaz",
    searchPlaceholder: "Search for a course...",
    cart: "Cart",
    login: "Login",
    logout: "Logout",
    myCourses: "My Courses",
    dashboard: "Dashboard",
    homeHeroTitle: "Learn Future Skills",
    homeHeroSubtitle: "In One Place",
    homeHeroDesc: "Albaz platform provides the best educational courses in programming, design, marketing, and more at competitive prices.",
    browseBtn: "Browse Courses",
    teachBtn: "Start Teaching",
    latestCourses: "Latest Courses",
    noCourses: "No courses found matching your search.",
    filters: { all: "All", programming: "Programming", design: "Design", marketing: "Marketing" },
    course: {
      student: "Students",
      free: "Free",
      currency: "EGP",
      buyNow: "Buy Now",
      addToCart: "Add to Cart",
      continueLearning: "Continue Learning",
      moneyBack: "30-Day Money-Back Guarantee",
      instructor: "By",
      updated: "Last Updated",
      content: "Course Content",
      noContent: "No content added yet.",
      aiSummary: "AI Summary",
      aiChat: "Course Assistant",
      recommended: "Recommended for You",
      reviews: "Student Reviews",
      addReview: "Add Your Review",
      submitReview: "Post Review",
      rating: "Rating",
      commentPlaceholder: "Write your feedback here...",
      discount: "OFF"
    },
    cartPage: {
      empty: "Cart is empty",
      summary: "Order Summary",
      total: "Total",
      paymentMethod: "Select Payment Method",
      pay: "Pay Now",
      chatToPay: "Chat to Pay",
      success: "Payment Successful!",
      successDesc: "Courses have been added to your account.",
      backHome: "Back to Home",
      remove: "Remove",
      haveCoupon: "Have a coupon?",
      apply: "Apply",
      couponApplied: "Coupon Applied",
      invalidCoupon: "Invalid or expired coupon",
      discountValue: "Discount Value"
    },
    loginPage: {
      title: "Login",
      registerTitle: "Create New Account",
      name: "Full Name",
      email: "Email or Phone",
      phone: "Phone Number",
      password: "Password",
      submit: "Login",
      registerSubmit: "Register",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      register: "Register Now",
      login: "Login Here",
      errorNotFound: "Account not found, please create a new account",
      errorWrongPass: "Incorrect password",
      errorExists: "Email or Phone already registered",
      errorEmpty: "Please fill all fields",
      loggedIn: "You are already logged in as",
      goToProfile: "Edit Profile",
      logout: "Logout",
      rememberMe: "Remember Me"
    },
    admin: {
      title: "Admin Dashboard",
      addCourse: "Add Course",
      viewCourses: "View Courses",
      courseName: "Course Name",
      price: "Price",
      students: "Students",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes",
      publish: "Publish Course",
      newCourse: "Add New Course",
      editCourse: "Edit Course",
      courseTitle: "Course Title",
      courseDesc: "Description",
      discountPrice: "Discount Price (Optional)",
      dropVideo: "Drag & Drop Videos Here (Mock)",
      thumbnail: "Course Thumbnail",
      imagePreview: "Image Preview",
      settings: "Settings",
      paymentSettings: "Payment Settings",
      vodafoneNumber: "Vodafone Cash Wallet Number",
      updateSettings: "Update Settings",
      coupons: "Coupons",
      addCoupon: "Add Coupon",
      code: "Code",
      discountPercent: "Discount %",
      expiryDate: "Expiry Date",
      specificCourse: "Specific Course (Optional)",
      allCourses: "All Courses",
      couponCreated: "Coupon Created Successfully",
      users: "Users",
      userEmail: "Details",
      userRole: "Role",
      joinedCourses: "Enrolled Courses",
      loginAs: "Login As",
      changePass: "Change Password",
      manageCourses: "Manage Courses",
      searchUser: "Search by Name, Email or Phone...",
      userDataUpdated: "User data updated successfully",
      coursesUpdated: "User courses updated",
      managePaymentMethods: "Manage Payment Methods",
      methodNameAr: "Name (Arabic)",
      methodNameEn: "Name (English)",
      isEnabled: "Enabled",
      deleteUserConfirm: "Are you sure you want to delete this user permanently?",
      siteTheme: "Site Theme (Occasion)",
      broadcast: "Broadcast",
      joinedDate: "Joined Date",
      lastLogin: "Last Login"
    },
    profile: {
        title: "My Profile",
        updateSuccess: "Profile updated successfully",
        update: "Update Profile"
    }
  }
};

// --- MOCK DATA ---
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'تعلم React من الصفر للاحتراف',
    description: 'كورس شامل يغطي أساسيات React و Hooks و Context API وحتى بناء مشاريع حقيقية.',
    price: 1500,
    discountPrice: 1200,
    instructor: 'أحمد علي',
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    rating: 4.8,
    studentsCount: 0, // Initial 0, will be updated dynamically
    category: 'برمجة',
    reviews: [
      { id: 'r1', userId: 'u2', userName: 'سارة أحمد', rating: 5, comment: 'كورس ممتاز وشرح وافي جداً!', date: '2024-02-15' },
      { id: 'r2', userId: 'u3', userName: 'محمد حسن', rating: 4, comment: 'جيد جداً لكن يحتاج المزيد من الأمثلة العملية.', date: '2024-02-10' }
    ],
    sections: [
      {
        id: 's1',
        title: 'مقدمة في React',
        lessons: [
          { id: 'l1', title: 'ما هو React؟', description: 'نظرة عامة على المكتبة', type: 'video', duration: '05:00', isFree: true, resources: [{id: 'r1', title: 'Introduction Video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1', type: 'video'}] },
          { id: 'l2', title: 'إعداد بيئة العمل', description: 'تنصيب Node.js و VS Code', type: 'video', duration: '10:00', resources: [] }
        ]
      },
      {
        id: 's2',
        title: 'Hooks الأساسية',
        lessons: [
          { id: 'l3', title: 'شرح useState', type: 'video', duration: '15:00', resources: [] },
          { id: 'l4', title: 'شرح useEffect', type: 'video', duration: '12:00', resources: [] },
          { id: 'l5', title: 'ملخص الـ Hooks', type: 'pdf', resources: [] }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'احتراف التصميم الجرافيكي',
    description: 'تعلم أساسيات التصميم باستخدام Photoshop و Illustrator وكيفية بناء هوية بصرية.',
    price: 900,
    instructor: 'سارة محمد',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    rating: 4.5,
    studentsCount: 0,
    category: 'تصميم',
    reviews: [],
    sections: []
  },
  {
    id: '3',
    title: 'أساسيات التسويق الرقمي',
    description: 'دليلك الشامل لدخول عالم التسويق الرقمي وإدارة الحملات الإعلانية.',
    price: 1200,
    instructor: 'محمود حسن',
    thumbnail: 'https://picsum.photos/seed/marketing/800/450',
    rating: 4.2,
    studentsCount: 0,
    category: 'تسويق',
    reviews: [],
    sections: []
  },
  {
    id: '4',
    title: 'مقدمة في بايثون',
    description: 'ابدأ رحلتك في البرمجة مع لغة بايثون السهلة والقوية.',
    price: 1100,
    discountPrice: 900,
    instructor: 'خالد عمر',
    thumbnail: 'https://picsum.photos/seed/python/800/450',
    rating: 4.7,
    studentsCount: 0,
    category: 'برمجة',
    reviews: [],
    sections: []
  },
  {
    id: '5',
    title: 'فن التصوير الفوتوغرافي',
    description: 'تعلم قواعد التكوين والإضاءة لالتقاط صور احترافية.',
    price: 1300,
    instructor: 'نور الهدى',
    thumbnail: 'https://picsum.photos/seed/photo/800/450',
    rating: 4.9,
    studentsCount: 0,
    category: 'تصميم',
    reviews: [],
    sections: []
  }
];

const ADMIN_EMAIL = 'youssefelbaz705@gmail.com';
const ADMIN_PASSWORD = 'Youssef99#';

const INITIAL_USERS: StoredUser[] = [
    { 
        id: 'admin-001',
        name: 'Youssef Elbaz', 
        email: ADMIN_EMAIL, 
        phone: '01000000000',
        password: ADMIN_PASSWORD, 
        role: UserRole.ADMIN,
        purchasedCourses: [],
        completedLessons: {},
        joinedDate: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
    },
    {
        id: 'student-002',
        name: 'Student Test',
        email: 'student@test.com',
        phone: '01112345678',
        password: '123',
        role: UserRole.STUDENT,
        purchasedCourses: ['1'],
        completedLessons: {},
        joinedDate: '2024-03-15T10:00:00.000Z',
        lastLogin: '2024-05-20T18:30:00.000Z'
    }
];

// Extended User Type for Storage (includes password)
interface StoredUser extends User {
    password: string;
}

interface StoreContextType {
  user: User | null;
  courses: Course[];
  cart: CartItem[];
  settings: SiteSettings;
  coupons: Coupon[];
  allUsers: StoredUser[]; // Exposed for Admin
  notifications: SystemNotification[];
  language: 'ar' | 'en';
  userMode: 'light' | 'dark'; // User preference
  t: typeof translations['ar'];
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleUserMode: () => void;
  login: (identifier: string, password?: string, rememberMe?: boolean) => 'success' | 'not_found' | 'wrong_password';
  register: (name: string, identifier: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<StoredUser>) => void; // Self update
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  updateSettings: (settings: SiteSettings) => void;
  addReview: (courseId: string, review: Omit<Review, 'id' | 'date'>) => void;
  enrollInCourses: (courseIds: string[]) => void;
  markLessonCompleted: (courseId: string, lessonId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, cartItems: CartItem[]) => { valid: boolean, discountAmount: number, message?: string };
  // Admin User Management
  adminUpdateUser: (userId: string, data: Partial<StoredUser>) => void;
  adminManageEnrollment: (userId: string, courseId: string, action: 'enroll' | 'unenroll') => void;
  deleteUser: (userId: string) => void;
  bulkDeleteUsers: (userIds: string[]) => void;
  loginAsUser: (userId: string) => void;
  sendNotification: (title: string, message: string, type: 'info' | 'alert' | 'success') => void;
  removeNotification: (id: string) => void;
  exportUsers: () => void; // Export function
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper for obfuscation
const secureStore = (key: string, value: any) => {
    try {
        localStorage.setItem(key, btoa(JSON.stringify(value)));
    } catch (e) {
        console.error("Storage Error", e);
    }
}

const secureRetrieve = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(atob(item)) : null;
    } catch (e) {
        console.error("Storage Retrieval Error", e);
        return null;
    }
}

export const StoreProvider = ({ children }: { children?: React.ReactNode }) => {
  // --- STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // --- EFFECT: Load Data from DB (Async) ---
  useEffect(() => {
    const loadData = async () => {
        try {
            const dbCourses = await dbGetAll(STORE_COURSES);
            const dbUsers = await dbGetAll(STORE_USERS);
            
            // Handle Courses
            if (dbCourses && dbCourses.length > 0) {
                setCourses(dbCourses);
            } else {
                setCourses(INITIAL_COURSES);
                // Save initials to DB
                INITIAL_COURSES.forEach(c => dbSaveItem(STORE_COURSES, c));
            }

            // Handle Users
            if (dbUsers && dbUsers.length > 0) {
                setRegisteredUsers(dbUsers);
            } else {
                setRegisteredUsers(INITIAL_USERS);
                // Save initials to DB
                INITIAL_USERS.forEach(u => dbSaveItem(STORE_USERS, u));
            }

        } catch (e) {
            console.error("Failed to load data from DB", e);
        } finally {
            setIsDataLoaded(true);
        }
    };
    loadData();
  }, []);

  // --- REAL-TIME STUDENT COUNT CALCULATION ---
  // Whenever registeredUsers changes (buy, register, etc.), recalculate counts
  useEffect(() => {
      if(isDataLoaded) {
          setCourses(prevCourses => prevCourses.map(course => {
              const realCount = registeredUsers.filter(u => u.purchasedCourses.includes(course.id)).length;
              return { ...course, studentsCount: realCount };
          }));
      }
  }, [registeredUsers, isDataLoaded]);

  // Sync Course changes to DB (excluding studentCount updates which are derived, but we save them anyway for consistency)
  useEffect(() => {
      if(isDataLoaded && courses.length > 0) {
          // We debounce or just save. Since this is local IDB, it's fast.
          courses.forEach(c => dbSaveItem(STORE_COURSES, c));
      }
  }, [courses, isDataLoaded]);


  const [cart, setCart] = useState<CartItem[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [userMode, setUserMode] = useState<'light' | 'dark'>('light');
  
  // Settings with Dynamic Payment Methods
  const [settings, setSettings] = useState<SiteSettings>({
      vodafoneWalletNumber: '01034170098',
      supportEmail: 'support@albaz.com',
      paymentMethods: [
          { id: '1', type: 'subscription', nameAr: 'الاشتراك في الدفع', nameEn: 'Subscription Payment', isEnabled: true, descriptionAr: 'تواصل معنا واتمام الدفع عبر واتساب' },
          { id: '2', type: 'visa', nameAr: 'بطاقة بنكية', nameEn: 'Credit / Debit Card', isEnabled: true },
          { id: '3', type: 'vodafone', nameAr: 'محفظة إلكترونية', nameEn: 'Mobile Wallet', isEnabled: true, descriptionAr: 'فودافون كاش، اتصالات، اورانج' },
          { id: '4', type: 'fawry', nameAr: 'فوري', nameEn: 'Fawry Pay', isEnabled: true, descriptionAr: 'الدفع في أقرب ماكينة فوري' }
      ],
      siteTheme: 'default',
      // UI Defaults
      brandName: 'Albaz',
      primaryColor: '#2563eb', // blue-600
      secondaryColor: '#f59e0b', // amber-500
      heroImageUrls: ['https://cdni.iconscout.com/illustration/premium/thumb/online-learning-4112674-3407969.png'], // Changed to array
      heroTitleAr: 'تعلم مهارات المستقبل',
      heroTitleEn: 'Learn Future Skills',
      heroSubtitleAr: 'في مكان واحد',
      heroSubtitleEn: 'In One Place',
      showStudentCount: true // Default visible
  });

  const [coupons, setCoupons] = useState<Coupon[]>([
      { id: 'c1', code: 'WELCOME10', discountPercent: 10, expiryDate: '2025-12-31' }
  ]);
  
  
  // Current logged in user (derived/synced state)
  const [user, setUser] = useState<User | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
      if(isDataLoaded) {
        const storedUser = secureRetrieve('albaz_user');
        if (storedUser) {
            // Verify user still exists in "database" (registeredUsers)
            const validUser = registeredUsers.find(u => u.id === storedUser.id);
            if (validUser) {
                setUser({
                    id: validUser.id,
                    name: validUser.name,
                    email: validUser.email,
                    phone: validUser.phone,
                    role: validUser.role,
                    purchasedCourses: validUser.purchasedCourses,
                    completedLessons: validUser.completedLessons,
                    joinedDate: validUser.joinedDate,
                    lastLogin: validUser.lastLogin
                });
            } else {
                localStorage.removeItem('albaz_user');
            }
        }
      }
  }, [isDataLoaded]); // Run once data is ready

  // Sync user state if the underlying registered user data changes (e.g. admin updates it)
  useEffect(() => {
    if (user) {
        const freshData = registeredUsers.find(u => u.id === user.id);
        if (freshData) {
            // Check for changes to avoid infinite loop
            const hasChanged = 
                freshData.name !== user.name ||
                freshData.email !== user.email ||
                freshData.phone !== user.phone ||
                JSON.stringify(freshData.purchasedCourses) !== JSON.stringify(user.purchasedCourses) || 
                JSON.stringify(freshData.completedLessons) !== JSON.stringify(user.completedLessons);
            
            if (hasChanged) {
                const updatedUser = {
                    id: freshData.id,
                    name: freshData.name,
                    email: freshData.email,
                    phone: freshData.phone,
                    role: freshData.role,
                    purchasedCourses: freshData.purchasedCourses,
                    completedLessons: freshData.completedLessons,
                    joinedDate: freshData.joinedDate,
                    lastLogin: freshData.lastLogin
                };
                setUser(updatedUser);
                // Update local storage if present
                if (localStorage.getItem('albaz_user')) {
                    secureStore('albaz_user', updatedUser);
                }
            }
        }
    }
  }, [registeredUsers]); 

  const login = (identifier: string, password?: string, rememberMe: boolean = false): 'success' | 'not_found' | 'wrong_password' => {
    // Check by email OR phone
    const foundUser = registeredUsers.find(u => u.email === identifier || u.phone === identifier);
    
    if (!foundUser) {
        return 'not_found';
    }
    
    // If password provided, check it. If not provided (Admin bypass loginAs), skip check.
    if (password && foundUser.password !== password) {
        return 'wrong_password';
    }

    // Update Last Login
    const now = new Date().toISOString();
    const updatedUser = { ...foundUser, lastLogin: now };
    
    setRegisteredUsers(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));
    dbSaveItem(STORE_USERS, updatedUser);

    const userData = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        purchasedCourses: updatedUser.purchasedCourses,
        completedLessons: updatedUser.completedLessons,
        joinedDate: updatedUser.joinedDate,
        lastLogin: now
    };

    setUser(userData);

    if (rememberMe) {
        secureStore('albaz_user', userData);
    }

    return 'success';
  };

  const register = (name: string, identifier: string, password: string): boolean => {
    // Check if email OR phone already exists
    const exists = registeredUsers.find(u => u.email === identifier || u.phone === identifier);
    if (exists) {
        return false;
    }

    const isEmail = identifier.includes('@');
    const now = new Date().toISOString();

    const newUser: StoredUser = { 
        id: 'u-' + Math.random().toString(36).substr(2, 5),
        name, 
        // We use email field as the primary identifier (username), even if it's a phone number, to satisfy required string type.
        // We also populate phone if it's not an email.
        email: identifier, 
        phone: isEmail ? undefined : identifier,
        password, 
        role: UserRole.STUDENT,
        purchasedCourses: [],
        completedLessons: {},
        joinedDate: now,
        lastLogin: now
    };

    setRegisteredUsers([...registeredUsers, newUser]);
    dbSaveItem(STORE_USERS, newUser);
    
    // Auto login after register
    setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        purchasedCourses: [],
        completedLessons: {},
        joinedDate: now,
        lastLogin: now
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('albaz_user');
  };

  const updateUser = (data: Partial<StoredUser>) => {
      if (!user) return;
      
      const passwordChanged = data.password && data.password !== registeredUsers.find(u => u.id === user.id)?.password;
      
      const updatedUserFull = { ...registeredUsers.find(u => u.id === user.id)!, ...data };

      setRegisteredUsers(prev => prev.map(u => {
          if (u.id === user.id) {
              return updatedUserFull;
          }
          return u;
      }));
      dbSaveItem(STORE_USERS, updatedUserFull);
      
      if (passwordChanged) {
          sendMockEmail(user.email, "Security Alert: Password Changed", "Your account password has been updated successfully.");
      }
  };

  const addToCart = (course: Course) => {
    if (!cart.find(item => item.courseId === course.id)) {
      setCart([...cart, { 
        courseId: course.id, 
        title: course.title, 
        price: course.discountPrice || course.price, 
        thumbnail: course.thumbnail 
      }]);
    }
  };

  const removeFromCart = (courseId: string) => {
    setCart(cart.filter(item => item.courseId !== courseId));
  };

  const clearCart = () => setCart([]);

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
    dbSaveItem(STORE_COURSES, course);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    dbSaveItem(STORE_COURSES, updatedCourse);
  };

  const deleteCourse = (id: string) => {
      setCourses(prev => prev.filter(c => c.id !== id));
      dbDeleteItem(STORE_COURSES, id);
  };

  const updateSettings = (newSettings: SiteSettings) => {
      setSettings(newSettings);
  };

  const addCoupon = (coupon: Coupon) => {
      setCoupons([...coupons, coupon]);
  }

  const deleteCoupon = (id: string) => {
      setCoupons(coupons.filter(c => c.id !== id));
  }

  const validateCoupon = (code: string, cartItems: CartItem[]) => {
      const coupon = coupons.find(c => c.code === code);
      if (!coupon) return { valid: false, discountAmount: 0 };

      if (new Date(coupon.expiryDate) < new Date()) {
          return { valid: false, discountAmount: 0, message: 'Expired' };
      }

      let totalDiscount = 0;
      cartItems.forEach(item => {
          if (!coupon.specificCourseId || coupon.specificCourseId === item.courseId) {
              totalDiscount += (item.price * (coupon.discountPercent / 100));
          }
      });

      if (totalDiscount === 0) {
           return { valid: false, discountAmount: 0, message: 'Not applicable' };
      }

      return { valid: true, discountAmount: totalDiscount };
  };

  const addReview = (courseId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        ...reviewData
    };

    let updatedCourse: Course | null = null;

    setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
            const updatedReviews = [...c.reviews, newReview];
            const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
            const newRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
            updatedCourse = { ...c, reviews: updatedReviews, rating: newRating };
            return updatedCourse;
        }
        return c;
    }));

    if(updatedCourse) dbSaveItem(STORE_COURSES, updatedCourse);
    
    // Send email to admin
    sendMockEmail(settings.supportEmail, "New Review Submitted", `User ${reviewData.userName} reviewed course ${courseId} with ${reviewData.rating} stars.`);
  };

  const enrollInCourses = (courseIds: string[]) => {
    if (user) {
      const currentUser = registeredUsers.find(u => u.id === user.id);
      if(currentUser) {
          const currentCourses = new Set(currentUser.purchasedCourses);
          courseIds.forEach(id => currentCourses.add(id));
          const updatedUser = { ...currentUser, purchasedCourses: Array.from(currentCourses) };
          
          setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
          dbSaveItem(STORE_USERS, updatedUser);
          
          // Send email to student
          sendMockEmail(user.email, "Enrollment Successful", `You have successfully enrolled in ${courseIds.length} courses.`);
      }
    }
  };

  const markLessonCompleted = (courseId: string, lessonId: string) => {
    if (user) {
        const currentUser = registeredUsers.find(u => u.id === user.id);
        if(currentUser) {
            const currentCompleted = currentUser.completedLessons[courseId] || [];
            if (!currentCompleted.includes(lessonId)) {
                const updatedUser = {
                    ...currentUser,
                    completedLessons: {
                        ...currentUser.completedLessons,
                        [courseId]: [...currentCompleted, lessonId]
                    }
                };
                setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                dbSaveItem(STORE_USERS, updatedUser);
            }
        }
    }
  };

  // --- ADMIN FUNCTIONS ---

  const adminUpdateUser = (userId: string, data: Partial<StoredUser>) => {
      const target = registeredUsers.find(u => u.id === userId);
      if(target) {
          const updated = { ...target, ...data };
          setRegisteredUsers(prev => prev.map(u => u.id === userId ? updated : u));
          dbSaveItem(STORE_USERS, updated);
      }
  };

  const adminManageEnrollment = (userId: string, courseId: string, action: 'enroll' | 'unenroll') => {
      const target = registeredUsers.find(u => u.id === userId);
      if(target) {
          const current = new Set(target.purchasedCourses);
          if (action === 'enroll') current.add(courseId);
          else current.delete(courseId);
          
          const updated = { ...target, purchasedCourses: Array.from(current) };
          setRegisteredUsers(prev => prev.map(u => u.id === userId ? updated : u));
          dbSaveItem(STORE_USERS, updated);
      }
  };

  const deleteUser = (userId: string) => {
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
      dbDeleteItem(STORE_USERS, userId);
      if (user?.id === userId) logout(); // If deleting self
  };

  const bulkDeleteUsers = (userIds: string[]) => {
      setRegisteredUsers(prev => prev.filter(u => !userIds.includes(u.id)));
      userIds.forEach(id => dbDeleteItem(STORE_USERS, id));
      if(user && userIds.includes(user.id)) logout();
  }

  const loginAsUser = (userId: string) => {
      const targetUser = registeredUsers.find(u => u.id === userId);
      if (targetUser) {
          setUser({
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            phone: targetUser.phone,
            role: targetUser.role,
            purchasedCourses: targetUser.purchasedCourses,
            completedLessons: targetUser.completedLessons,
            joinedDate: targetUser.joinedDate,
            lastLogin: targetUser.lastLogin
          });
      }
  };

  const sendNotification = (title: string, message: string, type: 'info' | 'alert' | 'success') => {
      const newNotification: SystemNotification = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          message,
          type,
          date: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleUserMode = () => {
      setUserMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- EXPORT FUNCTIONALITY ---
  const exportUsers = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "ID,Name,Email,Phone,Role,Joined Date,Enrolled Courses Count\n"
          + registeredUsers.map(u => `${u.id},"${u.name}",${u.email},"${u.phone || ''}",${u.role},${u.joinedDate},${u.purchasedCourses.length}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "albaz_users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <StoreContext.Provider value={{ 
      user, courses, cart, settings, coupons, allUsers: registeredUsers, notifications,
      language, setLanguage, t: translations[language],
      userMode, toggleUserMode,
      login, register, logout, updateUser, addToCart, removeFromCart, clearCart, addCourse, updateCourse, deleteCourse, updateSettings, addReview, enrollInCourses, markLessonCompleted, addCoupon, deleteCoupon, validateCoupon,
      adminUpdateUser, adminManageEnrollment, deleteUser, bulkDeleteUsers, loginAsUser, sendNotification, removeNotification, exportUsers
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
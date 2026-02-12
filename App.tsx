import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { ProfilePage } from './pages/ProfilePage';

// Simple footer component inside App to access context
const Footer = () => {
    const { t, language, settings } = useStore();
    return (
      <footer className="bg-dark text-gray-400 py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4">
            <p className="mb-4">{language === 'ar' ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${settings.brandName}` : `All rights reserved © ${new Date().getFullYear()} ${settings.brandName}`}</p>
            <div className="flex justify-center gap-4 text-sm">
                <a href="#" className="hover:text-white">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
                <a href="#" className="hover:text-white">{language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</a>
                <a href="#" className="hover:text-white">{language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</a>
            </div>
        </div>
      </footer>
    );
}

const MainLayout = ({children}: {children?: React.ReactNode}) => {
    const { language, settings, userMode } = useStore();
    
    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    // Dynamic Theme Injection
    useEffect(() => {
        const root = document.documentElement;
        const theme = settings.siteTheme;
        const isDark = userMode === 'dark';

        // Define Palettes
        const palettes = {
            default: {
                primary: '#2563eb', // blue-600
                secondary: '#f59e0b', // amber-500
            },
            ramadan: {
                primary: '#059669', // emerald-600
                secondary: '#d97706', // amber-600 (Gold)
            },
            'eid-fitr': {
                primary: '#9333ea', // purple-600
                secondary: '#ec4899', // pink-500
            },
            'eid-adha': {
                primary: '#0e7490', // cyan-700
                secondary: '#f97316', // orange-500
            }
        };

        // Priority: Custom settings in 'default' mode or if customized, otherwise predefined theme
        let primary = settings.primaryColor;
        let secondary = settings.secondaryColor;

        if (theme !== 'default' && theme !== 'custom' && palettes[theme]) {
            primary = palettes[theme].primary;
            secondary = palettes[theme].secondary;
        }

        // Apply Colors
        root.style.setProperty('--color-primary', primary);
        root.style.setProperty('--color-secondary', secondary);

        // Apply Backgrounds/Text based on User Mode (Light/Dark)
        if (isDark) {
            root.style.setProperty('--bg-page', '#0f172a'); // slate-900
            root.style.setProperty('--bg-card', '#1e293b'); // slate-800
            root.style.setProperty('--text-base', '#f1f5f9'); // slate-100
            root.style.setProperty('--text-muted', '#94a3b8'); // slate-400
            root.classList.add('dark');
        } else {
            root.style.setProperty('--bg-page', '#f8fafc'); // slate-50
            root.style.setProperty('--bg-card', '#ffffff'); // white
            root.style.setProperty('--text-base', '#1e293b'); // slate-800
            root.style.setProperty('--text-muted', '#64748b'); // slate-500
            root.classList.remove('dark');
        }

    }, [settings.siteTheme, settings.primaryColor, settings.secondaryColor, userMode]);

    return (
        <div className="flex flex-col min-h-screen font-sans bg-page text-base transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/course/:id" element={<CourseDetailsPage />} />
              <Route path="/cart" element={<Navigate to="/checkout" replace />} /> {/* Shortcut for demo */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </MainLayout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
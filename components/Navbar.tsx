import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, LayoutDashboard, Globe, Moon, Sun, Bell, X, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, cart, logout, t, language, setLanguage, userMode, toggleUserMode, notifications } = useStore();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl ml-2">
              {language === 'ar' ? 'ب' : 'A'}
            </div>
            <span className="text-2xl font-bold text-primary">{t.brand}</span>
          </div>

          {/* Search Bar - Hidden on small mobile */}
          <div className="hidden md:flex flex-1 mx-8 max-w-lg relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full border border-gray-300 rounded-full py-2 pr-10 pl-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white text-base"
            />
            <Search className={`w-5 h-5 text-muted absolute top-2.5 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            
             {/* Language Switcher */}
             <button 
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 text-muted hover:text-primary transition text-sm font-medium"
             >
                <Globe className="w-4 h-4" />
                <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
             </button>

             {/* Theme Toggle (Light/Dark) */}
             <button 
                onClick={toggleUserMode}
                className="flex items-center gap-1 text-muted hover:text-primary transition p-2 rounded-full hover:bg-page"
             >
                {userMode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>

             {/* Notification Bell (Only if logged in) */}
             {user && (
                 <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-muted hover:text-primary transition rounded-full hover:bg-page"
                    >
                        <Bell className="w-6 h-6" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden rtl:right-auto rtl:left-0">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-sm">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</h3>
                                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${n.type === 'alert' ? 'bg-red-50/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-gray-800">{n.title}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(n.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        {language === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                 </div>
             )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-muted hover:text-primary transition">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === UserRole.ADMIN ? (
                  <Link to="/admin" className="hidden sm:flex items-center gap-1 text-sm font-medium text-base hover:text-primary">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t.dashboard}</span>
                  </Link>
                ) : (
                  <Link to="/my-courses" className="hidden sm:block text-sm font-medium text-base hover:text-primary">
                    {t.myCourses}
                  </Link>
                )}
                
                <Link to="/profile" className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold hover:bg-slate-300 transition-colors" title={t.profile?.title}>
                  {user.name.charAt(0).toUpperCase()}
                </Link>
                
                <button onClick={logout} className="text-sm text-red-500 hover:underline mr-2">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm">
                <User className="w-4 h-4" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-3">
             <Link to="/cart" className="relative p-2 text-muted hover:text-primary transition">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cart.length}
                    </span>
                )}
             </Link>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-muted hover:text-primary p-1">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-fade-in absolute w-full z-50">
              <div className="p-4 space-y-3">
                  {/* Search Mobile */}
                  <div className="relative mb-4">
                        <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        className="w-full border border-gray-300 rounded-full py-2 pr-10 pl-4 focus:outline-none focus:border-primary text-sm bg-white"
                        />
                        <Search className={`w-5 h-5 text-muted absolute top-2.5 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                  </div>

                  {user ? (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        {user.role === UserRole.ADMIN && (
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-gray-700">
                                <LayoutDashboard className="w-5 h-5" />
                                <span>{t.dashboard}</span>
                            </Link>
                        )}
                        <Link to="/my-courses" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-gray-700">
                            <BookOpen className="w-5 h-5" />
                            <span>{t.myCourses}</span>
                        </Link>
                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-gray-700">
                            <User className="w-5 h-5" />
                            <span>{t.profile?.title}</span>
                        </Link>
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-lg text-red-500 w-full text-left rtl:text-right">
                            <LogOut className="w-5 h-5" />
                            <span>{t.logout}</span>
                        </button>
                      </>
                  ) : (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 bg-primary text-white p-3 rounded-lg justify-center font-bold">
                          <User className="w-5 h-5" />
                          <span>{t.login}</span>
                      </Link>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1 text-sm font-medium text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                        </button>
                        <button onClick={toggleUserMode} className="flex items-center gap-1 text-sm font-medium text-gray-600">
                            {userMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            <span>{userMode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                        </button>
                  </div>
              </div>
          </div>
      )}
    </nav>
  );
};
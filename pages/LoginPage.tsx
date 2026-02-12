import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { AlertCircle, User, LogOut, ArrowRight, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, t, language, user, logout } = useStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [name, setName] = useState('');
  // We use identifier to hold either email or phone
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
        if (!name || !identifier || !password) {
            setError(t.loginPage.errorEmpty);
            return;
        }
        const success = register(name, identifier, password);
        if (success) {
            navigate('/');
        } else {
            setError(t.loginPage.errorExists);
        }
    } else {
        if (!identifier || !password) {
            setError(t.loginPage.errorEmpty);
            return;
        }
        const result = login(identifier, password, rememberMe);
        if (result === 'success') {
            if (identifier === 'youssefelbaz705@gmail.com') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else if (result === 'not_found') {
            setError(t.loginPage.errorNotFound);
        } else if (result === 'wrong_password') {
            setError(t.loginPage.errorWrongPass);
        }
    }
  };

  if (user) {
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      <User className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">{t.loginPage.loggedIn}</h2>
                  <p className="text-gray-600 mb-8 font-bold text-lg">{user.name}</p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => navigate('/profile')}
                          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                          {t.loginPage.goToProfile}
                          {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                      <button 
                          onClick={() => { logout(); navigate('/'); }}
                          className="w-full bg-gray-100 text-red-500 py-3 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center gap-2"
                      >
                          <LogOut className="w-4 h-4" />
                          {t.loginPage.logout}
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-primary mb-8">
                {isRegistering ? t.loginPage.registerTitle : t.loginPage.title}
            </h2>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-800 text-sm mb-1">
                            {language === 'ar' ? 'تنبيه' : 'Alert'}
                        </h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {isRegistering && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.name}</label>
                        <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition" 
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.email}</label>
                    <input 
                        type="text" 
                        required 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition" 
                        placeholder={isRegistering ? "email or phone" : "email or phone"}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.password}</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition" 
                        placeholder="********"
                    />
                </div>

                {!isRegistering && (
                    <div className="flex items-center">
                        <input 
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 mx-2">
                            {t.loginPage.rememberMe}
                        </label>
                    </div>
                )}
                
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                    {isRegistering ? t.loginPage.registerSubmit : t.loginPage.submit}
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
                {isRegistering ? t.loginPage.haveAccount : t.loginPage.noAccount} {' '}
                <span 
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="text-secondary font-bold cursor-pointer hover:underline"
                >
                    {isRegistering ? t.loginPage.login : t.loginPage.register}
                </span>
            </div>
        </div>
    </div>
  );
};
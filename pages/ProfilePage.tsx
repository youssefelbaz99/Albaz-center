import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, ArrowRight, ArrowLeft } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, t, language, allUsers } = useStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
        navigate('/login');
    } else {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone || '');
        // Find stored password for this user
        const stored = allUsers.find(u => u.id === user.id);
        if(stored) setPassword(stored.password);
    }
  }, [user, navigate, allUsers]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateUser({
          name,
          email,
          phone,
          password
      });
      setSuccess(t.profile.updateSuccess);
      setTimeout(() => setSuccess(''), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                {language === 'ar' ? <ArrowRight className="w-5 h-5"/> : <ArrowLeft className="w-5 h-5"/>}
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{t.profile.title}</h1>
        </div>

        {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-sm font-bold text-center">
                {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.name}</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-gray-800"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.email}</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-gray-800"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.phone}</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-gray-800"
                    />
                    <Phone className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.password}</label>
                <div className="relative">
                    <input 
                        type="text" // Show as text for easy editing as per standard simple profile edit
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-gray-800"
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                </div>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {t.profile.update}
            </button>
        </form>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineSave } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userAPI } from '../services/api';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    preferredLanguage: user?.preferredLanguage || language,
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(profile);
      setLanguage(profile.preferredLanguage);
      await checkAuth();
      toast.success(t('success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Минимум 8 символов');
      return;
    }
    setPasswordLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title">{t('profile')}</h1>

      {/* Profile Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('firstName')}</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="input pl-12" />
              </div>
            </div>
            <div>
              <label className="label">{t('lastName')}</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="input pl-12" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">{t('email')}</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="input pl-12" />
            </div>
          </div>
          <div>
            <label className="label">{t('language')}</label>
            <select value={profile.preferredLanguage} onChange={(e) => setProfile({...profile, preferredLanguage: e.target.value})} className="input">
              {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSave className="w-5 h-5" />}
            <span>{t('save')}</span>
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="text-lg font-bold text-white mb-4">Изменить пароль</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Текущий пароль</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="input pl-12" />
            </div>
          </div>
          <div>
            <label className="label">Новый пароль</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="input pl-12" />
            </div>
          </div>
          <div>
            <label className="label">{t('confirmPassword')}</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="input pl-12" />
            </div>
          </div>
          <button type="submit" disabled={passwordLoading} className="btn-primary flex items-center space-x-2">
            {passwordLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSave className="w-5 h-5" />}
            <span>Изменить пароль</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

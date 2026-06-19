import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ ...formData, preferredLanguage: language });
      toast.success(t('success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">Q</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{t('signUp')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('firstName')}</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input pl-12" required />
                </div>
              </div>
              <div>
                <label className="label">{t('lastName')}</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input pl-12" required />
                </div>
              </div>
            </div>

            <div>
              <label className="label">{t('email')}</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input pl-12" placeholder="example@email.com" required />
              </div>
            </div>

            <div>
              <label className="label">{t('password')}</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input pl-12 pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">{t('confirmPassword')}</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input pl-12" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {t('loading')}
                </div>
              ) : (t('signUp'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('hasAccount')}{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">{t('signIn')}</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

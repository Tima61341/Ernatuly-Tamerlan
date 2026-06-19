import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMenu, 
  HiOutlineX, 
  HiOutlinePlay,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlineCog
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = user ? [
    { path: '/dashboard', label: t('dashboard') },
    { path: '/quizzes', label: t('myQuizzes') },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-dark-200/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">
              Quiz<span className="text-primary-400">Master</span>
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          {user && (
            <div className="hidden md:flex items-center space-x-1 bg-dark-100/50 rounded-full px-1.5 py-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/quizzes/new"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive('/quizzes/new')
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                + {t('createQuiz')}
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive('/admin')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('admin')}
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            
            {/* Join Game Button */}
            <Link
              to="/join"
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-game-green to-emerald-600 hover:from-emerald-500 hover:to-game-green text-white rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-game-green/25"
            >
              <HiOutlinePlay className="w-4 h-4" />
              <span className="hidden sm:inline">{t('joinGame')}</span>
            </Link>

            {/* Language Selector - Compact */}
            <div className="flex items-center bg-dark-100/50 rounded-full p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    language === lang.code
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                  title={lang.name}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            {/* User Menu / Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden md:flex items-center space-x-2 pl-1 pr-3 py-1 bg-dark-100/50 hover:bg-dark-100 rounded-full transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="text-sm text-gray-300 hidden lg:inline max-w-24 truncate">{user.firstName}</span>
                  <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-100 rounded-2xl border border-white/10 shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                        >
                          <HiOutlineUser className="w-4 h-4" />
                          <span>{t('profile')}</span>
                        </Link>
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                          >
                            <HiOutlineCog className="w-4 h-4" />
                            <span>{t('admin')}</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full"
                        >
                          <HiOutlineLogout className="w-4 h-4" />
                          <span>{t('logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-full text-sm font-semibold transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              {isOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {user && (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                          isActive(link.path)
                            ? 'bg-white/10 text-white'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/quizzes/new"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm font-medium text-primary-400 hover:bg-primary-500/10"
                    >
                      + {t('createQuiz')}
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5"
                      >
                        {t('admin')}
                      </Link>
                    )}
                  </>
                )}

                <div className="pt-3 mt-3 border-t border-white/5">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.firstName}</p>
                          <p className="text-xs text-gray-500">{t('profile')}</p>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl w-full mt-1"
                      >
                        <HiOutlineLogout className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex space-x-2 px-4">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 text-center text-sm text-gray-300 hover:bg-white/5 rounded-xl"
                      >
                        {t('login')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 text-center text-sm bg-primary-500 text-white rounded-xl font-medium"
                      >
                        {t('register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

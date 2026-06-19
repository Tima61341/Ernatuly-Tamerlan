import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-300 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">Q</span>
            </div>
            <span className="font-display font-bold text-lg text-white">
              Quiz<span className="text-primary-400">Master</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">
              {t('home')}
            </Link>
            <Link to="/join" className="hover:text-white transition-colors">
              {t('joinGame')}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {year} QuizMaster. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

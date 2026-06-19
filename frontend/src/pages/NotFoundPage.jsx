import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-9xl font-display font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-4">Страница не найдена</h1>
        <p className="text-gray-400 mb-8">Запрашиваемая страница не существует или была удалена.</p>
        <Link to="/" className="btn-primary inline-flex items-center space-x-2">
          <HiOutlineHome className="w-5 h-5" />
          <span>{t('backToHome')}</span>
        </Link>
      </motion.div>
    </div>
  );
}

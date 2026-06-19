import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineLightningBolt, 
  HiOutlineSparkles, 
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlinePlay,
  HiOutlinePlusCircle
} from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="card-hover group"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      icon: HiOutlinePlusCircle,
      title: t('feature1Title'),
      description: t('feature1Desc'),
      color: 'bg-gradient-to-br from-game-blue to-blue-600',
    },
    {
      icon: HiOutlineSparkles,
      title: t('feature2Title'),
      description: t('feature2Desc'),
      color: 'bg-gradient-to-br from-game-purple to-purple-600',
    },
    {
      icon: HiOutlineUsers,
      title: t('feature3Title'),
      description: t('feature3Desc'),
      color: 'bg-gradient-to-br from-game-green to-emerald-600',
    },
    {
      icon: HiOutlineChartBar,
      title: t('feature4Title'),
      description: t('feature4Desc'),
      color: 'bg-gradient-to-br from-game-yellow to-amber-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/10 to-pink-500/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6">
                <span className="gradient-text">{t('heroTitle')}</span>
                <br />
                <span className="text-white">{t('heroSubtitle')}</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/join"
                  className="group flex items-center space-x-2 px-8 py-4 bg-game-green hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-glow-green"
                >
                  <HiOutlinePlay className="w-6 h-6" />
                  <span>{t('playNow')}</span>
                </Link>
                
                <Link
                  to={user ? "/quizzes/new" : "/register"}
                  className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-400 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-glow"
                >
                  <HiOutlineLightningBolt className="w-6 h-6" />
                  <span>{t('getStarted')}</span>
                </Link>
              </div>
            </motion.div>

            {/* Demo preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-4xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-dark-100 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Mock game interface */}
                  <div className="p-6 bg-dark-200 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-game-red" />
                        <div className="w-3 h-3 rounded-full bg-game-yellow" />
                        <div className="w-3 h-3 rounded-full bg-game-green" />
                      </div>
                      <span className="text-gray-400 font-mono text-sm">quizmaster.app</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-semibold mb-4">
                        {t('question')} 3 {t('of')} 10
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Какая столица Казахстана?
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-game-red rounded-xl text-white font-bold text-center hover:scale-105 transition-transform cursor-pointer">
                        Алматы
                      </div>
                      <div className="p-4 bg-game-blue rounded-xl text-white font-bold text-center hover:scale-105 transition-transform cursor-pointer">
                        Астана
                      </div>
                      <div className="p-4 bg-game-yellow rounded-xl text-white font-bold text-center hover:scale-105 transition-transform cursor-pointer">
                        Шымкент
                      </div>
                      <div className="p-4 bg-game-green rounded-xl text-white font-bold text-center hover:scale-105 transition-transform cursor-pointer">
                        Караганда
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t('features')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                {t('getStarted')}!
              </h2>
              <p className="text-white/80 text-lg mb-8">
                {t('heroDescription')}
              </p>
              <Link
                to={user ? "/quizzes/new" : "/register"}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105"
              >
                <HiOutlinePlusCircle className="w-6 h-6" />
                <span>{t('createQuiz')}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  HiOutlineCollection, 
  HiOutlinePlay, 
  HiOutlineUsers,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { statsAPI, quizAPI, gameAPI } from '../services/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
  >
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, quizzesRes, gamesRes] = await Promise.all([
        statsAPI.getCreatorDashboard(),
        quizAPI.getMy(),
        gameAPI.getHosted(),
      ]);
      setStats(statsRes.data.data);
      setRecentQuizzes(quizzesRes.data.data?.slice(0, 5) || []);
      setRecentGames(gamesRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (quizId) => {
    try {
      const response = await gameAPI.create({ quizId });
      const { gameCode } = response.data.data;
      toast.success(`${t('gameCreated')} ${gameCode}`);
      navigate(`/host/${gameCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {t('dashboard')}
          </h1>
          <p className="text-gray-400">
            {t('welcome')}, {user?.firstName}! 👋
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Link to="/quizzes/new" className="btn-primary flex items-center space-x-2">
            <HiOutlinePlusCircle className="w-5 h-5" />
            <span>{t('createQuiz')}</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={HiOutlineCollection}
          label={t('totalQuizzes')}
          value={stats?.totalQuizzes || 0}
          color="bg-gradient-to-br from-game-blue to-blue-600"
        />
        <StatCard
          icon={HiOutlinePlay}
          label={t('totalGames')}
          value={stats?.totalGamesHosted || 0}
          color="bg-gradient-to-br from-game-green to-emerald-600"
        />
        <StatCard
          icon={HiOutlineUsers}
          label={t('totalPlayers')}
          value={stats?.totalPlayersJoined || 0}
          color="bg-gradient-to-br from-game-purple to-purple-600"
        />
        <StatCard
          icon={HiOutlineChartBar}
          label={t('questionsCreated')}
          value={stats?.totalQuestionsCreated || 0}
          color="bg-gradient-to-br from-game-yellow to-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">{t('recentQuizzes')}</h2>
            <Link to="/quizzes" className="text-primary-400 hover:text-primary-300 text-sm">
              {t('viewAll')} →
            </Link>
          </div>

          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 bg-dark-200 rounded-xl hover:bg-dark-200/70 transition-colors group"
                >
                  <Link to={`/quizzes/${quiz.id}`} className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{quiz.title?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                        {quiz.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {quiz.questionCount} {t('questionsCount')} • {quiz.timesPlayed} {t('gamesCount')}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${quiz.isPublic ? 'badge-success' : 'badge-warning'}`}>
                      {quiz.isPublic ? t('public') : t('private')}
                    </span>
                    <button
                      onClick={() => handleStartGame(quiz.id)}
                      className="p-2 bg-game-green/20 hover:bg-game-green/30 text-game-green rounded-lg transition-colors"
                      title={t('startGame')}
                    >
                      <HiOutlinePlay className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiOutlineCollection className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">{t('noQuizzes')}</p>
              <Link to="/quizzes/new" className="btn-primary inline-flex items-center space-x-2">
                <HiOutlinePlusCircle className="w-5 h-5" />
                <span>{t('createFirst')}</span>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">{t('recentGames')}</h2>
          </div>

          {recentGames.length > 0 ? (
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-dark-200 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      game.status === 'FINISHED' ? 'bg-gray-600' :
                      game.status === 'IN_PROGRESS' ? 'bg-game-green' : 'bg-game-yellow'
                    }`}>
                      <HiOutlinePlay className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{game.quiz?.title}</p>
                      <p className="text-sm text-gray-500">
                        Код: {game.gameCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      game.status === 'FINISHED' ? 'badge-secondary' :
                      game.status === 'IN_PROGRESS' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {game.status === 'FINISHED' ? t('finished') :
                       game.status === 'IN_PROGRESS' ? t('playing') : t('waiting')}
                    </span>
                    {game.status !== 'FINISHED' && (
                      <Link
                        to={`/host/${game.gameCode}`}
                        className="block text-sm text-primary-400 hover:text-primary-300 mt-1"
                      >
                        {t('viewAll')} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiOutlineClock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{t('noRecentGames')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

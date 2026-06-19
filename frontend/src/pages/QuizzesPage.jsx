import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlusCircle, HiOutlinePlay, HiOutlineTrash, HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { quizAPI, gameAPI } from '../services/api';

export default function QuizzesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getMy();
      setQuizzes(response.data.data || []);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (quizId) => {
    try {
      const response = await gameAPI.create({ quizId });
      const { gameCode } = response.data.data;
      navigate(`/host/${gameCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить викторину?')) return;
    try {
      await quizAPI.delete(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="section-title mb-4 md:mb-0">{t('myQuizzes')}</h1>
        <Link to="/quizzes/new" className="btn-primary inline-flex items-center space-x-2">
          <HiOutlinePlusCircle className="w-5 h-5" />
          <span>{t('createQuiz')}</span>
        </Link>
      </div>

      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-12"
          placeholder={t('search') + '...'}
        />
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{quiz.title?.[0]}</span>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/quizzes/${quiz.id}/edit`}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <Link to={`/quizzes/${quiz.id}`}>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {quiz.title}
                </h3>
              </Link>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {quiz.description || t('noDescription')}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{quiz.questionCount} {t('questionsCount')}</span>
                <span>{quiz.timesPlayed} {t('gamesCount')}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`badge ${quiz.isPublic ? 'badge-success' : 'badge-warning'}`}>
                  {quiz.isPublic ? t('public') : t('private')}
                </span>
                <span className={`badge ${
                  quiz.difficulty === 'EASY' ? 'badge-success' :
                  quiz.difficulty === 'HARD' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {quiz.difficulty === 'EASY' ? t('easy') : quiz.difficulty === 'HARD' ? t('hard') : t('medium')}
                </span>
              </div>

              <button
                onClick={() => handleStartGame(quiz.id)}
                className="btn-success w-full mt-4 flex items-center justify-center space-x-2"
              >
                <HiOutlinePlay className="w-5 h-5" />
                <span>{t('startGame')}</span>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">{search ? t('noResults') : t('noQuizzes')}</p>
          {!search && (
            <Link to="/quizzes/new" className="btn-primary inline-flex items-center space-x-2">
              <HiOutlinePlusCircle className="w-5 h-5" />
              <span>{t('createFirst')}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

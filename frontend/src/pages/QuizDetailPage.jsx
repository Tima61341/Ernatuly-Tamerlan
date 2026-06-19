import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlinePencil, HiOutlineTrash, HiOutlineClock, HiOutlineCollection } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { quizAPI, gameAPI } from '../services/api';

export default function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuiz(); }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getById(id);
      setQuiz(response.data.data);
    } catch (error) {
      toast.error(t('error'));
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await gameAPI.create({ quizId: quiz.id });
      navigate(`/host/${response.data.data.gameCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить викторину?')) return;
    try {
      await quizAPI.delete(id);
      toast.success(t('success'));
      navigate('/quizzes');
    } catch (error) {
      toast.error(t('error'));
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {quiz.topic && <span className="badge badge-primary">{quiz.topic.icon} {quiz.topic.name}</span>}
            <span className={`badge ${quiz.isPublic ? 'badge-success' : 'badge-warning'}`}>
              {quiz.isPublic ? t('public') : t('private')}
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-400">{quiz.description}</p>}
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Link to={`/quizzes/${id}/edit`} className="btn-secondary flex items-center space-x-2">
            <HiOutlinePencil className="w-5 h-5" /><span>{t('edit')}</span>
          </Link>
          <button onClick={handleDelete} className="btn-danger flex items-center space-x-2">
            <HiOutlineTrash className="w-5 h-5" /><span>{t('delete')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <HiOutlineCollection className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{quiz.questions?.length || 0}</p>
          <p className="text-gray-400 text-sm">{t('questions')}</p>
        </div>
        <div className="card text-center">
          <HiOutlineClock className="w-8 h-8 text-game-yellow mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{quiz.defaultTimerSeconds}{t('seconds')}</p>
          <p className="text-gray-400 text-sm">{t('timer')}</p>
        </div>
        <div className="card text-center">
          <HiOutlinePlay className="w-8 h-8 text-game-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{quiz.timesPlayed}</p>
          <p className="text-gray-400 text-sm">{t('totalGames')}</p>
        </div>
        <div className="card text-center">
          <div className="flex justify-center mb-1">
            {quiz.difficulty === 'EASY' ? (
              <svg className="w-7 h-7 text-game-green" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            ) : quiz.difficulty === 'HARD' ? (
              <svg className="w-7 h-7 text-game-red" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L22 20H2L12 3Z"/></svg>
            ) : (
              <svg className="w-7 h-7 text-game-yellow" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 12L12 22L2 12L12 2Z"/></svg>
            )}
          </div>
          <p className="text-gray-400 text-sm">{t(quiz.difficulty?.toLowerCase())}</p>
        </div>
      </div>

      <button onClick={handleStartGame} className="btn-success w-full text-lg mb-8 flex items-center justify-center space-x-2">
        <HiOutlinePlay className="w-6 h-6" /><span>{t('startGame')}</span>
      </button>

      <h2 className="text-xl font-bold text-white mb-4">{t('questions')}</h2>
      <div className="space-y-4">
        {quiz.questions?.map((q, index) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card">
            <div className="flex items-start justify-between mb-3">
              <span className="badge badge-primary">#{index + 1}</span>
              <span className="text-gray-500 text-sm">{q.timerSeconds}{t('secondsShort')} • {q.points} {t('pointsShort')}</span>
            </div>
            <p className="text-white font-medium mb-3">{q.text}</p>
            {q.type !== 'OPEN_ANSWER' && (
              <div className="grid grid-cols-2 gap-2">
                {q.options?.map((opt, i) => (
                  <div key={opt.id} className={`p-2 rounded-lg text-sm ${opt.isCorrect ? 'bg-game-green/20 text-green-300 border border-game-green' : 'bg-dark-200 text-gray-400'}`}>
                    {opt.text}
                  </div>
                ))}
              </div>
            )}
            {q.type === 'OPEN_ANSWER' && <p className="text-gray-400 text-sm">Ответы: {q.acceptableAnswers}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

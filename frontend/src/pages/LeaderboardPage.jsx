import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { HiOutlineHome, HiOutlineStar } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';
import { gameAPI } from '../services/api';
import { TrophyIcon, CrownIcon, FlameIcon } from '../components/common/ShapeIcons';

export default function LeaderboardPage() {
  const { gameCode } = useParams();
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    setTimeout(() => setShowConfetti(false), 5000);
  }, [gameCode]);

  const fetchLeaderboard = async () => {
    try {
      const response = await gameAPI.getLeaderboard(gameCode);
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const podium = leaderboard?.rankings?.slice(0, 3) || [];
  const others = leaderboard?.rankings?.slice(3) || [];

  return (
    <div className="min-h-screen bg-dark-200 p-4 py-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-game-yellow to-amber-600 flex items-center justify-center">
            <TrophyIcon className="w-11 h-11 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">{t('gameOver')}</h1>
          <p className="text-gray-400">{leaderboard?.quizTitle}</p>
        </motion.div>

        {/* Podium */}
        {podium.length > 0 && (
          <div className="flex items-end justify-center space-x-4 mb-8">
            {/* 2nd Place */}
            {podium[1] && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <img src={podium[1].avatarUrl} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-gray-400" />
                <p className="font-semibold text-white">{podium[1].nickname}</p>
                <p className="text-gray-400">{podium[1].totalScore}</p>
                <div className="w-20 h-24 bg-gray-500 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {podium[0] && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <div className="flex justify-center mb-2">
                  <CrownIcon className="w-9 h-9 text-game-yellow" />
                </div>
                <img src={podium[0].avatarUrl} alt="" className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-game-yellow" />
                <p className="font-bold text-white text-lg">{podium[0].nickname}</p>
                <p className="text-game-yellow font-bold">{podium[0].totalScore}</p>
                <div className="w-24 h-32 bg-game-yellow rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-4xl font-bold text-black">1</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
                <img src={podium[2].avatarUrl} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-amber-700" />
                <p className="font-semibold text-white">{podium[2].nickname}</p>
                <p className="text-gray-400">{podium[2].totalScore}</p>
                <div className="w-20 h-20 bg-amber-700 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Full List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <HiOutlineStar className="w-6 h-6" />
            <span>{t('leaderboard')}</span>
          </h2>
          
          <div className="space-y-2">
            {leaderboard?.rankings?.map((player, index) => (
              <div key={player.playerId} className={`flex items-center justify-between p-3 rounded-xl ${index < 3 ? 'bg-dark-200' : 'bg-dark-200/50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-game-yellow text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-dark-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <img src={player.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">{player.nickname}</p>
                    <p className="text-xs text-gray-500">
                      {player.correctAnswers}/{player.totalAnswers} ({Math.round(player.accuracy)}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{player.totalScore}</p>
                  {player.bestStreak > 1 && (
                    <p className="text-xs text-game-yellow flex items-center justify-end space-x-1">
                      <FlameIcon className="w-3 h-3" />
                      <span>{player.bestStreak}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center mt-8">
          <Link to="/" className="btn-primary flex items-center space-x-2">
            <HiOutlineHome className="w-5 h-5" />
            <span>{t('backToHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

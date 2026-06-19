import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { HiOutlinePlay, HiOutlineUsers, HiOutlineClipboard, HiOutlineArrowRight, HiOutlineStop, HiOutlineClock } from 'react-icons/hi';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { gameAPI } from '../services/api';
import { OPTION_SHAPES, OPTION_BG_CLASSES, CrownIcon, FlameIcon, UsersIcon } from '../components/common/ShapeIcons';

export default function HostGamePage() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const currentQuestionRef = useRef(null);
  const autoNextCalledRef = useRef(false);

  const joinUrl = `${window.location.origin}/join/${gameCode}`;

  const fetchState = useCallback(async () => {
    try {
      const response = await gameAPI.getState(gameCode);
      const newState = response.data.data;
      setGameState(newState);
      setLoading(false);
      
      // Start timer when new question appears
      if (newState?.status === 'IN_PROGRESS' && newState?.currentQuestion) {
        const questionId = newState.currentQuestion.id;
        if (currentQuestionRef.current !== questionId) {
          currentQuestionRef.current = questionId;
          autoNextCalledRef.current = false;
          setTimeLeft(newState.currentQuestion.timerSeconds);
          setTimerActive(true);
        }
      } else if (newState?.status !== 'IN_PROGRESS') {
        setTimerActive(false);
        setTimeLeft(null);
      }
    } catch (error) {
      toast.error(t('error'));
      navigate('/dashboard');
    }
  }, [gameCode, navigate, t]);

  // Fetch game state periodically
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0 && !autoNextCalledRef.current) {
      // Auto-advance to next question when timer reaches 0
      autoNextCalledRef.current = true;
      handleAutoNext();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, timerActive]);

  const handleAutoNext = async () => {
    if (actionLoading) return;
    setTimerActive(false);
    setActionLoading(true);
    
    try {
      const response = await gameAPI.nextQuestion(gameCode);
      if (response.data.data?.status === 'FINISHED') {
        setShowConfetti(true);
        toast.success(t('gameFinished'));
      } else {
        toast(t('timeUp'));
      }
    } catch (error) {
      console.error('Auto-next error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await gameAPI.start(gameCode);
      toast.success(t('gameStarted'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    setTimerActive(false);
    autoNextCalledRef.current = true;
    setActionLoading(true);
    try {
      const response = await gameAPI.nextQuestion(gameCode);
      if (response.data.data?.status === 'FINISHED') {
        setShowConfetti(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!confirm(t('confirmEndGame'))) return;
    setTimerActive(false);
    setActionLoading(true);
    try {
      await gameAPI.end(gameCode);
      setShowConfetti(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast.success(t('copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate timer color based on time left
  const getTimerColor = () => {
    if (timeLeft === null) return 'text-white';
    if (timeLeft <= 5) return 'text-game-red animate-pulse';
    if (timeLeft <= 10) return 'text-game-yellow';
    return 'text-game-green';
  };

  // Calculate timer progress percentage
  const getTimerProgress = () => {
    if (!gameState?.currentQuestion?.timerSeconds || timeLeft === null) return 100;
    return (timeLeft / gameState.currentQuestion.timerSeconds) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-200 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('game')}: {gameCode}</h1>
            <p className="text-gray-400">
              {gameState?.status === 'WAITING' ? t('waitingPlayers') :
               gameState?.status === 'IN_PROGRESS' ? `${t('question')} ${(gameState?.currentQuestionIndex || 0) + 1} ${t('of')} ${gameState?.totalQuestions}` :
               t('finished')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {gameState?.status === 'WAITING' && (
              <button
                onClick={handleStart}
                disabled={actionLoading || gameState?.playerCount < 1}
                className="btn-success flex items-center space-x-2"
              >
                <HiOutlinePlay className="w-5 h-5" />
                <span>{t('startGame')}</span>
              </button>
            )}
            {gameState?.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={handleNextQuestion}
                  disabled={actionLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <HiOutlineArrowRight className="w-5 h-5" />
                  <span>{t('nextQuestion')}</span>
                </button>
                <button
                  onClick={handleEnd}
                  disabled={actionLoading}
                  className="btn-danger flex items-center space-x-2"
                >
                  <HiOutlineStop className="w-5 h-5" />
                  <span>{t('endGame')}</span>
                </button>
              </>
            )}
            {gameState?.status === 'FINISHED' && (
              <button
                onClick={() => navigate(`/leaderboard/${gameCode}`)}
                className="btn-primary"
              >
                {t('leaderboard')} →
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: QR Code & Join Info */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <h2 className="text-xl font-bold text-white mb-4">{t('scanQR')}</h2>
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCode value={joinUrl} size={200} />
              </div>
              <p className="text-gray-400 mb-2">{t('orEnterCode')}</p>
              <div className="text-4xl font-mono font-bold text-primary-400 mb-4">
                {gameCode}
              </div>
              <button
                onClick={copyLink}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <HiOutlineClipboard className="w-5 h-5" />
                <span>{copied ? t('copied') : t('copyLink')}</span>
              </button>
            </div>
          </div>

          {/* Right: Players & Current Question */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question Display */}
            {gameState?.status === 'IN_PROGRESS' && gameState?.currentQuestion && (
              <motion.div
                key={gameState.currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                {/* Timer Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-primary">
                      {t('question')} {gameState.currentQuestion.questionNumber}
                    </span>
                    <div className={`flex items-center space-x-2 text-3xl font-bold ${getTimerColor()}`}>
                      <HiOutlineClock className="w-8 h-8" />
                      <span>{timeLeft !== null ? timeLeft : gameState.currentQuestion.timerSeconds}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-dark-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full transition-colors ${timeLeft <= 5 ? 'bg-game-red' : timeLeft <= 10 ? 'bg-game-yellow' : 'bg-game-green'}`}
                      style={{ width: `${getTimerProgress()}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  {gameState.currentQuestion.text}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {gameState.currentQuestion.options?.map((opt, i) => {
                    const ShapeIcon = OPTION_SHAPES[i % 4];
                    return (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center space-x-3 p-5 rounded-2xl text-white font-bold text-lg shadow-lg ${OPTION_BG_CLASSES[i % 4]}`}
                      >
                        <ShapeIcon className="w-7 h-7 flex-shrink-0 text-white/90" />
                        <span>{opt.text}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Auto-advance indicator */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-200 rounded-full text-gray-400">
                    <HiOutlineClock className="w-4 h-4 animate-pulse" />
                    <span>{t('autoAdvance')} {timeLeft} {t('seconds')}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Players List */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <HiOutlineUsers className="w-6 h-6" />
                  <span>{t('leaderboard')}</span>
                </h2>
                <span className="badge badge-success">
                  {gameState?.playerCount || 0} {t('players')}
                </span>
              </div>

              {gameState?.players?.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {gameState.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/30' :
                        index === 2 ? 'bg-gradient-to-r from-amber-700/20 to-transparent border border-amber-700/30' :
                        'bg-dark-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-game-yellow text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-dark-100 text-gray-400'
                        }`}>
                          {index === 0 ? <CrownIcon className="w-5 h-5" /> : index + 1}
                        </div>
                        <img
                          src={player.avatarUrl}
                          alt={player.nickname}
                          className="w-12 h-12 rounded-full border-2 border-white/20"
                        />
                        <div>
                          <p className="font-semibold text-white">{player.nickname}</p>
                          {player.currentStreak > 1 && (
                            <p className="text-xs text-game-yellow flex items-center space-x-1">
                              <FlameIcon className="w-3 h-3" />
                              <span>{player.currentStreak} {t('inARow')}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-white">{player.totalScore}</p>
                        <p className="text-xs text-gray-500">{player.correctAnswers} {t('correctAnswers')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">{t('waitingForPlayers')}</p>
                  <p className="text-gray-500 text-sm mt-2">{t('scanQR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

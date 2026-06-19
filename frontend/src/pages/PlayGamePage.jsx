import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { gameAPI } from '../services/api';
import { OPTION_SHAPES, OPTION_BG_CLASSES, CheckIcon, XIcon, BoltIcon, TrophyIcon } from '../components/common/ShapeIcons';

const optionColors = ['bg-game-red', 'bg-game-blue', 'bg-game-yellow', 'bg-game-green'];

export default function PlayGamePage() {
  const { playerToken } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [gameState, setGameState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const response = await gameAPI.getPlayerState(playerToken);
      const state = response.data.data;
      setGameState(state);
      
      if (state.currentQuestion && state.currentQuestion.id !== currentQuestion?.id) {
        setCurrentQuestion(state.currentQuestion);
        setSelectedOptions([]);
        setTextAnswer('');
        setAnswerResult(null);
        setStartTime(Date.now());
      }
      
      setLoading(false);
    } catch (error) {
      toast.error(t('error'));
      navigate('/join');
    }
  }, [playerToken, currentQuestion?.id, navigate, t]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleOptionClick = (optionId) => {
    if (answerResult || isAnswering) return;

    if (currentQuestion?.type === 'SINGLE_CHOICE' || currentQuestion?.type === 'TRUE_FALSE') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleSubmit = async () => {
    if (isAnswering || answerResult) return;
    
    const responseTimeMs = Date.now() - startTime;
    setIsAnswering(true);

    try {
      const response = await gameAPI.submitAnswer({
        playerToken,
        questionId: currentQuestion.id,
        selectedOptionIds: currentQuestion.type === 'OPEN_ANSWER' ? [] : selectedOptions,
        textAnswer: currentQuestion.type === 'OPEN_ANSWER' ? textAnswer : null,
        responseTimeMs,
      });

      const result = response.data.data;
      setAnswerResult(result);

      if (result.isCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setIsAnswering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Waiting state
  if (gameState?.status === 'WAITING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200 p-4">
        <div className="card text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-game-yellow/20 flex items-center justify-center mb-6 animate-pulse">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('waitingForPlayers')}</h1>
          <p className="text-gray-400 mb-6">{t('gameStartingSoon')}</p>
          <div className="text-6xl font-bold text-primary-400">
            {gameState?.playerCount || 0}
          </div>
          <p className="text-gray-500">{t('playersJoined')}</p>
        </div>
      </div>
    );
  }

  // Game finished
  if (gameState?.status === 'FINISHED') {
    const myPlayer = gameState?.players?.find(p => p.rank <= 3);
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200 p-4">
        {showConfetti && <Confetti />}
        <div className="card text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-game-yellow to-amber-600 flex items-center justify-center">
            <TrophyIcon className="w-11 h-11 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{t('gameOver')}</h1>
          <button
            onClick={() => navigate(`/leaderboard/${gameState?.gameCode}`)}
            className="btn-primary w-full"
          >
            {t('leaderboard')} →
          </button>
        </div>
      </div>
    );
  }

  // Question display
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('waitingForQuestion')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-200 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="badge badge-primary">
            {t('question')} {currentQuestion.questionNumber} {t('of')} {currentQuestion.totalQuestions}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">{t('yourScore')}</p>
            <p className="text-xl font-bold text-white">
              {gameState?.players?.find(p => true)?.totalScore || 0}
            </p>
          </div>
        </div>

        {/* Timer */}
        {!answerResult && (
          <div className="flex justify-center mb-6">
            <CountdownCircleTimer
              isPlaying={!answerResult}
              duration={currentQuestion.timerSeconds}
              colors={['#10B981', '#F59E0B', '#EF4444']}
              colorsTime={[currentQuestion.timerSeconds * 0.6, currentQuestion.timerSeconds * 0.3, 0]}
              size={80}
              strokeWidth={6}
              onComplete={() => {
                if (!answerResult) handleSubmit();
              }}
            >
              {({ remainingTime }) => (
                <span className="text-2xl font-bold text-white">{remainingTime}</span>
              )}
            </CountdownCircleTimer>
          </div>
        )}

        {/* Question */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            {currentQuestion.text}
          </h2>
          {currentQuestion.imageUrl && (
            <img src={currentQuestion.imageUrl} alt="" className="mt-4 rounded-lg max-h-48 mx-auto" />
          )}
        </motion.div>

        {/* Answer Result */}
        <AnimatePresence>
          {answerResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`card mb-6 text-center ${
                answerResult.isCorrect ? 'border-2 border-game-green' : 'border-2 border-game-red'
              }`}
            >
              <div className="flex justify-center mb-2">
                {answerResult.isCorrect 
                  ? <div className="w-12 h-12 rounded-full bg-game-green flex items-center justify-center"><CheckIcon className="w-7 h-7 text-white" /></div>
                  : <div className="w-12 h-12 rounded-full bg-game-red flex items-center justify-center"><XIcon className="w-7 h-7 text-white" /></div>
                }
              </div>
              <p className="text-xl font-bold text-white mb-2">
                {answerResult.isCorrect ? t('correct') : t('incorrect')}
              </p>
              <p className="text-2xl font-bold text-primary-400">
                +{answerResult.totalPoints} {t('points').toLowerCase()}
              </p>
              {answerResult.speedBonus > 0 && (
                <p className="text-sm text-game-yellow flex items-center justify-center space-x-1">
                  <BoltIcon className="w-4 h-4" />
                  <span>{t('speedBonus')}: +{answerResult.speedBonus}</span>
                </p>
              )}
              {answerResult.explanation && (
                <p className="text-gray-400 mt-4 text-sm">{answerResult.explanation}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        {currentQuestion.type === 'OPEN_ANSWER' ? (
          <div className="space-y-4">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="input text-lg"
              placeholder={t('yourAnswer')}
              disabled={!!answerResult}
            />
            {!answerResult && (
              <button
                onClick={handleSubmit}
                disabled={isAnswering || !textAnswer.trim()}
                className="btn-primary w-full text-lg"
              >
                {isAnswering ? t('loading') : t('submit')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedOptions.includes(option.id);
              const isCorrect = answerResult?.correctOptionIds?.includes(option.id);
              const showResult = answerResult !== null;
              const ShapeIcon = OPTION_SHAPES[index % 4];

              return (
                <motion.button
                  key={option.id}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showResult}
                  className={`flex items-center space-x-3 p-4 md:p-6 rounded-2xl text-white font-bold text-lg transition-all text-left ${
                    showResult
                      ? isCorrect
                        ? 'bg-game-green ring-4 ring-green-300'
                        : isSelected
                        ? 'bg-game-red ring-4 ring-red-300'
                        : 'bg-gray-600 opacity-50'
                      : isSelected
                      ? `${optionColors[index % 4]} ring-4 ring-white`
                      : `${optionColors[index % 4]} hover:opacity-90`
                  }`}
                >
                  <ShapeIcon className="w-6 h-6 flex-shrink-0 text-white/90" />
                  <span className="flex-1">{option.text}</span>
                  {showResult && isCorrect && <CheckIcon className="w-6 h-6 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XIcon className="w-6 h-6 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Submit button for multi-select */}
        {!answerResult && currentQuestion.type === 'MULTIPLE_CHOICE' && selectedOptions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={isAnswering}
            className="btn-primary w-full mt-4 text-lg"
          >
            {isAnswering ? t('loading') : t('submit')}
          </button>
        )}

        {/* Auto-submit for single choice */}
        {!answerResult && (currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE') && selectedOptions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={isAnswering}
            className="btn-primary w-full mt-4 text-lg"
          >
            {isAnswering ? t('loading') : t('submit')}
          </button>
        )}
      </div>
    </div>
  );
}

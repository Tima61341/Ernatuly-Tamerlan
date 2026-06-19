import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlay, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { gameAPI } from '../services/api';

const genderOptions = [
  { value: 'MALE', emoji: '👨', label: 'male' },
  { value: 'FEMALE', emoji: '👩', label: 'female' },
  { value: 'OTHER', emoji: '🧑', label: 'other' },
];

export default function JoinGamePage() {
  const { gameCode: urlGameCode } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: enter code, 2: enter details
  const [gameCode, setGameCode] = useState(urlGameCode || '');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlGameCode) {
      setGameCode(urlGameCode.toUpperCase());
      setStep(2);
    }
  }, [urlGameCode]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (gameCode.length >= 6) {
      setStep(2);
    } else {
      toast.error('Invalid game code');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error(t('enterNickname'));
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.join({
        gameCode: gameCode.toUpperCase(),
        nickname: nickname.trim(),
        gender,
      });

      const { playerToken } = response.data.data;
      toast.success(t('player.joined') || 'Joined!');
      navigate(`/play/${playerToken}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-game-green to-emerald-600 flex items-center justify-center mb-4">
                  <HiOutlinePlay className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {t('joinGame')}
                </h1>
                <p className="text-gray-400 mt-2">{t('enterGameCode')}</p>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="input text-center text-3xl font-mono tracking-widest mb-6"
                  placeholder="ABC123"
                  maxLength={8}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={gameCode.length < 6}
                  className="btn-success w-full text-lg"
                >
                  {t('next')} →
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-game-green/20 text-game-green rounded-full text-sm font-mono font-bold mb-4">
                  {t('gameCode')}: {gameCode}
                </div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {t('enterNickname')}
                </h1>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div>
                  <label className="label">{t('nickname')}</label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="input pl-12 text-lg"
                      placeholder="Player123"
                      maxLength={30}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('selectGender')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          gender === option.value
                            ? 'border-primary-500 bg-primary-500/20'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-3xl block mb-1">{option.emoji}</span>
                        <span className="text-sm text-gray-300">{t(option.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    ← {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !nickname.trim()}
                    className="btn-success flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {t('loading')}
                      </div>
                    ) : (
                      <>{t('join')}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

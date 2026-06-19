import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSparkles, HiOutlineSave, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { quizAPI, topicAPI, aiAPI } from '../services/api';

const questionTypes = [
  { value: 'SINGLE_CHOICE', label: 'singleChoice' },
  { value: 'MULTIPLE_CHOICE', label: 'multipleChoice' },
  { value: 'TRUE_FALSE', label: 'trueFalse' },
  { value: 'OPEN_ANSWER', label: 'openAnswer' },
];

const difficulties = ['EASY', 'MEDIUM', 'HARD'];
const languagesList = [{ code: 'ru', name: 'Русский' }, { code: 'kk', name: 'Қазақша' }, { code: 'en', name: 'English' }];
const optionColors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

export default function QuizEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isEditing = !!id;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    easyCount: 2,
    mediumCount: 3,
    hardCount: 1,
    easyPoints: 500,
    mediumPoints: 1000,
    hardPoints: 1500,
    questionType: 'SINGLE_CHOICE',
  });
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    topicId: null,
    newTopicName: '',
    difficulty: 'MEDIUM',
    language: language,
    defaultTimerSeconds: 30,
    isPublic: false,
    questions: []
  });

  useEffect(() => {
    fetchTopics();
    if (isEditing) fetchQuiz();
  }, [id]);

  const fetchTopics = async () => {
    try {
      const response = await topicAPI.getAll();
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getById(id);
      const data = response.data.data;
      setQuiz({
        title: data.title,
        description: data.description || '',
        topicId: data.topic?.id || null,
        newTopicName: '',
        difficulty: data.difficulty,
        language: data.language,
        defaultTimerSeconds: data.defaultTimerSeconds,
        isPublic: data.isPublic,
        questions: data.questions?.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          timerSeconds: q.timerSeconds,
          points: q.points,
          explanation: q.explanation || '',
          acceptableAnswers: q.acceptableAnswers || '',
          options: q.options?.map(o => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
            color: o.color
          })) || []
        })) || []
      });
    } catch (error) {
      toast.error(t('error'));
      navigate('/quizzes');
    }
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        text: '',
        type: 'SINGLE_CHOICE',
        timerSeconds: quiz.defaultTimerSeconds,
        points: 1000,
        difficulty: quiz.difficulty || 'MEDIUM',
        explanation: '',
        acceptableAnswers: '',
        options: [
          { text: '', isCorrect: true, color: optionColors[0] },
          { text: '', isCorrect: false, color: optionColors[1] },
          { text: '', isCorrect: false, color: optionColors[2] },
          { text: '', isCorrect: false, color: optionColors[3] },
        ]
      }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      
      // Handle type change
      if (field === 'type') {
        if (value === 'TRUE_FALSE') {
          questions[index].options = [
            { text: t('true') || 'True', isCorrect: true, color: optionColors[0] },
            { text: t('false') || 'False', isCorrect: false, color: optionColors[1] },
          ];
        } else if (value === 'OPEN_ANSWER') {
          questions[index].options = [];
        } else if (questions[index].options.length < 2) {
          questions[index].options = [
            { text: '', isCorrect: true, color: optionColors[0] },
            { text: '', isCorrect: false, color: optionColors[1] },
            { text: '', isCorrect: false, color: optionColors[2] },
            { text: '', isCorrect: false, color: optionColors[3] },
          ];
        }
      }
      
      return { ...prev, questions };
    });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      
      if (field === 'isCorrect' && questions[qIndex].type === 'SINGLE_CHOICE') {
        options.forEach((o, i) => o.isCorrect = i === oIndex);
      } else {
        options[oIndex] = { ...options[oIndex], [field]: value };
      }
      
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = (qIndex) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options.push({ text: '', isCorrect: false, color: optionColors[options.length % 4] });
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[qIndex].options = questions[qIndex].options.filter((_, i) => i !== oIndex);
      return { ...prev, questions };
    });
  };

  const generateWithAI = async () => {
    if (!quiz.title && !quiz.topicId && !quiz.newTopicName) {
      toast.error(t('specifyTopic'));
      return;
    }

    const total = aiConfig.easyCount + aiConfig.mediumCount + aiConfig.hardCount;
    if (total === 0) {
      toast.error(t('numberOfQuestions'));
      return;
    }

    setAiLoading(true);
    try {
      const response = await aiAPI.generateQuestions({
        topic: quiz.newTopicName || topics.find(t => t.id === quiz.topicId)?.name || quiz.title,
        language: quiz.language,
        questionType: aiConfig.questionType,
        easyCount: aiConfig.easyCount,
        mediumCount: aiConfig.mediumCount,
        hardCount: aiConfig.hardCount,
        easyPoints: aiConfig.easyPoints,
        mediumPoints: aiConfig.mediumPoints,
        hardPoints: aiConfig.hardPoints,
        includeExplanation: true
      });

      const generatedQuestions = response.data.data.map(q => ({
        text: q.text,
        type: q.type,
        timerSeconds: quiz.defaultTimerSeconds,
        points: q.points || 1000,
        difficulty: q.difficulty || 'MEDIUM',
        explanation: q.explanation || '',
        acceptableAnswers: q.acceptableAnswers || '',
        options: q.options?.map((o, i) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          color: optionColors[i % 4]
        })) || []
      }));

      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, ...generatedQuestions]
      }));

      setShowAiModal(false);
      toast.success(`${generatedQuestions.length} ${t('questionsAdded')}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('generationError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz.title.trim()) {
      toast.error('Введите название викторины');
      return;
    }
    if (quiz.questions.length === 0) {
      toast.error('Добавьте хотя бы один вопрос');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await quizAPI.update(id, quiz);
      } else {
        await quizAPI.create(quiz);
      }
      toast.success(t('success'));
      navigate('/quizzes');
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="section-title">{isEditing ? 'Редактировать викторину' : t('createQuiz')}</h1>

      {/* Basic Info */}
      <div className="card mb-6 space-y-4">
        <div>
          <label className="label">{t('quizTitle')} *</label>
          <input type="text" value={quiz.title} onChange={(e) => setQuiz({...quiz, title: e.target.value})} className="input" placeholder={t('enterTitle')} />
        </div>
        <div>
          <label className="label">{t('quizDescription')}</label>
          <textarea value={quiz.description} onChange={(e) => setQuiz({...quiz, description: e.target.value})} className="input min-h-[80px]" placeholder={t('enterDescription')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('selectTopic')}</label>
            <select value={quiz.topicId || ''} onChange={(e) => setQuiz({...quiz, topicId: e.target.value ? Number(e.target.value) : null})} className="input">
              <option value="">{t('selectTopicPlaceholder')}</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.icon} {topic.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('createNewTopic')}</label>
            <input type="text" value={quiz.newTopicName} onChange={(e) => setQuiz({...quiz, newTopicName: e.target.value, topicId: null})} className="input" placeholder={t('newTopic')} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">{t('difficulty')}</label>
            <select value={quiz.difficulty} onChange={(e) => setQuiz({...quiz, difficulty: e.target.value})} className="input">
              {difficulties.map(d => (
                <option key={d} value={d}>{t(d.toLowerCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('language')}</label>
            <select value={quiz.language} onChange={(e) => setQuiz({...quiz, language: e.target.value})} className="input">
              {languagesList.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('timer')}</label>
            <input type="number" min="5" max="120" value={quiz.defaultTimerSeconds} onChange={(e) => setQuiz({...quiz, defaultTimerSeconds: Number(e.target.value)})} className="input" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={quiz.isPublic} onChange={(e) => setQuiz({...quiz, isPublic: e.target.checked})} className="w-5 h-5 rounded" />
              <span className="text-gray-300">{t('makePublic')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{t('questions')} ({quiz.questions.length})</h2>
        <div className="flex space-x-2">
          <button onClick={() => setShowAiModal(true)} className="btn-secondary flex items-center space-x-2">
            <HiOutlineSparkles className="w-5 h-5" />
            <span>{t('generateWithAI')}</span>
          </button>
          <button onClick={addQuestion} className="btn-primary flex items-center space-x-2">
            <HiOutlinePlus className="w-5 h-5" />
            <span>{t('addQuestion')}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {quiz.questions.map((question, qIndex) => (
          <motion.div key={qIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} className="card mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="badge badge-primary">{t('question')} {qIndex + 1}</span>
                {question.difficulty && (
                  <span className={`badge ${
                    question.difficulty === 'EASY' ? 'badge-success' :
                    question.difficulty === 'HARD' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {t(question.difficulty.toLowerCase())}
                  </span>
                )}
                {question.points && (
                  <span className="text-xs text-gray-500">{question.points} {t('pointsShort')}</span>
                )}
              </div>
              <button onClick={() => removeQuestion(qIndex)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">{t('questionText')} *</label>
                <textarea value={question.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} className="input min-h-[60px]" placeholder={t('enterQuestion')} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">{t('questionType')}</label>
                  <select value={question.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)} className="input">
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{t(type.label)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t('timer')}</label>
                  <input type="number" min="5" max="120" value={question.timerSeconds} onChange={(e) => updateQuestion(qIndex, 'timerSeconds', Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="label">{t('points')}</label>
                  <input type="number" min="100" max="5000" step="100" value={question.points} onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))} className="input" />
                </div>
              </div>

              {question.type === 'OPEN_ANSWER' ? (
                <div>
                  <label className="label">Допустимые ответы (через запятую)</label>
                  <input type="text" value={question.acceptableAnswers} onChange={(e) => updateQuestion(qIndex, 'acceptableAnswers', e.target.value)} className="input" placeholder={t('acceptableAnswers')} />
                </div>
              ) : (
                <div>
                  <label className="label">{t('options')}</label>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                          checked={option.isCorrect}
                          onChange={() => updateOption(qIndex, oIndex, 'isCorrect', !option.isCorrect)}
                          className="w-5 h-5"
                        />
                        <div className="w-3 h-8 rounded" style={{ backgroundColor: option.color }} />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                          className="input flex-1"
                          placeholder={`Вариант ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <button onClick={() => removeOption(qIndex, oIndex)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.type !== 'TRUE_FALSE' && question.options.length < 6 && (
                      <button onClick={() => addOption(qIndex)} className="text-primary-400 hover:text-primary-300 text-sm">+ {t('addOption')}</button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="label">{t('explanation')}</label>
                <input type="text" value={question.explanation} onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)} className="input" placeholder={t('enterExplanation')} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {quiz.questions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">{t('noQuestions')}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end space-x-4 mt-6">
        <button onClick={() => navigate('/quizzes')} className="btn-secondary">{t('cancel')}</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center space-x-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSave className="w-5 h-5" />}
          <span>{t('saveQuiz')}</span>
        </button>
      </div>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => !aiLoading && setShowAiModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <HiOutlineSparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('aiGenerator')}</h3>
                    <p className="text-xs text-gray-400">{t('aiGeneratorDesc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => !aiLoading && setShowAiModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Difficulty Distribution */}
                <div>
                  <label className="label mb-3">{t('difficultyDistribution')}</label>
                  <div className="space-y-3">
                    {/* Easy */}
                    <div className="flex items-center justify-between p-3 bg-dark-200 rounded-2xl border border-game-green/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-game-green/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-game-green" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{t('easyQuestions')}</p>
                          <p className="text-xs text-gray-500">{aiConfig.easyPoints} {t('pointsShort')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setAiConfig(c => ({...c, easyCount: Math.max(0, c.easyCount - 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">−</button>
                        <span className="w-8 text-center text-white font-bold">{aiConfig.easyCount}</span>
                        <button onClick={() => setAiConfig(c => ({...c, easyCount: Math.min(15, c.easyCount + 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">+</button>
                      </div>
                    </div>

                    {/* Medium */}
                    <div className="flex items-center justify-between p-3 bg-dark-200 rounded-2xl border border-game-yellow/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-game-yellow/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-game-yellow" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 12L12 22L2 12L12 2Z"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{t('mediumQuestions')}</p>
                          <p className="text-xs text-gray-500">{aiConfig.mediumPoints} {t('pointsShort')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setAiConfig(c => ({...c, mediumCount: Math.max(0, c.mediumCount - 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">−</button>
                        <span className="w-8 text-center text-white font-bold">{aiConfig.mediumCount}</span>
                        <button onClick={() => setAiConfig(c => ({...c, mediumCount: Math.min(15, c.mediumCount + 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">+</button>
                      </div>
                    </div>

                    {/* Hard */}
                    <div className="flex items-center justify-between p-3 bg-dark-200 rounded-2xl border border-game-red/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-game-red/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-game-red" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L22 20H2L12 3Z"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{t('hardQuestions')}</p>
                          <p className="text-xs text-gray-500">{aiConfig.hardPoints} {t('pointsShort')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setAiConfig(c => ({...c, hardCount: Math.max(0, c.hardCount - 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">−</button>
                        <span className="w-8 text-center text-white font-bold">{aiConfig.hardCount}</span>
                        <button onClick={() => setAiConfig(c => ({...c, hardCount: Math.min(15, c.hardCount + 1)}))} className="w-8 h-8 rounded-lg bg-dark-100 hover:bg-white/10 text-white font-bold transition-colors">+</button>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mt-3 px-3">
                    <span className="text-sm text-gray-400">{t('total')}</span>
                    <span className="text-lg font-bold text-primary-400">
                      {aiConfig.easyCount + aiConfig.mediumCount + aiConfig.hardCount}
                    </span>
                  </div>
                </div>

                {/* Points Configuration */}
                <div>
                  <label className="label mb-3">{t('pointsPerDifficulty')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-game-green mb-1 block">{t('easyQuestions')}</span>
                      <input type="number" min="100" max="5000" step="100" value={aiConfig.easyPoints} onChange={(e) => setAiConfig(c => ({...c, easyPoints: Number(e.target.value)}))} className="input text-sm py-2" />
                    </div>
                    <div>
                      <span className="text-xs text-game-yellow mb-1 block">{t('mediumQuestions')}</span>
                      <input type="number" min="100" max="5000" step="100" value={aiConfig.mediumPoints} onChange={(e) => setAiConfig(c => ({...c, mediumPoints: Number(e.target.value)}))} className="input text-sm py-2" />
                    </div>
                    <div>
                      <span className="text-xs text-game-red mb-1 block">{t('hardQuestions')}</span>
                      <input type="number" min="100" max="5000" step="100" value={aiConfig.hardPoints} onChange={(e) => setAiConfig(c => ({...c, hardPoints: Number(e.target.value)}))} className="input text-sm py-2" />
                    </div>
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="label mb-2">{t('questionType')}</label>
                  <select value={aiConfig.questionType} onChange={(e) => setAiConfig(c => ({...c, questionType: e.target.value}))} className="input">
                    {questionTypes.map(qt => (
                      <option key={qt.value} value={qt.value}>{t(qt.label)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 p-6 border-t border-white/5">
                <button
                  onClick={() => setShowAiModal(false)}
                  disabled={aiLoading}
                  className="btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={generateWithAI}
                  disabled={aiLoading || (aiConfig.easyCount + aiConfig.mediumCount + aiConfig.hardCount === 0)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('generating')}</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-5 h-5" />
                      <span>{t('generate')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

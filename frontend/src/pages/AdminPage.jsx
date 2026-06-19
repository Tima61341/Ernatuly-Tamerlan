import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar, HiOutlineTag, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { userAPI, topicAPI, statsAPI } from '../services/api';

const tabs = [
  { id: 'dashboard', label: 'statistics', icon: HiOutlineChartBar },
  { id: 'users', label: 'users', icon: HiOutlineUsers },
  { id: 'topics', label: 'topics', icon: HiOutlineTag },
];

export default function AdminPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'topics') fetchTopics();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await statsAPI.getAdminDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await topicAPI.getAllIncludingInactive();
      setTopics(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.changeRole(userId, role);
      fetchUsers();
      toast.success(t('success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await userAPI.toggleActive(userId);
      fetchUsers();
      toast.success(t('success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Удалить тему?')) return;
    try {
      await topicAPI.delete(topicId);
      fetchTopics();
      toast.success(t('success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  return (
    <div className="page-container max-w-7xl mx-auto">
      <h1 className="section-title">{t('admin')}</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-dark-100 text-gray-400 hover:bg-dark-100/70'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{t(tab.label)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-gray-400">{t('users')}</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
                <p className="text-gray-400">{t('allQuizzes')}</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-white">{stats.totalGamesPlayed}</p>
                <p className="text-gray-400">{t('totalGames')}</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-white">{stats.activeGamesNow}</p>
                <p className="text-gray-400">Активных игр</p>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="pb-3">Пользователь</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Роль</th>
                    <th className="pb-3">Статус</th>
                    <th className="pb-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <span className="text-white">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400">{user.email}</td>
                      <td className="py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-dark-200 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="USER">USER</option>
                          <option value="CREATOR">CREATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {user.isActive ? 'Активен' : 'Заблокирован'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className={`text-sm ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                        >
                          {user.isActive ? t('deactivate') : t('activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Topics */}
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(topic => (
                <motion.div key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{topic.name}</p>
                      <p className="text-sm text-gray-500">{topic.quizCount} викторин</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${topic.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {topic.isActive ? 'Активна' : 'Скрыта'}
                    </span>
                    <button onClick={() => handleDeleteTopic(topic.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

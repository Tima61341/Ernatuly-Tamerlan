import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizEditorPage from './pages/QuizEditorPage';
import QuizDetailPage from './pages/QuizDetailPage';
import JoinGamePage from './pages/JoinGamePage';
import HostGamePage from './pages/HostGamePage';
import PlayGamePage from './pages/PlayGamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-200">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin()) return <Navigate to="/dashboard" replace />;
  
  return children;
};

// Public only Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col bg-dark-200">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          } />
          
          {/* Game routes (public for players) */}
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/join/:gameCode" element={<JoinGamePage />} />
          <Route path="/play/:playerToken" element={<PlayGamePage />} />
          <Route path="/leaderboard/:gameCode" element={<LeaderboardPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/quizzes" element={
            <ProtectedRoute><QuizzesPage /></ProtectedRoute>
          } />
          <Route path="/quizzes/new" element={
            <ProtectedRoute><QuizEditorPage /></ProtectedRoute>
          } />
          <Route path="/quizzes/:id" element={
            <ProtectedRoute><QuizDetailPage /></ProtectedRoute>
          } />
          <Route path="/quizzes/:id/edit" element={
            <ProtectedRoute><QuizEditorPage /></ProtectedRoute>
          } />
          <Route path="/host/:gameCode" element={
            <ProtectedRoute><HostGamePage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;

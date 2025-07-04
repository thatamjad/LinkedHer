import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnonymousProvider } from './context/AnonymousContext';
import { ReportProvider } from './context/ReportContext';
import ThemeProvider from './components/ui/ThemeProvider';
import ReportFormModal from './components/ui/ReportFormModal';
import { initSessionMonitor } from './middleware/sessionMonitor';
import { initNetworkMixing } from './middleware/networkMixing';
import { createSession } from './services/securityService';

// Import pages
import ModernLogin from './pages/ModernLogin';
import ModernRegister from './pages/ModernRegister';
import Dashboard from './pages/Dashboard';
import ModernProfile from './pages/ModernProfile';
import EditProfile from './pages/EditProfile';
import Verification from './pages/Verification';
import PostDetail from './pages/PostDetail';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CreatePost from './pages/CreatePost';
import Feed from './pages/Feed';
import Jobs from './pages/Jobs';
import Messages from './pages/Messages';
import Anonymous from './pages/Anonymous';
import AnonymousFeed from './pages/AnonymousFeed';
import AnonymousPersonas from './pages/AnonymousPersonas';
import AnonymousPostDetail from './pages/AnonymousPostDetail';
import AnonymousCreatePost from './pages/AnonymousCreatePost';
import ModerationDashboard from './pages/ModerationDashboard';
import SecuritySettings from './pages/SecuritySettings';

// Modern components
import ModernLandingPage from './components/landing/ModernLandingPage';

// Community & Support System pages
import SupportGroups from './pages/SupportGroups';
import SupportGroupDetail from './pages/SupportGroupDetail';
import CreateSupportGroup from './pages/CreateSupportGroup';
import MentalHealthResources from './pages/MentalHealthResources';
import MentalHealthResourceDetail from './pages/MentalHealthResourceDetail';
import AddMentalHealthResource from './pages/AddMentalHealthResource';
import CollaborativeProjects from './pages/CollaborativeProjects';
import CollaborativeProjectDetail from './pages/CollaborativeProjectDetail';
import CreateCollaborativeProject from './pages/CreateCollaborativeProject';
import AchievementsPage from './pages/AchievementsPage';
import AchievementDetail from './pages/AchievementDetail';
import CreateAchievement from './pages/CreateAchievement';
import DebugDashboard from './pages/DebugDashboard';

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';
import VerifiedRoute from './components/VerifiedRoute';
import ModeratorRoute from './components/ModeratorRoute';

function App() {
  // Initialize middlewares
  useEffect(() => {
    // Initialize session monitoring
    initSessionMonitor(null, () => {
      // Handle session expiry - redirect to login or show notification
      window.location.href = '/login?session=expired';
    });
    
    // Initialize network traffic mixing for anonymous mode
    initNetworkMixing();
    
    // Create a new session
    const initSession = async () => {
      try {
        await createSession();
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    initSession();
    
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        const cleanup = require('./middleware/sessionMonitor').cleanup;
        cleanup();
      }
    };
  }, []);
  
  return (
    <AuthProvider>
      <AnonymousProvider>
        <ReportProvider>
          <ThemeProvider>
            <Router>
              <Routes>
                {/* Landing page for unauthenticated users */}
                <Route path="/home" element={<ModernLandingPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<ModernLogin />} />
                <Route path="/register" element={<ModernRegister />} />
                
                {/* Professional Mode Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ModernProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/:userId" 
                  element={
                    <ProtectedRoute>
                      <ModernProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-profile" 
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/verification" 
                  element={
                    <ProtectedRoute>
                      <Verification />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/post/:postId" 
                  element={
                    <ProtectedRoute>
                      <PostDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-post" 
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/feed" 
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/jobs" 
                  element={
                    <ProtectedRoute>
                      <Jobs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/anonymous" 
                  element={
                    <ProtectedRoute>
                      <Anonymous />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Security Routes - accessible in both modes */}
                <Route 
                  path="/security" 
                  element={
                    <ProtectedRoute>
                      <SecuritySettings />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Anonymous Mode Routes */}
                <Route 
                  path="/anonymous" 
                  element={
                    <VerifiedRoute>
                      <AnonymousFeed />
                    </VerifiedRoute>
                  } 
                />
                <Route 
                  path="/anonymous/personas" 
                  element={
                    <VerifiedRoute>
                      <AnonymousPersonas />
                    </VerifiedRoute>
                  } 
                />
                <Route 
                  path="/anonymous/post/:postId" 
                  element={
                    <VerifiedRoute>
                      <AnonymousPostDetail />
                    </VerifiedRoute>
                  } 
                />
                <Route 
                  path="/anonymous/create-post" 
                  element={
                    <VerifiedRoute>
                      <AnonymousCreatePost />
                    </VerifiedRoute>
                  } 
                />
                
                {/* Moderation Route */}
                <Route 
                  path="/moderation" 
                  element={
                    <ModeratorRoute>
                      <ModerationDashboard />
                    </ModeratorRoute>
                  } 
                />

                {/* Community & Support System Routes */}
                {/* Support Groups */}
                <Route 
                  path="/support-groups" 
                  element={
                    <ProtectedRoute>
                      <SupportGroups />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/support-groups/:id" 
                  element={
                    <ProtectedRoute>
                      <SupportGroupDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/support-groups/create" 
                  element={
                    <ProtectedRoute>
                      <CreateSupportGroup />
                    </ProtectedRoute>
                  } 
                />

                {/* Mental Health Resources */}
                <Route 
                  path="/mental-health/resources" 
                  element={
                    <ProtectedRoute>
                      <MentalHealthResources />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mental-health/resources/:id" 
                  element={
                    <ProtectedRoute>
                      <MentalHealthResourceDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mental-health/resources/add" 
                  element={
                    <ProtectedRoute>
                      <AddMentalHealthResource />
                    </ProtectedRoute>
                  } 
                />

                {/* Collaborative Projects */}
                <Route 
                  path="/collaborative-projects" 
                  element={
                    <ProtectedRoute>
                      <CollaborativeProjects />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/collaborative-projects/:id" 
                  element={
                    <ProtectedRoute>
                      <CollaborativeProjectDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/collaborative-projects/create" 
                  element={
                    <ProtectedRoute>
                      <CreateCollaborativeProject />
                    </ProtectedRoute>
                  } 
                />

                {/* Achievements */}
                <Route 
                  path="/achievements" 
                  element={
                    <ProtectedRoute>
                      <AchievementsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements/:id" 
                  element={
                    <ProtectedRoute>
                      <AchievementDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements/create" 
                  element={
                    <ProtectedRoute>
                      <CreateAchievement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements/user/:userId" 
                  element={
                    <ProtectedRoute>
                      <AchievementsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <CreateAchievement />
                    </ProtectedRoute>
                  } 
                />

                {/* Debug Dashboard - Development Only */}
                <Route 
                  path="/debug" 
                  element={<DebugDashboard />} 
                />
              </Routes>
              
              {/* Global report form modal */}
              <ReportFormModal />
            </Router>
          </ThemeProvider>
        </ReportProvider>
      </AnonymousProvider>
    </AuthProvider>
  );
}

export default App;

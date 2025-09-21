import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthForm } from './components/auth/AuthForm';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Forms } from './pages/Forms';
import { FormResponses } from './pages/FormResponses';
import { Profile } from './pages/Profile';
import { PublicForm } from './pages/PublicForm';
import { useAuthStore } from './stores/authStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function App() {
  const { initialize, loading, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="signin" />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="signup" />} 
        />
        
        {/* Public Form Route - No authentication required */}
        <Route path="/research/:formId" element={<PublicForm />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="forms" element={
            <ProtectedRoute>
              <Forms />
            </ProtectedRoute>
          } />
          <Route path="forms/:formId/responses" element={
            <ProtectedRoute>
              <FormResponses />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
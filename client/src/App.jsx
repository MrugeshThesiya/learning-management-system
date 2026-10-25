import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { GuestOnly, ProtectedRoute } from './components/ProtectedRoute.jsx';
import { FullPageLoader } from './components/Feedback.jsx';
import AppLayout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import MyLearning from './pages/MyLearning.jsx';
import NotFound from './pages/NotFound.jsx';

// Root decides: guests see the marketing homepage, members see their dashboard.
function Root() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageLoader label="Restoring your session…" />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

            {/* Protected — login required, session re-validated on every load */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><AppLayout><Courses /></AppLayout></ProtectedRoute>} />
            <Route path="/courses/:id" element={<ProtectedRoute><AppLayout><CourseDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/my-learning" element={<ProtectedRoute><AppLayout><MyLearning /></AppLayout></ProtectedRoute>} />

            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

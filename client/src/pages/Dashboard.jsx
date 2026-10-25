import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FullPageLoader } from '../components/Feedback.jsx';
import StudentDashboard from './dashboards/StudentDashboard.jsx';
import InstructorDashboard from './dashboards/InstructorDashboard.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';

// Role-based entry: each role gets its own dashboard experience.
export default function Dashboard() {
  const { status, user } = useAuth();
  if (status === 'loading') return <FullPageLoader label="Loading your workspace…" />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <StudentDashboard />;
}

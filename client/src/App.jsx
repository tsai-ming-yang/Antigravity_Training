import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogs from './pages/AdminLogs';
import CourseEdit from './pages/CourseEdit';
import UserLogin from './pages/UserLogin';
import CourseList from './pages/CourseList';
import TrainingPlayer from './pages/TrainingPlayer';

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.title = '管理後台 - 教育訓練系統';
    } else {
      document.title = '教育訓練 - 員工專區';
    }
  }, [location]);
  return null;
}

function App() {
  return (
    <Router>
      <TitleUpdater />
      <div className="min-h-screen bg-gray-100 font-sans">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/course/:id" element={<CourseEdit />} />

          {/* User Routes */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/training/:courseId" element={<TrainingPlayer />} />

          {/* Redirect */}
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

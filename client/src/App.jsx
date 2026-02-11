import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Courses from './pages/Courses';
import Payment from './pages/Payment';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// Protected Route Component
const RequireAuth = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center">Yuklanmoqda...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />; // Unauthorized
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="register" element={<Register />} />
            <Route path="courses" element={<Courses />} />
            <Route path="payment" element={<Payment />} />
            <Route path="login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="attendance"
              element={
                <RequireAuth roles={['teacher', 'admin']}>
                  <Attendance />
                </RequireAuth>
              }
            />

            <Route
              path="admin"
              element={
                <RequireAuth roles={['admin']}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="teacher"
              element={
                <RequireAuth roles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

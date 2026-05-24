import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import TeamManagement from './pages/TeamManagement';
import EnvironmentLogs from './pages/EnvironmentLogs';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/teams" element={<PrivateRoute><TeamManagement /></PrivateRoute>} />
        <Route path="/environment/:id/logs" element={<PrivateRoute><EnvironmentLogs /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
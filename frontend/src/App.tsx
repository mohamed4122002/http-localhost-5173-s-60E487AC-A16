import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import Templates from './pages/Templates';
import TokenManagement from './pages/TokenManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SurveyEdit from './pages/SurveyEdit';
import PublicSurvey from './pages/PublicSurvey';

import AdminNotifier from './components/notifications/AdminNotifier';
import Layout from './components/Layout';
import { AnimatePresence } from 'framer-motion';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-dark overflow-hidden selection:bg-brand-accent/30 selection:text-white">
        <Toaster theme="dark" position="top-right" richColors />
        <AdminNotifier />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <Templates />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-survey"
              element={
                <PrivateRoute>
                  <CreateSurvey />
                </PrivateRoute>
              }
            />
            <Route
              path="/surveys/:surveyId"
              element={
                <PrivateRoute>
                  <TokenManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics/:surveyId"
              element={
                <PrivateRoute>
                  <AnalyticsDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/surveys/:surveyId/edit"
              element={
                <PrivateRoute>
                  <SurveyEdit />
                </PrivateRoute>
              }
            />
            <Route path="/s/:token" element={<PublicSurvey />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;

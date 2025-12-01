import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/UserDashboard';
import PendingTransactions from './components/PendingTransactions';
import PendingRewards from './components/PendingRewards';
import PricePredictorPage from './pages/PricePredictorPage';
import MetricsPage from './pages/MetricsPage';
import EmployeesPage from './pages/EmployeesPage';
import TelegramMessagesPage from './pages/TelegramMessagesPage';
import PendingActivationPage from './pages/PendingActivationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppNav from './components/AppNav';
import ProtectedRoute from './components/ProtectedRoute';
import 'materialize-css/dist/css/materialize.min.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Публичные роуты (без навигации) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-activation" element={<PendingActivationPage />} />
        
        {/* Защищённые роуты (с навигацией) */}
        <Route
          path="/*"
          element={
            <>
              <AppNav />
              <div className="container main-container">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/metrics"
                    element={
                      <ProtectedRoute>
                        <MetricsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/predictor"
                    element={
                      <ProtectedRoute>
                        <PricePredictorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <PendingTransactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <ProtectedRoute>
                        <PendingRewards />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employees"
                    element={
                      <ProtectedRoute>
                        <EmployeesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/telegram-messages"
                    element={
                      <ProtectedRoute requireAdmin>
                        <TelegramMessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

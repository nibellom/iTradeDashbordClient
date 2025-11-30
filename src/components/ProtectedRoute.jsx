import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null); // null, 'loading', 'authenticated', 'inactive', 'unauthorized'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthStatus('unauthorized');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const employee = response.data.employee;
          
          // Обновляем данные сотрудника в localStorage
          localStorage.setItem('employee', JSON.stringify(employee));
          
          // Проверяем активность аккаунта
          if (!employee.isActive) {
            setAuthStatus('inactive');
          } else {
            setAuthStatus('authenticated');
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('employee');
          setAuthStatus('unauthorized');
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        setAuthStatus('unauthorized');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="bybit-card bybit-card--center">
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  if (authStatus === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (authStatus === 'inactive') {
    return <Navigate to="/pending-activation" replace />;
  }

  if (authStatus === 'authenticated') {
    return children;
  }

  return null;
};

export default ProtectedRoute;


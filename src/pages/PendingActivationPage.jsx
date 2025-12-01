import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PendingActivationPage.css';

const PendingActivationPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/auth/verify');
        if (response.data.success) {
          const emp = response.data.employee;
          setEmployee(emp);
          
          // Если аккаунт активирован, перенаправляем на главную
          if (emp.isActive) {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Ошибка проверки статуса:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Проверяем статус каждые 5 секунд
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="pending-activation-page">
        <div className="pending-activation-container">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-activation-page">
      <div className="pending-activation-container">
        <div className="pending-activation-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
        </div>
        
        <h1 className="pending-activation-title">Ожидается подтверждение аккаунта</h1>
        
        <p className="pending-activation-message">
          Ваш аккаунт <strong>{employee?.login}</strong> был успешно зарегистрирован, 
          но пока не активирован администратором.
        </p>
        
        <p className="pending-activation-submessage">
          После активации вы получите полный доступ к системе. 
          Страница обновится автоматически.
        </p>

        <div className="pending-activation-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Ожидание активации...</span>
          </div>
        </div>

        <button onClick={handleLogout} className="pending-activation-logout">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default PendingActivationPage;



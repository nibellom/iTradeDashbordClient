import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    pinCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка, не авторизован ли уже пользователь
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('employee', JSON.stringify(response.data.employee));
        
        // Если аккаунт неактивен, перенаправляем на страницу ожидания
        if (!response.data.employee.isActive) {
          navigate('/pending-activation');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">iTrade Dashbord</h1>
          <p className="auth-subtitle">Вход в систему</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="login">Логин</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="Введите логин"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Введите пароль"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="pinCode">Пинкод</label>
            <input
              type="password"
              id="pinCode"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              required
              maxLength="6"
              placeholder="Введите пинкод"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


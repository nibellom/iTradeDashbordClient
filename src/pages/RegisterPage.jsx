import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    pinCode: '',
    confirmPinCode: '',
    role: 'operator'
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

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.pinCode !== formData.confirmPinCode) {
      setError('Пинкоды не совпадают');
      return;
    }

    if (formData.login.length < 3) {
      setError('Логин должен быть не менее 3 символов');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (formData.pinCode.length < 4 || formData.pinCode.length > 6) {
      setError('Пинкод должен быть от 4 до 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, confirmPinCode, ...submitData } = formData;
      const response = await axios.post('/api/auth/register', submitData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('employee', JSON.stringify(response.data.employee));
        // Перенаправляем на страницу ожидания активации
        navigate('/pending-activation');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">iTrade Dashbord</h1>
          <p className="auth-subtitle">Регистрация сотрудника</p>
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
              minLength="3"
              maxLength="50"
              autoComplete="username"
              placeholder="Введите логин (мин. 3 символа)"
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
              minLength="6"
              autoComplete="new-password"
              placeholder="Введите пароль (мин. 6 символов)"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              autoComplete="new-password"
              placeholder="Повторите пароль"
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
              minLength="4"
              maxLength="6"
              placeholder="Введите пинкод (4-6 символов)"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPinCode">Подтвердите пинкод</label>
            <input
              type="password"
              id="confirmPinCode"
              name="confirmPinCode"
              value={formData.confirmPinCode}
              onChange={handleChange}
              required
              minLength="4"
              maxLength="6"
              placeholder="Повторите пинкод"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">Роль</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="operator">Оператор</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


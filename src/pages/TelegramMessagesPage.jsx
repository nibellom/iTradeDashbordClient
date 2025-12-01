import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './TelegramMessagesPage.css';

const TelegramMessagesPage = () => {
  const [message, setMessage] = useState('');
  const [targetGroups, setTargetGroups] = useState({
    usersWithAccount: false,
    allBotUsers: false,
    usersWithoutAccount: false
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/telegram/users');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      setError('Не удалось загрузить статистику пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (group) => {
    setTargetGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!message.trim()) {
      setError('Введите текст сообщения');
      return;
    }

    const selectedGroups = Object.entries(targetGroups)
      .filter(([_, checked]) => checked)
      .map(([group]) => group);

    if (selectedGroups.length === 0) {
      setError('Выберите хотя бы одну группу получателей');
      return;
    }

    setSending(true);

    try {
      const response = await axios.post('/api/admin/telegram/send', {
        message: message.trim(),
        targetGroups: selectedGroups
      });

      if (response.data.success) {
        setResult(response.data);
        setMessage('');
        setTargetGroups({
          usersWithAccount: false,
          allBotUsers: false,
          usersWithoutAccount: false
        });
      } else {
        setError(response.data.error || 'Ошибка при отправке сообщений');
      }
    } catch (err) {
      console.error('Ошибка отправки:', err);
      setError(err.response?.data?.error || 'Ошибка при отправке сообщений');
    } finally {
      setSending(false);
    }
  };

  const selectedCount = Object.values(targetGroups).filter(Boolean).length;
  
  // Подсчитываем общее количество получателей
  // Если выбрана группа "Все пользователи бота", она включает всех остальных
  const totalRecipients = useMemo(() => {
    if (!stats) return 0;
    
    // Если выбраны "Все пользователи бота", это максимальная группа
    if (targetGroups.allBotUsers) {
      return stats.allBotUsers;
    }
    
    // Иначе суммируем выбранные группы
    // Примечание: usersWithAccount и usersWithoutAccount не пересекаются
    let count = 0;
    if (targetGroups.usersWithAccount) {
      count += stats.usersWithAccount;
    }
    if (targetGroups.usersWithoutAccount) {
      count += stats.usersWithoutAccount;
    }
    
    return count;
  }, [stats, targetGroups]);

  return (
    <div className="telegram-messages-page">
      <header className="telegram-header bybit-card">
        <div>
          <h1>Отправка сообщений через Telegram</h1>
          <p className="telegram-subtitle">Массовая рассылка сообщений пользователям бота</p>
        </div>
        <button onClick={fetchStats} className="refresh-button" disabled={loading}>
          {loading ? 'Загрузка...' : 'Обновить статистику'}
        </button>
      </header>

      {stats && (
        <div className="telegram-stats bybit-card">
          <h3>Статистика пользователей</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">С подключенным счетом</span>
              <span className="stat-value">{stats.usersWithAccount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Все пользователи бота</span>
              <span className="stat-value">{stats.allBotUsers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Без подключенного счета</span>
              <span className="stat-value">{stats.usersWithoutAccount}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="telegram-form bybit-card">
        <div className="form-section">
          <h3>Выберите получателей</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={targetGroups.usersWithAccount}
                onChange={() => handleCheckboxChange('usersWithAccount')}
              />
              <span className="checkbox-custom"></span>
              <div className="checkbox-content">
                <span className="checkbox-title">Пользователи с подключенным счетом</span>
                <span className="checkbox-description">
                  Пользователи из схемы User (telegram ID хранится в поле email)
                </span>
                {stats && (
                  <span className="checkbox-count">{stats.usersWithAccount} пользователей</span>
                )}
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={targetGroups.allBotUsers}
                onChange={() => handleCheckboxChange('allBotUsers')}
              />
              <span className="checkbox-custom"></span>
              <div className="checkbox-content">
                <span className="checkbox-title">Все пользователи бота</span>
                <span className="checkbox-description">
                  Все пользователи из схемы UserBot
                </span>
                {stats && (
                  <span className="checkbox-count">{stats.allBotUsers} пользователей</span>
                )}
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={targetGroups.usersWithoutAccount}
                onChange={() => handleCheckboxChange('usersWithoutAccount')}
              />
              <span className="checkbox-custom"></span>
              <div className="checkbox-content">
                <span className="checkbox-title">Без подключенного счета</span>
                <span className="checkbox-description">
                  Пользователи из UserBot, которых нет в User
                </span>
                {stats && (
                  <span className="checkbox-count">{stats.usersWithoutAccount} пользователей</span>
                )}
              </div>
            </label>
          </div>

          {selectedCount > 0 && (
            <div className="selected-info">
              Выбрано групп: {selectedCount} | Примерное количество получателей: {totalRecipients}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Текст сообщения</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите текст сообщения для отправки..."
            rows={8}
            className="message-textarea"
            required
          />
          <div className="textarea-footer">
            <span className="char-count">{message.length} символов</span>
            <span className="char-hint">Поддерживается HTML разметка</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="result-message">
            <div className="result-header">
              <span className="result-icon">✓</span>
              <span>{result.message}</span>
            </div>
            <div className="result-details">
              <div>Успешно отправлено: {result.results.successful}</div>
              <div>Ошибок: {result.results.failed}</div>
              {result.results.errors.length > 0 && (
                <details className="result-errors">
                  <summary>Детали ошибок ({result.results.errors.length})</summary>
                  <ul>
                    {result.results.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>
                        Chat ID {err.chatId}: {err.error}
                      </li>
                    ))}
                    {result.results.errors.length > 10 && (
                      <li>... и еще {result.results.errors.length - 10} ошибок</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="send-button"
          disabled={sending || !message.trim() || selectedCount === 0}
        >
          {sending ? 'Отправка...' : `Отправить сообщение${totalRecipients > 0 ? ` (${totalRecipients})` : ''}`}
        </button>
      </form>
    </div>
  );
};

export default TelegramMessagesPage;


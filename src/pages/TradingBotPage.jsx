import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TradingBotPage.css';

const TradingBotPage = () => {
  const [settings, setSettings] = useState({
    symbol: '',
    target: '',
    priceStart: '',
    priceStop: '',
    nickname: ''
  });
  const [statusWork, setStatusWork] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/trading-bot/settings');
      if (response.data.success) {
        setSettings({
          symbol: response.data.settings.symbol || '',
          target: response.data.settings.target || '',
          priceStart: response.data.settings.priceStart || '',
          priceStop: response.data.settings.priceStop || '',
          nickname: response.data.settings.nickname || ''
        });
        setStatusWork(response.data.settings.statusWork || '0');
      }
    } catch (err) {
      console.error('Ошибка загрузки настроек:', err);
      setError(err.response?.data?.error || 'Не удалось загрузить настройки бота');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put('/api/admin/trading-bot/settings', settings);
      if (response.data.success) {
        setSuccess('Настройки успешно обновлены');
        setSettings(response.data.settings);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      setError(err.response?.data?.error || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = statusWork === '1' ? '0' : '1';
    setToggling(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put('/api/admin/trading-bot/status', {
        statusWork: newStatus
      });
      if (response.data.success) {
        setStatusWork(newStatus);
        setSuccess(response.data.message);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
      setError(err.response?.data?.error || 'Не удалось изменить статус торговли');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="trading-bot-page">
        <div className="bybit-card">
          <div className="center-align">Загрузка настроек...</div>
        </div>
      </div>
    );
  }

  // По требованиям: если statusWork = '1' -> показываем "Начать торговлю" (устанавливает '0')
  // Если statusWork = '0' -> показываем "Остановить торговлю" (устанавливает '1')
  // Торговля активна когда statusWork = '0'
  const isTradingActive = statusWork === '0';

  return (
    <div className="trading-bot-page">
      <header className="trading-bot-header bybit-card">
        <div>
          <h1>Управление торговым ботом</h1>
          <p className="trading-bot-subtitle">Настройка параметров массовой торговли</p>
        </div>
        <div className="status-indicator">
          <span className={`status-badge status-${isTradingActive ? 'active' : 'inactive'}`}>
            {isTradingActive ? '🟢 Торговля активна' : '🔴 Торговля остановлена'}
          </span>
        </div>
      </header>

      {error && (
        <div className="error-message bybit-card">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message bybit-card">
          {success}
        </div>
      )}

      <div className="trading-bot-content">
        <form onSubmit={handleSaveSettings} className="trading-bot-form bybit-card">
          <h3>Параметры торговли</h3>
          
          <div className="form-row">
            <div className="input-field">
              <label htmlFor="symbol">Symbol (Торговая пара)</label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={settings.symbol}
                onChange={handleInputChange}
                placeholder="Например: LTCUSDT"
                required
              />
            </div>

            <div className="input-field">
              <label htmlFor="target">Target (Целевая прибыль)</label>
              <input
                type="number"
                id="target"
                name="target"
                value={settings.target}
                onChange={handleInputChange}
                placeholder="Например: 4"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-field">
              <label htmlFor="priceStart">Price Start (Цена запуска)</label>
              <input
                type="number"
                id="priceStart"
                name="priceStart"
                value={settings.priceStart}
                onChange={handleInputChange}
                placeholder="Например: 95"
                step="0.01"
                required
              />
            </div>

            <div className="input-field">
              <label htmlFor="priceStop">Price Stop (Цена остановки)</label>
              <input
                type="number"
                id="priceStop"
                name="priceStop"
                value={settings.priceStop}
                onChange={handleInputChange}
                placeholder="Например: 120"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-field">
              <label htmlFor="nickname">Nickname (Трейдер)</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={settings.nickname}
                onChange={handleInputChange}
                placeholder="Например: ag"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </div>
        </form>

        <div className="trading-bot-controls bybit-card">
          <h3>Управление торговлей</h3>
          <p className="control-description">
            {isTradingActive
              ? 'Торговля в данный момент активна. Нажмите кнопку, чтобы остановить торговлю.'
              : 'Торговля остановлена. Нажмите кнопку, чтобы начать торговлю.'}
          </p>
          <button
            onClick={handleToggleStatus}
            className={`toggle-button ${isTradingActive ? 'stop' : 'start'}`}
            disabled={toggling}
          >
            {toggling
              ? 'Обработка...'
              : isTradingActive
              ? '⛔ Остановить торговлю'
              : '🚀 Начать торговлю'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingBotPage;


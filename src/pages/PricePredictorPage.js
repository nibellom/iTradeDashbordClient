// src/pages/PricePredictorPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import M from 'materialize-css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const PricePredictorPage = () => {
  const [symbol, setSymbol] = useState('LTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [limit, setLimit] = useState(200);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Инициализация Materialize компонентов
  useEffect(() => {
    M.AutoInit();
    const selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems);
  }, []);

  const predict = async () => {
    // Валидация ввода
    if (!symbol.match(/^[A-Z0-9]+$/)) {
      setError('Неверный формат торговой пары (например, LTCUSDT)');
      M.toast({ html: 'Неверный формат торговой пары', classes: 'red' });
      return;
    }
    if (!['1h', '1d', '1w', '1M'].includes(interval)) {
      setError('Неверный интервал времени');
      M.toast({ html: 'Неверный интервал времени', classes: 'red' });
      return;
    }
    if (isNaN(limit) || limit <= 0 || limit > 10000 || !Number.isInteger(Number(limit))) {
      setError('Лимит должен быть целым числом от 1 до 10000');
      M.toast({ html: 'Неверный лимит', classes: 'red' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/predict-price-prob', {
        symbol,
        interval,
        limit,
      });
      setResult(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка сервера';
      setError(errorMsg);
      M.toast({ html: `Ошибка: ${errorMsg}`, classes: 'red' });
    }
    setLoading(false);
  };

  // Данные для гистограммы распределения цен
  const chartData = result?.histogram
    ? {
        labels: result.histogram.labels,
        datasets: [
          {
            label: `Распределение цен закрытия (${interval === '1d' ? 'день' : interval === '1' ? 'час' : 'месяц'})`,
            data: result.histogram.values,
            backgroundColor: 'rgba(0, 150, 136, 0.5)', // Teal color from Materialize
            borderColor: 'rgba(0, 150, 136, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="row">
      <div className="col s12">
        <h3 className="teal-text">Прогноз движения цены</h3>
        <div className="card price-predictor-card">
          <div className="card-content">
            <div className="row">
              <div className="input-field col s12 m4">
                <input
                  id="symbol"
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
                <label htmlFor="symbol" className="active">Торговая пара (например, LTCUSDT)</label>
              </div>
              <div className="input-field col s12 m4">
                <select
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                >
                  <option value="1h">1 час</option>
                  <option value="1d">1 день</option>
                  <option value="1w">1 неделя</option>
                  <option value="1M">1 месяц</option>
                </select>
                <label htmlFor="interval">Интервал времени</label>
              </div>
              <div className="input-field col s12 m4">
                <input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
                <label htmlFor="limit" className="active">Лимит свечей (1-10000)</label>
              </div>
            </div>
            <button
              className={`btn waves-effect waves-light teal ${loading ? 'disabled' : ''}`}
              onClick={predict}
            >
              {loading ? 'Загрузка...' : 'Прогнозировать'}
            </button>
            {error && <p className="red-text">{error}</p>}
            {result && (
              <div className="row mt-4 prediction-block">
                <div className="col s12">
                  <h5 className="prediction-title">Прогноз для {result.symbol}</h5>
                  <ul className="collection">
                    <li className="collection-item">Средняя цена закрытия: {result.mean}</li>
                    <li className="collection-item">Стандартное отклонение цены: {result.std}</li>
                  </ul>
                </div>
                {chartData && (
                  <div className="col s12">
                    <h5>Распределение цен закрытия</h5>
                    <div className="card-panel">
                      <Bar
                        data={chartData}
                        options={{
                          scales: {
                            x: { title: { display: true, text: 'Ценовой диапазон (USDT)' } },
                            y: { title: { display: true, text: 'Частота' } },
                          },
                          plugins: {
                            legend: { display: true },
                            tooltip: { enabled: true },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="grey-text text-darken-1">
          Примечание: Прогнозы основаны на исторических данных и не гарантируют будущих результатов.
        </p>
      </div>
    </div>
  );
};

export default PricePredictorPage;
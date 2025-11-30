import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const formatUsdt = (value = 0) =>
  value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const MetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          axios.get('/api/admin/metrics'),
          axios.get('/api/admin/metrics/history?limit=60')
        ]);

        setMetrics(currentRes.data.metrics);
        setHistory(historyRes.data.history || []);
      } catch (err) {
        console.error('Ошибка загрузки метрик:', err);
        setError(err.response?.data?.error || 'Не удалось загрузить метрики');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const chartData = useMemo(() => {
    if (!history.length) return null;

    const labels = history.map(({ recordedAt }) =>
      new Date(recordedAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    return {
      labels,
      datasets: [
        {
          label: 'AUM (USDT)',
          data: history.map((item) => item.totalManagedFunds),
          borderColor: '#fcd535',
          backgroundColor: 'rgba(252, 213, 53, 0.15)',
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          label: 'Активные клиенты',
          data: history.map((item) => item.activeClients),
          borderColor: '#00d1b2',
          backgroundColor: 'rgba(0, 209, 178, 0.2)',
          tension: 0.35,
          yAxisID: 'y1'
        },
        {
          label: 'Bot пользователи',
          data: history.map((item) => item.totalBotUsers),
          borderColor: '#4f9eff',
          backgroundColor: 'rgba(79, 158, 255, 0.2)',
          tension: 0.35,
          yAxisID: 'y1'
        }
      ]
    };
  }, [history]);

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#f5f5f5' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            if (context.datasetIndex === 0) {
              return `${context.dataset.label}: ${value.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} USDT`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#c9d1d9' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        position: 'left',
        ticks: {
          color: '#c9d1d9',
          callback: (value) => `${value / 1000}k`
        },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      y1: {
        position: 'right',
        ticks: { color: '#c9d1d9' },
        grid: { display: false }
      }
    }
  };

  const monthlyProfitChart = useMemo(() => {
    const series = metrics?.monthlyProfitSeries || [];
    if (!series.length) return null;
    const labels = series.map((item) => item.label);
    return {
      labels,
      datasets: [
        {
          label: 'Средняя прибыль на клиента',
          data: series.map((item) => item.avgClientProfit),
          borderColor: '#fcd535',
          backgroundColor: 'rgba(252, 213, 53, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [metrics]);

  const monthlyTotalProfitChart = useMemo(() => {
    const series = metrics?.monthlyProfitSeries || [];
    if (!series.length) return null;
    const labels = series.map((item) => item.label);
    return {
      labels,
      datasets: [
        {
          label: 'Суммарная прибыль за месяц',
          data: series.map((item) => item.totalProfit),
          borderColor: '#00d1b2',
          backgroundColor: 'rgba(0, 209, 178, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [metrics]);

  const profitChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#f5f5f5' } },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatUsdt(context.raw)} USDT`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#c9d1d9' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: {
          color: '#c9d1d9',
          callback: (value) => `${value / 1000}k`
        },
        grid: { color: 'rgba(255,255,255,0.08)' }
      }
    }
  };

  const kpis = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: 'Средний баланс клиента',
        value: `${formatUsdt(metrics.avgBalancePerClient)} USDT`,
        description: 'Средний объём средств на клиента с активной торговлей.'
      },
      {
        label: 'Доля рефералов',
        value: `${metrics.referralSharePct}%`,
        description: 'Процент пользователей бота, пришедших по рефералам.'
      },
      {
        label: 'AUM на пользователя бота',
        value: `${formatUsdt(metrics.fundsPerBotUser)} USDT`,
        description: 'Сколько средств в среднем приходится на одного пользователя бота.'
      },
      {
        label: 'Конверсия бота в трейдинг',
        value: `${metrics.clientToBotConversionPct}%`,
        description: 'Доля пользователей бота, которые стали активными клиентами.'
      },
      {
        label: 'Прибыль за последний месяц',
        value: `${formatUsdt(metrics.lastMonthProfit)} USDT`,
        description: 'Сумма подтверждённых транзакций (flag=1) за последний месяц.'
      },
      {
        label: 'Средняя прибыль на клиента (последний месяц)',
        value: `${formatUsdt(metrics.avgClientProfitLastMonth)} USDT`,
        description: 'Последняя месячная прибыль, делённая на активных клиентов.'
      },
      {
        label: 'Общая прибыль за всё время',
        value: `${formatUsdt(metrics.totalProfitAllTime)} USDT`,
        description: 'Накопленная прибыль по всем подтверждённым переводам.'
      }
    ];
  }, [metrics]);

  if (loading) {
    return <div className="bybit-card bybit-card--center">Загрузка метрик...</div>;
  }

  if (error) {
    return <div className="bybit-card bybit-card--error">{error}</div>;
  }

  return (
    <div className="metrics-page">
      <header className="metrics-hero bybit-card">
        <div>
          <p className="metrics-hero__eyebrow">Bybit style overview</p>
          <h1>Ключевые метрики проекта</h1>
          <p>Следим за динамикой AUM, клиентской базы и конверсией каналов привлечения.</p>
        </div>
        {metrics && (
          <div className="metrics-hero__value">
            <span>Общий AUM</span>
            <strong>{formatUsdt(metrics.totalManagedFunds)} USDT</strong>
            <small>Обновлено: {new Date(metrics.recordedAt).toLocaleString('ru-RU')}</small>
          </div>
        )}
      </header>

      {metrics && (
        <section className="metrics-grid">
          <article className="bybit-card">
            <p className="card-label">Активные клиенты</p>
            <h2>{metrics.activeClients}</h2>
            <p className="card-subtitle">Торгуют прямо сейчас (startTrading = 1)</p>
          </article>
          <article className="bybit-card">
            <p className="card-label">Пользователи бота</p>
            <h2>{metrics.totalBotUsers}</h2>
            <p className="card-subtitle">Все зарегистрированные в UserBot</p>
          </article>
          <article className="bybit-card">
            <p className="card-label">Реферальные пользователи</p>
            <h2>{metrics.referralBotUsers}</h2>
            <p className="card-subtitle">refId ≠ 0</p>
          </article>
          <article className="bybit-card">
            <p className="card-label">Средний баланс</p>
            <h2>{formatUsdt(metrics.avgBalancePerClient)} USDT</h2>
            <p className="card-subtitle">Среднее значение депозита активных клиентов</p>
          </article>
        </section>
      )}

      {chartData && (
        <section className="bybit-card chart-card">
          <div className="chart-card__header">
            <div>
              <p className="card-label">Динамика показателей</p>
              <h2>История AUM и базы пользователей</h2>
            </div>
            <span>Период: {history.length} точек</span>
          </div>
          <Line data={chartData} options={chartOptions} />
        </section>
      )}

      {monthlyProfitChart && (
        <section className="bybit-card chart-card">
          <div className="chart-card__header">
            <div>
              <p className="card-label">Прибыль на клиента</p>
              <h2>Средняя прибыль по месяцам</h2>
            </div>
            <span>Шаг: 1 месяц</span>
          </div>
          <Line data={monthlyProfitChart} options={profitChartOptions} />
        </section>
      )}

      {monthlyTotalProfitChart && (
        <section className="bybit-card chart-card">
          <div className="chart-card__header">
            <div>
              <p className="card-label">Суммарная прибыль</p>
              <h2>История месячной прибыли проекта</h2>
            </div>
            <span>Шаг: 1 месяц</span>
          </div>
          <Line data={monthlyTotalProfitChart} options={profitChartOptions} />
        </section>
      )}

      {kpis.length > 0 && (
        <section className="kpi-grid">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="bybit-card kpi-card">
              <p className="card-label">{kpi.label}</p>
              <h3>{kpi.value}</h3>
              <p className="card-subtitle">{kpi.description}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default MetricsPage;


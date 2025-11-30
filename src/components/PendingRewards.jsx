import React, { useState, useEffect } from 'react';
import 'materialize-css/dist/css/materialize.min.css';
import axios from 'axios';

const PendingRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-rewards');
      setRewards(res.data.rewards);
    } catch (err) {
      alert('Ошибка загрузки вознаграждений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handlePaid = async (id) => {
    if (!window.confirm('Отметить вознаграждение как оплаченное?')) return;

    try {
      await axios.post('/api/admin/mark-reward-paid', { rewardId: id });
      setRewards(prev => prev.filter(r => r._id !== id));
      alert('Вознаграждение отмечено как оплаченное');
    } catch (err) {
      alert('Ошибка на сервере');
    }
  };

  if (loading) return <div className="container center-align">Загрузка...</div>;

  return (
    <div className="container">
      <h4 className="center-align" style={{ margin: '30px 0', fontWeight: 600 }}>
        Ожидающие реферальные вознаграждения
      </h4>

      {rewards.length === 0 ? (
        <div className="center-align grey-text text-lighten-1">Нет ожидающих выплат</div>
      ) : (
        <div className="row">
          {rewards.map(r => (
            <div key={r._id} className="col s12" style={{ marginBottom: '20px' }}>
              <div className="card blue-grey darken-1 hoverable">
                <div className="card-content white-text">
                  <span className="card-title" style={{ fontSize: '1.4rem' }}>
                    Реферал: {r.refEmail}
                  </span>

                  <div className="row" style={{ marginBottom: 0 }}>
                    <div className="col s12 m6">
                      <p><strong>От пользователя:</strong> {r.userEmail}</p>
                      <p><strong>Сумма депозита:</strong> <span className="green-text text-lighten-2">{r.depositAmount} USDT</span></p>
                      <p><strong>Вознаграждение:</strong> <span className="yellow-text text-lighten-2">{r.rewardAmount} USDT</span></p>
                    </div>
                    <div className="col s12 m6">
                      {r.refBybitUID && <p><strong>Bybit UID:</strong> {r.refBybitUID}</p>}
                      <p><strong>Дата:</strong> {new Date(r.date).toLocaleString()}</p>
                      <p><strong>ID транзакции:</strong> <span className="truncate" title={r.transactionId?._id}>{r.transactionId?._id || '—'}</span></p>
                    </div>
                  </div>

                  <div className="card-action" style={{ padding: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => handlePaid(r._id)}
                      className="btn green lighten-1 waves-effect waves-light"
                    >
                      Оплачено
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRewards;
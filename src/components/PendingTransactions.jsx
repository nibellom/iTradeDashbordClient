// client/src/components/admin/PendingTransactions.jsx
import React, { useState, useEffect } from 'react';
import 'materialize-css/dist/css/materialize.min.css';
import axios from 'axios';

const PendingTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-transactions');
      setTransactions(res.data.transactions);
    } catch (err) {
      alert('Ошибка загрузки транзакций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, type) => {
    const action = type === 'confirm' ? 'подтвердить' : 'отклонить';
    const confirmed = window.confirm(
      `Вы уверены, что хотите ${action} перевод?\n\n` +
      (type === 'confirm'
        ? 'Депозит останется на счету.'
        : 'Сумма будет вычтена из депозита.')
    );

    if (!confirmed) return;

    const endpoint =
      type === 'confirm'
        ? '/api/admin/confirm-transaction'
        : '/api/admin/reject-transaction';

    try {
      await axios.post(endpoint, { transactionId: id });
      setTransactions(prev => prev.filter(t => t._id !== id));
      alert(type === 'confirm' ? 'Перевод подтверждён' : 'Перевод отклонён');
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка на сервере');
    }
  };

  if (loading) return <div className="container center-align">Загрузка...</div>;

  return (
    <div className="container">
      <h4 className="center-align" style={{ margin: '30px 0', fontWeight: 600 }}>
        Депозиты ожидающие подтверждения
      </h4>

      {transactions.length === 0 ? (
        <div className="center-align grey-text text-lighten-1">Нет ожидающих транзакций</div>
      ) : (
        <div className="row">
          {transactions.map(t => (
            <div key={t._id} className="col s12" style={{ marginBottom: '20px' }}>
              <div className="card blue-grey darken-1 hoverable">
                <div className="card-content white-text">
                  <span className="card-title" style={{ fontSize: '1.4rem' }}>
                    {t.email}
                  </span>

                  <div className="row" style={{ marginBottom: 0 }}>
                    <div className="col s12 m6">
                      <p><strong>Сумма:</strong> <span className="green-text text-lighten-2">{t.quantity} USDT</span> USDT</p>
                      <p><strong>Дата:</strong> {new Date(t.date).toLocaleString()}</p>
                    </div>
                    <div className="col s12 m6">
                      {t.nic && <p><strong>Ник:</strong> {t.nic}</p>}
                      <p>
                        <strong>ID:</strong>{' '}
                        <span className="truncate" style={{ maxWidth: '180px', display: 'inline-block' }} title={t._id}>
                          {t._id}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="card-action" style={{ padding: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => handleAction(t._id, 'confirm')}
                      className="btn green lighten-1 waves-effect waves-light"
                      style={{ marginRight: '12px' }}
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => handleAction(t._id, 'reject')}
                      className="btn red lighten-1 waves-effect waves-light"
                    >
                      Не получен
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

export default PendingTransactions;
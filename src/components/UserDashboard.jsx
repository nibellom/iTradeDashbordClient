import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'materialize-css/dist/css/materialize.min.css';
import BuyOrderForm from './BuyOrderForm';
import SellOffsetOrderForm from './SellOffsetOrderForm';
import OrderTabsCard from './OrderTabsCard'

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealsMap, setDealsMap] = useState({}); // email => сделки
  const [loadingDealsMap, setLoadingDealsMap] = useState({}); // email => загрузка сделок
  const [cancelSymbolsMap, setCancelSymbolsMap] = useState({}); // email => введённый символ

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/bybit-balances');
        const data = response.data;
        
        // Убеждаемся, что data является массивом
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Ожидался массив, получен:', data);
          setUsers([]);
          setError('Неверный формат данных от сервера');
        }
      } catch (err) {
        console.error('Ошибка загрузки баланса:', err);
        setError(err.response?.data?.error || 'Ошибка загрузки данных');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCancelAllBySymbol = async (email) => {
    const symbol = cancelSymbolsMap[email];
    if (!symbol) return;
  
    const confirmed = window.confirm(`Снять все заявки по инструменту ${symbol}?`);
    if (!confirmed) return;
  
    try {
      const res = await axios.post('/api/bybit-cancel-all', { email, symbol });
      const data = res.data;
  
      if (data.success) {
        alert(`✅ Все заявки по ${symbol} сняты`);
        await refreshUserData(email);
      } else {
        alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка сети при снятии заявок: ' + (err.response?.data?.error || err.message));
    }
  };
  

  const handleShowDeals = async (email) => {
    setLoadingDealsMap(prev => ({ ...prev, [email]: true }));
    try {
      const res = await axios.get(`/api/bybit-deals?email=${email}`);
      const rawData = res.data;

      if (Array.isArray(rawData)) {
        const parsedDeals = rawData.map(d => ({
          time: parseInt(d.execTime),
          symbol: d.symbol,
          side: d.side,
          price: d.execPrice,
          qty: d.execQty,
        }));

        setDealsMap(prev => ({ ...prev, [email]: parsedDeals.slice(0, 10) })); // максимум 10 сделок
      } else {
        setDealsMap(prev => ({ ...prev, [email]: [] }));
      }
    } catch (err) {
      console.error('Ошибка загрузки сделок:', err);
      setDealsMap(prev => ({ ...prev, [email]: [] }));
    } finally {
      setLoadingDealsMap(prev => ({ ...prev, [email]: false }));
    }
  };

  const handleCancelOrder = async (email, orderId, symbol) => {
    if (!window.confirm('Отменить эту заявку?')) return;

    try {
      const res = await axios.post('/api/bybit-cancel-order', { email, orderId, symbol });
      const data = res.data;

      if (data.success) {
        alert('✅ Заявка отменена');
        await refreshUserData(email);
      } else {
        alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка сети: ' + (err.response?.data?.error || err.message));
    }
  };

  const refreshUserData = async (email) => {
    try {
      const res = await axios.get(`/api/bybit-user-balance/${email}`);
      const updated = res.data;

      setUsers(prev =>
        prev.map(user => (user.email === email ? updated : user))
      );
    } catch (err) {
      console.error('Ошибка при обновлении пользователя:', err);
    }
  };

  if (loading) return <div className="center-align">Загрузка балансов...</div>;

  if (error) {
    return (
      <div className="bybit-card bybit-card--error">
        <p>Ошибка: {error}</p>
        <button onClick={() => window.location.reload()} className="auth-button" style={{ marginTop: '16px' }}>
          Обновить страницу
        </button>
      </div>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="bybit-card bybit-card--center">
        <p>Нет пользователей для отображения</p>
      </div>
    );
  }

  return (
    // <div className="container">
      
      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {users.map((user, index) => {
          const userDeals = dealsMap[user.email] || [];
          const loadingDeals = loadingDealsMap[user.email];

          return (
            <div className="col s12 m6 l4" key={index} style={{ marginBottom: '20px' }}>
              <div className="card blue-grey darken-1 hoverable" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="card-content white-text" style={{ flexGrow: 1 }}>
                  <span className="card-title">{user.email}</span>
                  <p><strong>Идентификатор:</strong> {user.phon}</p>
                  
                  <p><strong>Депозит:</strong> {user.depozit} USDT</p>
                  {user.error ? (
                    <p className="red-text text-lighten-2">Ошибка: {user.error}</p>
                  ) : (
                    <>
                      <p><strong>Общий баланс:</strong> {Number(user.balance.result.list?.[0]?.totalEquity || 0).toFixed(4)} USDT</p>
                      
                      <p style={{ marginTop: '20px' }}><strong>Позиции:</strong></p>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '10px' }}>
                        <ul>
                            {user.balance.result.list?.[0]?.coin?.map((coin, i) => (
                            <li key={i}>{coin.coin}: {coin.walletBalance}</li>
                            )) || <li>Нет данных</li>}
                        </ul>
                      </div>

                      <div className="card-action"></div>
                      {user.openOrders && user.openOrders.length > 0 ? (
                        <>
                          <p><strong>Открытые ордера:</strong></p>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="striped white-text">
                              <thead>
                                <tr>
                                  <th>Контракт</th>
                                  <th>Направление</th>
                                  <th>Цена</th>
                                  <th>Объём</th>
                                  <th>ID</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {user.openOrders.map((order, i) => (
                                  <tr key={i}>
                                    <td>{order.symbol}</td>
                                    <td>{order.side}</td>
                                    <td>{order.price}</td>
                                    <td>{order.qty}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.orderId}>
                                      {order.orderId}
                                    </td>
                                    <td>
                                      <button
                                        className="btn red lighten-1 btn-small"
                                        onClick={() => handleCancelOrder(user.email, order.orderId, order.symbol)}
                                      >
                                        ❌
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className="grey-text">Нет открытых ордеров</p>
                      )}
                    </>
                  )}

                  <button
                    className="btn blue lighten-1"
                    style={{ marginTop: '20px' }}
                    onClick={() => handleShowDeals(user.email)}
                    disabled={loadingDeals}
                  >
                    {loadingDeals ? 'Загрузка...' : 'Сделки'}
                  </button>

                  {/* 🟡 Выводим сделки прямо под кнопкой */}
                  {userDeals.length > 0 && (
                    <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '10px' }}>
                      <table className="striped white-text">
                        <thead>
                          <tr>
                            <th>Время</th>
                            <th>Символ</th>
                            <th>Сторона</th>
                            <th>Цена</th>
                            <th>Объём</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDeals.map((d, i) => (
                            <tr key={i}>
                              <td>{new Date(d.time).toLocaleString()}</td>
                              <td>{d.symbol}</td>
                              <td>{d.side}</td>
                              <td>{d.price}</td>
                              <td>{d.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Токен"
                    value={cancelSymbolsMap[user.email] || ''}
                    onChange={(e) =>
                    setCancelSymbolsMap(prev => ({ ...prev, [user.email]: e.target.value }))
                    }
                    style={{ flex: 1, backgroundColor: 'white', paddingLeft: '10px', borderRadius: '4px' }}
                />
                <button
                    className="btn red lighten-2"
                    onClick={() => handleCancelAllBySymbol(user.email)}
                    disabled={!cancelSymbolsMap[user.email]}
                >
                    Снять все
                </button>
                </div>
                </div>

                <OrderTabsCard email={user.email} refreshUserData={refreshUserData} />

                {/* <div className="card-action">
                  <BuyOrderForm 
                    email={user.email}
                    refreshUserData={refreshUserData}
                   />
                  
                </div>

                <div className="card-action">
                  <SellOffsetOrderForm 
                    email={user.email}
                    refreshUserData={refreshUserData}
                   />
                  
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    // </div>
  );
};

export default UserDashboard;

import React, { useState } from 'react';
import axios from 'axios';

const BuyOrderForm = ({ email, refreshUserData }) => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [message, setMessage] = useState('');

  const handleBuy = async () => {
    if (!symbol || !price || !qty) {
      setMessage('Заполните все поля');
      return;
    }

    try {
      const response = await axios.post('/api/bybit-buy-order', {
        email,
        symbol,
        price,
        qty,
      });

      if (response.data.success) {
        setMessage('Ордер успешно выставлен');
        setSymbol('');
        setPrice('');
        setQty('');
        alert('✅ Ордер успешно выставлен')
        await refreshUserData(email);
      } else {
        setMessage('Ошибка при создании ордера');
      }
    } catch (error) {
      console.error(error);
      setMessage('Ошибка сервера при создании ордера');
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h5 className="white-text">Выставить лимитный ордер на покупку</h5>
      <div className="input-field">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Например: BTCUSDT"
          style={{ color: '#f4f5f7' }}
        />
        <label className="active">Символ</label>
      </div>
      <div className="input-field">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена"
          style={{ color: '#f4f5f7' }}
        />
        <label className="active">Цена</label>
      </div>
      <div className="input-field">
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Объём"
          style={{ color: '#f4f5f7' }}
        />
        <label className="active">Объём</label>
      </div>
      <button className="btn green" onClick={handleBuy}>+ Купить</button>
      {message && <p className="white-text" style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default BuyOrderForm;

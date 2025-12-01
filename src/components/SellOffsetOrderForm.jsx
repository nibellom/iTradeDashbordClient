import React, { useState } from 'react';
import axios from 'axios';

const SellOffsetOrderForm = ({ email, refreshUserData }) => {
  const [symbol, setSymbol] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [qty, setQty] = useState('');
  const [message, setMessage] = useState('');

  const handleSell = async () => {
    if (!symbol || !entryPrice || !sellPrice || !qty) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const profit = ((parseFloat(sellPrice) - parseFloat(entryPrice)) * parseFloat(qty)).toFixed(2);

    try {
      const response = await axios.post('/api/sell-offset', {
        email,
        symbol,               
        price: sellPrice,     
        qty,                  
        priceIn: entryPrice,  
        flag: '0',
        flagMessage: '0'
      });

      setMessage('✅ Заявка на продажу успешно отправлена');
      setSymbol('');
      setEntryPrice('');
      setSellPrice('');
      setQty('');
      await refreshUserData(email);
    } catch (error) {
      console.error('Ошибка при отправке заявки на продажу:', error);
      setMessage('❌ Ошибка при отправке заявки');
    }
  };

  return (
    <div className="card blue-grey darken-1 white-text">
      <div className="card-content">
        <span className="card-title">[–] Офсетная продажа</span>
        <div className="input-field">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Название контракта"
            style={{ color: '#f4f5f7' }}
          />
        </div>
        <div className="input-field">
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="Цена входа"
            style={{ color: '#f4f5f7' }}
          />
        </div>
        <div className="input-field">
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="Цена продажи"
            style={{ color: '#f4f5f7' }}
          />
        </div>
        <div className="input-field">
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Объем"
            style={{ color: '#f4f5f7' }}
          />
        </div>
        <button className="btn red" onClick={handleSell}>
          Продать
        </button>
        {message && <p className="white-text" style={{ marginTop: '10px' }}>{message}</p>}
      </div>
    </div>
  );
};

export default SellOffsetOrderForm;

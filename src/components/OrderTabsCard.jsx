import React, { useState } from 'react';
import BuyOrderForm from './BuyOrderForm';
import SellOffsetOrderForm from './SellOffsetOrderForm';

const OrderTabsCard = ({ email, refreshUserData }) => {
  const [activeTab, setActiveTab] = useState('buy');

  const tabStyle = (tab) => {
    const isActive = activeTab === tab;
    let backgroundColor = '#424242'; // default dark gray
    if (isActive) {
      backgroundColor = tab === 'buy' ? '#2e7d32' : '#c62828'; // green or red
    }
    return {
      backgroundColor,
      color: 'white',
      fontWeight: 'bold',
      padding: '10px',
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: '5px 5px 0 0',
    };
  };

  return (
    <div className="card blue-grey darken-1 hoverable" style={{ marginBottom: '20px' }}>
      <div className="card-content white-text">
        {/* <span className="card-title">Ордер</span> */}

        <div className="row" style={{ marginBottom: '0' }}>
          <div className="col s6" onClick={() => setActiveTab('buy')}>
            <div style={tabStyle('buy')}>Покупка</div>
          </div>
          <div className="col s6" onClick={() => setActiveTab('sell')}>
            <div style={tabStyle('sell')}>Продажа</div>
          </div>
        </div>

        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col s12">
            {activeTab === 'buy' ? (
              <BuyOrderForm email={email} refreshUserData={refreshUserData} />
            ) : (
              <SellOffsetOrderForm email={email} refreshUserData={refreshUserData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTabsCard;

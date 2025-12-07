import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AppNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      try {
        setEmployee(JSON.parse(employeeData));
      } catch (e) {
        console.error('Error parsing employee data:', e);
      }
    }
  }, []);

  const handleNavToggle = () => setMenuOpen((prev) => !prev);
  const handleLinkClick = () => {
    setMenuOpen(false);
    setAdminMenuOpen(false);
  };

  const handleAdminToggle = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      setAdminMenuOpen(!adminMenuOpen);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setEmployee(null);
    navigate('/login');
  };

  return (
    <nav className="bybit-nav">
      <div className="nav-wrapper container bybit-nav__inner">
        <Link to="/" className="brand-logo bybit-logo" onClick={handleLinkClick}>
          Dashboard
        </Link>
        <button
          className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={handleNavToggle}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`bybit-nav__links ${menuOpen ? 'is-open' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={handleLinkClick}>Dashboard</Link></li>
          <li><Link to="/predictor" className="nav-link" onClick={handleLinkClick}>Price Predictor</Link></li>
          {employee && employee.role === 'admin' && (
            <li><Link to="/trading-bot" className="nav-link" onClick={handleLinkClick}>Trading Bot</Link></li>
          )}
          <li 
            className="nav-admin-menu"
            onMouseEnter={() => setAdminMenuOpen(true)}
            onMouseLeave={() => setAdminMenuOpen(false)}
          >
            <span 
              className="nav-link nav-link--dropdown"
              onClick={handleAdminToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAdminToggle(e);
                }
              }}
            >
              Admin
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className={`admin-dropdown-arrow ${adminMenuOpen ? 'is-open' : ''}`}
                style={{ marginLeft: '6px', display: 'inline-block' }}
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <ul className={`nav-admin-dropdown ${adminMenuOpen ? 'is-open' : ''}`}>
              <li><Link to="/metrics" className="nav-dropdown-link" onClick={handleLinkClick}>Metrics</Link></li>
              <li><Link to="/transactions" className="nav-dropdown-link" onClick={handleLinkClick}>Transactions</Link></li>
              <li><Link to="/rewards" className="nav-dropdown-link" onClick={handleLinkClick}>Rewards</Link></li>
              {employee && employee.role === 'admin' && (
                <>
                  <li><Link to="/employees" className="nav-dropdown-link" onClick={handleLinkClick}>Employees</Link></li>
                  <li><Link to="/telegram-messages" className="nav-dropdown-link" onClick={handleLinkClick}>Telegram Messages</Link></li>
                </>
              )}
            </ul>
          </li>
          {employee && (
            <li className="nav-user-menu">
              <div className="nav-user-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="nav-user-dropdown">
                <div className="nav-user-dropdown-header">
                  <div className="nav-user-dropdown-name">{employee.login}</div>
                  <div className="nav-user-dropdown-role">{employee.role}</div>
                </div>
                <button onClick={handleLogout} className="nav-user-dropdown-logout">
                  Выход
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default AppNav;


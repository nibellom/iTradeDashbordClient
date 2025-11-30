import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeesPage.css';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const roleLabels = {
    admin: 'Администратор',
    manager: 'Менеджер',
    operator: 'Оператор'
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/employees');
      if (response.data.success) {
        setEmployees(response.data.employees);
      } else {
        setError('Не удалось загрузить список сотрудников');
      }
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);
      if (err.response?.status === 403) {
        setError('У вас нет прав доступа к этой странице');
      } else {
        setError(err.response?.data?.error || 'Ошибка загрузки сотрудников');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (employeeId, newRole) => {
    if (!window.confirm(`Изменить роль сотрудника на "${roleLabels[newRole]}"?`)) {
      return;
    }

    setUpdating(prev => ({ ...prev, [employeeId]: true }));

    try {
      const response = await axios.put(`/api/admin/employees/${employeeId}/role`, {
        role: newRole
      });

      if (response.data.success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp._id === employeeId
              ? { ...emp, role: response.data.employee.role }
              : emp
          )
        );
      } else {
        alert('Ошибка: ' + (response.data.error || 'Не удалось изменить роль'));
      }
    } catch (err) {
      console.error('Ошибка изменения роли:', err);
      alert('Ошибка: ' + (err.response?.data?.error || 'Не удалось изменить роль'));
    } finally {
      setUpdating(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleStatusToggle = async (employeeId, currentStatus) => {
    const action = currentStatus ? 'деактивировать' : 'активировать';
    if (!window.confirm(`Вы уверены, что хотите ${action} этого сотрудника?`)) {
      return;
    }

    setUpdating(prev => ({ ...prev, [employeeId]: true }));

    try {
      const response = await axios.put(`/api/admin/employees/${employeeId}/status`);

      if (response.data.success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp._id === employeeId
              ? { ...emp, isActive: response.data.employee.isActive }
              : emp
          )
        );
      } else {
        alert('Ошибка: ' + (response.data.error || 'Не удалось изменить статус'));
      }
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
      alert('Ошибка: ' + (err.response?.data?.error || 'Не удалось изменить статус'));
    } finally {
      setUpdating(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge role-badge--admin';
      case 'manager':
        return 'role-badge role-badge--manager';
      case 'operator':
        return 'role-badge role-badge--operator';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="bybit-card bybit-card--center">
        <p>Загрузка сотрудников...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bybit-card bybit-card--error">
        <p>{error}</p>
        <button onClick={fetchEmployees} className="auth-button" style={{ marginTop: '16px' }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <header className="employees-header bybit-card">
        <div>
          <h1>Управление сотрудниками</h1>
          <p className="employees-subtitle">Назначение ролей и управление доступом</p>
        </div>
        <button onClick={fetchEmployees} className="refresh-button">
          Обновить
        </button>
      </header>

      <div className="employees-grid">
        {employees.map((employee) => (
          <div
            key={employee._id}
            className={`employee-card bybit-card ${!employee.isActive ? 'employee-card--inactive' : ''}`}
          >
            <div className="employee-card-header">
              <div className="employee-info">
                <h3 className="employee-login">{employee.login}</h3>
                <span className={getRoleBadgeClass(employee.role)}>
                  {roleLabels[employee.role]}
                </span>
              </div>
              <div className={`employee-status ${employee.isActive ? 'active' : 'inactive'}`}>
                {employee.isActive ? 'Активен' : 'Неактивен'}
              </div>
            </div>

            <div className="employee-details">
              <div className="employee-detail-item">
                <span className="detail-label">Дата регистрации:</span>
                <span className="detail-value">
                  {new Date(employee.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {employee.lastLogin && (
                <div className="employee-detail-item">
                  <span className="detail-label">Последний вход:</span>
                  <span className="detail-value">
                    {new Date(employee.lastLogin).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
            </div>

            <div className="employee-actions">
              <div className="role-selector">
                <label htmlFor={`role-${employee._id}`}>Роль:</label>
                <select
                  id={`role-${employee._id}`}
                  value={employee.role}
                  onChange={(e) => handleRoleChange(employee._id, e.target.value)}
                  disabled={updating[employee._id]}
                  className="role-select"
                >
                  <option value="operator">Оператор</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <button
                onClick={() => handleStatusToggle(employee._id, employee.isActive)}
                disabled={updating[employee._id]}
                className={`status-toggle-btn ${employee.isActive ? 'deactivate' : 'activate'}`}
              >
                {updating[employee._id]
                  ? '...'
                  : employee.isActive
                  ? 'Деактивировать'
                  : 'Активировать'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="bybit-card bybit-card--center">
          <p>Нет зарегистрированных сотрудников</p>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;


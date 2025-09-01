import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, token, linkCode } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleConnectTelegram = () => {
    const code = linkCode || 'demo-code-1234';
    const botUsername = 'my_bot_Trenchp1413bot';
    const url = `https://t.me/${botUsername}?start=${encodeURIComponent(code)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const userData = dashboardData?.user || user;
  const transactions = dashboardData?.transactions || [];

  return (
    <div>
      <header className="header">
        <div style={{fontWeight: 700}}>Redwood Bank</div>
        <div className="nav-links">
          <Link to="/zelle">Zelle</Link>
          <Link to="/mobile-deposit">Mobile Deposit</Link>
          <Link to="/bill-pay">Bill Pay</Link>
          <button onClick={logout} className="btn secondary">Sign out</button>
        </div>
      </header>
      
      <main className="container">
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <div style={{color: '#6b7280', fontSize: '13px'}}>Welcome</div>
              <div style={{fontWeight: 700, fontSize: '18px', marginTop: '6px'}}>
                {userData?.name || userData?.username}
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{color: '#6b7280', fontSize: '13px'}}>Current balance</div>
              <div style={{fontWeight: 700, fontSize: '22px'}}>
                ${userData?.balance?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          <h3 style={{marginTop: '18px'}}>Recent member stock earnings (credits)</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th style={{textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td className={tx.amount >= 0 ? 'credit' : 'debit'}>
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{marginTop: '12px'}}>
            <button onClick={handleConnectTelegram} className="btn secondary">
              Connect Telegram
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
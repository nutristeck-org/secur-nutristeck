import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BillPay = () => {
  const { logout, token, linkCode } = useAuth();
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/pay-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-link-code': linkCode
        },
        body: JSON.stringify({
          payee,
          amount: parseFloat(amount),
          accountNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Bill paid successfully! New balance: $${data.newBalance.toFixed(2)}`);
        setPayee('');
        setAmount('');
        setAccountNumber('');
      } else {
        setError(data.error || 'Failed to pay bill');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const commonPayees = [
    'Electric Company',
    'Gas Company',
    'Water Department',
    'Internet Provider',
    'Credit Card Company',
    'Insurance Company'
  ];

  return (
    <div>
      <header className="header">
        <div style={{fontWeight: 700}}>Redwood Bank</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/zelle">Zelle</Link>
          <Link to="/mobile-deposit">Mobile Deposit</Link>
          <button onClick={logout} className="btn secondary">Sign out</button>
        </div>
      </header>
      
      <main className="container">
        <div className="card">
          <h2>Pay Bills</h2>
          <p>Pay your bills quickly and securely online.</p>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="payee">Payee</label>
            <input
              id="payee"
              type="text"
              placeholder="Enter payee name"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              required
              list="common-payees"
            />
            <datalist id="common-payees">
              {commonPayees.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            <label htmlFor="accountNumber">Account Number</label>
            <input
              id="accountNumber"
              type="text"
              placeholder="Your account number with this payee"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />

            <label htmlFor="amount">Payment Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <div style={{marginTop: '14px'}}>
              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Bill'}
              </button>
            </div>

            {message && (
              <div className="success">
                {message}
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}
          </form>

          <div style={{marginTop: '20px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24'}}>
            <h4 style={{margin: '0 0 8px', color: '#92400e'}}>Bill Pay Information:</h4>
            <ul style={{margin: 0, paddingLeft: '20px', color: '#92400e'}}>
              <li>Payments are processed on the next business day</li>
              <li>Electronic payments typically arrive in 1-2 business days</li>
              <li>Keep your confirmation number for your records</li>
              <li>Set up recurring payments to never miss a due date</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillPay;
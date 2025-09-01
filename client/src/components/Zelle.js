import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Zelle = () => {
  const { logout, token, linkCode } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/send-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-link-code': linkCode
        },
        body: JSON.stringify({
          recipient,
          amount: parseFloat(amount),
          memo
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Money sent successfully! New balance: $${data.newBalance.toFixed(2)}`);
        setRecipient('');
        setAmount('');
        setMemo('');
      } else {
        setError(data.error || 'Failed to send money');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <div style={{fontWeight: 700}}>Redwood Bank</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/mobile-deposit">Mobile Deposit</Link>
          <Link to="/bill-pay">Bill Pay</Link>
          <button onClick={logout} className="btn secondary">Sign out</button>
        </div>
      </header>
      
      <main className="container">
        <div className="card">
          <h2>Send Money with Zelle</h2>
          <p>Send money quickly and securely to friends and family.</p>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="recipient">Recipient Email or Phone</label>
            <input
              id="recipient"
              type="text"
              placeholder="Enter email or phone number"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />

            <label htmlFor="amount">Amount</label>
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

            <label htmlFor="memo">Memo (Optional)</label>
            <input
              id="memo"
              type="text"
              placeholder="What's this for?"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <div style={{marginTop: '14px'}}>
              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Money'}
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
        </div>
      </main>
    </div>
  );
};

export default Zelle;
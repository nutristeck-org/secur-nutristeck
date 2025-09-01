import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileDeposit = () => {
  const { logout, token, linkCode } = useAuth();
  const [amount, setAmount] = useState('');
  const [checkImage, setCheckImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/mobile-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-link-code': linkCode
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          checkImage: checkImage ? 'image_data_placeholder' : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Check deposited successfully! New balance: $${data.newBalance.toFixed(2)}`);
        setAmount('');
        setCheckImage(null);
        // Reset file input
        const fileInput = document.getElementById('checkImage');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to deposit check');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCheckImage(file);
  };

  return (
    <div>
      <header className="header">
        <div style={{fontWeight: 700}}>Redwood Bank</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/zelle">Zelle</Link>
          <Link to="/bill-pay">Bill Pay</Link>
          <button onClick={logout} className="btn secondary">Sign out</button>
        </div>
      </header>
      
      <main className="container">
        <div className="card">
          <h2>Deposit a Check</h2>
          <p>Take photos of the front and back of your check to deposit it instantly.</p>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="amount">Check Amount</label>
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

            <label htmlFor="checkImage">Check Image (Front)</label>
            <input
              id="checkImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: '8px',
                border: '2px dashed #e6e9ef',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}
            />
            <small style={{display: 'block', marginTop: '6px', color: 'var(--muted)'}}>
              In a real app, you would also capture the back of the check.
            </small>

            <div style={{marginTop: '14px'}}>
              <button 
                type="submit" 
                className="btn" 
                disabled={loading || !amount}
              >
                {loading ? 'Processing...' : 'Deposit Check'}
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

          <div style={{marginTop: '20px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac'}}>
            <h4 style={{margin: '0 0 8px', color: '#0f7a3a'}}>Mobile Deposit Tips:</h4>
            <ul style={{margin: 0, paddingLeft: '20px', color: '#166534'}}>
              <li>Endorse the back of your check</li>
              <li>Place check on a dark surface</li>
              <li>Ensure all four corners are visible</li>
              <li>Use good lighting</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileDeposit;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password, pin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setPin('');
    setError('');
  };

  const handleConnectTelegram = () => {
    const code = 'demo-code-1234';
    const botUsername = 'my_bot_Trenchp1413bot';
    const url = `https://t.me/${botUsername}?start=${encodeURIComponent(code)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          <div style={{fontWeight: 700}}>Redwood Bank</div>
        </div>
      </div>

      <div className="container">
        <section className="hero">
          <h1>Welcome to Redwood Bank Affiliated with NUTRISTECK POOLS & CO LLC</h1>
          <p>Use the sample credentials to sign on and explore the dashboard. This is a simulation environment.</p>
          <div className="creds">
            <ul style={{margin: 0, paddingLeft: '18px', color: '#fff'}}>
              <li><strong>User ID:</strong> <span>Lowkeyrich1413</span></li>
              <li><strong>Password:</strong> <span>$SlimYellow1</span></li>
              <li><strong>PIN:</strong> <span>1234</span></li>
            </ul>
          </div>
        </section>

        <section className="card form">
          <h2 style={{margin: '0 0 6px'}}>Sign On</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">User ID</label>
            <input
              id="username"
              type="text"
              placeholder="User ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />

            <div style={{marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
              >
                {loading ? 'Signing On...' : 'Sign On'}
              </button>
              <button 
                type="button" 
                className="btn secondary" 
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            <div className="links">
              <button type="button" style={{background: 'none', border: 'none', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px'}}>Forgot User ID?</button>
              <button type="button" style={{background: 'none', border: 'none', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px'}}>Forgot Password?</button>
              <button type="button" style={{background: 'none', border: 'none', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px'}}>Enroll</button>
            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <div style={{marginTop: '12px'}}>
              <button 
                type="button" 
                onClick={handleConnectTelegram}
                style={{
                  background: '#fff',
                  border: '2px solid var(--green)',
                  color: 'var(--green)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Connect Telegram
              </button>
              <small style={{display: 'block', marginTop: '6px', color: 'var(--muted)'}}>
                Click to generate a link you can open in Telegram to link your account.
              </small>
            </div>
          </form>
        </section>

        <footer style={{marginTop: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px'}}>
          © 2025 Redwood Bank Affiliated with NUTRISTECK POOLS & CO LLC — environment
        </footer>
      </div>

      <button 
        className="support" 
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '18px',
          background: 'var(--accent)',
          color: '#06211a',
          padding: '8px 12px',
          borderRadius: '999px',
          boxShadow: '0 6px 18px rgba(11,20,12,0.12)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Support
      </button>
    </div>
  );
};

export default Login;
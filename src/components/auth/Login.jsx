import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Single admin authentication code
  const ADMIN_CODE = 'FepaNKKk4nuElM4gG5Ai';  // Super Admin

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!authCode.trim()) {
      setError('Please enter an authentication code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Check if the auth code is valid
      if (authCode.trim() === ADMIN_CODE) {
        // Skip Firebase Auth for now and just use localStorage
        localStorage.setItem('adminAuthCode', ADMIN_CODE);
        localStorage.setItem('adminAuthTime', Date.now().toString());
        
        // Update authentication status and redirect
        setIsAuthenticated(true);
        navigate('/');
      } else {
        setError('Invalid authentication code');
      }
      
    } catch (err) {
      console.error("Login error:", err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="text-center mb-4">
          <div className="brand-logo mb-3">
            <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
          </div>
          <h1 className="fw-bold">Admin Login</h1>
          <p className="text-muted">Enter your authentication code to continue</p>
        </div>
        
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="authCode" className="form-label">Authentication Code</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-key"></i>
              </span>
              <input 
                type="password"
                className="form-control border-start-0 ps-0"
                id="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Enter admin code"
                autoComplete="off"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </>
            )}
          </button>
        </form>
        <div className="text-center mt-4">
          <small className="text-muted">TeamLexia Admin Panel © 2025</small>
        </div>
      </div>
    </div>
  );
};

export default Login;

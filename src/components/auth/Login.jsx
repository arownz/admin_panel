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
        <h1 className="text-center mb-4">Admin Login</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="authCode" className="form-label">Authentication Code</label>
            <input 
              type="password"
              className="form-control"
              id="authCode"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Enter your admin authentication code"
              autoComplete="off"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

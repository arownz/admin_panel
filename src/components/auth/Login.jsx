import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Updated path

const Login = () => {
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Single admin authentication code
  const ADMIN_CODE = 'FepaNKKk4nuElM4gG5Ai';

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!authCode.trim()) {
      setError('Please enter an authentication code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (authCode.trim() === ADMIN_CODE) {
        login(ADMIN_CODE);
        navigate('/');
      } else {
        setError('Invalid authentication code');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            {/* Large Lock Icon */}
            <div className="admin-icon mb-3">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h1 className="display-6 fw-bold mb-2">TeamLexia Admin</h1>
            <p className="text-muted fs-6">Enter your authentication code to access the admin panel</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-6 fw-semibold">Authentication Code</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-key-fill text-primary"></i>
                </span>
                <Form.Control
                  type="password"
                  placeholder="Enter your admin code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="form-control-lg border-start-0"
                  style={{ fontSize: '1rem' }}
                />
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 btn-lg py-2"
              disabled={loading}
              style={{ fontSize: '1.1rem' }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login to Admin Panel
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;

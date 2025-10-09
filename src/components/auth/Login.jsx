import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { validateAdminCode, markCodeAsUsed } from '../../firebase/services';

const Login = () => {
  const [authCode, setAuthCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBootstrapMessage, setShowBootstrapMessage] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check if ADMINTEMP has been used in this browser session
  useEffect(() => {
    const hasUsedBootstrap = localStorage.getItem('admintemp_used');
    if (hasUsedBootstrap === 'true') {
      setShowBootstrapMessage(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!authCode.trim()) {
      setError('Please enter an authentication code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Temporary bootstrap code for initial setup
      const BOOTSTRAP_CODE = 'ADMINTEMP';
      const hasUsedBootstrap = localStorage.getItem('admintemp_used') === 'true';

      if (authCode.trim() === BOOTSTRAP_CODE) {
        if (hasUsedBootstrap) {
          setError('Bootstrap code has already been used in this browser session. Please use a generated admin code.');
          return;
        }

        // Mark bootstrap code as used in this browser session
        localStorage.setItem('admintemp_used', 'true');
        setShowBootstrapMessage(false);

        login(authCode.trim());
        navigate('/');
        return;
      }

      // Validate the admin code against Firebase
      const validation = await validateAdminCode(authCode.trim());

      if (validation.valid) {
        // Always mark the code as used (with usedAt timestamp)
        // For one-time codes, this makes them invalid
        // For reusable codes, this just logs usage but keeps them valid
        await markCodeAsUsed(validation.codeId, 'admin-login');

        // Login successful
        login(authCode.trim());
        navigate('/');
      } else {
        setError(validation.reason || 'Invalid authentication code');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            {/* TeamLexia Logo */}
            <div className="login-logo mb-3">
              <img
                src="/logo.png"
                alt="TeamLexia Logo"
                className="img-fluid"
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>
            <h1 className="h3 h1-md fw-bold mb-2">TeamLexia Admin</h1>
            <p className="text-muted small">Enter your authentication code to access the admin panel</p>

            {/* Security Warning */}
            <div className="alert alert-warning small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Important:</strong> Always save your admin codes securely! Clearing browser data will reset authentication, allowing unauthorized access via bootstrap code.
            </div>

            {showBootstrapMessage && (
              <div className="alert alert-info small">
                <strong>First-time setup:</strong> Use code <code>ADMINTEMP</code> to access Admin Codes management
              </div>
            )}
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-4">
              <Form.Label className="fs-6 fw-semibold text-dark">
                <i className="bi bi-shield-lock-fill me-2 text-primary"></i>
                Authentication Code
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="form-control-lg ps-5 pe-5"
                  style={{
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    border: '2px solid #4361ee',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(67, 97, 238, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 6px 16px rgba(67, 97, 238, 0.25)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
                <div
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: '18px' }}
                >
                  <i className="bi bi-key-fill text-primary" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <button
                  className="btn btn-link position-absolute top-50 translate-middle-y"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    right: '12px',
                    textDecoration: 'none',
                    color: '#6c757d'
                  }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>
              </div>
              <Form.Text className="text-muted d-flex align-items-center mt-2">
                <i className="bi bi-info-circle me-2"></i>
                Enter the 8-character alphanumeric admin code
              </Form.Text>
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

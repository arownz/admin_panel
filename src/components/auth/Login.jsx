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
            <Form.Group className="mb-3">
              <Form.Label className="fs-6 fw-semibold">Authentication Code</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-key-fill text-primary"></i>
                </span>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="form-control-lg border-start-0 border-end-0"
                  style={{ fontSize: '1rem' }}
                />
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Badge, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getUserById } from '../../firebase/services';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(id);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getVerificationBadge = (user) => {
    if (user.isVerified || user.verificationStatus === 'verified') {
      return <Badge bg="success" className="fs-6 px-3 py-2">✓ Verified</Badge>;
    }
    if (user.verificationStatus === 'pending') {
      return <Badge bg="warning" className="fs-6 px-3 py-2">⏳ Pending</Badge>;
    }
    if (user.verificationStatus === 'rejected') {
      return <Badge bg="danger" className="fs-6 px-3 py-2">✗ Rejected</Badge>;
    }
    return <Badge bg="secondary" className="fs-6 px-3 py-2">Unverified</Badge>;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-3">Loading user details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <div className="content-wrapper">
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
            <Button variant="secondary" onClick={() => navigate('/users')}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/users')}
                className="mb-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Users
              </Button>
              <h1 className="display-6 mb-0">User Details</h1>
            </div>
            <Link to={`/users/${id}/edit`}>
              <Button variant="primary" size="lg">
                <i className="bi bi-pencil me-2"></i>
                Edit User
              </Button>
            </Link>
          </div>

          {/* User Profile Section */}
          <Card className="full-width-card border-0 shadow-sm mb-4">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                {user.profile_image_url ? (
                  <img 
                    src={user.profile_image_url} 
                    alt={user.name} 
                    className="rounded-circle mb-4"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center mx-auto mb-4"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <i className="bi bi-person display-4 text-secondary"></i>
                  </div>
                )}
                <h2 className="mb-2">{user.name || 'Anonymous User'}</h2>
                <p className="text-muted fs-5 mb-3">{user.email}</p>
                <div className="d-flex justify-content-center gap-3">
                  <Badge bg="primary" className="fs-6 px-3 py-2">
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </Badge>
                  {getVerificationBadge(user)}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Two Column Layout */}
          <div className="detail-two-column">
            {/* Left Column - Basic Information */}
            <div>
              <Card className="full-width-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-4">
                  <h3 className="mb-0">Basic Information</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-bold text-muted py-3">User ID</td>
                        <td className="fs-5 py-3">{user.uid || id}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted py-3">Email</td>
                        <td className="fs-5 py-3">{user.email}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted py-3">Phone</td>
                        <td className="fs-5 py-3">{user.phone || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted py-3">Location</td>
                        <td className="fs-5 py-3">{user.location || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted py-3">Created</td>
                        <td className="fs-5 py-3">{formatDate(user.created_at || user.createdAt)}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted py-3">Last Login</td>
                        <td className="fs-5 py-3">{formatDate(user.last_login || user.lastLogin)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>

            {/* Right Column - Professional Details */}
            <div>
              <Card className="full-width-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-4">
                  <h3 className="mb-0">Professional Details</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  {user.role === 'professional' ? (
                    <Table borderless className="mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-bold text-muted py-3">Profession</td>
                          <td className="fs-5 py-3">{user.profession || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted py-3">Affiliation</td>
                          <td className="fs-5 py-3">{user.affiliation || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted py-3">Specialty</td>
                          <td className="fs-5 py-3">{user.specialty || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted py-3">License Number</td>
                          <td className="fs-5 py-3">{user.licenseNumber || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted py-3">Work Email</td>
                          <td className="fs-5 py-3">{user.professionalInfo?.workEmail || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted py-3">Verification Status</td>
                          <td className="py-3">{getVerificationBadge(user)}</td>
                        </tr>
                        {user.verifiedAt && (
                          <tr>
                            <td className="fw-bold text-muted py-3">Verified At</td>
                            <td className="fs-5 py-3">{formatDate(user.verifiedAt)}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-person display-4 text-muted mb-3"></i>
                      <p className="text-muted fs-5">This user is not a professional account.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Bio Section (if available) */}
          {user.bio && (
            <Card className="full-width-card border-0 shadow-sm mt-4">
              <Card.Header className="bg-white border-0 py-4">
                <h3 className="mb-0">Biography</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <p className="fs-5 mb-0">{user.bio}</p>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

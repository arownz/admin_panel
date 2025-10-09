import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getUserById, updateUser } from '../../firebase/services';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent',
    status: 'active',
    // Professional fields
    profession: '',
    affiliation: '',
    specialty: '',
    licenseNumber: '',
    workEmail: '',
    // Admin fields
    isVerified: false,
    verificationStatus: 'unverified'
  });

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isEditMode) return;

      try {
        const userData = await getUserById(id);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'parent',
          status: userData.status || 'active',
          profession: userData.profession || '',
          affiliation: userData.affiliation || '',
          specialty: userData.specialty || '',
          licenseNumber: userData.licenseNumber || '',
          workEmail: userData.professionalInfo?.workEmail || '',
          isVerified: userData.isVerified || false,
          verificationStatus: userData.verificationStatus || 'unverified'
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, isEditMode]);

  // Auto-dismiss success and error messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        status: formData.status,
        isVerified: formData.isVerified,
        verificationStatus: formData.verificationStatus
      };

      // Add professional fields if user is a professional
      if (formData.role === 'professional') {
        updateData.profession = formData.profession;
        updateData.affiliation = formData.affiliation;
        updateData.specialty = formData.specialty;
        updateData.licenseNumber = formData.licenseNumber;
        updateData.professionalInfo = {
          workEmail: formData.workEmail
        };
      }

      await updateUser(id, updateData);
      setSuccess(true);
      setTimeout(() => navigate(`/users/${id}`), 1500);

    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-3">Loading user data...</div>
            </div>
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
          <div className="mb-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/users')}
              className="mb-3"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Users
            </Button>
            <h1 className="display-6 mb-0">Edit User</h1>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              <i className="bi bi-check-circle me-2"></i>
              User successfully updated! Redirecting...
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <h5 className="mb-4 text-primary">
                  <i className="bi bi-person me-2"></i>
                  Basic Information
                </h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed for security reasons
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Professional Information (only if role is professional) */}
                {formData.role === 'professional' && (
                  <>
                    <hr className="my-4" />
                    <h5 className="mb-4 text-info">
                      <i className="bi bi-briefcase me-2"></i>
                      Professional Information
                    </h5>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Profession</Form.Label>
                          <Form.Control
                            type="text"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            placeholder="e.g., Speech Therapist, Psychologist"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Affiliation</Form.Label>
                          <Form.Control
                            type="text"
                            name="affiliation"
                            value={formData.affiliation}
                            onChange={handleChange}
                            placeholder="e.g., Hospital, Clinic, University"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Specialty</Form.Label>
                          <Form.Control
                            type="text"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            placeholder="e.g., Dyslexia, ADHD, Learning Disabilities"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>License Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder="Professional license number"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Work Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="workEmail"
                        value={formData.workEmail}
                        onChange={handleChange}
                        placeholder="professional@hospital.com"
                      />
                    </Form.Group>
                  </>
                )}

                {/* Admin Controls */}
                <hr className="my-4" />
                <h5 className="mb-4 text-warning">
                  <i className="bi bi-shield-check me-2"></i>
                  Admin Controls
                </h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Status</Form.Label>
                      <Form.Select
                        name="verificationStatus"
                        value={formData.verificationStatus}
                        onChange={handleChange}
                      >
                        <option value="unverified">Unverified</option>
                        <option value="pending">Pending Review</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4 pt-4 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/users/${id}`)}
                    size="lg"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Updating User...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update User
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
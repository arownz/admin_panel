import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getUser, createUser, updateUser } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',  // Changed from username to name
    email: '',
    role: 'parent', // Changed from user_level to role
    status: 'active',
    photoUrl: '',  // Changed from profile_picture to photoUrl
    childName: '',  // Added child fields for parents
    childAge: '',
    notes: '',
    specialties: '',
    qualifications: ''
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isEditMode) return;
      
      try {
        const userData = await getUser(id);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'parent',
          status: userData.status || 'active',
          photoUrl: userData.photoUrl || '',
          childName: userData.childName || '',
          childAge: userData.childAge || '',
          notes: userData.notes || '',
          specialties: userData.specialties || '',
          qualifications: userData.qualifications || ''
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Check authentication
      if (!isAuthenticated) {
        throw new Error('You must be logged in to perform this action');
      }
      
      if (isEditMode) {
        // Update existing user
        await updateUser(id, formData);
        setSuccess(true);
        setTimeout(() => navigate(`/users/${id}`), 1500);
      } else {
        // Create new user
        const newUser = await createUser(formData);
        setSuccess(true);
        setTimeout(() => navigate(`/users/${newUser.id}`), 1500);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <h1 className="mb-4">{isEditMode ? 'Edit User' : 'Add New User'}</h1>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              User successfully {isEditMode ? 'updated' : 'created'}!
            </Alert>
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>User Type</Form.Label>
                      <Form.Select
                        name="role"  // Changed from user_level
                        value={formData.role}  // Changed from user_level
                        onChange={handleChange}
                      >
                        <option value="parent">Parent</option>
                        <option value="professional">Professional</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Text className="text-muted">
                  </Form.Text>
                </Form.Group>
                
                {/* Add child fields if user type is parent */}
                {formData.role === 'parent' && (
                  <>
                    <h5 className="mt-4 mb-3">Child Information</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Child Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="childName"
                            value={formData.childName}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Child Age</Form.Label>
                          <Form.Control
                            type="number"
                            name="childAge"
                            value={formData.childAge}
                            onChange={handleChange}
                            min="0"
                            max="18"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any notes about the child's condition"
                      />
                    </Form.Group>
                  </>
                )}
                
                {/* Professional specific fields (shown only if role is professional) */}
                {formData.role === 'professional' && (
                  <>
                    <h5 className="mt-4 mb-3">Professional Details</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Specialties</Form.Label>
                      <Form.Control
                        type="text"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleChange}
                        placeholder="e.g., Dyslexia, ADHD, Learning Disabilities"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Qualifications</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        placeholder="Educational background, certifications, etc."
                      />
                    </Form.Group>
                  </>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/users')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update User' : 'Create User'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default UserForm;
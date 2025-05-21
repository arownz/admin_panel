import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getUser } from '../../firebase/services';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const setupUserListener = () => {
      try {
        setLoading(true);
        unsubscribe = getUser(id, (userData) => {
          if (userData) {
            setUser(userData);
          } else {
            setError('User not found');
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up user listener:", err);
        setError("Failed to load user details. Please try again.");
        setLoading(false);
      }
    };
    
    setupUserListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      
      // Handle Firestore Timestamp objects
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle timestamp objects with seconds and nanoseconds
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Already a date or timestamp string
      else {
        date = new Date(timestamp);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Link to="/users" className="btn btn-sm btn-outline-secondary mb-2">
                <i className="bi bi-arrow-left me-1"></i> Back to Users
              </Link>
              <h1 className="m-0">User Details</h1>
            </div>
            
            {user && (
              <div>
                <Link to={`/users/${id}/edit`} className="btn btn-primary me-2">
                  <i className="bi bi-pencil me-1"></i> Edit User
                </Link>
              </div>
            )}
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : user ? (
            <>
              <Card className="border-0 shadow-sm mb-4 text-center">
                <Card.Body className="py-4">
                  {user.photoUrl && user.photoUrl !== '' ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name || 'User'} 
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <i className="bi bi-person" style={{ fontSize: '4rem' }}></i>
                    </div>
                  )}
                  
                  <h2 className="mb-1">{user.name}</h2>
                  <p className="text-muted mb-2">{user.email}</p>
                  
                  <div className="mb-3">
                    <Badge bg={getStatusBadgeClass(user.status)} className="me-2">
                      {user.status || 'Active'}
                    </Badge>
                    <Badge bg="info">
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
              
              <Row>
                <Col lg={6}>
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-0">
                      <h5 className="m-0">Basic Information</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-3">
                        <Col sm={4} className="text-muted">User ID</Col>
                        <Col sm={8}>{user.id}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col sm={4} className="text-muted">Created</Col>
                        <Col sm={8}>{formatDate(user.createdAt)}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col sm={4} className="text-muted">Last Login</Col>
                        <Col sm={8}>{formatDate(user.lastLoginAt)}</Col>
                      </Row>
                      {user.location && (
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">Location</Col>
                          <Col sm={8}>{user.location}</Col>
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={6}>
                  {user.role === 'parent' && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-white border-0">
                        <h5 className="m-0">Child Information</h5>
                      </Card.Header>
                      <Card.Body>
                        {user.childName ? (
                          <>
                            <Row className="mb-3">
                              <Col sm={4} className="text-muted">Child Name</Col>
                              <Col sm={8}>{user.childName}</Col>
                            </Row>
                            {user.childAge && (
                              <Row className="mb-3">
                                <Col sm={4} className="text-muted">Child Age</Col>
                                <Col sm={8}>{user.childAge} years</Col>
                              </Row>
                            )}
                            {user.notes && (
                              <Row className="mb-3">
                                <Col sm={4} className="text-muted">Notes</Col>
                                <Col sm={8}>{user.notes}</Col>
                              </Row>
                            )}
                          </>
                        ) : (
                          <p className="text-muted">No child information provided</p>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                  
                  {user.role === 'professional' && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-white border-0">
                        <h5 className="m-0">Professional Details</h5>
                      </Card.Header>
                      <Card.Body>
                        {user.specialties && (
                          <Row className="mb-3">
                            <Col sm={4} className="text-muted">Specialties</Col>
                            <Col sm={8}>{user.specialties}</Col>
                          </Row>
                        )}
                        {user.qualifications && (
                          <Row className="mb-3">
                            <Col sm={4} className="text-muted">Qualifications</Col>
                            <Col sm={8}>{user.qualifications}</Col>
                          </Row>
                        )}
                        {!user.specialties && !user.qualifications && (
                          <p className="text-muted">No professional details provided</p>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="warning">User not found. It may have been deleted.</Alert>
          )}
        </Container>
      </div>
    </div>
  );
};

export default UserDetail;

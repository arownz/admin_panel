import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getAppointment } from '../../firebase/services';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointment details
        const appointmentData = await getAppointment(id);
        setAppointment(appointmentData);
        
      } catch (err) {
        console.error("Error fetching appointment data:", err);
        setError("Failed to load appointment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointmentData();
  }, [id]);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'scheduled':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <Alert variant="danger">{error}</Alert>
            <Link to="/appointments" className="btn btn-primary">Back to Appointments</Link>
          </Container>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <Alert variant="warning">Appointment not found</Alert>
            <Link to="/appointments" className="btn btn-primary">Back to Appointments</Link>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Appointment Details</h1>
            <div>
              <Link to="/appointments" className="btn btn-secondary">
                <i className="bi bi-arrow-left"></i> Back
              </Link>
            </div>
          </div>
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Appointment Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Appointment ID:</Col>
                <Col sm={8}>{appointment.id}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Status:</Col>
                <Col sm={8}>
                  <Badge bg={getStatusBadgeClass(appointment.status)}>
                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Date & Time:</Col>
                <Col sm={8}>
                  {appointment.appointmentTime ? 
                    new Date(appointment.appointmentTime).toLocaleString() : 
                    'Not scheduled'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Created At:</Col>
                <Col sm={8}>
                  {appointment.createdAt ? 
                    new Date(appointment.createdAt).toLocaleString() : 
                    'Unknown'}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            <Col md={6}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h5 className="mb-0">User Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">User Name:</Col>
                    <Col sm={8}>
                      <Link to={`/users/${appointment.userId}`}>
                        {appointment.userName || 'Unknown User'}
                      </Link>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">User ID:</Col>
                    <Col sm={8}>{appointment.userId || 'N/A'}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h5 className="mb-0">Professional Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">Professional Name:</Col>
                    <Col sm={8}>
                      <Link to={`/users/${appointment.professionalId}`}>
                        {appointment.professionalName || 'Unknown Professional'}
                      </Link>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">Professional ID:</Col>
                    <Col sm={8}>{appointment.professionalId || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">Specialty:</Col>
                    <Col sm={8}>{appointment.specialty || 'Not specified'}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Appointment Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Reason:</Col>
                <Col sm={8}>{appointment.reason || 'No reason provided'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Notes:</Col>
                <Col sm={8}>{appointment.notes || 'No notes available'}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default AppointmentDetail;
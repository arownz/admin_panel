import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getVerificationRequest, updateVerificationStatus, deleteVerificationRequest } from '../../firebase/services';

const VerificationRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchVerificationRequest();
  }, [id]);

  const fetchVerificationRequest = async () => {
    try {
      setLoading(true);
      const data = await getVerificationRequest(id);
      setRequest(data);
      setAdminNotes(data.adminNotes || '');
      setError('');
    } catch (err) {
      console.error('Error fetching verification request:', err);
      setError('Failed to load verification request');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setProcessing(true);
      await updateVerificationStatus(id, newStatus, adminNotes);
      
      setRequest(prev => ({
        ...prev,
        status: newStatus,
        processedAt: new Date(),
        adminNotes: adminNotes
      }));
      
      setError('');
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError('Failed to update verification status');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await deleteVerificationRequest(id);
      navigate('/verification-requests');
    } catch (err) {
      console.error('Error deleting verification request:', err);
      setError('Failed to delete verification request');
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: 'clock' },
      approved: { variant: 'success', icon: 'check-circle' },
      rejected: { variant: 'danger', icon: 'x-circle' }
    };

    const config = statusConfig[status] || { variant: 'secondary', icon: 'question-circle' };

    return (
      <Badge bg={config.variant} className="fs-6 px-3 py-2">
        <i className={`bi bi-${config.icon} me-2`}></i>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-3">Loading verification request...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <div className="content-wrapper">
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
            <Button variant="secondary" onClick={() => navigate('/verification-requests')}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Verification Requests
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
                onClick={() => navigate('/verification-requests')}
                className="mb-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Verification Requests
              </Button>
              <h1 className="display-6 mb-0">
                <i className="bi bi-patch-check me-3"></i>
                Verification Request Details
              </h1>
            </div>
            <div className="d-flex gap-3">
              {request?.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={processing}
                  >
                    {processing ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <i className="bi bi-check-lg me-2"></i>
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={processing}
                  >
                    {processing ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <i className="bi bi-x-lg me-2"></i>
                    )}
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="outline-danger"
                size="lg"
                onClick={() => setShowDeleteModal(true)}
                disabled={processing}
              >
                <i className="bi bi-trash me-2"></i>
                Delete
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Main Content */}
          <div className="detail-two-column">
            {/* Left Column - Request Information */}
            <div>
              <Card className="full-width-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-4">
                  <h3 className="mb-0">
                    <i className="bi bi-person-badge me-3"></i>
                    Request Information
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col md={6}>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">User ID</label>
                        <div className="fs-5 fw-medium">{request?.userId || 'N/A'}</div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">Work Email</label>
                        <div className="fs-5 fw-medium">{request?.workEmail || 'N/A'}</div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">Profession</label>
                        <div className="fs-5 fw-medium">{request?.profession || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">Affiliation</label>
                        <div className="fs-5 fw-medium">{request?.affiliation || 'N/A'}</div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">License Number</label>
                        <div className="fs-5 fw-medium">
                          {request?.licenseNumber || 'Not provided'}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted mb-2">Trusted Domain</label>
                        <div>
                          <Badge bg={request?.trustedDomain ? 'success' : 'secondary'} className="fs-6 px-3 py-2">
                            {request?.trustedDomain ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {request?.documentUrl && (
                    <div className="mt-4 pt-4 border-top">
                      <label className="form-label fw-bold text-muted mb-3">Verification Document</label>
                      <div>
                        <Button
                          variant="primary"
                          size="lg"
                          href={request.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          View Document
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Right Column - Status & Notes */}
            <div>
              {/* Status Card */}
              <Card className="full-width-card border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 py-4">
                  <h3 className="mb-0">
                    <i className="bi bi-info-circle me-3"></i>
                    Status & Timeline
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted mb-2">Current Status</label>
                    <div className="mt-2">
                      {getStatusBadge(request?.status)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted mb-2">Submitted At</label>
                    <div className="fs-5 fw-medium">
                      {request?.submittedAt ? 
                        new Date(request.submittedAt).toLocaleString() : 'N/A'
                      }
                    </div>
                  </div>

                  {request?.processedAt && (
                    <div className="mb-4">
                      <label className="form-label fw-bold text-muted mb-2">Processed At</label>
                      <div className="fs-5 fw-medium">
                        {new Date(request.processedAt).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted mb-2">Auto Verified</label>
                    <div>
                      <Badge bg={request?.isAutoVerified ? 'success' : 'secondary'} className="fs-6 px-3 py-2">
                        {request?.isAutoVerified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Admin Notes Card */}
              <Card className="full-width-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-4">
                  <h3 className="mb-0">
                    <i className="bi bi-chat-text me-3"></i>
                    Admin Notes
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification request..."
                      className="fs-5"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-3 w-100"
                    onClick={() => handleStatusUpdate(request?.status)}
                    disabled={processing}
                  >
                    {processing ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <i className="bi bi-save me-2"></i>
                    )}
                    Save Notes
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <p className="fs-5">Are you sure you want to delete this verification request?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer className="p-4">
              <Button variant="secondary" size="lg" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="lg" onClick={handleDelete} disabled={processing}>
                {processing ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <i className="bi bi-trash me-2"></i>
                )}
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestDetail;
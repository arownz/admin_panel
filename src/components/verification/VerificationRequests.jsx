import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Badge, Button, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { getVerificationRequests, updateVerificationStatus } from '../../firebase/services';

const VerificationRequests = () => {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [processing, setProcessing] = useState({});
  const [success, setSuccess] = useState(null);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  useEffect(() => {
    const filterRequests = () => {
      let filtered = [...requests];

      if (searchTerm) {
        filtered = filtered.filter(request =>
          request.workEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.affiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(request => request.status === statusFilter);
      }

      if (professionFilter !== 'all') {
        filtered = filtered.filter(request => request.profession === professionFilter);
      }

      setFilteredRequests(filtered);
    };

    filterRequests();
  }, [requests, searchTerm, statusFilter, professionFilter]);

  // Auto-dismiss success and error messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const data = await getVerificationRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setProcessing(prev => ({ ...prev, [requestId]: true }));

      await updateVerificationStatus(requestId, newStatus);

      setRequests(prev => prev.map(request =>
        request.id === requestId
          ? { ...request, status: newStatus, processedAt: new Date() }
          : request
      ));

      setSuccess(`Verification request ${newStatus} successfully`);
      setError('');
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError('Failed to update verification status');
      setSuccess(null);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmAction(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    setShowConfirmAction(false);
    await handleStatusUpdate(selectedRequest.id, actionType);
    setSelectedRequest(null);
    setActionType('');
  };

  const cancelAction = () => {
    setShowConfirmAction(false);
    setSelectedRequest(null);
    setActionType('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: 'clock' },
      approved: { variant: 'success', icon: 'check-circle' },
      rejected: { variant: 'danger', icon: 'x-circle' }
    };

    const config = statusConfig[status] || { variant: 'secondary', icon: 'question-circle' };

    return (
      <Badge bg={config.variant}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const getUniqueProfessions = () => {
    const professions = [...new Set(requests.map(r => r.profession).filter(Boolean))];
    return professions.sort();
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <button className="mobile-menu-toggle d-lg-none" onClick={toggleSidebar}>
          <i className="bi bi-list fs-4"></i>
        </button>
        <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Container fluid className="py-3">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Loading verification requests...</div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <button className="mobile-menu-toggle d-lg-none" onClick={toggleSidebar}>
        <i className="bi bi-list fs-4"></i>
      </button>
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Container fluid className="py-3">
          <div className="d-flex align-items-center mb-4">
            <h1 className="mb-0">Verification Requests</h1>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <InputGroup style={{ width: '250px' }}>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>

                  <Form.Select
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    style={{ width: '180px' }}
                  >
                    <option value="all">All Professions</option>
                    {getUniqueProfessions().map(profession => (
                      <option key={profession} value={profession}>{profession}</option>
                    ))}
                  </Form.Select>
                </div>

                <div className="text-muted">
                  Total: {filteredRequests.length} requests
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Profession</th>
                      <th>Affiliation</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div>
                            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                            <div className="text-muted">
                              {searchTerm || statusFilter !== 'all' || professionFilter !== 'all'
                                ? 'No verification requests match your filters'
                                : 'No verification requests found'
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{request.workEmail || 'N/A'}</div>
                              <small className="text-muted">ID: {request.userId?.substring(0, 8)}...</small>
                            </div>
                          </td>
                          <td>
                            <span className="fw-medium">{request.profession || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="text-truncate" style={{ maxWidth: '200px', display: 'inline-block' }}>
                              {request.affiliation || 'N/A'}
                            </span>
                          </td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <small className="text-muted">
                              {request.submittedAt ? (() => {
                                try {
                                  let date;
                                  if (typeof request.submittedAt.toDate === 'function') {
                                    date = request.submittedAt.toDate();
                                  } else if (request.submittedAt.seconds) {
                                    date = new Date(request.submittedAt.seconds * 1000);
                                  } else {
                                    date = new Date(request.submittedAt);
                                  }

                                  if (isNaN(date.getTime())) return 'Invalid date';

                                  return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch {
                                  return 'Invalid date';
                                }
                              })() : 'N/A'}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link to={`/verification-requests/${request.id}`}>
                                <Button variant="outline-primary" size="sm">
                                  <i className="bi bi-eye"></i>
                                </Button>
                              </Link>

                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleActionClick(request, 'approved')}
                                    disabled={processing[request.id]}
                                    title="Approve"
                                  >
                                    {processing[request.id] ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <i className="bi bi-check"></i>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleActionClick(request, 'rejected')}
                                    disabled={processing[request.id]}
                                    title="Reject"
                                  >
                                    {processing[request.id] ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <i className="bi bi-x"></i>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <small className="text-muted">
                  Showing {filteredRequests.length} of {requests.length} verification requests
                </small>
                <div className="d-flex gap-3">
                  <small className="text-muted">
                    <Badge bg="warning" className="me-1">{requests.filter(r => r.status === 'pending').length}</Badge>
                    Pending
                  </small>
                  <small className="text-muted">
                    <Badge bg="success" className="me-1">{requests.filter(r => r.status === 'approved').length}</Badge>
                    Approved
                  </small>
                  <small className="text-muted">
                    <Badge bg="danger" className="me-1">{requests.filter(r => r.status === 'rejected').length}</Badge>
                    Rejected
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Confirmation Modal */}
          <Modal
            show={showConfirmAction}
            onHide={cancelAction}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {actionType === 'approved' ? 'Approve Verification Request' : 'Reject Verification Request'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} this verification request?
              </p>
              {selectedRequest && (
                <div className="alert alert-info">
                  <p className="mb-1"><strong>Professional:</strong> {selectedRequest.userName || 'Unknown'}</p>
                  <p className="mb-1"><strong>Profession:</strong> {selectedRequest.profession}</p>
                  <p className="mb-0"><strong>Work Email:</strong> {selectedRequest.workEmail}</p>
                </div>
              )}
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle me-2"></i>
                {actionType === 'approved'
                  ? 'This will grant the user professional verification status.'
                  : 'This will reject the verification request. The user can resubmit later.'}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelAction}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approved' ? 'success' : 'danger'}
                onClick={confirmAction}
              >
                {actionType === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default VerificationRequests;
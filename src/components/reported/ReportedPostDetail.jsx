import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Alert, Badge, Form, Modal } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getReportedPost, resolveReport, deletePost } from '../../firebase/services';

const ReportedPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportedPost, setReportedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchReportedPostData = async () => {
      try {
        setLoading(true);
        const postData = await getReportedPost(id);
        console.log("Fetched reported post detail data:", postData);
        setReportedPost(postData);
      } catch (err) {
        console.error("Error fetching reported post:", err);
        setError("Failed to load reported post details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportedPostData();
  }, [id]);

  const handleResolveReport = async (action) => {
    try {
      setLoading(true);

      // Possible actions: 'approve', 'reject', 'delete'
      await resolveReport(id, action, resolutionNote);

      if (action === 'delete') {
        await deletePost(reportedPost.postId);
        navigate('/reported-posts');
      } else {
        // Refresh data
        const updatedPost = await getReportedPost(id);
        setReportedPost(updatedPost);
        setLoading(false);
        setResolutionNote('');
      }
    } catch (err) {
      console.error(`Error ${action} reported post:`, err);
      setError(`Failed to ${action} report. Please try again.`);
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    await handleResolveReport('delete');
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    try {
      let date;

      // Handle Firestore Timestamp objects
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle timestamp objects with seconds
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle regular date strings/numbers
      else {
        date = new Date(timestamp);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <Badge bg="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            HIGH
          </Badge>
        );
      case 'medium':
        return (
          <Badge bg="warning">
            <i className="bi bi-exclamation-circle me-2"></i>
            MEDIUM
          </Badge>
        );
      case 'low':
        return (
          <Badge bg="info">
            <i className="bi bi-info-circle me-2"></i>
            LOW
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary">
            <i className="bi bi-dash-circle me-2"></i>
            {severity?.toUpperCase() || 'NOT SPECIFIED'}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge bg="warning">
            <i className="bi bi-clock me-2"></i>
            PENDING REVIEW
          </Badge>
        );
      case 'approved':
        return (
          <Badge bg="success">
            <i className="bi bi-check-circle me-2"></i>
            APPROVED
          </Badge>
        );
      case 'rejected':
      case 'dismissed':
        return (
          <Badge bg="danger">
            <i className="bi bi-x-circle me-2"></i>
            DISMISSED
          </Badge>
        );
      case 'deleted':
        return (
          <Badge bg="danger">
            <i className="bi bi-trash me-2"></i>
            REMOVED
          </Badge>
        );
      case 'resolved':
        return (
          <Badge bg="primary">
            <i className="bi bi-check-circle me-2"></i>
            RESOLVED
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary">
            <i className="bi bi-dash-circle me-2"></i>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        );
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
            <Link to="/reported-posts" className="btn btn-primary">Back to Reported Posts</Link>
          </Container>
        </div>
      </div>
    );
  }

  if (!reportedPost) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <Alert variant="warning">Reported post not found</Alert>
            <Link to="/reported-posts" className="btn btn-primary">Back to Reported Posts</Link>
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
            <h1 className="display-6 mb-0">Reported Post Review</h1>
            <div>
              <Link to="/reported-posts" className="btn btn-secondary">
                <i className="bi bi-arrow-left"></i> Back to List
              </Link>
            </div>
          </div>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Report Details</h5>
                <div>
                  {getStatusBadge(reportedPost.status)}
                  <span className="mx-2">|</span>
                  {getSeverityBadge(reportedPost.severity)}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Report ID:</Col>
                <Col sm={9}>{reportedPost.id}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Reported By:</Col>
                <Col sm={9}>
                  {reportedPost.reporterName ? (
                    <Link to={`/users/${reportedPost.reporterId}`}>{reportedPost.reporterName}</Link>
                  ) : (
                    reportedPost.reporterId || 'Anonymous'
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Reason:</Col>
                <Col sm={9}><strong>{reportedPost.reason}</strong></Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Details:</Col>
                <Col sm={9}>{reportedPost.details || 'No additional details provided'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Submitted:</Col>
                <Col sm={9}>{formatDate(reportedPost.createdAt || reportedPost.reportedAt)}</Col>
              </Row>

              {reportedPost.status === 'resolved' && (
                <>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Resolution:</Col>
                    <Col sm={9}>{reportedPost.resolution || 'No resolution notes provided'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Resolved By:</Col>
                    <Col sm={9}>{reportedPost.resolvedBy || 'Unknown'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Resolved At:</Col>
                    <Col sm={9}>
                      {reportedPost.resolvedAt ? new Date(reportedPost.resolvedAt).toLocaleString() : 'Unknown'}
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Reported Content</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Post Author:</Col>
                <Col sm={9}>
                  {reportedPost.authorName ? (
                    <Link to={`/users/${reportedPost.authorId}`}>{reportedPost.authorName}</Link>
                  ) : (
                    reportedPost.authorId || 'Unknown'
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Post Status:</Col>
                <Col sm={9}>
                  {reportedPost.status === 'deleted' ? (
                    <Badge bg="secondary">Post has been removed from system</Badge>
                  ) : reportedPost.postId ? (
                    <Badge bg="success">Post exists in system</Badge>
                  ) : (
                    <Badge bg="secondary">Post no longer available</Badge>
                  )}
                </Col>
              </Row>
              {reportedPost.postId && reportedPost.status !== 'deleted' && (
                <div className="d-flex justify-content-between">
                  <Button
                    as={Link}
                    to={`/posts/${reportedPost.postId}`}
                    variant="outline-primary"
                    className="me-2"
                  >
                    <i className="bi bi-eye me-1"></i> View Full Post
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {reportedPost.status !== 'resolved' && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h5 className="mb-0">Take Action</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label>Resolution Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add notes about how this report was handled..."
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="danger"
                    onClick={handleDeleteClick}
                    disabled={loading}
                  >
                    <i className="bi bi-trash me-1"></i> Delete Post
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>

        {/* Delete confirmation modal */}
        <Modal
          show={showConfirmDelete}
          onHide={cancelDelete}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this reported post?</p>
            <div className="alert alert-warning">
              <p className="mb-1"><strong>Post Content:</strong></p>
              <p className="mb-0">{reportedPost?.post?.content || 'Content not available'}</p>
            </div>
            <p className="text-danger mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone. The post will be permanently removed from the system.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Post
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ReportedPostDetail;
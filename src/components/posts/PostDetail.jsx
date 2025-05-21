import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Alert, Badge, Modal } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getPost, deletePost } from '../../firebase/services';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const postData = await getPost(id);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostData();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      console.log("Attempting to delete post:", id);
      await deletePost(id);
      console.log("Post successfully deleted");
      navigate('/posts');
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(`Failed to delete post: ${err.message || "Unknown error"}`);
      setLoading(false);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <Badge bg="success">Published</Badge>;
      case 'draft':
        return <Badge bg="warning">Draft</Badge>;
      case 'archived':
        return <Badge bg="secondary">Archived</Badge>;
      case 'flagged':
        return <Badge bg="danger">Flagged</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
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
            <Link to="/posts" className="btn btn-primary">Back to Posts</Link>
          </Container>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <Alert variant="warning">Post not found</Alert>
            <Link to="/posts" className="btn btn-primary">Back to Posts</Link>
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
          {/* Update the button group in the header section - remove the Edit button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Post Details</h1>
            <div>
              <Link to="/posts" className="btn btn-secondary me-2">
                <i className="bi bi-arrow-left"></i> Back
              </Link>
              {/* Edit button removed */}
              <Button variant="danger" onClick={handleDeleteClick}>
                <i className="bi bi-trash"></i> Delete
              </Button>
            </div>
          </div>
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{post.title}</h5>
                <div>{getStatusBadge(post.status)}</div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="post-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </div>
              </div>
              
              <Row className="mt-4">
                <Col md={4}>
                  <div className="text-muted mb-2">Author</div>
                  <div>
                    {post.authorName ? (
                      <Link to={`/users/${post.authorId}`}>{post.authorName}</Link>
                    ) : (
                      post.authorId || 'Unknown'
                    )}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-muted mb-2">Category</div>
                  <div>{post.category || 'Uncategorized'}</div>
                </Col>
                <Col md={4}>
                  <div className="text-muted mb-2">Created</div>
                  <div>{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown'}</div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col md={4}>
                  <div className="text-muted mb-2">Last Updated</div>
                  <div>{post.updatedAt ? new Date(post.updatedAt).toLocaleString() : 'N/A'}</div>
                </Col>
                <Col md={8}>
                  <div className="text-muted mb-2">Tags</div>
                  <div>
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.map((tag, index) => (
                        <Badge key={index} bg="info" className="me-1">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-muted">No tags</span>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Engagement Metrics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <div className="h3">{post.views || 0}</div>
                  <div className="text-muted">Views</div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="h3">{post.likes || 0}</div>
                  <div className="text-muted">Likes</div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="h3">{post.comments || 0}</div>
                  <div className="text-muted">Comments</div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="h3">{post.shares || 0}</div>
                  <div className="text-muted">Shares</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {post.reports && post.reports.length > 0 && (
            <Card className="border-0 shadow-sm mb-4 border-danger">
              <Card.Header className="bg-danger bg-opacity-10 border-0 pt-4 pb-3">
                <h5 className="mb-0 text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  This post has been reported
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  This post has been reported {post.reports.length} times for the following reasons:
                </div>
                <ul className="list-group list-group-flush">
                  {post.reports.map((report, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{report.reason}</div>
                        {report.details}
                      </div>
                      <small className="text-muted">
                        {report.reportedAt ? new Date(report.reportedAt).toLocaleString() : 'Unknown'}
                      </small>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Link to="/reported-posts" className="btn btn-outline-danger">
                    View All Reported Posts
                  </Link>
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>

      {/* Delete confirmation modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this post?</p>
          <div className="alert alert-secondary">
            {post.title ? post.title : (post.content?.substring(0, 100) + "...")}
          </div>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostDetail;
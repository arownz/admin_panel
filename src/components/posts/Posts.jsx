import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getPosts, deletePost } from '../../firebase/services';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getPosts();
        setPosts(postsData);
        setFilteredPosts(postsData);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  useEffect(() => {
    let results = [...posts];
    
    if (categoryFilter !== 'all') {
      results = results.filter(post => post.category === categoryFilter);
    }
    
    if (searchTerm) {
      results = results.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPosts(results);
  }, [searchTerm, categoryFilter, posts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete || !postToDelete.id) {
      console.error("No post selected for deletion");
      setError("Failed to delete post: No post selected");
      setShowConfirmDelete(false);
      setPostToDelete(null);
      return;
    }

    console.log("Attempting to delete post:", postToDelete.id);
    
    try {
      await deletePost(postToDelete.id);
      console.log("Post successfully deleted:", postToDelete.id);
      
      const updatedPosts = posts.filter(post => post.id !== postToDelete.id);
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(`Failed to delete post: ${err.message || "Unknown error"}`);
    } finally {
      setShowConfirmDelete(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setPostToDelete(null);
  };

  const truncateContent = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="bi bi-file-post me-2"></i>
              Posts Management
            </h1>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <Form.Control
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: '250px' }}
                  />
                </div>
                
                <div className="text-muted">
                  Total: {filteredPosts.length} posts
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title/Content</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Engagement</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.map(post => (
                        <tr key={post.id}>
                          <td>{post.id}</td>
                          <td>
                            <div className="fw-medium">
                              {post.title ? post.title : truncateContent(post.content)}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {post.authorPhotoUrl ? (
                                <img 
                                  src={post.authorPhotoUrl} 
                                  alt={post.authorName} 
                                  className="rounded-circle me-2"
                                  width="25"
                                  height="25"
                                />
                              ) : null}
                              <span>{post.authorName}</span>
                              {post.isProfessionalPost && (
                                <Badge bg="info" className="ms-1">Pro</Badge>
                              )}
                            </div>
                          </td>
                          <td>{post.category || 'Uncategorized'}</td>
                          <td>
                            <small className="text-muted">
                              <i className="bi bi-heart me-1"></i>{post.likeCount || 0}
                              <span className="mx-2">•</span>
                              <i className="bi bi-chat me-1"></i>{post.commentCount || 0}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link to={`/posts/${post.id}`}>
                                <Button variant="outline-primary" size="sm">
                                  <i className="bi bi-eye"></i>
                                </Button>
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(post)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
          
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
              <p>Are you sure you want to delete this post?</p>
              <div className="alert alert-secondary">
                {postToDelete?.title ? postToDelete.title : truncateContent(postToDelete?.content, 100)}
              </div>
              <p className="text-danger">This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default Posts;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { getPosts, deletePost } from '../../firebase/services';
import { Modal, Button, Alert } from 'react-bootstrap';

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
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      results = results.filter(post => post.category === categoryFilter);
    }
    
    // Apply search term
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

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
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
      
      // Update local state after successful deletion
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

  const getCategories = () => {
    const categories = new Set();
    posts.forEach(post => {
      if (post.category) categories.add(post.category);
    });
    return Array.from(categories);
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
        <div className="data-table-container">
          <div className="data-table-header">
            <h2>Posts Management</h2>
            <div className="d-flex">
              <div className="search-bar">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title/Content</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map(post => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td>
                        {post.title ? post.title : truncateContent(post.content)}
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
                          {post.authorName}
                          {post.isProfessionalPost && (
                            <span className="badge bg-info ms-1">Pro</span>
                          )}
                        </div>
                      </td>
                      <td>{post.category || 'Uncategorized'}</td>
                      <td>{post.likeCount}</td>
                      <td>{post.commentCount}</td>
                      <td>{new Date(post.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/posts/${post.id}`} className="btn btn-sm btn-info">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClick(post)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
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

          {/* Error alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;

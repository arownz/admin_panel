import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Form, Modal } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { deleteUser, getUsersRealtime } from '../../firebase/services';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const setupRealtimeListener = () => {
      try {
        setLoading(true);
        unsubscribe = getUsersRealtime((usersData) => {
          console.log("Received users data:", usersData);
          setUsers(usersData);
          applyFilters(usersData, searchTerm, userTypeFilter);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up users listener:", err);
        setError("Failed to load users. Please refresh the page.");
        setLoading(false);
      }
    };
    
    setupRealtimeListener();
    
    // Cleanup function
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [searchTerm, userTypeFilter]);

  // Update the applyFilters function
  const applyFilters = (usersData, search, typeFilter) => {
    console.log("Filtering users data:", usersData);
    
    // Sort users by creation date (latest first)
    // This serves as a backup for the Firestore orderBy
    let sorted = [...usersData].sort((a, b) => {
      // Handle different timestamp formats
      const getTimestamp = (user) => {
        if (!user.createdAt) return 0;
        
        if (typeof user.createdAt.toDate === 'function') {
          return user.createdAt.toDate().getTime();
        }
        
        if (user.createdAt.seconds) {
          return user.createdAt.seconds * 1000;
        }
        
        return new Date(user.createdAt).getTime();
      };
      
      return getTimestamp(b) - getTimestamp(a); // Descending order (newest first)
    });
    
    let filtered = sorted;
    
    // Apply search filter - focus on name, email and childName
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.childName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply user type filter based on role
    if (typeFilter !== 'all') {
      filtered = filtered.filter(user => user.role === typeFilter);
    }
    
    console.log("Filtered users:", filtered);
    setFilteredUsers(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    applyFilters(users, newSearchTerm, userTypeFilter);
  };

  // Handle user type filter change
  const handleTypeFilterChange = (e) => {
    const newTypeFilter = e.target.value;
    setUserTypeFilter(newTypeFilter);
    applyFilters(users, searchTerm, newTypeFilter);
  };

  // Handle user deletion
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Get profile picture
  const getProfilePicture = (user) => {
    return user.photoUrl || '';
  };

  // Get user display name - prioritize the name field
  const getUserDisplayName = (user) => {
    return user.name || user.email?.split('@')[0] || 'Anonymous User';
  };

  // Get user type text
  const getUserTypeText = (user) => {
    if (user.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return 'Unknown';
  };

  // Get user status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'bg-success';
      case 'suspended': return 'bg-warning';
      case 'inactive': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Format date - display more readable dates for recent entries
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      let date;
      
      // Handle Firestore Timestamp objects
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle timestamp objects with seconds and nanoseconds
      else if (timestamp.seconds) {
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
      
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      // For recent dates (less than 7 days ago), show relative time
      if (diffDays < 7) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        if (diffDays === 0) {
          return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
          return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          return rtf.format(-diffDays, 'day');
        }
      }
      
      // For older dates, show the date
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
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
            <h1 className="m-0">Users</h1>
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div className="d-flex align-items-center mb-2 mb-md-0">
                  <Form.Group className="me-3" style={{minWidth: '200px'}}>
                    <Form.Control
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </Form.Group>
                  
                  <Form.Group style={{minWidth: '150px'}}>
                    <Form.Select 
                      value={userTypeFilter} 
                      onChange={handleTypeFilterChange}
                    >
                      <option value="all">All Users</option>
                      <option value="parent">Parents</option>
                      <option value="professional">Professionals</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                
                <div className="text-muted">
                  Total: {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No users found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Child</th>
                        <th>Status</th>
                        <th>
                          Created
                          <i className="bi bi-arrow-down-short ms-1" title="Sorted newest first"></i>
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {getProfilePicture(user) && getProfilePicture(user) !== '' ? (
                                <img 
                                  src={getProfilePicture(user)} 
                                  alt={user.name || 'User'} 
                                  className="rounded-circle me-2"
                                  width="32"
                                  height="32"
                                  onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = 'https://via.placeholder.com/32';
                                  }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-person text-secondary"></i>
                                </div>
                              )}
                              <Link to={`/users/${user.id}`} className="text-decoration-none">
                                {getUserDisplayName(user)}
                              </Link>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{getUserTypeText(user)}</td>
                          <td>
                            {user.role === 'parent' && user.childName ? 
                              <div>
                                {user.childName}{user.childAge ? `, ${user.childAge} years` : ''}
                                {user.notes && <div className="small text-muted text-truncate" style={{maxWidth: "150px"}}>{user.notes}</div>}
                              </div> 
                              : '-'}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td>
                            {formatDate(user.createdAt)}
                          </td>
                          <td>
                            <div className="d-flex">
                              <Link 
                                to={`/users/${user.id}`}
                                className="btn btn-sm btn-outline-secondary me-2"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link 
                                to={`/users/${user.id}/edit`}
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Modal show={showDeleteModal} onHide={handleDeleteCancel}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete user <strong>{userToDelete?.name || userToDelete?.email}</strong>?
              This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default Users;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { getUsersRealtime, deleteUser } from '../../firebase/services';

const Users = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const unsubscribe = getUsersRealtime((usersData) => {
      console.log("Users data received:", usersData);
      setUsers(usersData);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified') {
        filtered = filtered.filter(user => user.isVerified || user.verificationStatus === 'verified');
      } else if (verificationFilter === 'pending') {
        filtered = filtered.filter(user => user.verificationStatus === 'pending');
      } else if (verificationFilter === 'unverified') {
        filtered = filtered.filter(user => !user.isVerified && user.verificationStatus !== 'verified' && user.verificationStatus !== 'pending');
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.affiliation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, verificationFilter, searchTerm]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      let date;
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getVerificationBadge = (user) => {
    if (user.isVerified || user.verificationStatus === 'verified') {
      return (
        <Badge bg="success">
          <i className="bi bi-check-circle me-1"></i>
          VERIFIED
        </Badge>
      );
    }
    if (user.verificationStatus === 'pending') {
      return (
        <Badge bg="warning">
          <i className="bi bi-clock me-1"></i>
          PENDING
        </Badge>
      );
    }
    if (user.verificationStatus === 'rejected') {
      return (
        <Badge bg="danger">
          <i className="bi bi-x-circle me-1"></i>
          REJECTED
        </Badge>
      );
    }
    return (
      <Badge bg="secondary">
        <i className="bi bi-dash-circle me-1"></i>
        UNVERIFIED
      </Badge>
    );
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setSuccess('User deleted successfully');
        setError(null);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
        setSuccess(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-3">Loading users...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle d-lg-none"
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <i className="bi bi-list fs-4"></i>
      </button>
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Container fluid className="py-3">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-people fs-2 text-primary me-2"></i>
            <h1 className="mb-0">User Management</h1>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
              {success}
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <Form.Control
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '250px' }}
                    aria-label="Search users by name, email, profession, or affiliation"
                  />

                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ width: '150px' }}
                    aria-label="Filter users by role"
                  >
                    <option value="all">All Roles</option>
                    <option value="parent">Parents</option>
                    <option value="professional">Professionals</option>
                  </Form.Select>

                  <Form.Select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    style={{ width: '180px' }}
                    aria-label="Filter users by verification status"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </Form.Select>
                </div>

                <div className="text-muted">
                  Total: {filteredUsers.length} users
                </div>
              </div>

              <div className="table-container">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>NAME/EMAIL</th>
                      <th>ROLE</th>
                      <th>PROFESSION/AFFILIATION</th>
                      <th>VERIFICATION</th>
                      <th>CREATED ↓</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div>
                            <i className="bi bi-people display-4 text-muted mb-3"></i>
                            <div className="text-muted">
                              {searchTerm || roleFilter !== 'all' || verificationFilter !== 'all'
                                ? 'No users match your filters'
                                : 'No users found'
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {user.profile_image_url ? (
                                <img
                                  src={user.profile_image_url}
                                  alt={user.name}
                                  className="rounded-circle me-3"
                                  width="40"
                                  height="40"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-3"
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <i className="bi bi-person text-secondary"></i>
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold">{user.name || 'Anonymous'}</div>
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={user.role === 'professional' ? 'info' : 'primary'}>
                              {user.role?.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            {user.role === 'professional' ? (
                              <div>
                                <div className="fw-medium">{user.profession || 'N/A'}</div>
                                <small className="text-muted">{user.affiliation || 'N.U Dasma'}</small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{getVerificationBadge(user)}</td>
                          <td>
                            <small className="text-muted">
                              {formatDate(user.created_at || user.createdAt)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link to={`/users/${user.id}`}>
                                <Button variant="outline-primary" size="sm" aria-label={`View details for ${user.name || 'user'}`}>
                                  <i className="bi bi-eye"></i>
                                </Button>
                              </Link>
                              <Link to={`/users/${user.id}/edit`}>
                                <Button variant="outline-secondary" size="sm" aria-label={`Edit ${user.name || 'user'}`}>
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                aria-label={`Delete ${user.name || 'user'}`}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
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
                  Showing {filteredUsers.length} of {users.length} users
                </small>
                <div className="d-flex gap-3">
                  <small className="text-muted">
                    <Badge bg="primary" className="me-1">{users.filter(u => u.role === 'parent').length}</Badge>
                    Parents
                  </small>
                  <small className="text-muted">
                    <Badge bg="info" className="me-1">{users.filter(u => u.role === 'professional').length}</Badge>
                    Professionals
                  </small>
                  <small className="text-muted">
                    <Badge bg="success" className="me-1">{users.filter(u => u.isVerified || u.verificationStatus === 'verified').length}</Badge>
                    Verified
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Users;

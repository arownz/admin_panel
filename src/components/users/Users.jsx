import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Form, Badge, Spinner, Alert, Modal, InputGroup } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import TableSkeleton from '../TableSkeleton';
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !userToDelete.id) {
      console.error("No user selected for deletion");
      setError("Failed to delete user: No user selected");
      setShowConfirmDelete(false);
      setUserToDelete(null);
      return;
    }

    console.log("Attempting to delete user:", userToDelete.id);

    try {
      await deleteUser(userToDelete.id);
      console.log("User successfully deleted:", userToDelete.id);
      setSuccess('User deleted successfully');
      setError(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message || "Unknown error"}`);
      setSuccess(null);
    } finally {
      setShowConfirmDelete(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

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
            <h1 className="mb-0">Users Management</h1>
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
                  <InputGroup style={{ width: '250px' }}>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search users by name, email, profession, or affiliation"
                    />
                  </InputGroup>

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
                    {loading ? (
                      <TableSkeleton rows={5} columns={6} />
                    ) : filteredUsers.length === 0 ? (
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
                              {(user.profile_image_url || user.photoUrl) ? (
                                <>
                                  <img
                                    src={user.profile_image_url || user.photoUrl}
                                    alt={user.name}
                                    className="rounded-circle me-3"
                                    width="40"
                                    height="40"
                                    style={{ objectFit: 'cover', display: 'block' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const fallback = e.target.nextElementSibling;
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                        fallback.classList.add('d-flex');
                                      }
                                    }}
                                  />
                                  <div
                                    className="rounded-circle bg-secondary bg-opacity-25 align-items-center justify-content-center me-3"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      display: 'none'
                                    }}
                                  >
                                    <i className="bi bi-person text-secondary"></i>
                                  </div>
                                </>
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
                                onClick={() => handleDeleteClick(user)}
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
              <p>Are you sure you want to delete this user?</p>
              <div className="alert alert-secondary">
                <strong>{userToDelete?.name || 'Unnamed User'}</strong>
                <br />
                <small className="text-muted">{userToDelete?.email}</small>
              </div>
              <p className="text-danger">This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete User
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default Users;

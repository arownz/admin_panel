import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import TableSkeleton from '../TableSkeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { getAppointments } from '../../firebase/services';
import { Container, Badge, Card, Form, InputGroup } from 'react-bootstrap';

const Appointments = () => {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
        setFilteredAppointments(appointmentsData);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let results = [...appointments];

    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(appointment => appointment.status === statusFilter);
    }

    // Apply search term
    if (searchTerm) {
      results = results.filter(appointment =>
        appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.professionalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(results);
  }, [searchTerm, statusFilter, appointments]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

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

      return date.toLocaleString('en-US', {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge bg-success">
            <i className="bi bi-check-circle me-1"></i>
            {status.toUpperCase()}
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-danger">
            <i className="bi bi-x-circle me-1"></i>
            {status.toUpperCase()}
          </span>
        );
      case 'scheduled':
        return (
          <span className="badge bg-primary">
            <i className="bi bi-calendar-check me-1"></i>
            {status.toUpperCase()}
          </span>
        );
      case 'pending':
        return (
          <span className="badge bg-warning">
            <i className="bi bi-clock me-1"></i>
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary">
            <i className="bi bi-dash-circle me-1"></i>
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <button className="mobile-menu-toggle d-lg-none" onClick={toggleSidebar}>
        <i className="bi bi-list fs-4"></i>
      </button>
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Container fluid className="py-3">
          <div className="d-flex align-items-center mb-4">
            <h1 className="mb-0">Appointments Management</h1>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    style={{ width: '150px' }}
                  >
                    <option value="all">All Status</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                  </Form.Select>

                  <InputGroup style={{ width: '250px' }}>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                </div>

                <div className="text-muted">
                  Total: {filteredAppointments.length} appointments
                </div>
              </div>

              {loading ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Professional</th>
                          <th>Specialty</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <TableSkeleton rows={5} columns={8} />
                      </tbody>
                    </table>
                  </div>
                </>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Professional</th>
                          <th>Specialty</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map(appointment => (
                          <tr key={appointment.id}>
                            <td>{appointment.id}</td>
                            <td>{appointment.userName}</td>
                            <td>{appointment.professionalName}</td>
                            <td>{appointment.specialty}</td>
                            <td>{formatDate(appointment.appointmentTime)}</td>
                            <td>
                              {getStatusBadge(appointment.status)}
                            </td>
                            <td>{formatDate(appointment.createdAt)}</td>
                            <td>
                              {/* Removed Edit and Delete buttons, kept only View */}
                              <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-info">
                                <i className="bi bi-eye"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <small className="text-muted">
                      Showing {filteredAppointments.length} of {appointments.length} appointments
                    </small>
                    <div className="d-flex gap-3">
                      <small className="text-muted">
                        <Badge bg="warning" className="me-1">{appointments.filter(a => a.status === 'scheduled').length}</Badge>
                        Scheduled
                      </small>
                      <small className="text-muted">
                        <Badge bg="success" className="me-1">{appointments.filter(a => a.status === 'completed').length}</Badge>
                        Completed
                      </small>
                      <small className="text-muted">
                        <Badge bg="danger" className="me-1">{appointments.filter(a => a.status === 'cancelled').length}</Badge>
                        Cancelled
                      </small>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Appointments;

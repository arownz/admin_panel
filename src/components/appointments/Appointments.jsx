import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { getAppointments } from '../../firebase/services';
import { Container } from 'react-bootstrap';

const Appointments = () => {
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

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'scheduled':
        return 'bg-primary';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="bi bi-calendar-check me-2"></i>
              Appointments
            </h1>
          </div>
          <div className="data-table-container">
            <div className="data-table-header">
              <div className="d-flex">
                <div className="me-2">
                  <select 
                    className="form-select" 
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="all">All Statuses</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="search-bar">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search appointments..."
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
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : (
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
                        <td>{new Date(appointment.appointmentTime).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>{new Date(appointment.createdAt).toLocaleString()}</td>
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
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Appointments;

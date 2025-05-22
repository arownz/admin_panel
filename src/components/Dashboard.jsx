import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Sidebar from './Sidebar';
import { 
  getUsers, 
  getAppointments, 
  getPosts, 
  getReportedPosts,
  getChats,
  convertTimestamp
} from '../firebase/services';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    appointments: 0,
    posts: 0,
    reportedPosts: 0,
    activeChats: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from Firebase
        const usersData = await getUsers();
        const appointmentsData = await getAppointments();
        const postsData = await getPosts();
        const reportedPostsData = await getReportedPosts();
        const chatsData = await getChats();
        
        // Update stats
        setStats({
          users: usersData.length,
          appointments: appointmentsData.length,
          posts: postsData.length,
          reportedPosts: reportedPostsData.length,
          activeChats: chatsData.length
        });
        
        // Get most recent users (sort by last_login)
        const sortedUsers = [...usersData].sort((a, b) => {
          const dateA = a.last_login ? new Date(a.last_login) : new Date(0);
          const dateB = b.last_login ? new Date(b.last_login) : new Date(0);
          return dateB - dateA;
        }).slice(0, 5);
        setRecentUsers(sortedUsers);
        
        // Get most recent appointments (sort by appointmentTime)
        const sortedAppointments = [...appointmentsData].sort((a, b) => {
          const dateA = a.appointmentTime ? new Date(convertTimestamp(a.appointmentTime)) : new Date(0);
          const dateB = b.appointmentTime ? new Date(convertTimestamp(b.appointmentTime)) : new Date(0);
          return dateB - dateA;
        }).slice(0, 5);
        setRecentAppointments(sortedAppointments);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Data for bar chart
  const barChartData = {
    labels: ['Users', 'Appointments', 'Posts', 'Reported Posts'],
    datasets: [
      {
        label: 'System Statistics',
        data: [stats.users, stats.appointments, stats.posts, stats.reportedPosts],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Data for pie chart - appointment status distribution
  const getAppointmentStatusCounts = () => {
    const statusCounts = {
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };
    
    recentAppointments.forEach(appointment => {
      if (statusCounts.hasOwnProperty(appointment.status)) {
        statusCounts[appointment.status]++;
      }
    });
    
    return statusCounts;
  };
  
  const statusCounts = getAppointmentStatusCounts();
  
  const pieChartData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [statusCounts.scheduled, statusCounts.completed, statusCounts.cancelled],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'scheduled': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
      }
      
      // Handle timestamp objects with seconds and nanoseconds
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      
      // Already a date or timestamp string
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (error) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Container fluid className="py-3">
            <div className="alert alert-danger">{error}</div>
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
          <h1 className="mb-4">Dashboard</h1>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <Row className="g-3 mb-4">
                <Col md={6} xl={3}>
                  <Card className="stat-card h-100 border-0">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-primary-gradient me-3">
                        <i className="bi bi-people-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="stat-value display-6 fw-bold">{stats.users}</div>
                        <div className="stat-label text-muted">Total Users</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card className="stat-card h-100 border-0">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-success-gradient me-3">
                        <i className="bi bi-calendar-check-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="stat-value display-6 fw-bold">{stats.appointments}</div>
                        <div className="stat-label text-muted">Appointments</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card className="stat-card h-100 border-0">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-warning-gradient me-3">
                        <i className="bi bi-file-post-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="stat-value display-6 fw-bold">{stats.posts}</div>
                        <div className="stat-label text-muted">Posts</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card className="stat-card h-100 border-0">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-danger-gradient me-3">
                        <i className="bi bi-flag-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="stat-value display-6 fw-bold">{stats.reportedPosts}</div>
                        <div className="stat-label text-muted">Reported Posts</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {/* Charts */}
              <Row className="mb-4">
                <Col lg={8} className="mb-3">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h5 className="mb-0">System Overview</h5>
                    </Card.Header>
                    <Card.Body>
                      <Bar data={barChartData} options={{ responsive: true }} />
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={4} className="mb-3">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h5 className="mb-0">Appointment Status</h5>
                    </Card.Header>
                    <Card.Body>
                      <Pie data={pieChartData} options={{ responsive: true }} />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Recent Data */}
              <Row>
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="m-0">Recent Users</h5>
                        <Link to="/users" className="btn btn-sm btn-outline-primary">View All</Link>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table m-0">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th> {/* Changed from Username */}
                              <th>Email</th>
                              <th>Role</th> {/* Changed from Type */}
                              <th>Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentUsers.map(user => (
                              <tr key={user.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {user.photoUrl && user.photoUrl !== '' ? (
                                      <img 
                                        src={user.photoUrl} 
                                        alt={user.name} 
                                        className="rounded-circle me-2"
                                        width="32"
                                        height="32"
                                        style={{ objectFit: 'cover' }}
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
                                    <Link to={`/users/${user.id}`}>{user.name || 'Unnamed User'}</Link>
                                  </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                  <span className={`badge ${user.role === 'professional' ? 'bg-info' : 'bg-secondary'}`}>
                                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                                  </span>
                                </td>
                                <td>{formatDate(user.createdAt)}</td>
                              </tr>
                            ))}
                            {recentUsers.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center py-3">No users found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Recent Appointments</h5>
                      <Link to="/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>User</th>
                              <th>Professional</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentAppointments.map(appointment => (
                              <tr key={appointment.id}>
                                <td>
                                  <Link to={`/users/${appointment.userId}`} className="text-decoration-none">
                                    {appointment.userName}
                                  </Link>
                                </td>
                                <td>{appointment.professionalName}</td>
                                <td>{appointment.appointmentTime ? 
                                  new Date(convertTimestamp(appointment.appointmentTime)).toLocaleString() : 
                                  'Not scheduled'}
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {recentAppointments.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center py-3">No appointments found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import Sidebar from './Sidebar';
import { 
  getUsers, 
  getAppointments, 
  getPosts, 
  getReportedPosts,
  getVerificationRequests,
  convertTimestamp
} from '../firebase/services';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
    verificationRequests: 0,
    // Enhanced stats
    pendingReports: 0,
    completedAppointments: 0,
    newUsersThisMonth: 0,
    pendingVerifications: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data
        const [usersData, appointmentsData, postsData, reportedPostsData, verificationData] = await Promise.all([
          getUsers(),
          getAppointments(),
          getPosts(),
          getReportedPosts(),
          getVerificationRequests()
        ]);
        
        // Calculate enhanced statistics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // User statistics
        const newUsersThisMonth = usersData.filter(user => {
          const userDate = user.createdAt ? new Date(convertTimestamp(user.createdAt)) : new Date(0);
          return userDate >= startOfMonth;
        }).length;
        
        // Appointment statistics
        const completedAppointments = appointmentsData.filter(apt => apt.status === 'completed').length;
        
        // Report statistics
        const pendingReports = reportedPostsData.filter(report => report.status === 'pending').length;
        
        // Verification statistics
        const pendingVerifications = verificationData.filter(req => req.status === 'pending').length;
        
        setStats({
          users: usersData.length,
          appointments: appointmentsData.length,
          posts: postsData.length,
          reportedPosts: reportedPostsData.length,
          verificationRequests: verificationData.length,
          pendingReports,
          completedAppointments,
          newUsersThisMonth,
          pendingVerifications
        });
        
        // Set recent data (last 5 items)
        const sortedUsers = [...usersData]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(convertTimestamp(a.createdAt)) : new Date(0);
            const dateB = b.createdAt ? new Date(convertTimestamp(b.createdAt)) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentUsers(sortedUsers);
        
        const sortedAppointments = [...appointmentsData]
          .sort((a, b) => {
            const dateA = a.appointmentTime ? new Date(convertTimestamp(a.appointmentTime)) : new Date(0);
            const dateB = b.appointmentTime ? new Date(convertTimestamp(b.appointmentTime)) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentAppointments(sortedAppointments);
        
        const sortedPosts = [...postsData]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(convertTimestamp(a.createdAt)) : new Date(0);
            const dateB = b.createdAt ? new Date(convertTimestamp(b.createdAt)) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentPosts(sortedPosts);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data based on real statistics
  const barChartData = {
    labels: ['Total Users', 'Posts', 'Appointments', 'Pending Reports', 'Verifications'],
    datasets: [
      {
        label: 'Count',
        data: [stats.users, stats.posts, stats.appointments, stats.pendingReports, stats.verificationRequests],
        backgroundColor: [
          'rgba(67, 97, 238, 0.8)',
          'rgba(255, 209, 102, 0.8)',
          'rgba(77, 212, 172, 0.8)',
          'rgba(239, 71, 111, 0.8)',
          'rgba(17, 138, 178, 0.8)'
        ],
        borderColor: [
          'rgba(67, 97, 238, 1)',
          'rgba(255, 209, 102, 1)',
          'rgba(77, 212, 172, 1)',
          'rgba(239, 71, 111, 1)',
          'rgba(17, 138, 178, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Appointment status pie chart
  const appointmentStatusData = {
    labels: ['Completed', 'Scheduled', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.completedAppointments,
          stats.appointments - stats.completedAppointments - (recentAppointments.filter(apt => apt.status === 'cancelled').length),
          recentAppointments.filter(apt => apt.status === 'cancelled').length
        ],
        backgroundColor: [
          'rgba(77, 212, 172, 0.8)',
          'rgba(67, 97, 238, 0.8)',
          'rgba(239, 71, 111, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
      }
      
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'scheduled': return 'bg-primary';
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'pending': return 'bg-warning';
      default: return 'bg-secondary';
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
              <div className="mt-2">Loading dashboard data...</div>
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
          <h1 className="mb-4">Dashboard Overview</h1>
          
          {/* Enhanced Stats Cards */}
          <Row className="g-3 mb-4">
            <Col md={6} xl={3}>
              <Card className="stat-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="stat-icon bg-primary-gradient me-3">
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                  <div>
                    <div className="stat-value display-6 fw-bold">{stats.users}</div>
                    <div className="stat-label text-muted">Total Users</div>
                    <small className="text-info">
                      <i className="bi bi-plus-circle"></i> {stats.newUsersThisMonth} new this month
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} xl={3}>
              <Card className="stat-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="stat-icon bg-success-gradient me-3">
                    <i className="bi bi-calendar-check-fill fs-4"></i>
                  </div>
                  <div>
                    <div className="stat-value display-6 fw-bold">{stats.appointments}</div>
                    <div className="stat-label text-muted">Appointments</div>
                    <small className="text-success">
                      <i className="bi bi-check-circle"></i> {stats.completedAppointments} completed
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} xl={3}>
              <Card className="stat-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="stat-icon bg-warning-gradient me-3">
                    <i className="bi bi-file-post-fill fs-4"></i>
                  </div>
                  <div>
                    <div className="stat-value display-6 fw-bold">{stats.posts}</div>
                    <div className="stat-label text-muted">Total Posts</div>
                    <small className="text-info">
                      <i className="bi bi-bar-chart"></i> Content activity
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} xl={3}>
              <Card className="stat-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="stat-icon bg-danger-gradient me-3">
                    <i className="bi bi-flag-fill fs-4"></i>
                  </div>
                  <div>
                    <div className="stat-value display-6 fw-bold">{stats.reportedPosts}</div>
                    <div className="stat-label text-muted">Reported Posts</div>
                    <small className="text-warning">
                      <i className="bi bi-exclamation-triangle"></i> {stats.pendingReports} pending
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional Stats Row */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-muted">Verification Requests</h5>
                  <div className="display-4 fw-bold text-info">{stats.verificationRequests}</div>
                  <small className="text-warning">
                    <i className="bi bi-clock"></i> {stats.pendingVerifications} pending review
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-muted">New Users This Month</h5>
                  <div className="display-4 fw-bold text-success">{stats.newUsersThisMonth}</div>
                  <small className="text-muted">Growth indicator</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h5 className="mb-0">System Statistics</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={barChartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h5 className="mb-0">Appointment Status</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={appointmentStatusData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false 
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Recent Data Tables */}
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
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <Link to={`/users/${user.id}`} className="text-decoration-none">
                                {user.name || 'Unnamed User'}
                              </Link>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(user.status || 'active')}`}>
                                {user.status || 'Active'}
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
                <Card.Header className="bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0">Recent Appointments</h5>
                    <Link to="/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
                  </div>
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
                              <Link to={`/appointments/${appointment.id}`} className="text-decoration-none">
                                {appointment.userName || 'Unknown User'}
                              </Link>
                            </td>
                            <td>{appointment.professionalName || 'N/A'}</td>
                            <td>
                              {appointment.appointmentTime ? 
                                formatDate(appointment.appointmentTime) : 
                                'Not scheduled'
                              }
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status || 'Scheduled'}
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

          {/* Recent Posts */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0">Recent Posts</h5>
                    <Link to="/posts" className="btn btn-sm btn-outline-primary">View All</Link>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Content</th>
                          <th>Author</th>
                          <th>Created</th>
                          <th>Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPosts.map(post => (
                          <tr key={post.id}>
                            <td>
                              <Link to={`/posts/${post.id}`} className="text-decoration-none">
                                {post.content ? 
                                  (post.content.length > 50 ? 
                                    post.content.substring(0, 50) + '...' : 
                                    post.content) : 
                                  'No content'
                                }
                              </Link>
                            </td>
                            <td>{post.authorName || 'Unknown'}</td>
                            <td>{formatDate(post.createdAt)}</td>
                            <td>
                              <small className="text-muted">
                                <i className="bi bi-heart"></i> {post.likes || 0} | 
                                <i className="bi bi-chat"></i> {post.comments || 0}
                              </small>
                            </td>
                          </tr>
                        ))}
                        {recentPosts.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-3">No posts found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;

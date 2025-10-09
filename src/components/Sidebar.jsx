import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../hooks/useSidebar';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, isMobile, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      closeMobileSidebar();
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/users', icon: 'bi-people', label: 'User Management' },
    { path: '/verification-requests', icon: 'bi-patch-check', label: 'Verification Requests' },
    { path: '/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { path: '/posts', icon: 'bi-file-post', label: 'Posts' },
    { path: '/reported-posts', icon: 'bi-flag', label: 'Reported Posts' },
    { path: '/admin-codes', icon: 'bi-key', label: 'Admin Codes' },
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'show' : ''} d-flex flex-column`}
        style={{ height: '100vh' }}
      >
        <div className="sidebar-header p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-between">
            {(!isCollapsed || isMobile) && (
              <div className="d-flex align-items-center text-white">
                <i className="bi bi-gear-wide-connected fs-3 text-primary me-2"></i>
                <div>
                  <h5 className="mb-0">TeamLexia</h5>
                  <small className="text-light opacity-75">Admin Panel</small>
                </div>
              </div>
            )}
            {isCollapsed && !isMobile && (
              <i className="bi bi-gear-wide-connected fs-3 text-primary"></i>
            )}
            {!isMobile && (
              <button
                className="btn btn-link text-white p-1"
                onClick={toggleSidebar}
                style={{ fontSize: '1.2rem' }}
              >
                <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
              </button>
            )}
            {isMobile && (
              <button
                className="btn btn-link text-white p-1"
                onClick={closeMobileSidebar}
                style={{ fontSize: '1.2rem' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav flex-grow-1 d-flex flex-column">
          <ul className="nav flex-column p-2 flex-grow-1">
            {menuItems.map((item) => (
              <li className="nav-item mb-2" key={item.path}>
                <a
                  onClick={() => handleNavClick(item.path)}
                  className={`nav-link d-flex align-items-center text-white text-decoration-none rounded px-3 py-3 ${isActive(item.path) ? 'bg-primary' : ''}`}
                  style={{
                    minHeight: '50px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title={(isCollapsed && !isMobile) ? item.label : ''}
                >
                  <i className={`${item.icon} ${(isCollapsed && !isMobile) ? '' : 'me-3'}`} style={{ fontSize: '1.2rem' }}></i>
                  {(!isCollapsed || isMobile) && <span style={{ fontSize: '1rem' }}>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer p-3 border-top border-secondary">
          <button
            onClick={handleLogoutClick}
            className={`btn btn-outline-light w-100 d-flex align-items-center py-2 ${(isCollapsed && !isMobile) ? 'justify-content-center' : ''}`}
            style={{ minHeight: '45px' }}
            title={(isCollapsed && !isMobile) ? 'Logout' : ''}
          >
            <i className={`bi bi-box-arrow-right ${(isCollapsed && !isMobile) ? '' : 'me-2'}`} style={{ fontSize: '1.1rem' }}></i>
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-0">Are you sure you want to logout from the admin panel?</p>
          <small className="text-muted">You will need to enter your authentication code again to access the panel.</small>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-2">
          <Button
            variant="outline-secondary"
            onClick={handleLogoutCancel}
            className="px-4"
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogoutConfirm}
            className="px-4"
          >
            <i className="bi bi-box-arrow-right me-1"></i>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Sidebar;

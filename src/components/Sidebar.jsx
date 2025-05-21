import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';  // Add Modal import
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [activeItem, setActiveItem] = useState('/');
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Add state for logout modal

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Update handleLogout to show confirmation dialog
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Add confirmLogout function to handle actual logout
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // Add cancelLogout function to close the modal without logging out
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Removed dyslexia-users, notifications, admin codes, and settings from menuItems
  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/users', icon: 'bi-people', label: 'User Management' },
    { path: '/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { path: '/posts', icon: 'bi-file-post', label: 'Posts' },
    { path: '/reported-posts', icon: 'bi-flag', label: 'Reported Posts' },
    { path: '/chats', icon: 'bi-chat-dots', label: 'Chats' },
  ];

  return (
    <>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3 className={collapsed ? 'd-none' : ''}>TeamLexia Admin</h3>
          <Button 
            variant="link" 
            className="toggle-btn p-0 text-white" 
            onClick={toggleSidebar}
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </Button>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`sidebar-menu-item ${activeItem === item.path ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              {!collapsed && <span className="ms-2">{item.label}</span>}
            </Link>
          ))}
          <a href="#" className="sidebar-menu-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            {!collapsed && <span className="ms-2">Logout</span>}
          </a>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={cancelLogout} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to logout?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Sidebar;

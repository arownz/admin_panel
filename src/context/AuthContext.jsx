import { createContext, useState, useContext, useEffect } from 'react';

// Single admin authentication code
const ADMIN_CODE = 'FepaNKKk4nuElM4gG5Ai';  // Super Admin

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if there's a stored auth code on initial load
    const storedCode = localStorage.getItem('adminAuthCode');
    if (storedCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      setCurrentUser({ role: 'admin' }); // Mock user object
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    try {
      console.log("Logging out user...");
      
      // Clear authentication data from localStorage
      localStorage.removeItem('adminAuthCode');
      localStorage.removeItem('adminAuthTime');
      
      // Update authentication state
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      console.log("Logout successful, redirecting to login page");
      
      // Force redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      alert("There was a problem logging out. Please try again.");
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;

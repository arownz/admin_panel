import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const authCode = localStorage.getItem('adminAuthCode');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (authCode && authTime) {
      const loginTime = parseInt(authTime);
      const currentTime = Date.now();
      const timeDifference = currentTime - loginTime;
      
      // Session expires after 24 hours (86400000 ms)
      if (timeDifference < 86400000) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear storage
        localStorage.removeItem('adminAuthCode');
        localStorage.removeItem('adminAuthTime');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (authCode) => {
    localStorage.setItem('adminAuthCode', authCode);
    localStorage.setItem('adminAuthTime', Date.now().toString());
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminAuthCode');
    localStorage.removeItem('adminAuthTime');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    setIsAuthenticated
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
// filepath: c:\Users\droid\admin_panel\src\components\ThemeToggle.jsx
import React from 'react';
import { Button } from 'react-bootstrap';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);
  
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode');
  };
  
  return (
    <Button 
      variant="link" 
      className="theme-toggle p-0" 
      onClick={toggleTheme}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>
    </Button>
  );
};

export default ThemeToggle;
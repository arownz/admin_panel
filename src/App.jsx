import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Users from './components/users/Users';
import UserDetail from './components/users/UserDetail';
import UserForm from './components/users/UserForm';
import Appointments from './components/appointments/Appointments';
import AppointmentDetail from './components/appointments/AppointmentDetail';
import Posts from './components/posts/Posts';
import PostDetail from './components/posts/PostDetail';
import ReportedPosts from './components/reported/ReportedPosts';
import ReportedPostDetail from './components/reported/ReportedPostDetail';
import Chats from './components/chats/Chats';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="/users/:id/edit" element={<UserForm />} />
      
      {/* Appointment routes */}
      <Route path="/appointments" element={
        <ProtectedRoute>
          <Appointments />
        </ProtectedRoute>
      } />
      <Route path="/appointments/:id" element={
        <ProtectedRoute>
          <AppointmentDetail />
        </ProtectedRoute>
      } />
      
      {/* Posts routes */}
      <Route path="/posts" element={
        <ProtectedRoute>
          <Posts />
        </ProtectedRoute>
      } />
      <Route path="/posts/:id" element={
        <ProtectedRoute>
          <PostDetail />
        </ProtectedRoute>
      } />
      
      {/* Reported posts routes */}
      <Route path="/reported-posts" element={<ReportedPosts />} />
      <Route path="/reported-posts/:id" element={<ReportedPostDetail />} />
      
      {/* Chats route */}
      <Route path="/chats" element={
        <ProtectedRoute>
          <Chats />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

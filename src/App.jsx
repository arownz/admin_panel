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
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      
      {/* Protect the Dashboard route */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Other protected routes */}
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/users/:id" element={
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      } />
      <Route path="/users/:id/edit" element={
        <ProtectedRoute>
          <UserForm />
        </ProtectedRoute>
      } />
      
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
      <Route path="/reported-posts" element={
        <ProtectedRoute>
          <ReportedPosts />
        </ProtectedRoute>
      } />
      <Route path="/reported-posts/:id" element={
        <ProtectedRoute>
          <ReportedPostDetail />
        </ProtectedRoute>
      } />
      
      {/* Chats route */}
      <Route path="/chats" element={
        <ProtectedRoute>
          <Chats />
        </ProtectedRoute>
      } />
      
      {/* Redirect any unknown paths to login or dashboard based on authentication */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
      } />
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

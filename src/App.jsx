import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Users from './components/users/Users';
import UserDetail from './components/users/UserDetail';
import UserForm from './components/users/UserForm';
import Posts from './components/posts/Posts';
import PostDetail from './components/posts/PostDetail';
import ReportedPosts from './components/reported/ReportedPosts';
import ReportedPostDetail from './components/reported/ReportedPostDetail';
import Appointments from './components/appointments/Appointments';
import AppointmentDetail from './components/appointments/AppointmentDetail';
import VerificationRequests from './components/verification/VerificationRequests';
import VerificationRequestDetail from './components/verification/VerificationRequestDetail';
import AdminCodes from './components/admin/AdminCodes';
import LoadingBar from './components/LoadingBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <LoadingBar />
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

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

              <Route path="/verification-requests" element={
                <ProtectedRoute>
                  <VerificationRequests />
                </ProtectedRoute>
              } />

              <Route path="/verification-requests/:id" element={
                <ProtectedRoute>
                  <VerificationRequestDetail />
                </ProtectedRoute>
              } />

              <Route path="/admin-codes" element={
                <ProtectedRoute>
                  <AdminCodes />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;

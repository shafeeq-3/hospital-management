import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Loader from './components/ui/Loader';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientBilling from './pages/patient/Billing';
import PatientPayments from './pages/patient/Payments';
import PatientReports from './pages/patient/Reports';
import PatientProfile from './pages/patient/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorReports from './pages/doctor/Reports';
import DoctorSalary from './pages/doctor/Salary';
import DoctorProfile from './pages/doctor/Profile';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffSalary from './pages/staff/Salary';
import StaffAnnouncements from './pages/staff/Announcements';
import StaffSchedule from './pages/staff/Schedule';
import StaffProfile from './pages/staff/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTests from './pages/admin/Tests';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminPayments from './pages/admin/Payments';
import AdminSalaries from './pages/admin/Salaries';
import AdminSettings from './pages/admin/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/billing"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/payments"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/reports"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/salary"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/announcements"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/schedule"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/salary"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/profile"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salaries"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSalaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                  <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                    Go back home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

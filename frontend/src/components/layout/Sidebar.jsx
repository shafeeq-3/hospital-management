import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  User, 
  Users, 
  TestTube, 
  DollarSign, 
  Megaphone,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
          { icon: FileText, label: 'My Reports', path: '/patient/reports' },
          { icon: CreditCard, label: 'Billing', path: '/patient/billing' },
          { icon: DollarSign, label: 'Payments', path: '/patient/payments' },
          { icon: User, label: 'Profile', path: '/patient/profile' },
        ];
      case 'doctor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
          { icon: Users, label: 'Patients', path: '/doctor/patients' },
          { icon: FileText, label: 'Reports', path: '/doctor/reports' },
          { icon: DollarSign, label: 'Salary', path: '/doctor/salary' },
          { icon: User, label: 'Profile', path: '/doctor/profile' },
        ];
      case 'staff':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
          { icon: Megaphone, label: 'Announcements', path: '/staff/announcements' },
          { icon: Calendar, label: 'Schedule', path: '/staff/schedule' },
          { icon: DollarSign, label: 'Salary', path: '/staff/salary' },
          { icon: User, label: 'Profile', path: '/staff/profile' },
        ];
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: TestTube, label: 'Tests', path: '/admin/tests' },
          { icon: DollarSign, label: 'Salaries', path: '/admin/salaries' },
          { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
          { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
          { icon: Settings, label: 'Settings', path: '/admin/settings' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">MediCare</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

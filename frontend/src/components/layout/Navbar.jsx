import { useState } from 'react';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearching(true);
      const { data } = await api.get(`/${user.role}/search?q=${query}`);
      setSearchResults(data.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (result) => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    
    // Navigate based on result type and user role
    if (user.role === 'admin') {
      if (result.type === 'user') {
        navigate('/admin/users');
      } else if (result.type === 'test') {
        navigate('/admin/tests');
      } else if (result.type === 'announcement') {
        navigate('/admin/announcements');
      }
    } else if (user.role === 'doctor') {
      if (result.type === 'patient') {
        navigate('/doctor/patients');
      } else if (result.type === 'report') {
        navigate('/doctor/reports');
      }
    } else if (user.role === 'patient') {
      if (result.type === 'report') {
        navigate('/patient/reports');
      } else if (result.type === 'billing') {
        navigate('/patient/billing');
      }
    } else if (user.role === 'staff') {
      if (result.type === 'announcement') {
        navigate('/staff/announcements');
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          <div className="hidden lg:flex items-center ml-4 flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, reports, tests..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowResults(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
                  {searching ? (
                    <div className="p-4 text-center text-gray-500">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No results found</div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{result.title}</p>
                              <p className="text-sm text-gray-600">{result.description}</p>
                            </div>
                            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                              {result.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="hidden lg:block text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

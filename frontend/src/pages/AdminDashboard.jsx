import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getLogs, getLogAnalytics } = useApi();
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  // Check if user is admin on load
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Load logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { action, userId, startDate, endDate } = filters;
        const res = await getLogs(page, 20, action, userId, startDate, endDate);
        if (res && res.logs) {
          setLogs(res.logs);
          setTotalPages(res.pagination.pages);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [getLogs, page, filters]);

  // Load analytics on initial page load
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getLogAnalytics();
        if (res) {
          setAnalytics(res);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    
    fetchAnalytics();
  }, [getLogAnalytics]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    // The filters state is already set via handleFilterChange, 
    // and the useEffect will trigger a reload
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get color for action type
  const getActionColor = (action) => {
    const colors = {
      'login': 'bg-emerald-100 text-emerald-700',
      'register': 'bg-blue-100 text-blue-700',
      'profile_update': 'bg-purple-100 text-purple-700',
      'workout_complete': 'bg-orange-100 text-orange-700',
      'meal_tracking': 'bg-green-100 text-green-700',
      'page_view': 'bg-gray-100 text-gray-700',
      'badge_earned': 'bg-yellow-100 text-yellow-700',
      'error': 'bg-red-100 text-red-700'
    };
    
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Analytics Section */}
        {analytics && (
          <div className="mb-8 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analytics Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Activity by Type */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Activity by Type</h3>
                <div className="space-y-2">
                  {analytics.actionCounts.map(action => (
                    <div key={action._id} className="flex justify-between">
                      <span className={`px-2 py-1 rounded text-sm ${getActionColor(action._id)}`}>
                        {action._id}
                      </span>
                      <span className="font-semibold">{action.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Users */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Top Active Users</h3>
                <div className="space-y-2">
                  {analytics.topUsers.map(user => (
                    <div key={user._id} className="flex justify-between items-center">
                      <div className="truncate max-w-[70%]">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                        {user.count} actions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Period Info */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Analysis Period</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{formatDate(analytics.period.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{formatDate(analytics.period.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Activities:</span>
                    <span>{analytics.actionCounts.reduce((sum, action) => sum + action.count, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Filter Logs</h2>
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full rounded bg-gray-700 border-gray-600 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="register">Register</option>
                <option value="profile_update">Profile Update</option>
                <option value="workout_complete">Workout Complete</option>
                <option value="meal_tracking">Meal Tracking</option>
                <option value="page_view">Page View</option>
                <option value="badge_earned">Badge Earned</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Enter user ID"
                className="w-full rounded bg-gray-700 border-gray-600 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full rounded bg-gray-700 border-gray-600 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full rounded bg-gray-700 border-gray-600 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
        
        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4">User Activity Logs</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-2">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No logs found matching the criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.user ? (
                          <div>
                            <div>{log.user.name}</div>
                            <div className="text-xs text-gray-400">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.ip || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-900 p-2 rounded max-w-md overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
              <div>
                <p className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
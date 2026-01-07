import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Edit, Eye, EyeOff } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPassword = () => {
    if (!user) return '••••••••••••';
    
    if (user.role === 'ADMIN') {
      return 'admin123';
    } else if (user.role === 'STUDENT' && user.studentUid) {
      return user.studentUid;
    } else {
      // For other roles, check if username matches a pattern
      // If it's a staff account, default might be username or a standard password
      return user.username.toLowerCase() + '123';
    }
  };
  
  const getPasswordInfo = () => {
    if (!user) return { password: '••••••••••••', info: '' };
    
    if (user.role === 'ADMIN') {
      return {
        password: 'admin123',
        info: 'Default admin password - change it for security'
      };
    } else if (user.role === 'STUDENT' && user.studentUid) {
      return {
        password: user.studentUid,
        info: 'Student UID is the default password'
      };
    } else {
      // For staff accounts, show username-based default
      const defaultPwd = user.username.toLowerCase() + '123';
      return {
        password: defaultPwd,
        info: 'Default password format: username + 123 (if not changed)'
      };
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600">
        <p>User not found</p>
        <Link to="/users" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/users" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Users
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600 mt-1">View user information</p>
        </div>
        <Link to={`/users/${id}/edit`}>
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2 inline" />
            Edit User
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Basic Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <p className="font-medium text-lg">{user.username}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={showPassword ? getPasswordInfo().password : "••••••••••••"}
                          readOnly
                          className="input bg-white border-blue-300 font-mono text-sm pr-10 w-full font-semibold text-gray-900"
                          style={{ letterSpacing: showPassword ? '0px' : '2px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 focus:outline-none transition-colors"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {showPassword && (
                      <div className="text-sm text-green-800 bg-green-100 border border-green-300 px-4 py-3 rounded mb-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span className="font-semibold">Password:</span>
                          <span className="font-mono font-bold text-lg">{getPasswordInfo().password}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded">
                      <strong>ℹ️ Password Info:</strong> {getPasswordInfo().info}
                      <span className="block mt-1 text-blue-700">
                        {!showPassword && (
                          <span className="text-blue-600 font-medium">👆 Click eye icon to view password</span>
                        )}
                        {showPassword && (
                          <span>
                            {user.role === 'ADMIN' 
                              ? '⚠️ This is the default password. If changed, actual password cannot be retrieved (BCrypt encrypted).'
                              : user.role === 'STUDENT'
                              ? '⚠️ This is the default password (Student UID). If changed, actual password cannot be retrieved.'
                              : '⚠️ This is the default password format. If changed, actual password cannot be retrieved (BCrypt encrypted).'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to={`/users/${id}/edit`}>
                  <Button variant="secondary" className="text-sm px-4 py-2">
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <p className="font-medium">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.role}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p className="font-medium">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.status}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card title="Account Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">User ID</label>
              <p className="font-medium">#{user.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Created At</label>
              <p className="font-medium">{formatDateTime(user.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Updated</label>
              <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Role Permissions">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-4">
            This user has the following role-based permissions:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-2 text-sm">
              {user.role === 'ADMIN' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Full access to all modules
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    User management (create, edit, delete users)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    System configuration access
                  </li>
                </>
              )}
              {user.role === 'ACCOUNTS' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Fee collection (online & offline)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Receipt generation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View students (for fee collection)
                  </li>
                </>
              )}
              {user.role === 'ADMISSIONS' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Create and edit students
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Upload student documents
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View courses
                  </li>
                </>
              )}
              {user.role === 'HOSTEL_WARDEN' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Manage hostel allocations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View hostel occupancy
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View students (for allocation)
                  </li>
                </>
              )}
              {user.role === 'LIBRARIAN' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Manage library books
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Issue and return books
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Calculate fines
                  </li>
                </>
              )}
              {user.role === 'EXAM_CELL' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Enter exam marks
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Mark attendance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View student results
                  </li>
                </>
              )}
              {user.role === 'STUDENT' && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View own profile
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View own fees and receipts
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View own exam results
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserView;


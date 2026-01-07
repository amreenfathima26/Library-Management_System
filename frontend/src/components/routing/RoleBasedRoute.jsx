import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../utils/roleBasedAccess';

const RoleBasedRoute = ({ children, requiredRoute }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRoute && !hasAccess(user.role, requiredRoute)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;


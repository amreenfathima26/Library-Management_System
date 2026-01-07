import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../../pages/dashboard/AdminDashboard';
import StudentDashboard from '../../pages/dashboard/StudentDashboard';
import AccountsDashboard from '../../pages/dashboard/AccountsDashboard';
import AdmissionsDashboard from '../../pages/dashboard/AdmissionsDashboard';
import HostelWardenDashboard from '../../pages/dashboard/HostelWardenDashboard';
import LibrarianDashboard from '../../pages/dashboard/LibrarianDashboard';
import ExamCellDashboard from '../../pages/dashboard/ExamCellDashboard';
import RoleBasedRoute from './RoleBasedRoute';

const DashboardRoute = () => {
  const { user } = useAuth();
  
  const getDashboard = () => {
    switch (user?.role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'ACCOUNTS':
        return <AccountsDashboard />;
      case 'ADMISSIONS':
        return <AdmissionsDashboard />;
      case 'HOSTEL_WARDEN':
        return <HostelWardenDashboard />;
      case 'LIBRARIAN':
        return <LibrarianDashboard />;
      case 'EXAM_CELL':
        return <ExamCellDashboard />;
      case 'ADMIN':
      default:
        return <AdminDashboard />;
    }
  };
  
  return (
    <RoleBasedRoute requiredRoute="dashboard">
      {getDashboard()}
    </RoleBasedRoute>
  );
};

export default DashboardRoute;


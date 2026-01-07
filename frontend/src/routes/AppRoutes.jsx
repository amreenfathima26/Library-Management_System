import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import StudentList from '../pages/students/StudentList';
import StudentCreate from '../pages/students/StudentCreate';
import StudentProfile from '../pages/students/StudentProfile';
import StudentProfileView from '../pages/students/StudentProfileView';
import StudentReceipts from '../pages/students/StudentReceipts';
import StudentHostelDetails from '../pages/students/StudentHostelDetails';
import StudentMarksAttendance from '../pages/students/StudentMarksAttendance';
import StudentLibraryDues from '../pages/students/StudentLibraryDues';
import AdminExamOverview from '../pages/exams/AdminExamOverview';
import SystemSettings from '../pages/settings/SystemSettings';
import FeeDashboard from '../pages/finance/FeeDashboard';
import FeeCollection from '../pages/finance/FeeCollection';
import HostelList from '../pages/hostel/HostelList';
import HostelAllocation from '../pages/hostel/HostelAllocation';
import RoomManagement from '../pages/hostel/RoomManagement';
import HostelDeallocation from '../pages/hostel/HostelDeallocation';
import HostelReports from '../pages/hostel/HostelReports';
import AllocationList from '../pages/hostel/AllocationList';
import LibraryBooks from '../pages/library/LibraryBooks';
import BookIssueReturn from '../pages/library/BookIssueReturn';
import IssuedBooks from '../pages/library/IssuedBooks';
import OverdueFines from '../pages/library/OverdueFines';
import BorrowingHistory from '../pages/library/BorrowingHistory';
import InventoryHealth from '../pages/library/InventoryHealth';
import ExamMarksEntry from '../pages/exams/ExamMarksEntry';
import ExamResultsView from '../pages/exams/ExamResultsView';
import StudentResults from '../pages/exams/StudentResults';
import UserList from '../pages/users/UserList';
import UserCreate from '../pages/users/UserCreate';
import UserEdit from '../pages/users/UserEdit';
import UserView from '../pages/users/UserView';
import CourseList from '../pages/courses/CourseList';
import CourseCreate from '../pages/courses/CourseCreate';
import CourseEdit from '../pages/courses/CourseEdit';
import StudentEdit from '../pages/students/StudentEdit';
import NotFound from '../pages/errors/NotFound';
import Layout from '../components/layout/Layout';
import RoleBasedRoute from '../components/routing/RoleBasedRoute';
import DashboardRoute from '../components/routing/DashboardRoute';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRoute />} />
          
          <Route path="students">
            {/* Student Portal Routes (must come before :id routes) */}
            <Route 
              path="profile" 
              element={
                <RoleBasedRoute requiredRoute="profile">
                  <StudentProfileView />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="receipts" 
              element={
                <RoleBasedRoute requiredRoute="fees">
                  <StudentReceipts />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="hostel" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <StudentHostelDetails />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="marks-attendance" 
              element={
                <RoleBasedRoute requiredRoute="results">
                  <StudentMarksAttendance />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="library" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <StudentLibraryDues />
                </RoleBasedRoute>
              } 
            />
            
            {/* Staff Routes */}
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="students">
                  <StudentList />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="create" 
              element={
                <RoleBasedRoute requiredRoute="students">
                  <StudentCreate />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id" 
              element={
                <RoleBasedRoute requiredRoute="students">
                  <StudentProfile />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id/edit" 
              element={
                <RoleBasedRoute requiredRoute="students">
                  <StudentEdit />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="finance">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="finance">
                  <FeeDashboard />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="collect" 
              element={
                <RoleBasedRoute requiredRoute="finance">
                  <FeeCollection />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="hostel">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <HostelList />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="allocate" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <HostelAllocation />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="deallocate" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <HostelDeallocation />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="allocations" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <AllocationList />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="reports" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <HostelReports />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id/rooms" 
              element={
                <RoleBasedRoute requiredRoute="hostel">
                  <RoomManagement />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="library">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <LibraryBooks />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="transactions" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <BookIssueReturn />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="issued" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <IssuedBooks />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="overdue" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <OverdueFines />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="history" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <BorrowingHistory />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="inventory" 
              element={
                <RoleBasedRoute requiredRoute="library">
                  <InventoryHealth />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="exams">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="exams">
                  {user?.role === 'ADMIN' ? <AdminExamOverview /> : <ExamMarksEntry />}
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="entry" 
              element={
                <RoleBasedRoute requiredRoute="exams">
                  <ExamMarksEntry />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="results" 
              element={
                <RoleBasedRoute requiredRoute="exams">
                  <StudentResults />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="results-view" 
              element={
                <RoleBasedRoute requiredRoute="exams">
                  <ExamResultsView />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="settings">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="users">
                  <SystemSettings />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="courses">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="courses">
                  <CourseList />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="create" 
              element={
                <RoleBasedRoute requiredRoute="courses">
                  <CourseCreate />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id/edit" 
              element={
                <RoleBasedRoute requiredRoute="courses">
                  <CourseEdit />
                </RoleBasedRoute>
              } 
            />
          </Route>
          
          <Route path="users">
            <Route 
              index 
              element={
                <RoleBasedRoute requiredRoute="users">
                  <UserList />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="create" 
              element={
                <RoleBasedRoute requiredRoute="users">
                  <UserCreate />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id" 
              element={
                <RoleBasedRoute requiredRoute="users">
                  <UserView />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path=":id/edit" 
              element={
                <RoleBasedRoute requiredRoute="users">
                  <UserEdit />
                </RoleBasedRoute>
              } 
            />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;


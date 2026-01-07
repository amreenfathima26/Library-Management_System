import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { Users, UserPlus, Book, FileText } from 'lucide-react';

const AdmissionsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsResponse = await axiosInstance.get('/students');
      const coursesResponse = await axiosInstance.get('/courses');
      
      setStats({
        totalStudents: studentsResponse.data.length,
        activeStudents: studentsResponse.data.filter(s => s.status === 'ACTIVE').length,
        totalCourses: coursesResponse.data.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions Dashboard</h1>
          <p className="text-gray-600 mt-1">Student admission and enrollment management</p>
        </div>
        <Link to="/students/create">
          <button className="btn btn-primary">
            <UserPlus className="w-5 h-5 mr-2 inline" />
            New Admission
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          change={`${stats?.activeStudents || 0} active`}
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          icon={UserPlus}
        />
        <StatCard
          title="Available Courses"
          value={stats?.totalCourses || 0}
          icon={Book}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/students/create" className="block">
              <div className="px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="font-medium text-primary-900">New Student Admission</div>
                <div className="text-sm text-primary-600">Register a new student</div>
              </div>
            </Link>
            <Link to="/students" className="block">
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View All Students</div>
                <div className="text-sm text-blue-600">Manage student records</div>
              </div>
            </Link>
            <Link to="/courses" className="block">
              <div className="px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">View Courses</div>
                <div className="text-sm text-green-600">Check available courses</div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Admission Process">
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">1</div>
              <div>
                <p className="font-medium">Fill Student Form</p>
                <p className="text-gray-600">Enter student personal and academic details</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">2</div>
              <div>
                <p className="font-medium">Upload Documents</p>
                <p className="text-gray-600">Upload photo and certificates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">3</div>
              <div>
                <p className="font-medium">Generate Student UID</p>
                <p className="text-gray-600">System auto-generates unique ID</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdmissionsDashboard;


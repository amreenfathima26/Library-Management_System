import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { GraduationCap, BookOpen, Users, FileText } from 'lucide-react';

const ExamCellDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsResponse = await axiosInstance.get('/students?status=ACTIVE');
      const coursesResponse = await axiosInstance.get('/courses');
      
      setStats({
        totalStudents: studentsResponse.data.length,
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
          <h1 className="text-3xl font-bold text-gray-900">Exam Cell Dashboard</h1>
          <p className="text-gray-600 mt-1">Marks entry and attendance management</p>
        </div>
        <Link to="/exams">
          <button className="btn btn-primary">
            Enter Marks
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Students"
          value={stats?.totalStudents || 0}
          icon={Users}
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
        />
        <StatCard
          title="Exam Management"
          value="Ready"
          icon={GraduationCap}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/exams" className="block">
              <div className="px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="font-medium text-primary-900">Enter Exam Marks</div>
                <div className="text-sm text-primary-600">Record student exam results</div>
              </div>
            </Link>
            <Link to="/exams" className="block">
              <div className="px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Mark Attendance</div>
                <div className="text-sm text-green-600">Record student attendance</div>
              </div>
            </Link>
            <Link to="/exams/results" className="block">
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View Results</div>
                <div className="text-sm text-blue-600">Check student exam results</div>
              </div>
            </Link>
            <Link to="/students" className="block">
              <div className="px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">View Students</div>
                <div className="text-sm text-purple-600">Search students for marks entry</div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Grading System">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">A+</span>
              <span className="text-gray-600">90 - 100</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">A</span>
              <span className="text-gray-600">80 - 89</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">B+</span>
              <span className="text-gray-600">70 - 79</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">B</span>
              <span className="text-gray-600">60 - 69</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">C+</span>
              <span className="text-gray-600">50 - 59</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">C</span>
              <span className="text-gray-600">40 - 49</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">F</span>
              <span className="text-red-600">&lt; 40</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamCellDashboard;


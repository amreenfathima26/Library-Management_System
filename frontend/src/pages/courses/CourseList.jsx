import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('📚 CourseList: Fetching courses from /courses endpoint...');
      const response = await axiosInstance.get('/courses');
      console.log('📚 CourseList: API Response:', response);
      console.log('📚 CourseList: Courses Data:', response.data);
      
      if (response && response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        console.log(`✅ CourseList: Loaded ${response.data.length} courses`);
      } else {
        console.error('❌ CourseList: Invalid response format:', response);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ CourseList: Error fetching courses:', error);
      console.error('❌ CourseList: Error response:', error.response);
      console.error('❌ CourseList: Error status:', error.response?.status);
      console.error('❌ CourseList: Error data:', error.response?.data);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter((course) =>
    `${course.courseName} ${course.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const canEdit = user?.role === 'ADMIN';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage academic courses</p>
        </div>
        {canEdit && (
          <Link to="/courses/create">
            <Button>
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Course
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fee per Semester</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{course.courseName}</td>
                  <td className="py-3 px-4">{course.department}</td>
                  <td className="py-3 px-4">{course.durationYears} years</td>
                  <td className="py-3 px-4">{formatCurrency(course.feePerSemester)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {canEdit && (
                        <Link to={`/courses/${course.id}/edit`}>
                          <button className="text-blue-600 hover:text-blue-700" title="Edit">
                            <Edit className="w-5 h-5" />
                          </button>
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CourseList;


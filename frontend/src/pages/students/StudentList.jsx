import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const StudentList = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this student application?')) {
      return;
    }
    try {
      await axiosInstance.post(`/students/${id}/approve`);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve student');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      try {
        await axiosInstance.post(`/students/${id}/reject`, null, {
          params: { reason }
        });
        fetchStudents();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject student');
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // If student role, fetch only their own data
      if (user?.role === 'STUDENT') {
        const response = await axiosInstance.get('/students');
        const student = response.data.find(s => s.email === user?.email);
        setStudents(student ? [student] : []);
      } else {
        const response = await axiosInstance.get('/students');
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.studentUid} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'STUDENT' ? 'My Profile' : 'Students'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'STUDENT' 
              ? 'View your student profile' 
              : 'Manage student records'}
          </p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
          <Link to="/students/create">
            <Button>
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Student
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
              placeholder="Search students..."
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student UID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Application</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{student.studentUid}</td>
                  <td className="py-3 px-4 font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{student.email}</td>
                  <td className="py-3 px-4">{student.courseName}</td>
                  <td className="py-3 px-4">{student.semester}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : student.status === 'GRADUATED'
                          ? 'bg-blue-100 text-blue-800'
                          : student.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : student.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {student.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(student.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(student.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {student.status === 'PENDING' && user?.role !== 'ADMIN' && user?.role !== 'ADMISSIONS' && (
                      <span className="text-yellow-600">
                        <Clock className="w-5 h-5" />
                      </span>
                    )}
                    {student.status !== 'PENDING' && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/students/${student.id}`}>
                      <button className="text-primary-600 hover:text-primary-700">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
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

export default StudentList;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    status: 'ACTIVE',
  });
  const [studentsWithoutLogin, setStudentsWithoutLogin] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentsWithoutLogin();
  }, []);

  const fetchStudentsWithoutLogin = async () => {
    try {
      const response = await axiosInstance.get('/users/students/without-login');
      setStudentsWithoutLogin(response.data);
    } catch (error) {
      console.error('Error fetching students without login:', error);
    }
  };

  const handleStudentSelect = (studentId) => {
    const student = studentsWithoutLogin.find(s => s.id === parseInt(studentId));
    if (student) {
      setSelectedStudent(studentId);
      setFormData({
        ...formData,
        username: student.studentUid,
        email: student.email,
        role: 'STUDENT',
        password: student.studentUid, // Default password = Student UID
      });
    }
  };

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ACCOUNTS', label: 'Accounts Staff' },
    { value: 'ADMISSIONS', label: 'Admissions Staff' },
    { value: 'HOSTEL_WARDEN', label: 'Hostel Warden' },
    { value: 'LIBRARIAN', label: 'Librarian' },
    { value: 'EXAM_CELL', label: 'Exam Cell Staff' },
    { value: 'STUDENT', label: 'Student' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/users', formData);
      navigate('/users');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/users" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Users
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-1">Add a new user to the system</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.role === 'STUDENT' && studentsWithoutLogin.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student (Without Login)
              </label>
              <select
                className="input w-full"
                value={selectedStudent}
                onChange={(e) => handleStudentSelect(e.target.value)}
              >
                <option value="">-- Select a student to create login --</option>
                {studentsWithoutLogin.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentUid} - {student.firstName} {student.lastName} ({student.email}) - {student.courseName} Sem {student.semester}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                {studentsWithoutLogin.length} student(s) without login accounts
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Enter username"
              disabled={selectedStudent !== '' && formData.role === 'STUDENT'}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email"
              disabled={selectedStudent !== '' && formData.role === 'STUDENT'}
            />
          </div>

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            placeholder="Enter password (min 6 characters)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserCreate;


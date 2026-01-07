import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: '',
    department: '',
    durationYears: '',
    feePerSemester: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/courses', {
        ...formData,
        durationYears: parseInt(formData.durationYears),
        feePerSemester: parseFloat(formData.feePerSemester),
      });
      navigate('/courses');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Courses
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600 mt-1">Add a new academic course</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Name"
            value={formData.courseName}
            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            required
            placeholder="e.g., Bachelor of Computer Science"
          />

          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
            placeholder="e.g., Computer Science"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duration (Years)"
              type="number"
              min="1"
              max="10"
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
              required
            />
            <Input
              label="Fee per Semester (₹)"
              type="number"
              step="0.01"
              min="0"
              value={formData.feePerSemester}
              onChange={(e) => setFormData({ ...formData, feePerSemester: e.target.value })}
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/courses')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CourseCreate;


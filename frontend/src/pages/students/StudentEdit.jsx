import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    courseId: '',
    year: '', // Changed from semester to year
    admissionDate: '',
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && formData.courseId) {
      const course = courses.find(c => c.id === parseInt(formData.courseId));
      if (course) {
        setSelectedCourse(course);
      }
    }
  }, [courses, formData.courseId]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchStudent();
    }
  }, [id, courses.length]);

  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`/students/${id}`);
      const student = response.data;
      
      // Convert semester to year (Semester 1-2 = Year 1, Semester 3-4 = Year 2, etc.)
      const semester = student.semester || 1;
      const year = Math.ceil(semester / 2); // Semester 1-2 = Year 1, Semester 3-4 = Year 2
      
      // Find the course to set selectedCourse (need to wait for courses to load)
      // This will be set in useEffect after courses are loaded
      
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dob: student.dob ? student.dob.split('T')[0] : '',
        gender: student.gender || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        courseId: student.courseId || '',
        year: year.toString(), // Convert to year
        admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : '',
      });
    } catch (error) {
      setError('Failed to load student data');
    } finally {
      setFetching(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from /courses endpoint...');
      const response = await axiosInstance.get('/courses');
      console.log('Courses API Response:', response);
      console.log('Courses Data:', response.data);
      
      if (response && response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        console.log(`✅ Loaded ${response.data.length} courses`);
      } else {
        console.error('❌ Invalid response format:', response);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setCourses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert Year to Semester (Year 1 = Semester 1, Year 2 = Semester 3, etc.)
      // Assuming 2 semesters per year: Year 1 = Sem 1-2, Year 2 = Sem 3-4, etc.
      const year = parseInt(formData.year);
      const semester = (year - 1) * 2 + 1; // Year 1 = Sem 1, Year 2 = Sem 3, Year 3 = Sem 5, etc.
      
      // Prepare data with semester (backend expects semester)
      const studentData = {
        ...formData,
        semester: semester
      };
      delete studentData.year; // Remove year field before sending
      
      await axiosInstance.put(`/students/${id}`, studentData);
      navigate(`/students/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link to={`/students/${id}`} className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
        <p className="text-gray-600 mt-1">Update student information</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                className="input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course {courses.length > 0 && `(${courses.length} available)`}
              </label>
              <select
                className="input"
                value={formData.courseId}
                onChange={(e) => {
                  const courseId = e.target.value;
                  const course = courses.find(c => c.id === parseInt(courseId));
                  setSelectedCourse(course);
                  setFormData({ ...formData, courseId: courseId, year: '' }); // Reset year when course changes
                }}
                required
                disabled={courses.length === 0}
              >
                <option value="">
                  {courses.length === 0 ? 'No courses available. Please create courses first.' : 'Select Course'}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName} - {course.department} ({course.durationYears} years)
                  </option>
                ))}
              </select>
              {courses.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ No courses found. Please create courses in the Courses section first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year {selectedCourse && `(Based on ${selectedCourse.courseName})`}
              </label>
              <select
                className="input"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                disabled={!selectedCourse}
              >
                <option value="">
                  {selectedCourse ? 'Select Year' : 'Select Course first'}
                </option>
                {selectedCourse && Array.from({ length: selectedCourse.durationYears }, (_, i) => i + 1).map((year) => (
                  <option key={year} value={year}>
                    {year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : `${year}th Year`}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <p className="text-xs text-gray-500 mt-1">
                  Course Duration: {selectedCourse.durationYears} {selectedCourse.durationYears === 1 ? 'year' : 'years'}
                </p>
              )}
            </div>
          </div>

          <Input
            label="Admission Date"
            type="date"
            value={formData.admissionDate}
            onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/students/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentEdit;


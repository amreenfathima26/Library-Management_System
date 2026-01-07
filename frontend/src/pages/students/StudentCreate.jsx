import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Upload, X, FileText } from 'lucide-react';

const StudentCreate = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      console.log('🔍 StudentCreate: Fetching courses...');
      console.log('🔍 API Base URL:', axiosInstance.defaults.baseURL);
      console.log('🔍 Full URL will be:', axiosInstance.defaults.baseURL + '/courses');
      console.log('🔍 Auth Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await axiosInstance.get('/courses');
      
      console.log('✅ StudentCreate: API Response Status:', response.status);
      console.log('✅ StudentCreate: Full Response:', response);
      console.log('✅ StudentCreate: Response Data:', response.data);
      console.log('✅ StudentCreate: Data Type:', typeof response.data);
      console.log('✅ StudentCreate: Is Array?', Array.isArray(response.data));
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setCourses(response.data);
          console.log(`✅ StudentCreate: Successfully loaded ${response.data.length} courses`);
          if (response.data.length === 0) {
            console.warn('⚠️ StudentCreate: API returned empty array - no courses in database');
          }
        } else {
          console.error('❌ StudentCreate: Response data is not an array:', response.data);
          setCourses([]);
        }
      } else {
        console.error('❌ StudentCreate: Invalid response - no data property');
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ StudentCreate: Error fetching courses');
      console.error('❌ Error Object:', error);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Response:', error.response);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ Error Data:', error.response?.data);
      console.error('❌ Error Headers:', error.response?.headers);
      
      // Show user-friendly error
      if (error.response?.status === 401) {
        console.error('❌ Authentication failed - token may be expired');
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        console.error('❌ Access forbidden - user role may not have permission');
        setError('Access denied. You do not have permission to view courses.');
      } else if (error.response?.status === 404) {
        console.error('❌ Endpoint not found - check API URL');
        setError('API endpoint not found. Please check backend configuration.');
      } else if (!error.response) {
        console.error('❌ Network error - backend may not be running');
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to load courses. Please check console for details.');
      }
      
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleDocumentAdd = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const documentType = prompt('Enter document type (e.g., Aadhar, Marksheet, Certificate):');
      if (documentType) {
        setDocuments([...documents, { file, type: documentType }]);
      }
    }
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert Year to Semester (Year 1 = Semester 1, Year 2 = Semester 3, etc.)
      // Assuming 2 semesters per year: Year 1 = Sem 1-2, Year 2 = Sem 3-4, etc.
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 1) {
        setError('Please select a valid year');
        setLoading(false);
        return;
      }
      const semester = (year - 1) * 2 + 1; // Year 1 = Sem 1, Year 2 = Sem 3, Year 3 = Sem 5, etc.
      
      // Prepare data with semester (backend expects semester)
      // Ensure courseId is a number, not string
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address || '',
        courseId: parseInt(formData.courseId), // Convert to number
        semester: semester,
        admissionDate: formData.admissionDate
      };
      
      console.log('📤 Sending student data:', studentData);
      
      // Create student first
      const response = await axiosInstance.post('/students', studentData);
      const studentId = response.data.id;

      // Upload photo if provided
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('file', photo);
        await axiosInstance.post(`/upload/student/${studentId}/photo`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Upload documents if provided
      for (const doc of documents) {
        const docFormData = new FormData();
        docFormData.append('file', doc.file);
        docFormData.append('documentType', doc.type);
        await axiosInstance.post(`/upload/student/${studentId}/documents`, docFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/students/${studentId}`);
    } catch (error) {
      console.error('❌ Error creating student:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create student';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
        } 
        // Handle single error message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle error object
        else if (errorData.error) {
          errorMessage = errorData.error;
        }
        // Handle string error
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-gray-600 mt-1">Register a new student</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course {coursesLoading ? '(Loading...)' : courses.length > 0 && `(${courses.length} available)`}
              </label>
              {coursesLoading ? (
                <div className="input flex items-center justify-center py-2">
                  <span className="text-gray-500">Loading courses...</span>
                </div>
              ) : (
                <>
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
                  {courses.length === 0 && !error && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ No courses found. Please create courses in the Courses section first.
                    </p>
                  )}
                  {error && courses.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ {error}
                    </p>
                  )}
                </>
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
            <Input
              label="Admission Date"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            type="textarea"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents Upload</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {photo ? photo.name : 'Upload Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Documents (Aadhar, Marksheet, etc.)</label>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{doc.type}:</span>
                          <span className="text-sm text-gray-600 ml-2">{doc.file.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-fit">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Add Document</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentAdd}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload documents like Aadhar Card, 10th/12th Marksheet, Transfer Certificate, etc.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/students')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentCreate;


import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Upload, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExamMarksEntry = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    courseId: '',
    year: '',
    semester: '',
  });
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    subjectName: '',
    marks: '',
    examDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchAllStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [filters, allStudents]);

  useEffect(() => {
    // Fetch students when course or semester filter changes
    if (filters.courseId || filters.semester) {
      fetchStudents();
    } else {
      fetchAllStudents();
    }
  }, [filters.courseId, filters.semester]);

  const fetchAllStudents = async () => {
    try {
      const response = await axiosInstance.get('/students');
      setAllStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch students with filters if any are selected
      let url = '/students';
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.semester) params.append('semester', filters.semester);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await axiosInstance.get(url);
      setAllStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterStudents = () => {
    let filtered = [...allStudents];

    // Filter by department (from course)
    if (filters.department) {
      filtered = filtered.filter(student => 
        student.course?.department === filters.department
      );
    }

    // Filter by course
    if (filters.courseId) {
      filtered = filtered.filter(student => 
        student.course?.id === parseInt(filters.courseId)
      );
    }

    // Filter by year (calculated from semester)
    if (filters.year) {
      const yearNum = parseInt(filters.year);
      filtered = filtered.filter(student => {
        if (!student.semester) return false;
        const studentYear = Math.ceil(student.semester / 2);
        return studentYear === yearNum;
      });
    }

    // Filter by semester
    if (filters.semester) {
      filtered = filtered.filter(student => 
        student.semester === parseInt(filters.semester)
      );
    }

    setFilteredStudents(filtered);
  };

  // Get unique departments from courses
  const uniqueDepartments = [...new Set(courses.map(c => c.department).filter(Boolean))].sort();

  // Get courses filtered by selected department
  const filteredCourses = filters.department
    ? courses.filter(c => c.department === filters.department)
    : courses;

  // Get available semesters based on selected course
  const getAvailableSemesters = () => {
    if (!filters.courseId) return [];
    const selectedCourse = courses.find(c => c.id === parseInt(filters.courseId));
    if (!selectedCourse) return [];
    const maxSemesters = selectedCourse.durationYears * 2;
    return Array.from({ length: maxSemesters }, (_, i) => i + 1);
  };

  // Get available years based on selected course
  const getAvailableYears = () => {
    if (!filters.courseId) return [];
    const selectedCourse = courses.find(c => c.id === parseInt(filters.courseId));
    if (!selectedCourse) return [];
    return Array.from({ length: selectedCourse.durationYears }, (_, i) => i + 1);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters
    if (key === 'department') {
      newFilters.courseId = '';
      newFilters.year = '';
      newFilters.semester = '';
    }
    if (key === 'courseId') {
      newFilters.year = '';
      newFilters.semester = '';
    }
    if (key === 'year') {
      newFilters.semester = '';
    }
    
    setFilters(newFilters);
    
    // Update formData courseId if course filter changes
    if (key === 'courseId') {
      setFormData({ ...formData, courseId: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/exams', {
        student: { id: parseInt(formData.studentId) },
        course: { id: parseInt(formData.courseId) },
        subjectName: formData.subjectName,
        marks: parseFloat(formData.marks),
        examDate: formData.examDate,
      });
      setFormData({
        ...formData,
        studentId: '',
        subjectName: '',
        marks: '',
        examDate: new Date().toISOString().split('T')[0],
      });
      alert('Marks entered successfully!');
      // Refresh students list
      fetchStudents();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enter marks');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    setError('');
    setUploadLoading(true);
    setUploadResult(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', uploadFile);
      if (filters.courseId) uploadFormData.append('courseId', filters.courseId);
      if (filters.semester) uploadFormData.append('semester', filters.semester);
      if (formData.examDate) uploadFormData.append('examDate', formData.examDate);

      const response = await axiosInstance.post('/exams/bulk-upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setUploadFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('bulk-upload-file');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create Excel template
    const template = `Student UID,Subject Name,Marks
STU20250001,Mathematics,85
STU20250002,Physics,78
STU20250003,Chemistry,92`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_marks_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Marks Entry</h1>
          <p className="text-gray-600 mt-1">Enter student exam marks by Department, Course, Year & Semester</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={uploadMode === 'single' ? 'primary' : 'secondary'}
            onClick={() => setUploadMode('single')}
          >
            Single Entry
          </Button>
          <Button
            variant={uploadMode === 'bulk' ? 'primary' : 'secondary'}
            onClick={() => setUploadMode('bulk')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Link to="/exams/results-view">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <Card title="Filter Students">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department/Branch</label>
            <select
              className="input"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              className="input"
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              disabled={!filters.department}
            >
              <option value="">Select Course</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              className="input"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              disabled={!filters.courseId}
            >
              <option value="">All Years</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}st Year</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              className="input"
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              disabled={!filters.courseId}
            >
              <option value="">All Semesters</option>
              {getAvailableSemesters().map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {(filters.department || filters.courseId || filters.year || filters.semester) && (
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({ department: '', courseId: '', year: '', semester: '' });
                setFormData({ ...formData, courseId: '' });
              }}
              className="text-sm"
            >
              Clear Filters
            </Button>
            <span className="ml-4 text-sm text-gray-600">
              Showing {filteredStudents.length} student(s)
            </span>
          </div>
        )}
      </Card>

      {uploadMode === 'bulk' ? (
        <Card title="Bulk Upload Exam Marks">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {uploadResult && (
            <div className={`mb-4 px-4 py-3 rounded-lg ${
              uploadResult.failureCount === 0 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              <p className="font-semibold">{uploadResult.message}</p>
              <p className="text-sm mt-1">
                Success: {uploadResult.successCount} | Failed: {uploadResult.failureCount} | Total: {uploadResult.totalRecords}
              </p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Errors:</p>
                  <ul className="list-disc list-inside mt-1">
                    {uploadResult.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                  {uploadResult.errors.length > 10 && (
                    <p className="mt-1">... and {uploadResult.errors.length - 10} more errors</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              className="mb-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template (CSV)
            </Button>
            <p className="text-sm text-gray-600 mb-4">
              Template format: Student UID, Subject Name, Marks (CSV or Excel format)
            </p>
          </div>

          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (CSV or Excel)
              </label>
              <input
                id="bulk-upload-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
                <select
                  className="input"
                  value={filters.courseId}
                  onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">If not specified, uses student's course</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester (Optional)</label>
                <select
                  className="input"
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                >
                  <option value="">All Semesters</option>
                  {getAvailableSemesters().map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">If not specified, uses student's semester</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">If not specified, uses today's date</p>
              </div>
            </div>

            <Button type="submit" disabled={uploadLoading || !uploadFile}>
              {uploadLoading ? 'Uploading...' : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Marks
                </>
              )}
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <select
                className="input"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                disabled={filteredStudents.length === 0 && (filters.department || filters.courseId || filters.year || filters.semester)}
              >
                <option value="">Select Student</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentUid} - {student.firstName} {student.lastName} 
                    {student.course && ` (${student.course.courseName}, Sem ${student.semester})`}
                  </option>
                ))}
              </select>
              {filteredStudents.length === 0 && (filters.department || filters.courseId || filters.year || filters.semester) && (
                <p className="mt-1 text-sm text-gray-500">No students found with selected filters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                className="input"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName} ({course.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Subject Name"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Marks"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              required
            />
            <Input
              label="Exam Date"
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Enter Marks'}
          </Button>
        </form>
      </Card>
      )}
    </div>
  );
};

export default ExamMarksEntry;


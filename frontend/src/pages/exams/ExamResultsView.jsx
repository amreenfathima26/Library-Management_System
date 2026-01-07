import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, Filter, FileText } from 'lucide-react';

const ExamResultsView = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    courseId: '',
    semester: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchResults();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      let url = '/exams/results/organized';
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.department) params.append('department', filters.department);
      if (params.toString()) url += '?' + params.toString();

      const response = await axiosInstance.get(url);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueDepartments = [...new Set(courses.map(c => c.department).filter(Boolean))].sort();
  const filteredCourses = filters.department
    ? courses.filter(c => c.department === filters.department)
    : courses;

  // Group results by department
  const groupedByDepartment = results.reduce((acc, result) => {
    const dept = result.department || 'Unknown';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(result);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-1">View results organized by Department, Year & Semester</p>
        </div>
      </div>

      {/* Filters */}
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              className="input"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value, courseId: '', semester: '' })}
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
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value, semester: '' })}
              disabled={!filters.department}
            >
              <option value="">All Courses</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>{course.courseName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              className="input"
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              disabled={!filters.courseId}
            >
              <option value="">All Semesters</option>
              {filters.courseId && courses.find(c => c.id === parseInt(filters.courseId)) && 
                Array.from({ length: courses.find(c => c.id === parseInt(filters.courseId)).durationYears * 2 }, (_, i) => i + 1).map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))
              }
            </select>
          </div>
        </div>

        {(filters.department || filters.courseId || filters.semester) && (
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setFilters({ department: '', courseId: '', semester: '' })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Results by Department */}
      {Object.keys(groupedByDepartment).length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No results found</p>
            <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
          </div>
        </Card>
      ) : (
        Object.entries(groupedByDepartment).map(([department, deptResults]) => (
          <Card key={department} title={`${department} Department`}>
            {/* Group by Year */}
            {Object.entries(
              deptResults.reduce((acc, result) => {
                const year = result.year || 'Unknown';
                if (!acc[year]) acc[year] = [];
                acc[year].push(result);
                return acc;
              }, {})
            ).map(([year, yearResults]) => (
              <div key={year} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {year} Year
                </h3>
                
                {/* Group by Semester */}
                {Object.entries(
                  yearResults.reduce((acc, result) => {
                    const sem = result.semester || 'Unknown';
                    if (!acc[sem]) acc[sem] = [];
                    acc[sem].push(result);
                    return acc;
                  }, {})
                ).map(([semester, semResults]) => (
                  <div key={semester} className="mb-4 border-l-4 border-blue-500 pl-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Semester {semester}
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Subject</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Course</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Students</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Passed</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Failed</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Avg Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResults.map((result, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3">{result.subject}</td>
                              <td className="py-2 px-3 text-gray-600">{result.courseName}</td>
                              <td className="py-2 px-3">{result.totalStudents}</td>
                              <td className="py-2 px-3 text-green-600 font-medium">{result.passed}</td>
                              <td className="py-2 px-3 text-red-600 font-medium">{result.failed}</td>
                              <td className="py-2 px-3">{result.averageMarks?.toFixed(2) || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  );
};

export default ExamResultsView;




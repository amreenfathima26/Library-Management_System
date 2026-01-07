import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GraduationCap, Users, FileCheck, Clock, TrendingUp, Calendar, Eye, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const AdminExamOverview = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'attendance'
  const [selectedView, setSelectedView] = useState(null); // For drill-down view
  const [filters, setFilters] = useState({
    courseId: '',
    semester: '',
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, perfRes, attRes] = await Promise.all([
        axiosInstance.get('/exams/statistics').catch(() => ({ data: null })),
        axiosInstance.get('/exams/performance', {
          params: {
            courseId: filters.courseId || undefined,
            semester: filters.semester || undefined,
          }
        }).catch(() => ({ data: [] })),
        axiosInstance.get('/exams/attendance-overview', {
          params: {
            courseId: filters.courseId || undefined,
            semester: filters.semester || undefined,
          }
        }).catch(() => ({ data: [] }))
      ]);

      setStatistics(statsRes.data);
      setPerformance(perfRes.data || []);
      setAttendanceOverview(attRes.data || []);
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedView(item);
  };

  const handleCloseDetails = () => {
    setSelectedView(null);
  };

  const handleExportCSV = () => {
    const data = activeTab === 'overview' ? performance : attendanceOverview;
    const headers = activeTab === 'overview'
      ? ['Course', 'Semester', 'Subject', 'Total Students', 'Appeared', 'Passed', 'Failed', 'Pass %', 'Avg Marks']
      : ['Course', 'Semester', 'Total Students', 'Present', 'Absent', 'Avg Attendance %', 'Low Attendance (<75%)'];

    const csvContent = [
      headers.join(','),
      ...data.map(item => activeTab === 'overview'
        ? [
            item.courseName,
            item.semester || 'N/A',
            item.subjectName || 'N/A',
            item.totalStudents,
            item.appeared,
            item.passed || 0,
            item.failed || 0,
            item.passPercentage + '%',
            item.averageMarks || 'N/A'
          ].join(',')
        : [
            item.courseName,
            item.semester || 'N/A',
            item.totalStudents,
            item.appeared,
            item.failed || 0,
            item.passPercentage + '%',
            'N/A'
          ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.semester) params.append('semester', filters.semester);
      params.append('reportType', activeTab === 'overview' ? 'Performance' : 'Attendance');

      const response = await axiosInstance.get(`/exams/report/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam_report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams Overview</h1>
          <p className="text-gray-600 mt-1">View exam statistics and course-wise performance</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/exams/results-view">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </Link>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold">{statistics.totalStudents || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Exams Conducted</p>
                <p className="text-2xl font-bold">{statistics.examsConducted || 0}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Results Published</p>
                <p className="text-2xl font-bold">{statistics.resultsPublished || 0}</p>
              </div>
              <FileCheck className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Results</p>
                <p className="text-2xl font-bold">{statistics.pendingResults || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Pass %</p>
                <p className="text-2xl font-bold">{statistics.averagePassPercentage?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Attendance %</p>
                <p className="text-2xl font-bold">{statistics.averageAttendancePercentage?.toFixed(1) || 0}%</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              className="input"
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
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
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchData} variant="outline" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedView(null); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => { setActiveTab('attendance'); setSelectedView(null); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attendance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Attendance Overview
          </button>
        </nav>
      </div>

      {/* Overview Table */}
      {activeTab === 'overview' && (
        <Card title="Course Performance">
          {performance.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No exam data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Appeared</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pass %</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Marks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{item.courseName}</td>
                      <td className="py-3 px-4">Semester {item.semester || 'N/A'}</td>
                      <td className="py-3 px-4 font-medium">{item.subjectName}</td>
                      <td className="py-3 px-4">{item.appeared}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.passPercentage >= 75 ? 'bg-green-100 text-green-800' :
                          item.passPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.passPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.averageMarks?.toFixed(2) || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Attendance Overview Table */}
      {activeTab === 'attendance' && (
        <Card title="Attendance Overview">
          {attendanceOverview.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No attendance data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Attendance %</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Students</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Present</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceOverview.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{item.courseName}</td>
                      <td className="py-3 px-4">Semester {item.semester || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.passPercentage >= 75 ? 'bg-green-100 text-green-800' :
                          item.passPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.passPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.totalStudents}</td>
                      <td className="py-3 px-4 text-green-600">{item.appeared}</td>
                      <td className="py-3 px-4 text-red-600">{item.failed || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Drill-down Modal */}
      {selectedView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Subject Details</h2>
              <button onClick={handleCloseDetails} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-medium">{selectedView.subjectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{selectedView.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="font-medium">Semester {selectedView.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="font-medium">{selectedView.totalStudents}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{selectedView.passed || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{selectedView.failed || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Marks</p>
                  <p className="text-2xl font-bold">{selectedView.averageMarks?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Pass Percentage</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full"
                    style={{ width: `${selectedView.passPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedView.passPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamOverview;


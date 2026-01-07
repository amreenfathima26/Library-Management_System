import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GraduationCap, Calendar, Award, CheckCircle, XCircle, Download } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const StudentMarksAttendance = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marks'); // 'marks' or 'attendance'

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Use /me endpoint for STUDENT role
      let studentData;
      if (user?.role === 'STUDENT') {
        const response = await axiosInstance.get('/students/me');
        studentData = response.data;
      } else {
        // For staff, find by email
        const studentsResponse = await axiosInstance.get('/students');
        studentData = studentsResponse.data.find(s => s.email === user?.email);
      }
      
      if (studentData) {
        setStudent(studentData);
        
        // Fetch marks and attendance
        const [marksResponse, attendanceResponse] = await Promise.all([
          axiosInstance.get(`/exams/student/${studentData.id}`).catch(() => ({ data: [] })),
          axiosInstance.get(`/exams/attendance/student/${studentData.id}`).catch(() => ({ data: [] }))
        ]);
        
        setMarks(marksResponse.data || []);
        setAttendance(attendanceResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarks = () => {
    const csvContent = [
      ['Subject', 'Marks', 'Grade', 'Exam Date'],
      ...marks.map(m => [
        m.subjectName,
        m.marks,
        m.grade,
        formatDate(m.examDate)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marks_${student?.studentUid || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAttendance = () => {
    const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
    const totalDays = attendance.length;
    const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) : 0;

    const csvContent = [
      ['Date', 'Status', 'Course'],
      ...attendance.map(a => [
        formatDate(a.date),
        a.status,
        a.course?.courseName || 'N/A'
      ]),
      [],
      ['Summary'],
      ['Total Days', totalDays],
      ['Present', presentCount],
      ['Absent', absentCount],
      ['Attendance %', attendancePercentage + '%']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${student?.studentUid || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDFReport = async () => {
    if (!student) return;
    
    try {
      const response = await axiosInstance.get(`/exams/student/${student.id}/report`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_report_${student.studentUid}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      alert('Failed to download PDF report');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student profile not found. Please contact administrator.</p>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) : 0;

  const averageMarks = marks.length > 0
    ? (marks.reduce((sum, m) => sum + (m.marks || 0), 0) / marks.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marks & Attendance</h1>
          <p className="text-gray-600 mt-1">View your exam results and attendance records</p>
        </div>
        <div className="flex space-x-2">
          {marks.length > 0 && (
            <Button onClick={handleDownloadPDFReport} variant="primary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          )}
          {activeTab === 'marks' && marks.length > 0 && (
            <Button onClick={handleExportMarks} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
          {activeTab === 'attendance' && attendance.length > 0 && (
            <Button onClick={handleExportAttendance} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Exams</p>
              <p className="text-2xl font-bold">{marks.length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Marks</p>
              <p className="text-2xl font-bold">{averageMarks}</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance %</p>
              <p className="text-2xl font-bold">{attendancePercentage}%</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Present Days</p>
              <p className="text-2xl font-bold">{presentCount}/{totalDays}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('marks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marks'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Exam Marks
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attendance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Attendance
          </button>
        </nav>
      </div>

      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <Card title="Exam Results">
          {marks.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No exam results available</p>
              <p className="text-sm text-gray-500 mt-2">Results will appear here after exams are conducted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Marks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam Date</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{result.subjectName}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-lg">{result.marks}</span>
                        <span className="text-gray-500 text-sm ml-1">/ 100</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.grade === 'A+' || result.grade === 'A'
                            ? 'bg-green-100 text-green-800'
                            : result.grade === 'B+' || result.grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : result.grade === 'C+' || result.grade === 'C'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(result.examDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <Card title="Attendance Records">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records available</p>
              <p className="text-sm text-gray-500 mt-2">Attendance will appear here after classes begin</p>
            </div>
          ) : (
            <>
              {/* Attendance Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-xl font-bold">{totalDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-xl font-bold text-green-600">{presentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-xl font-bold text-red-600">{absentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className="text-xl font-bold">{attendancePercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(record.date)}</td>
                        <td className="py-3 px-4">{record.course?.courseName || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {record.status === 'PRESENT' ? (
                            <span className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Present</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-600">
                              <XCircle className="w-4 h-4" />
                              <span>Absent</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentMarksAttendance;


import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import { formatDate } from '../../utils/helpers';

const StudentResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // If user is STUDENT, auto-fetch their data
    if (user?.role === 'STUDENT') {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const studentsResponse = await axiosInstance.get('/students');
      const studentData = studentsResponse.data.find(s => s.email === user?.email);
      if (studentData) {
        setStudent(studentData);
        setStudentId(studentData.id.toString());
        fetchResults(studentData.id);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && user?.role !== 'STUDENT') {
      fetchResults(parseInt(studentId));
    }
  }, [studentId]);

  const fetchResults = async (id) => {
    try {
      const response = await axiosInstance.get(`/exams/student/${id}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && studentId) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'STUDENT' ? 'My Results' : 'Student Results'}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'STUDENT' 
            ? 'View your exam results' 
            : 'View student exam results'}
        </p>
      </div>

      {user?.role !== 'STUDENT' && (
        <Card>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
            <input
              type="number"
              className="input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
            />
          </div>
        </Card>
      )}

      {user?.role === 'STUDENT' && student && (
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Student UID</p>
              <p className="font-medium">{student.studentUid}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{student.firstName} {student.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-medium">{student.courseName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Semester</p>
              <p className="font-medium">Semester {student.semester}</p>
            </div>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <Card title="Results">
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
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{result.subjectName}</td>
                    <td className="py-3 px-4 font-medium">{result.marks}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(result.examDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentResults;


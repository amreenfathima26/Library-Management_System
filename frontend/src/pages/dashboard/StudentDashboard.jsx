import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import { User, DollarSign, Home, BookOpen, GraduationCap } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [feeData, setFeeData] = useState([]);
  const [hostelData, setHostelData] = useState(null);
  const [libraryData, setLibraryData] = useState([]);
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // For STUDENT role, use /me endpoint to get own profile
      let student;
      if (user?.role === 'STUDENT') {
        const response = await axiosInstance.get('/students/me');
        student = response.data;
      } else {
        // For staff, find by email
        const studentsResponse = await axiosInstance.get('/students');
        student = studentsResponse.data.find(s => s.email === user?.email);
      }
      
      if (student) {
        setStudentData(student);
        
        // Fetch related data
        const [fees, hostel, library, exams] = await Promise.all([
          axiosInstance.get(`/payments/student/${student.id}`).catch(() => ({ data: [] })),
          axiosInstance.get(`/hostel/student/${student.id}`).catch(() => ({ data: [] })),
          axiosInstance.get(`/library/student/${student.id}/active`).catch(() => ({ data: [] })),
          axiosInstance.get(`/exams/student/${student.id}`).catch(() => ({ data: [] })),
        ]);
        
        setFeeData(fees.data || []);
        setHostelData(hostel.data?.[0] || null);
        setLibraryData(library.data || []);
        setExamData(exams.data || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student profile not found. Please contact administrator.</p>
      </div>
    );
  }

  const totalFeesPaid = feeData
    .filter(f => f.status === 'SUCCESS')
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
        <p className="text-gray-600 mt-1">Welcome, {studentData.firstName} {studentData.lastName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student UID</p>
              <p className="text-xl font-bold">{studentData.studentUid}</p>
            </div>
            <User className="w-8 h-8 text-primary-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Fees Paid</p>
              <p className="text-xl font-bold">{formatCurrency(totalFeesPaid)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <Link to="/students/hostel" className="block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hostel</p>
                <p className="text-xl font-bold">{hostelData ? 'Allocated' : 'Not Allocated'}</p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Books Issued</p>
              <p className="text-xl font-bold">{libraryData.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="My Profile">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium">{studentData.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Semester:</span>
              <span className="font-medium">{studentData.semester}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                studentData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {studentData.status}
              </span>
            </div>
            <Link to="/students/profile" className="block mt-4 text-primary-600 hover:text-primary-700">
              View Full Profile →
            </Link>
          </div>
        </Card>

        <Card title="Recent Exam Results">
          {examData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No exam results available</p>
          ) : (
            <div className="space-y-2">
              {examData.slice(0, 5).map((exam) => (
                <div key={exam.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{exam.subjectName}</p>
                    <p className="text-sm text-gray-600">{formatDate(exam.examDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{exam.marks}</p>
                    <p className="text-sm text-primary-600">{exam.grade}</p>
                  </div>
                </div>
              ))}
              <Link to="/students/marks-attendance" className="block mt-4 text-primary-600 hover:text-primary-700 text-center">
                View All Results →
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fee History">
          {feeData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No fee transactions</p>
          ) : (
            <div className="space-y-2">
              {feeData.slice(0, 5).map((fee) => (
                <div key={fee.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{fee.receiptNumber}</p>
                    <p className="text-sm text-gray-600">Semester {fee.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(fee.amount)}</p>
                    <p className={`text-xs ${fee.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                      {fee.status}
                    </p>
                  </div>
                </div>
              ))}
              <Link to="/students/receipts" className="block mt-4 text-primary-600 hover:text-primary-700 text-center">
                View All Receipts →
              </Link>
            </div>
          )}
        </Card>

        <Card title="Issued Books">
          {libraryData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No books issued</p>
          ) : (
            <div className="space-y-2">
              {libraryData.map((book) => (
                <div key={book.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{book.book?.title}</p>
                    <p className="text-sm text-gray-600">Issued: {formatDate(book.issuedDate)}</p>
                  </div>
                  <div className="text-right">
                    {book.fineAmount > 0 && (
                      <p className="text-sm text-red-600">Fine: ₹{book.fineAmount}</p>
                    )}
                    <p className="text-xs text-blue-600">{book.status}</p>
                  </div>
                </div>
              ))}
              <Link to="/students/library" className="block mt-4 text-primary-600 hover:text-primary-700 text-center">
                View Library Dues →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;


import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import { Search, User, BookOpen, RotateCcw } from 'lucide-react';

const BorrowingHistory = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentHistory(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentHistory = async (studentId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/library/student/${studentId}`);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching student history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.studentUid} ${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Borrowing History</h1>
        <p className="text-gray-600 mt-1">View complete borrowing history for any student</p>
      </div>

      {/* Student Search */}
      <Card title="Search Student">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by UID, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          {searchTerm && (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No students found</div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{student.studentUid}</div>
                    <div className="text-sm text-gray-600">
                      {student.firstName} {student.lastName}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Selected Student Info */}
      {selectedStudent && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-sm text-gray-600">UID: {selectedStudent.studentUid}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Transaction History */}
      {selectedStudent && (
        <Card title="Borrowing History">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No borrowing history found for this student
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Return Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{transaction.book?.author || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                      <td className="py-3 px-4">
                        {transaction.returnDate ? formatDate(transaction.returnDate) : 'Not Returned'}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.fineAmount ? (
                          <span className="text-red-600 font-medium">₹{transaction.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'ISSUED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default BorrowingHistory;


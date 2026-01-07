import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { BookOpen, Calendar, DollarSign, AlertCircle, Download, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

const StudentLibraryDues = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
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
        
        // Fetch library transactions
        const [activeResponse, allResponse] = await Promise.all([
          axiosInstance.get(`/library/student/${studentData.id}/active`).catch(() => ({ data: [] })),
          axiosInstance.get(`/library/student/${studentData.id}`).catch(() => ({ data: [] }))
        ]);
        
        setIssuedBooks(activeResponse.data || []);
        setAllTransactions(allResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = activeTab === 'active' ? issuedBooks : allTransactions;
    const csvContent = [
      ['Book Title', 'Author', 'ISBN', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine Amount'],
      ...data.map(t => [
        t.book?.title || 'N/A',
        t.book?.author || 'N/A',
        t.book?.isbn || 'N/A',
        formatDate(t.issuedDate),
        t.dueDate ? formatDate(t.dueDate) : 'N/A',
        t.returnedDate ? formatDate(t.returnedDate) : 'N/A',
        t.status,
        formatCurrency(t.fineAmount || 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `library_${activeTab}_${student?.studentUid || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  const totalFine = issuedBooks.reduce((sum, book) => sum + parseFloat(book.fineAmount || 0), 0);
  const overdueBooks = issuedBooks.filter(book => {
    if (!book.dueDate) return false;
    const dueDate = new Date(book.dueDate);
    const today = new Date();
    return dueDate < today && book.status === 'ISSUED';
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600 mt-1">View your issued books and library dues</p>
        </div>
        {(issuedBooks.length > 0 || allTransactions.length > 0) && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Books Issued</p>
              <p className="text-2xl font-bold">{issuedBooks.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Fine</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalFine)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue Books</p>
              <p className="text-2xl font-bold text-orange-600">{overdueBooks.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{allTransactions.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Currently Issued ({issuedBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History ({allTransactions.length})
          </button>
        </nav>
      </div>

      {/* Active Books Tab */}
      {activeTab === 'active' && (
        <Card title="Currently Issued Books">
          {issuedBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No books currently issued</p>
              <p className="text-sm text-gray-500 mt-2">Visit the library to issue books</p>
            </div>
          ) : (
            <div className="space-y-4">
              {totalFine > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Outstanding Fine: {formatCurrency(totalFine)}</p>
                      <p className="text-sm text-red-700">Please pay the fine at the library counter</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Book Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ISBN</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedBooks.map((transaction) => {
                      const isOverdue = transaction.dueDate && new Date(transaction.dueDate) < new Date() && transaction.status === 'ISSUED';
                      return (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                          <td className="py-3 px-4">{transaction.book?.author || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{transaction.book?.isbn || 'N/A'}</td>
                          <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                          <td className="py-3 px-4">
                            {transaction.dueDate ? (
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {formatDate(transaction.dueDate)}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.fineAmount > 0 ? (
                              <span className="text-red-600 font-semibold">
                                {formatCurrency(transaction.fineAmount)}
                              </span>
                            ) : (
                              <span className="text-green-600">No fine</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'ISSUED'
                                ? isOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {transaction.status}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card title="Library Transaction History">
          {allTransactions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No library transactions</p>
              <p className="text-sm text-gray-500 mt-2">Your library history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Book Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Return Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine Paid</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                      <td className="py-3 px-4">{transaction.book?.author || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                      <td className="py-3 px-4">
                        {transaction.returnedDate ? formatDate(transaction.returnedDate) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.fineAmount > 0 ? (
                          <span className="text-red-600">{formatCurrency(transaction.fineAmount)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.status === 'RETURNED' ? (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Returned</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {transaction.status}
                          </span>
                        )}
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

export default StudentLibraryDues;


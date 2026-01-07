import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import { BookOpen, Search, RotateCcw, AlertCircle } from 'lucide-react';

const BookIssueReturn = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'issued', 'returned'
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, booksRes, studentsRes] = await Promise.all([
        axiosInstance.get('/library/transactions'),
        axiosInstance.get('/library/books'),
        axiosInstance.get('/students'),
      ]);
      setTransactions(transactionsRes.data || []);
      setBooks(booksRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      // Use URLSearchParams for proper parameter encoding
      const params = new URLSearchParams();
      params.append('bookId', issueForm.bookId);
      params.append('studentId', issueForm.studentId);
      
      const response = await axiosInstance.post(`/library/issue?${params.toString()}`);
      
      if (response.status === 201 || response.status === 200) {
        setShowIssueModal(false);
        setIssueForm({ bookId: '', studentId: '' });
        fetchData(); // Refresh transactions list
        alert('Book issued successfully!');
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to issue book';
      alert(errorMessage);
    }
  };

  const handleReturn = async () => {
    try {
      const params = new URLSearchParams();
      params.append('transactionId', selectedTransaction.id);
      
      const response = await axiosInstance.post(`/library/return?${params.toString()}`);
      
      if (response.status === 200) {
        setShowReturnModal(false);
        setSelectedTransaction(null);
        fetchData(); // Refresh transactions list
        alert('Book returned successfully!');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to return book';
      alert(errorMessage);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student?.studentUid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'issued' && transaction.status === 'ISSUED') ||
      (filterStatus === 'returned' && transaction.status === 'RETURNED');
    
    return matchesSearch && matchesFilter;
  });

  const calculateDaysOverdue = (issuedDate) => {
    if (!issuedDate) return 0;
    const today = new Date();
    const issued = new Date(issuedDate);
    const diffTime = today - issued;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays - 14); // 14 days allowed
  };

  const calculateFine = (issuedDate) => {
    const daysOverdue = calculateDaysOverdue(issuedDate);
    return daysOverdue > 0 ? daysOverdue * 10 : 0; // ₹10 per day
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Transactions</h1>
          <p className="text-gray-600 mt-1">Issue and return books</p>
        </div>
        <Button onClick={() => setShowIssueModal(true)}>
          <BookOpen className="w-5 h-5 mr-2 inline" />
          Issue Book
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by book, student name or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="issued">Issued Only</option>
              <option value="returned">Returned Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={fetchData}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card title="Transaction History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student UID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Return Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Overdue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => {
                  const daysOverdue = calculateDaysOverdue(transaction.issuedDate);
                  const fine = transaction.fineAmount || (daysOverdue > 0 ? calculateFine(transaction.issuedDate) : 0);
                  
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {transaction.student?.firstName} {transaction.student?.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{transaction.student?.studentUid || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                      <td className="py-3 px-4">
                        {transaction.returnDate ? formatDate(transaction.returnDate) : 'Not Returned'}
                      </td>
                      <td className="py-3 px-4">
                        {daysOverdue > 0 ? (
                          <span className="text-red-600 font-medium">{daysOverdue} days</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {fine > 0 ? (
                          <span className="text-red-600 font-medium">₹{fine.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'ISSUED'
                              ? daysOverdue > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {transaction.status === 'ISSUED' && daysOverdue > 0 ? 'OVERDUE' : transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {transaction.status === 'ISSUED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowReturnModal(true);
                            }}
                          >
                            Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Issue Book Modal */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setIssueForm({ bookId: '', studentId: '' });
        }}
        title="Issue Book"
      >
        <form onSubmit={handleIssue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
            <select
              className="input"
              value={issueForm.bookId}
              onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
              required
            >
              <option value="">Choose a book...</option>
              {books
                .filter(book => book.availableQuantity > 0)
                .map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author} (Available: {book.availableQuantity})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select
              className="input"
              value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
              required
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.studentUid} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <Button type="submit">Issue Book</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowIssueModal(false);
                setIssueForm({ bookId: '', studentId: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Return Book Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedTransaction(null);
        }}
        title="Return Book"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Book Return Confirmation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Book: <strong>{selectedTransaction.book?.title}</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Student: <strong>{selectedTransaction.student?.firstName} {selectedTransaction.student?.lastName}</strong>
                  </p>
                  {calculateDaysOverdue(selectedTransaction.issuedDate) > 0 && (
                    <p className="text-sm text-red-700 mt-2">
                      ⚠️ Overdue by {calculateDaysOverdue(selectedTransaction.issuedDate)} days. 
                      Fine: ₹{calculateFine(selectedTransaction.issuedDate).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleReturn}>Confirm Return</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedTransaction(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookIssueReturn;

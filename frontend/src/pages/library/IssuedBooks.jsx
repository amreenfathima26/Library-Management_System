import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { BookOpen, AlertCircle, RotateCcw } from 'lucide-react';

const IssuedBooks = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  const fetchIssuedBooks = async () => {
    try {
      const response = await axiosInstance.get('/library/transactions/issued');
      setIssuedBooks(response.data || []);
    } catch (error) {
      console.error('Error fetching issued books:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysOverdue = (issuedDate) => {
    if (!issuedDate) return 0;
    const today = new Date();
    const issued = new Date(issuedDate);
    const diffTime = today - issued;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays - 14); // 14 days allowed
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issued Books</h1>
          <p className="text-gray-600 mt-1">View all currently issued books</p>
        </div>
        <Button variant="outline" onClick={fetchIssuedBooks}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card title={`Total Issued: ${issuedBooks.length}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student UID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Since Issue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No books currently issued
                  </td>
                </tr>
              ) : (
                issuedBooks.map((transaction) => {
                  const daysOverdue = calculateDaysOverdue(transaction.issuedDate);
                  const daysSinceIssue = Math.floor((new Date() - new Date(transaction.issuedDate)) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{transaction.book?.author || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {transaction.student?.firstName} {transaction.student?.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{transaction.student?.studentUid || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                      <td className="py-3 px-4">
                        <span className={daysSinceIssue > 14 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {daysSinceIssue} days
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {daysOverdue > 0 ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>OVERDUE ({daysOverdue} days)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ACTIVE
                          </span>
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
    </div>
  );
};

export default IssuedBooks;


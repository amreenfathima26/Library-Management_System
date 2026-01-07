import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { AlertCircle, DollarSign, RotateCcw, TrendingUp } from 'lucide-react';

const OverdueFines = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [finesSummary, setFinesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overdueRes, summaryRes] = await Promise.all([
        axiosInstance.get('/library/transactions/overdue'),
        axiosInstance.get('/library/fines/summary'),
      ]);
      setOverdueBooks(overdueRes.data || []);
      setFinesSummary(summaryRes.data || {});
    } catch (error) {
      console.error('Error fetching overdue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (issuedDate) => {
    if (!issuedDate) return 0;
    const today = new Date();
    const issued = new Date(issuedDate);
    const diffTime = today - issued;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysOverdue = Math.max(0, diffDays - 14);
    return daysOverdue * 10; // ₹10 per day
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overdue Books & Fines</h1>
          <p className="text-gray-600 mt-1">Monitor overdue books and fine collection</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Fines Summary Cards */}
      {finesSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overdue Books</p>
                <p className="text-2xl font-bold text-red-600">{finesSummary.overdueCount || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Fines</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{finesSummary.totalPendingFines?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Collected Fines</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{finesSummary.totalCollectedFines?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Fines</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{finesSummary.totalFines?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Overdue Books Table */}
      <Card title={`Overdue Books (${overdueBooks.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student UID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Overdue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {overdueBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No overdue books
                  </td>
                </tr>
              ) : (
                overdueBooks.map((transaction) => {
                  const daysOverdue = Math.max(0, Math.floor((new Date() - new Date(transaction.issuedDate)) / (1000 * 60 * 60 * 24)) - 14);
                  const fine = calculateFine(transaction.issuedDate);
                  
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.book?.title || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {transaction.student?.firstName} {transaction.student?.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{transaction.student?.studentUid || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(transaction.issuedDate)}</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-medium">{daysOverdue} days</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-bold">₹{fine.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          OVERDUE
                        </span>
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

export default OverdueFines;


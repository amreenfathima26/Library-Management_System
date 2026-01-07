import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/charts/StatCard';
import { DollarSign, Plus, Receipt, Eye, FileText } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const FeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const canCollectFee = user?.role === 'ACCOUNTS';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch dashboard overview for fee stats
      const overviewResponse = await axiosInstance.get('/dashboard/overview');
      setStats(overviewResponse.data);
      
      // Fetch recent transactions (you may need to create this endpoint)
      // const transactionsResponse = await axiosInstance.get('/payments/recent');
      // setRecentTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ADMIN' 
              ? 'Track and manage fee collections' 
              : 'Collect and manage fee payments'}
          </p>
        </div>
        {canCollectFee ? (
          <Link to="/finance/collect">
            <Button>
              <Plus className="w-5 h-5 mr-2 inline" />
              Collect Fee
            </Button>
          </Link>
        ) : (
          <div className="text-sm text-gray-500">
            {user?.role === 'ADMIN' && (
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                View Only - ACCOUNTS staff collect fees
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Fees Collected"
          value={formatCurrency(stats?.total_fees_collected || 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(stats?.monthly_fees_collected || 0)}
          icon={Receipt}
        />
        <StatCard
          title="Pending Payments"
          value="0"
          icon={DollarSign}
        />
      </div>

      <Card title="Recent Transactions">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Receipt No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mode</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{transaction.receiptNumber}</td>
                    <td className="py-3 px-4">{transaction.studentName}</td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">{transaction.paymentMode}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDateTime(transaction.paidAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FeeDashboard;


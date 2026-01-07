import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { DollarSign, Receipt, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { formatDateTime } from '../../utils/helpers';

const AccountsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/overview');
      setOverview(response.data);
      
      // Fetch recent transactions (you may need to create this endpoint)
      // For now, we'll show a message
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Fee collection and financial management</p>
        </div>
        <Link to="/finance/collect">
          <button className="btn btn-primary">
            Collect Fee
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Fees Collected"
          value={formatCurrency(overview?.total_fees_collected || 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(overview?.monthly_fees_collected || 0)}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Receipts Generated"
          value={overview?.total_students || 0}
          icon={Receipt}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/finance/collect" className="block">
              <div className="px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Collect Fee (Cash)</div>
                <div className="text-sm text-green-600">Record offline payment</div>
              </div>
            </Link>
            <Link to="/finance" className="block">
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View All Transactions</div>
                <div className="text-sm text-blue-600">See fee payment history</div>
              </div>
            </Link>
            <Link to="/students" className="block">
              <div className="px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">View Students</div>
                <div className="text-sm text-purple-600">Search students for fee collection</div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Recent Activity">
          <p className="text-gray-500 text-center py-4">Recent transactions will appear here</p>
        </Card>
      </div>
    </div>
  );
};

export default AccountsDashboard;


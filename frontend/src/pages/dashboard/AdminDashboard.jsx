import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { Users, DollarSign, Home, BookOpen, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/overview');
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!overview) {
    return <div className="text-center text-gray-600">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to College ERP System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={overview.total_students || 0}
          icon={Users}
          change={`${overview.active_students || 0} active`}
        />
        <StatCard
          title="Total Fees Collected"
          value={formatCurrency(overview.total_fees_collected || 0)}
          icon={DollarSign}
          change={`${formatCurrency(overview.monthly_fees_collected || 0)} this month`}
          trend="up"
        />
        <StatCard
          title="Hostel Occupancy"
          value={`${overview.hostel_total_occupied || 0}/${overview.hostel_total_capacity || 0}`}
          icon={Home}
          change={`${overview.hostel_occupancy_percentage?.toFixed(1) || 0}%`}
        />
        <StatCard
          title="Books Issued"
          value={overview.currently_issued_books || 0}
          icon={BookOpen}
          change={`${overview.total_books_issued || 0} total`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Fee Collection">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', amount: 500000 },
              { month: 'Feb', amount: 600000 },
              { month: 'Mar', amount: 550000 },
              { month: 'Apr', amount: 700000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Fees (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <div className="font-medium text-primary-900">Add New Student</div>
              <div className="text-sm text-primary-600">Register a new student</div>
            </button>
            <Link to="/finance" className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="font-medium text-green-900">View Fee Management</div>
              <div className="text-sm text-green-600">Track fee collections and reports</div>
            </Link>
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="font-medium text-blue-900">Allocate Hostel</div>
              <div className="text-sm text-blue-600">Assign student to hostel</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


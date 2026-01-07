import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { BookOpen, Book, Users, AlertCircle } from 'lucide-react';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const booksResponse = await axiosInstance.get('/library/books');
      const totalBooks = booksResponse.data.length;
      const totalQuantity = booksResponse.data.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const availableBooks = booksResponse.data.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
      const issuedBooks = totalQuantity - availableBooks;
      
      setStats({
        totalBooks,
        totalQuantity,
        availableBooks,
        issuedBooks,
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-600 mt-1">Book inventory and transaction management</p>
        </div>
        <Link to="/library">
          <button className="btn btn-primary">
            Manage Books
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={Book}
        />
        <StatCard
          title="Total Copies"
          value={stats?.totalQuantity || 0}
          icon={BookOpen}
        />
        <StatCard
          title="Available"
          value={stats?.availableBooks || 0}
          icon={BookOpen}
        />
        <StatCard
          title="Issued"
          value={stats?.issuedBooks || 0}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/library" className="block">
              <div className="px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="font-medium text-primary-900">Add New Book</div>
                <div className="text-sm text-primary-600">Add book to library inventory</div>
              </div>
            </Link>
            <Link to="/library/transactions" className="block">
              <div className="px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Issue/Return Books</div>
                <div className="text-sm text-green-600">Manage book transactions</div>
              </div>
            </Link>
            <Link to="/library/issued" className="block">
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View Issued Books</div>
                <div className="text-sm text-blue-600">See all currently issued books</div>
              </div>
            </Link>
            <Link to="/library/overdue" className="block">
              <div className="px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <div className="font-medium text-red-900">Overdue & Fines</div>
                <div className="text-sm text-red-600">Monitor overdue books and fines</div>
              </div>
            </Link>
            <Link to="/library/history" className="block">
              <div className="px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">Borrowing History</div>
                <div className="text-sm text-purple-600">View student borrowing history</div>
              </div>
            </Link>
            <Link to="/library/inventory" className="block">
              <div className="px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="font-medium text-yellow-900">Inventory Health</div>
                <div className="text-sm text-yellow-600">Monitor inventory status</div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Library Rules">
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Maximum Books</p>
                <p className="text-gray-600">Students can issue up to 5 books at a time</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium">Issue Period</p>
                <p className="text-gray-600">Books must be returned within 14 days</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Fine Calculation</p>
                <p className="text-gray-600">₹10 per day for overdue books</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LibrarianDashboard;


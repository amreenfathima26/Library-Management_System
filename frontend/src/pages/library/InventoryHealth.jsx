import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import { BookOpen, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

const InventoryHealth = () => {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch inventory health statistics from backend
      const healthResponse = await axiosInstance.get('/library/inventory/health');
      const healthData = healthResponse.data || {};
      
      // Set statistics from backend
      setStats({
        totalBooks: healthData.totalBooks || 0,
        totalQuantity: healthData.totalQuantity || 0,
        availableQuantity: healthData.availableQuantity || 0,
        issuedQuantity: healthData.issuedQuantity || 0,
        lowStockBooks: healthData.lowStockBooksCount || 0,
        outOfStockBooks: healthData.outOfStockBooksCount || 0,
        healthyBooks: healthData.healthyBooksCount || 0,
        utilizationRate: healthData.utilizationRate || 0,
      });
      
      // Set books for display (low stock and out of stock)
      const lowStock = healthData.lowStockBooks || [];
      const outOfStock = healthData.outOfStockBooks || [];
      setBooks([...lowStock, ...outOfStock]);
    } catch (error) {
      console.error('Error fetching inventory health data:', error);
      // Fallback: try to fetch books directly
      try {
        const response = await axiosInstance.get('/library/books');
        const booksData = response.data || [];
        setBooks(booksData);
        
        // Calculate statistics as fallback
        const totalBooks = booksData.length;
        const totalQuantity = booksData.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const availableQuantity = booksData.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
        const issuedQuantity = totalQuantity - availableQuantity;
        const lowStockBooks = booksData.filter(b => (b.availableQuantity || 0) <= 2 && (b.availableQuantity || 0) > 0);
        const outOfStockBooks = booksData.filter(b => (b.availableQuantity || 0) === 0);
        const healthyBooks = booksData.filter(b => (b.availableQuantity || 0) > 2);
        
        setStats({
          totalBooks,
          totalQuantity,
          availableQuantity,
          issuedQuantity,
          lowStockBooks: lowStockBooks.length,
          outOfStockBooks: outOfStockBooks.length,
          healthyBooks: healthyBooks.length,
          utilizationRate: totalQuantity > 0 ? ((issuedQuantity / totalQuantity) * 100).toFixed(1) : 0,
        });
      } catch (fallbackError) {
        console.error('Error in fallback fetch:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Filter books for display (already filtered by backend, but add safety checks)
  const lowStockList = books.filter(b => (b.availableQuantity || 0) <= 2 && (b.availableQuantity || 0) > 0);
  const outOfStockList = books.filter(b => (b.availableQuantity || 0) === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Health</h1>
        <p className="text-gray-600 mt-1">Monitor library inventory status and health</p>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Books</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Copies</p>
                <p className="text-2xl font-bold">{stats.totalQuantity}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-2xl font-bold">{stats.availableQuantity}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilization</p>
                <p className="text-2xl font-bold">{stats.utilizationRate}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Health Status */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Healthy Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyBooks}</p>
                  <p className="text-xs text-gray-500 mt-1">Books with &gt;2 copies available</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStockBooks}</p>
                <p className="text-xs text-gray-500 mt-1">Books with ≤2 copies available</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockBooks}</p>
                <p className="text-xs text-gray-500 mt-1">Books with 0 copies available</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Low Stock Books */}
      {lowStockList.length > 0 && (
        <Card title={`Low Stock Books (${lowStockList.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockList.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{book.title}</td>
                    <td className="py-3 px-4 text-gray-600">{book.author}</td>
                    <td className="py-3 px-4">{book.quantity || 0}</td>
                    <td className="py-3 px-4">
                      <span className="text-orange-600 font-medium">{book.availableQuantity || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        LOW STOCK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Out of Stock Books */}
      {outOfStockList.length > 0 && (
        <Card title={`Out of Stock Books (${outOfStockList.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockList.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{book.title}</td>
                    <td className="py-3 px-4 text-gray-600">{book.author}</td>
                    <td className="py-3 px-4">{book.quantity || 0}</td>
                    <td className="py-3 px-4">
                      <span className="text-red-600 font-medium">{book.availableQuantity || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        OUT OF STOCK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {lowStockList.length === 0 && outOfStockList.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">All books are in healthy stock!</p>
            <p className="text-sm text-gray-600 mt-2">No low stock or out of stock books</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryHealth;


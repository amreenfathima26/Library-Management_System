import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeeCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    semester: '',
    paymentMode: 'CASH',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user has permission to collect fees
  const canCollectFee = user?.role === 'ACCOUNTS';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.paymentMode === 'RAZORPAY') {
        // Create Razorpay order
        const response = await axiosInstance.post('/payments/create-order', {
          ...formData,
          amount: parseFloat(formData.amount),
          semester: parseInt(formData.semester),
        });
        // Handle Razorpay payment (integrate Razorpay checkout)
        alert('Razorpay integration needed');
      } else {
        // Cash payment
        await axiosInstance.post('/payments/cash', {
          ...formData,
          amount: parseFloat(formData.amount),
          semester: parseInt(formData.semester),
        });
        navigate('/finance');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have permission, show access denied
  if (!canCollectFee) {
    return (
      <div className="space-y-6">
        <Link to="/finance" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Finance
        </Link>

        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Only ACCOUNTS / FINANCE STAFF can collect fees.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {user?.role === 'ADMIN' 
                ? 'As an Admin, you can view and track fee collections, but fee collection must be done by ACCOUNTS staff.'
                : 'You do not have permission to collect fees.'}
            </p>
            <Link to="/finance">
              <Button variant="secondary">
                Go to Fee Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/finance" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Finance
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Collect Fee</h1>
        <p className="text-gray-600 mt-1">Process fee payment</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              className="input"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.studentUid} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Semester"
              type="number"
              min="1"
              max="12"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              className="input"
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              required
            >
              <option value="CASH">Cash</option>
              <option value="RAZORPAY">Online (Razorpay)</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Collect Fee'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/finance')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FeeCollection;


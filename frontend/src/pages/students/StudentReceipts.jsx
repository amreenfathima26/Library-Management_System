import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, FileText, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const StudentReceipts = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentAndReceipts();
  }, []);

  const fetchStudentAndReceipts = async () => {
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
        
        // Fetch fee transactions (receipts)
        const feesResponse = await axiosInstance.get(`/payments/student/${studentData.id}`);
        const transactions = feesResponse.data || [];
        
        // Filter only successful transactions (which have receipts)
        const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS');
        setReceipts(successfulTransactions);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (receiptNumber) => {
    try {
      const response = await axiosInstance.get(`/upload/receipt/${receiptNumber}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleExportAll = () => {
    // Export receipts as CSV
    const csvContent = [
      ['Receipt Number', 'Amount', 'Payment Mode', 'Semester', 'Date', 'Status'],
      ...receipts.map(r => [
        r.receiptNumber,
        formatCurrency(r.amount),
        r.paymentMode,
        r.semester,
        r.paidAt ? formatDate(r.paidAt) : 'N/A',
        r.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipts_${student?.studentUid || 'export'}.csv`;
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

  const totalPaid = receipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Receipts</h1>
          <p className="text-gray-600 mt-1">View and download your fee payment receipts</p>
        </div>
        {receipts.length > 0 && (
          <Button onClick={handleExportAll} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        )}
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Receipts</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student UID</p>
              <p className="text-xl font-bold">{student.studentUid}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Receipts List */}
      <Card title="Payment Receipts">
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No receipts available</p>
            <p className="text-sm text-gray-500 mt-2">Receipts will appear here after fee payments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Receipt Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Mode</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{receipt.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {formatCurrency(receipt.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {receipt.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4">Semester {receipt.semester}</td>
                    <td className="py-3 px-4">
                      {receipt.paidAt ? formatDate(receipt.paidAt) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {receipt.status === 'SUCCESS' ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span>{receipt.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleDownloadReceipt(receipt.receiptNumber)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentReceipts;


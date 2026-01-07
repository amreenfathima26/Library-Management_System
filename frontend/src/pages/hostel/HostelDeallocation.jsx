import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Search, UserX, Home } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const HostelDeallocation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [student, setStudent] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    setAllocation(null);
    setLoading(true);

    try {
      // Search by Student UID
      const response = await axiosInstance.get(`/students/uid/${searchTerm.trim()}`);
      const foundStudent = response.data;
      setStudent(foundStudent);

      // Get student allocations
      const allocResponse = await axiosInstance.get(`/hostels/student/${foundStudent.id}`);
      const activeAllocation = allocResponse.data.find(
        (alloc) => alloc.status === 'ALLOCATED'
      );

      if (activeAllocation) {
        setAllocation(activeAllocation);
      } else {
        setError('No active hostel allocation found for this student');
      }
    } catch (error) {
      setError('Student not found. Please check the Student UID.');
      setStudent(null);
      setAllocation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeallocate = async () => {
    if (!window.confirm('Are you sure you want to deallocate this student from the hostel?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await axiosInstance.post(`/hostels/deallocate?studentId=${student.id}`);
      setSuccess('Student deallocated successfully');
      setTimeout(() => {
        navigate('/hostel');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to deallocate student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/hostel" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Hostels
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deallocate Student</h1>
        <p className="text-gray-600 mt-1">Remove student from hostel room</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Student UID
            </label>
            <div className="flex space-x-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                placeholder="Enter Student UID (e.g., STU20250001)"
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !searchTerm.trim()}>
                <Search className="w-4 h-4 mr-2 inline" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the Student UID to find and deallocate the student
            </p>
          </div>
        </form>
      </Card>

      {error && (
        <Card>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </Card>
      )}

      {success && (
        <Card>
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </Card>
      )}

      {student && allocation && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Student UID</label>
                  <p className="font-medium">{student.studentUid}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Course</label>
                  <p className="font-medium">{student.courseName}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-primary-600" />
                  <div>
                    <label className="text-sm text-gray-600">Hostel</label>
                    <p className="font-medium">{allocation.hostel?.hostelName || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Room Number</label>
                  <p className="font-medium">{allocation.room?.roomNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Allocation Date</label>
                  <p className="font-medium">{formatDate(allocation.allocationDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {allocation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Button
                onClick={handleDeallocate}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <UserX className="w-4 h-4 mr-2 inline" />
                {loading ? 'Deallocating...' : 'Deallocate Student'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HostelDeallocation;


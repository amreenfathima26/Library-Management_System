import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Search, Users, Home, UserX } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AllocationList = () => {
  const [allocations, setAllocations] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, ALLOCATED, VACATED

  useEffect(() => {
    fetchHostels();
    fetchAllocations();
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [selectedHostel, filterStatus]);

  const fetchHostels = async () => {
    try {
      const response = await axiosInstance.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedHostel === 'all') {
        response = await axiosInstance.get('/hostels/allocations');
      } else {
        response = await axiosInstance.get(`/hostels/${selectedHostel}/allocations`);
      }
      
      let data = response.data || [];
      
      // Filter by status
      if (filterStatus !== 'all') {
        data = data.filter(alloc => alloc.status === filterStatus);
      }
      
      setAllocations(data);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeallocate = async (allocationId, studentId) => {
    if (!window.confirm('Are you sure you want to deallocate this student?')) {
      return;
    }

    try {
      await axiosInstance.post(`/hostels/deallocate?studentId=${studentId}`);
      fetchAllocations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to deallocate student');
    }
  };

  const filteredAllocations = allocations.filter(alloc => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      alloc.studentUid?.toLowerCase().includes(search) ||
      alloc.studentName?.toLowerCase().includes(search) ||
      alloc.hostelName?.toLowerCase().includes(search) ||
      alloc.roomNumber?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/hostel" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Hostels
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Allocation List</h1>
          <p className="text-gray-600 mt-1">View all hostel allocations</p>
        </div>
        <Link to="/hostel/allocate">
          <Button>
            <Users className="w-4 h-4 mr-2 inline" />
            Allocate Student
          </Button>
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hostel</label>
            <select
              className="input"
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
            >
              <option value="all">All Hostels</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.hostelName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="VACATED">Vacated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by UID, Name, Room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Student UID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Hostel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Allocation Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No allocations found</p>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{allocation.studentUid}</td>
                    <td className="px-4 py-3 text-sm">{allocation.studentName}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span>{allocation.hostelName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">Room {allocation.roomNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(allocation.allocationDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          allocation.status === 'ALLOCATED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {allocation.status === 'ALLOCATED' && (
                        <button
                          onClick={() => handleDeallocate(allocation.id, allocation.studentId)}
                          className="text-red-600 hover:text-red-700"
                          title="Deallocate"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-gray-600">
        Showing {filteredAllocations.length} of {allocations.length} allocations
      </div>
    </div>
  );
};

export default AllocationList;


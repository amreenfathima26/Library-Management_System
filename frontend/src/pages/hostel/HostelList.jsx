import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/charts/StatCard';
import { Home, Users, Settings, FileText, UserPlus, UserX } from 'lucide-react';

const HostelList = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await axiosInstance.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-600 mt-1">Manage hostel rooms and allocations</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/hostel/allocations">
            <Button variant="secondary">
              <Users className="w-4 h-4 mr-2 inline" />
              View Allocations
            </Button>
          </Link>
          <Link to="/hostel/reports">
            <Button variant="secondary">
              <FileText className="w-4 h-4 mr-2 inline" />
              Reports
            </Button>
          </Link>
          <Link to="/hostel/deallocate">
            <Button variant="secondary">
              <UserX className="w-4 h-4 mr-2 inline" />
              Deallocate
            </Button>
          </Link>
          <Link to="/hostel/allocate">
            <Button>
              <UserPlus className="w-4 h-4 mr-2 inline" />
              Allocate Student
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <Card key={hostel.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{hostel.hostelName}</h3>
              <Home className="w-8 h-8 text-primary-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rooms:</span>
                <span className="font-medium">{hostel.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{hostel.totalCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupied:</span>
                <span className="font-medium">{hostel.totalOccupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available:</span>
                <span className="font-medium text-green-600">{hostel.availableBeds}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-bold text-primary-600">
                    {hostel.occupancyPercentage?.toFixed(1)}%
                  </span>
                </div>
                <Link to={`/hostel/${hostel.id}/rooms`}>
                  <Button variant="secondary" className="w-full text-sm">
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Manage Rooms
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HostelList;


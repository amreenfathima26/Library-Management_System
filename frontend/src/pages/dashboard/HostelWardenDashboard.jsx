import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/ui/Card';
import { Home, Users, Bed, TrendingUp } from 'lucide-react';

const HostelWardenDashboard = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const totalCapacity = hostels.reduce((sum, h) => sum + (h.totalCapacity || 0), 0);
  const totalOccupied = hostels.reduce((sum, h) => sum + (h.totalOccupied || 0), 0);
  const totalAvailable = hostels.reduce((sum, h) => sum + (h.availableBeds || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-600 mt-1">Room allocation and occupancy tracking</p>
        </div>
        <Link to="/hostel/allocate">
          <button className="btn btn-primary">
            Allocate Student
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Hostels"
          value={hostels.length}
          icon={Home}
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity}
          icon={Bed}
        />
        <StatCard
          title="Occupied Beds"
          value={totalOccupied}
          icon={Users}
        />
        <StatCard
          title="Available Beds"
          value={totalAvailable}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Hostel Overview">
          {hostels.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hostels found</p>
          ) : (
            <div className="space-y-3">
              {hostels.map((hostel) => (
                <div key={hostel.id} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{hostel.hostelName}</h3>
                    <span className="text-sm text-gray-600">
                      {hostel.occupancyPercentage?.toFixed(1)}% occupied
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Rooms:</span>
                      <span className="font-medium ml-1">{hostel.totalRooms}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Occupied:</span>
                      <span className="font-medium ml-1">{hostel.totalOccupied}/{hostel.totalCapacity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium ml-1 text-green-600">{hostel.availableBeds}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/hostel/allocate" className="block">
              <div className="px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="font-medium text-primary-900">Allocate Student</div>
                <div className="text-sm text-primary-600">Assign student to hostel room</div>
              </div>
            </Link>
            <Link to="/hostel" className="block">
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View All Hostels</div>
                <div className="text-sm text-blue-600">See room details and occupancy</div>
              </div>
            </Link>
            <Link to="/students" className="block">
              <div className="px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">View Students</div>
                <div className="text-sm text-purple-600">Search students for allocation</div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HostelWardenDashboard;


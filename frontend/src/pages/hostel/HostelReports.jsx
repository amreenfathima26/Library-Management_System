import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Download, BarChart3, Users, Home } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const HostelReports = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('occupancy'); // occupancy, allocations, rooms

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      fetchHostelDetails();
    }
  }, [selectedHostel]);

  const fetchHostels = async () => {
    try {
      const response = await axiosInstance.get('/hostels');
      setHostels(response.data);
      if (response.data.length > 0 && !selectedHostel) {
        setSelectedHostel(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostelDetails = async () => {
    if (!selectedHostel) return;

    try {
      const [roomsRes, hostelRes] = await Promise.all([
        axiosInstance.get(`/hostels/${selectedHostel}/rooms`),
        axiosInstance.get(`/hostels/${selectedHostel}`)
      ]);
      setRooms(roomsRes.data);
      
      // Fetch all allocations for this hostel
      const allAllocations = [];
      for (const room of roomsRes.data) {
        // Note: Backend might need an endpoint to get allocations by hostel
        // For now, we'll use room data
      }
    } catch (error) {
      console.error('Error fetching hostel details:', error);
    }
  };

  const exportReport = () => {
    const hostel = hostels.find(h => h.id === selectedHostel);
    if (!hostel) return;

    let csvContent = '';
    
    if (reportType === 'occupancy') {
      csvContent = `Hostel Occupancy Report - ${hostel.hostelName}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      csvContent += `Hostel Name,Total Rooms,Total Capacity,Occupied Beds,Available Beds,Occupancy %\n`;
      csvContent += `${hostel.hostelName},${hostel.totalRooms},${hostel.totalCapacity},${hostel.totalOccupied},${hostel.availableBeds},${hostel.occupancyPercentage.toFixed(2)}%\n\n`;
      csvContent += `Room Details:\n`;
      csvContent += `Room Number,Capacity,Occupied,Available\n`;
      rooms.forEach(room => {
        csvContent += `${room.roomNumber},${room.capacity},${room.occupiedBeds},${room.capacity - room.occupiedBeds}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel_report_${hostel.hostelName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const currentHostel = hostels.find(h => h.id === selectedHostel);

  return (
    <div className="space-y-6">
      <Link to="/hostel" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Hostels
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel Reports</h1>
          <p className="text-gray-600 mt-1">View occupancy and allocation reports</p>
        </div>
        <Button onClick={exportReport} variant="secondary">
          <Download className="w-4 h-4 mr-2 inline" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setReportType('occupancy')}
          className={`p-4 rounded-lg border-2 ${
            reportType === 'occupancy'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <BarChart3 className="w-6 h-6 mb-2 text-primary-600" />
          <h3 className="font-semibold">Occupancy Report</h3>
          <p className="text-sm text-gray-600">Room occupancy statistics</p>
        </button>
        <button
          onClick={() => setReportType('allocations')}
          className={`p-4 rounded-lg border-2 ${
            reportType === 'allocations'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Users className="w-6 h-6 mb-2 text-primary-600" />
          <h3 className="font-semibold">Allocation History</h3>
          <p className="text-sm text-gray-600">Student allocation records</p>
        </button>
        <button
          onClick={() => setReportType('rooms')}
          className={`p-4 rounded-lg border-2 ${
            reportType === 'rooms'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Home className="w-6 h-6 mb-2 text-primary-600" />
          <h3 className="font-semibold">Room Details</h3>
          <p className="text-sm text-gray-600">Detailed room information</p>
        </button>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Hostel</label>
          <select
            className="input"
            value={selectedHostel || ''}
            onChange={(e) => setSelectedHostel(Number(e.target.value))}
          >
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.hostelName}
              </option>
            ))}
          </select>
        </div>

        {currentHostel && (
          <div className="space-y-6">
            {reportType === 'occupancy' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Occupancy Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-blue-600">{currentHostel.totalRooms}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-green-600">{currentHostel.totalCapacity}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-2xl font-bold text-yellow-600">{currentHostel.totalOccupied}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Occupancy %</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentHostel.occupancyPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Room-wise Occupancy</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Room Number</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Capacity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Occupied</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Available</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Occupancy %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room) => {
                          const roomOccupancy = room.capacity > 0 ? (room.occupiedBeds * 100 / room.capacity) : 0;
                          return (
                            <tr key={room.id}>
                              <td className="px-4 py-3 text-sm font-medium">{room.roomNumber}</td>
                              <td className="px-4 py-3 text-sm">{room.capacity}</td>
                              <td className="px-4 py-3 text-sm">{room.occupiedBeds}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={room.capacity - room.occupiedBeds > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {room.capacity - room.occupiedBeds}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={roomOccupancy >= 100 ? 'text-red-600' : roomOccupancy >= 80 ? 'text-yellow-600' : 'text-green-600'}>
                                  {roomOccupancy.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'rooms' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Room Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Room {room.roomNumber}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{room.capacity} beds</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Occupied:</span>
                          <span className="font-medium">{room.occupiedBeds} beds</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className={`font-medium ${room.capacity - room.occupiedBeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {room.capacity - room.occupiedBeds} beds
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default HostelReports;


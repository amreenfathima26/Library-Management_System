import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Search, User, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const HostelAllocation = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    studentUid: '',
    hostelId: '',
    roomId: '',
    allocationDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (formData.hostelId) {
      fetchRooms(formData.hostelId);
    }
  }, [formData.hostelId]);

  const fetchHostels = async () => {
    try {
      const response = await axiosInstance.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const response = await axiosInstance.get(`/hostels/${hostelId}/rooms/available`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleStudentSearch = async (e) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    setSearching(true);

    try {
      const response = await axiosInstance.get(`/students/uid/${formData.studentUid.trim()}`);
      const foundStudent = response.data;
      
      // Check if student is already allocated
      const allocResponse = await axiosInstance.get(`/hostels/student/${foundStudent.id}`);
      const activeAllocation = allocResponse.data.find(alloc => alloc.status === 'ALLOCATED');
      
      if (activeAllocation) {
        setError('This student already has an active hostel allocation');
        setStudent(null);
      } else {
        setStudent(foundStudent);
        setFormData({ ...formData, studentId: foundStudent.id });
      }
    } catch (error) {
      setError('Student not found. Please check the Student UID.');
      setStudent(null);
      setFormData({ ...formData, studentId: '' });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!student) {
      setError('Please search and select a student first');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/hostels/allocate', {
        studentId: formData.studentId,
        hostelId: formData.hostelId,
        roomId: formData.roomId,
        allocationDate: formData.allocationDate,
      });
      navigate('/hostel');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to allocate student');
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
        <h1 className="text-3xl font-bold text-gray-900">Allocate Hostel</h1>
        <p className="text-gray-600 mt-1">Assign student to hostel room</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleStudentSearch} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student by UID
            </label>
            <div className="flex space-x-2">
              <Input
                value={formData.studentUid}
                onChange={(e) => setFormData({ ...formData, studentUid: e.target.value.toUpperCase() })}
                placeholder="Enter Student UID (e.g., STU20250001)"
                required
                className="flex-1"
              />
              <Button type="submit" disabled={searching || !formData.studentUid.trim()}>
                <Search className="w-4 h-4 mr-2 inline" />
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the Student UID to find and allocate the student
            </p>
          </div>
        </form>

        {student && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Student Found</h3>
            </div>
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
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hostel</label>
            <select
              className="input"
              value={formData.hostelId}
              onChange={(e) => setFormData({ ...formData, hostelId: e.target.value, roomId: '' })}
              required
              disabled={!student}
            >
              <option value="">Select Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.hostelName} ({hostel.availableBeds} beds available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
            <select
              className="input"
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              required
              disabled={!formData.hostelId || rooms.length === 0}
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber} ({room.capacity - room.occupiedBeds} available)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Allocation Date"
            type="date"
            value={formData.allocationDate}
            onChange={(e) => setFormData({ ...formData, allocationDate: e.target.value })}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading || !student || !formData.hostelId || !formData.roomId}>
              {loading ? 'Allocating...' : 'Allocate Student'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/hostel')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HostelAllocation;


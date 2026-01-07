import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ArrowLeft, Plus, Edit, Trash2, Users, RefreshCw } from 'lucide-react';

const RoomManagement = () => {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 1,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchHostel();
      fetchRooms();
    }
  }, [id]);

  const fetchHostel = async () => {
    try {
      const response = await axiosInstance.get(`/hostels/${id}`);
      setHostel(response.data);
    } catch (error) {
      console.error('Error fetching hostel:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get(`/hostels/${id}/rooms`);
      console.log('Rooms API Response:', response.data); // Debug log
      if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
        console.log('Rooms set:', response.data.length); // Debug log
      } else {
        console.log('No rooms array in response'); // Debug log
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      console.error('Error details:', error.response?.data); // Debug log
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomNumber: room.roomNumber,
        capacity: room.capacity,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        roomNumber: '',
        capacity: 1,
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({ roomNumber: '', capacity: 1 });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingRoom) {
        // Update room - Note: Backend might need PUT endpoint
        await axiosInstance.put(`/hostels/${id}/rooms/${editingRoom.id}`, formData);
      } else {
        // Create room
        await axiosInstance.post(`/hostels/${id}/rooms`, formData);
      }
      fetchRooms();
      fetchHostel();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This will affect allocations.')) {
      return;
    }
    try {
      await axiosInstance.delete(`/hostels/${id}/rooms/${roomId}`);
      fetchRooms();
      fetchHostel();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">{hostel?.hostelName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={fetchRooms}>
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Room
          </Button>
        </div>
      </div>

      {rooms && rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(room)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{room.capacity || 0} beds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium">{room.occupiedBeds || 0} beds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className={`font-medium ${(room.capacity || 0) - (room.occupiedBeds || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(room.capacity || 0) - (room.occupiedBeds || 0)} beds
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {room.occupiedBeds || 0}/{room.capacity || 0} occupied
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No rooms found. Add your first room to get started.</p>
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingRoom ? 'Edit Room' : 'Add Room'}>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Room Number"
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            required
            placeholder="e.g., 101, A-201"
          />
          <Input
            label="Capacity (Beds)"
            type="number"
            min="1"
            max="10"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="flex space-x-4">
            <Button type="submit">
              {editingRoom ? 'Update Room' : 'Create Room'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagement;


import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import { Home, MapPin, Calendar, Users, Bed } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const StudentHostelDetails = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [hostelAllocation, setHostelAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostelDetails();
  }, []);

  const fetchHostelDetails = async () => {
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
        
        // Fetch hostel allocation
        try {
          const hostelResponse = await axiosInstance.get(`/hostel/student/${studentData.id}`);
          const allocations = hostelResponse.data || [];
          if (allocations.length > 0) {
            setHostelAllocation(allocations[0]); // Get the latest/active allocation
          }
        } catch (error) {
          console.error('Error fetching hostel details:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Hostel Details</h1>
        <p className="text-gray-600 mt-1">View your hostel allocation and room information</p>
      </div>

      {!hostelAllocation ? (
        <Card>
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No Hostel Allocation</p>
            <p className="text-sm text-gray-500 mt-2">
              You are not currently allocated to any hostel. Please contact the Hostel Warden for allocation.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hostel Information */}
          <Card title="Hostel Information">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hostel Name</p>
                  <p className="font-medium text-lg">{hostelAllocation.hostel?.name || 'N/A'}</p>
                </div>
              </div>
              {hostelAllocation.hostel?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{hostelAllocation.hostel.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Allocation Date</p>
                  <p className="font-medium">
                    {hostelAllocation.allocationDate ? formatDate(hostelAllocation.allocationDate) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    hostelAllocation.status === 'ALLOCATED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hostelAllocation.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Room Information */}
          <Card title="Room Information">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Bed className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-medium text-lg">
                    {hostelAllocation.room?.roomNumber || 'N/A'}
                  </p>
                </div>
              </div>
              {hostelAllocation.room && (
                <>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Room Capacity</p>
                      <p className="font-medium">
                        {hostelAllocation.room.capacity || 'N/A'} beds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Occupied Beds</p>
                      <p className="font-medium">
                        {hostelAllocation.room.occupiedBeds || 0} / {hostelAllocation.room.capacity || 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {hostelAllocation.vacationDate && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Vacation Date</p>
                    <p className="font-medium">{formatDate(hostelAllocation.vacationDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Student Info */}
      <Card title="Student Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Student UID</p>
            <p className="font-medium">{student.studentUid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Course</p>
            <p className="font-medium">{student.courseName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Semester</p>
            <p className="font-medium">Semester {student.semester}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentHostelDetails;


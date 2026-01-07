import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Award } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const StudentProfileView = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
    
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, []);

  const fetchStudentProfile = async () => {
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
        
        // Fetch student photo if available
        if (studentData.photoPath) {
          try {
            const photoResponse = await axiosInstance.get(`/upload/student/${studentData.id}/photo`, {
              responseType: 'blob'
            });
            const blob = new Blob([photoResponse.data], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            setPhotoUrl(url);
          } catch (error) {
            console.error('Error fetching photo:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View your personal information and academic details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo and Basic Info */}
        <Card>
          <div className="text-center">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-primary-200 mb-4"
              />
            ) : (
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{student.studentUid}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              student.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800'
                : student.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {student.status}
            </span>
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{student.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{formatDate(student.dob)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{student.gender}</p>
              </div>
            </div>
            {student.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{student.address}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Academic Information */}
        <Card title="Academic Information">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium">{student.courseName}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-medium">Semester {student.semester}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-medium">{formatDate(student.admissionDate)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfileView;


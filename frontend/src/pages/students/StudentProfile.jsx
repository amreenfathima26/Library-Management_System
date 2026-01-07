import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance, { API_BASE_URL } from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Edit, Trash2, Upload, FileText, CheckCircle, XCircle, Download } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetchStudent();

    // Cleanup: revoke blob URL when component unmounts or id changes
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`/students/${id}`);
      setStudent(response.data);

      // Parse documents if available
      if (response.data.documentsPath) {
        try {
          const docs = JSON.parse(response.data.documentsPath);
          setDocuments(Object.entries(docs).map(([type, path]) => ({ type, path })));
        } catch (e) {
          // If parsing fails, documents might be in different format
        }
      }

      // Fetch student photo with authentication
      if (response.data.photoPath) {
        try {
          const photoResponse = await axiosInstance.get(`/upload/student/${id}/photo`, {
            responseType: 'blob'
          });
          const blob = new Blob([photoResponse.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        } catch (error) {
          console.error('Error fetching student photo:', error);
          setPhotoUrl(null);
        }
      } else {
        setPhotoUrl(null);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      await axiosInstance.post(`/upload/student/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchStudent();
    } catch (error) {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const documentType = prompt('Enter document type (e.g., Aadhar, Marksheet):');
    if (!documentType) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('documentType', documentType);
      await axiosInstance.post(`/upload/student/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchStudent();
    } catch (error) {
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this student application?')) {
      return;
    }
    try {
      await axiosInstance.post(`/students/${id}/approve`);
      fetchStudent();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve student');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      try {
        await axiosInstance.post(`/students/${id}/reject`, null, {
          params: { reason }
        });
        fetchStudent();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject student');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student? This will mark them as LEFT.')) {
      return;
    }
    try {
      await axiosInstance.delete(`/students/${id}`);
      window.location.href = '/students';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center text-gray-600">Student not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Students
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-1">{student.studentUid}</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
          <div className="flex space-x-2">
            {student.status === 'PENDING' && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleApprove}
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleReject}
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <XCircle className="w-4 h-4 mr-2 inline" />
                  Reject
                </Button>
              </>
            )}
            <Link to={`/students/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Button
                variant="secondary"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2 inline" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Personal Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <p className="font-medium">
                {student.firstName} {student.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-medium">{formatDate(student.dob)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <p className="font-medium">{student.gender}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium">{student.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <p className="font-medium">{student.address || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card title="Academic Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Course</label>
              <p className="font-medium">{student.courseName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Semester</label>
              <p className="font-medium">{student.semester}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Admission Date</label>
              <p className="font-medium">{formatDate(student.admissionDate)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${student.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : student.status === 'GRADUATED'
                    ? 'bg-blue-100 text-blue-800'
                    : student.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : student.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {student.status}
              </span>
              {student.status === 'PENDING' && (
                <p className="text-xs text-yellow-600 mt-1">Awaiting approval from Admissions</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Documents">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
            {student.photoPath ? (
              <div className="flex items-center space-x-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Student"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Loading...</span>
                  </div>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
                  <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            ) : (
              (user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
                <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-fit">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Documents</label>
              {(user?.role === 'ADMIN' || user?.role === 'ADMISSIONS') && (
                <label className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="w-4 h-4" />
                  <span>Add Document</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                        <span className="text-xs text-gray-500 ml-2">({doc.path.split('/').pop()})</span>
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/upload/student/${id}/documents/${doc.type}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                      download
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>
        </div>
      </Card >
    </div >
  );
};

export default StudentProfile;


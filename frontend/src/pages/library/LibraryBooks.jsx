import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react';

const LibraryBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [filters, setFilters] = useState({
    branch: '',
    subject: '',
    category: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    quantity: '',
    branch: '',
    subject: '',
    category: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get('/library/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        branch: formData.branch === '__NEW__' ? '' : formData.branch,
        subject: formData.subject === '__NEW__' ? '' : formData.subject,
      };
      await axiosInstance.post('/library/books', submitData);
      setShowAddModal(false);
      setFormData({ title: '', author: '', isbn: '', quantity: '', branch: '', subject: '', category: '' });
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add book');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      quantity: book.quantity,
      branch: book.branch || '',
      subject: book.subject || '',
      category: book.category || '',
    });
    setShowAddModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        branch: formData.branch === '__NEW__' ? '' : formData.branch,
        subject: formData.subject === '__NEW__' ? '' : formData.subject,
      };
      await axiosInstance.put(`/library/books/${editingBook.id}`, submitData);
      setShowAddModal(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', isbn: '', quantity: '', branch: '', subject: '', category: '' });
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/library/books/${id}`);
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  // Get unique values for filter dropdowns
  const uniqueBranches = [...new Set(books.map(b => b.branch).filter(Boolean))].sort();
  const uniqueSubjects = [...new Set(books.map(b => b.subject).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();

  const filteredBooks = books.filter((book) => {
    const matchesSearch = `${book.title} ${book.author} ${book.isbn || ''} ${book.branch || ''} ${book.subject || ''} ${book.category || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesBranch = !filters.branch || book.branch === filters.branch;
    const matchesSubject = !filters.subject || book.subject === filters.subject;
    const matchesCategory = !filters.category || book.category === filters.category;
    
    return matchesSearch && matchesBranch && matchesSubject && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Books</h1>
          <p className="text-gray-600 mt-1">Manage library collection</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
          <Button onClick={() => {
            setEditingBook(null);
            setFormData({ title: '', author: '', isbn: '', quantity: '', branch: '', subject: '', category: '' });
            setShowAddModal(true);
          }}>
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Book
          </Button>
        )}
      </div>

      <Card>
        <div className="mb-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="input"
              >
                <option value="">All Branches</option>
                {uniqueBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="input"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(filters.branch || filters.subject || filters.category) && (
            <Button
              variant="secondary"
              onClick={() => setFilters({ branch: '', subject: '', category: '' })}
              className="text-sm"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Branch</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ISBN</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{book.title}</td>
                  <td className="py-3 px-4">{book.author}</td>
                  <td className="py-3 px-4 text-gray-600">{book.branch || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{book.subject || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{book.category || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{book.isbn || 'N/A'}</td>
                  <td className="py-3 px-4">{book.quantity}</td>
                  <td className="py-3 px-4">{book.availableQuantity}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.availableQuantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.availableQuantity > 0 ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBook(null);
          setFormData({ title: '', author: '', isbn: '', quantity: '', branch: '', subject: '', category: '' });
        }}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <form onSubmit={editingBook ? handleUpdate : handleAddBook} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="input"
              >
                <option value="">Select Branch</option>
                {uniqueBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
                <option value="__NEW__">+ Add New Branch</option>
              </select>
              {(formData.branch === '__NEW__' || (formData.branch && !uniqueBranches.includes(formData.branch))) && (
                <input
                  type="text"
                  value={formData.branch === '__NEW__' ? '' : formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="Type new branch name..."
                  className="input mt-2"
                  autoFocus
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input"
              >
                <option value="">Select Subject</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
                <option value="__NEW__">+ Add New Subject</option>
              </select>
              {(formData.subject === '__NEW__' || (formData.subject && !uniqueSubjects.includes(formData.subject))) && (
                <input
                  type="text"
                  value={formData.subject === '__NEW__' ? '' : formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Type new subject name..."
                  className="input mt-2"
                  autoFocus
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="">Select Category</option>
                <option value="Textbook">Textbook</option>
                <option value="Reference">Reference</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Research">Research</option>
                <option value="Journal">Journal</option>
                <option value="Magazine">Magazine</option>
              </select>
            </div>
          </div>
          <Input
            label="ISBN"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
          <div className="flex space-x-4">
            <Button type="submit">
              {editingBook ? 'Update' : 'Add'} Book
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setEditingBook(null);
                setFormData({ title: '', author: '', isbn: '', quantity: '', branch: '', subject: '', category: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LibraryBooks;


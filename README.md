# ERP-Based Integrated Student Management System

A comprehensive, low-cost ERP solution for college student management built for Smart India Hackathon.

## 🎯 Features

- **Admissions Module**: Online admission forms, student ID auto-generation, document uploads
- **Student Master Database**: Single source of truth for all student data
- **Fee Management**: Razorpay integration, cash payments, automated PDF receipts
- **Hostel Management**: Room allocation, occupancy tracking, warden management
- **Library Management**: Book issue/return, fine calculation, availability tracking
- **Examination Module**: Marks entry, attendance tracking, result generation
- **Admin Dashboard**: Real-time KPIs, analytics, and reporting
- **Role-Based Access Control**: Multiple user roles with JWT authentication

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2.0** - Java framework
- **Spring Security** - JWT authentication
- **MySQL** - Database
- **Razorpay** - Payment gateway
- **iTextPDF** - PDF generation
- **Maven** - Dependency management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

## 📋 Prerequisites

- Java 17 or higher
Oracle Java path from PATH:
Open System Properties → Environment Variables
Edit System PATH

if the in your termal using the higher version then run this in the termal:

Add this to your PowerShell profile ($PROFILE):
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

You can now run Maven commands with JDK 17. Try:
mvn -version

- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- Razorpay account (for payment integration)

## 🚀 Setup Instructions

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE college_erp;
```

2. Run the schema script:
```bash
mysql -u root -p college_erp < database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Update `application.yml` with your database credentials:
```yaml
spring:
  datasource:
    username: your_username
    password: your_password
```

3. Update Razorpay credentials:
```yaml
razorpay:
  key-id: your_razorpay_key_id
  key-secret: your_razorpay_key_secret
```

4. Build and run:
```bash
mvn clean install
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file if needed:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Default Credentials

- **Username**: admin
- **Password**: admin123

**Note**: Change the default password in production!

## 📁 Project Structure

```
├── backend/
│   ├── src/main/java/com/college/erp/
│   │   ├── auth/          # Authentication & JWT
│   │   ├── students/       # Student management
│   │   ├── fees/          # Fee & payment processing
│   │   ├── hostel/        # Hostel management
│   │   ├── library/       # Library management
│   │   ├── exams/         # Examination & attendance
│   │   ├── dashboard/     # Dashboard & analytics
│   │   └── storage/       # File storage service
│   └── src/main/resources/
│       └── application.yml
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── routes/        # Routing configuration
│   └── package.json
│
└── database/
    └── schema.sql         # Complete database schema
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/{id}` - Get student details
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/webhook` - Razorpay webhook
- `POST /api/payments/cash` - Record cash payment
- `GET /api/payments/student/{id}` - Get student fee history

### Hostel
- `GET /api/hostels` - List all hostels
- `POST /api/hostels/allocate` - Allocate student to hostel
- `POST /api/hostels/deallocate` - Deallocate student

### Library
- `GET /api/library/books` - List all books
- `POST /api/library/issue` - Issue book
- `POST /api/library/return` - Return book

### Exams
- `POST /api/exams` - Enter exam marks
- `GET /api/exams/student/{id}` - Get student results
- `POST /api/exams/attendance` - Mark attendance

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard statistics

## 🐳 Docker Deployment

### Backend Dockerfile
```bash
cd backend
docker build -t college-erp-backend .
docker run -p 8080:8080 college-erp-backend
```

### Frontend Dockerfile (create if needed)
```bash
cd frontend
npm run build
# Serve with nginx or similar
```

## 📝 Environment Variables

### Backend (.env or application.yml)
- `DB_USERNAME` - MySQL username
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - JWT secret key (min 32 characters)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `FILE_UPLOAD_DIR` - File upload directory path

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with BCrypt
- CORS configuration
- Input validation
- SQL injection prevention (JPA)
- File upload validation

## 📊 Database Schema

The complete database schema includes:
- Users (authentication)
- Students (master data)
- Courses
- Fee Transactions
- Receipts
- Hostels, Rooms, Allocations
- Library Books, Transactions
- Exams, Attendance
- System Logs
- Backups

See `database/schema.sql` for complete schema.

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Production Build

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/erp-system-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Output in dist/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is developed for Smart India Hackathon.

## 👥 Team

Developed by the College ERP Team for Smart India Hackathon 2025.

## 🆘 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for Smart India Hackathon**





ACCOUNTS Staff:
- Username: accounts
- Email: accounts@college.edu
- Role: ACCOUNTS
- Password: accounts123

ADMISSIONS Staff:
- Username: admissions
- Email: admissions@college.edu
- Role: ADMISSIONS
- Password: admissions123

HOSTEL WARDEN:
- Username: warden
- Email: warden@college.edu
- Role: HOSTEL_WARDEN
- Password: warden123

LIBRARIAN:
- Username: librarian
- Email: librarian@college.edu
- Role: LIBRARIAN
- Password: librarian123

EXAM CELL:
- Username: examcell
- Email: examcell@college.edu
- Role: EXAM_CELL
- Password: examcell123
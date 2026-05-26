# 🎓 Placement Eligibility Criteria Management System

A comprehensive full-stack web application for managing campus placements with real-time interview tracking, eligibility checking, and application management.

## ✨ Features

### 🧑🎓 Student Features
- **Registration & Login** with profile management
- **Academic Profile** with CGPA, marks, backlogs tracking
- **Real-time Eligibility Check** for companies
- **Company Browsing** with detailed eligibility reports
- **Application Management** with status tracking
- **Interview Progress Tracking** with round-by-round updates
- **Real-time Notifications** for status changes

### 👨💼 Admin Features
- **Dashboard** with comprehensive analytics
- **Student Management** with search and filters
- **Company Management** with CRUD operations
- **Eligibility Criteria Setting** with dynamic rules
- **Application Tracking** with status updates
- **Interview Board** with drag-and-drop student management
- **Real-time Interview Rounds** management
- **Broadcast Notifications** to students

### 🔄 Real-time Features
- Live interview round progression
- Instant notifications for status changes
- Real-time eligibility updates
- Live dashboard statistics
- Socket.IO powered real-time updates

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for notifications
- **Vite** for fast development

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **MySQL** with connection pooling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled

### Database
- **MySQL** with optimized schema
- Foreign key relationships
- Indexes for performance
- Transaction support

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/placement-system.git
cd placement-system
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
mysql -u root -p < database/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Update .env with your database credentials
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=placement_db
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Start backend server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 👥 Default Login Credentials
- **Admin Login**: `admin@placement.com` / `admin123`
- **Student Login**: `arjun@test.com` / `student123`

## 📊 Database Schema
- **students** - Student registration data
- **academic_details** - Academic performance metrics
- **companies** - Company information
- **eligibility_criteria** - Company-specific eligibility rules
- **applications** - Student applications
- **interview_rounds** - Interview round definitions
- **interview_participants** - Student round participation
- **notifications** - System notifications

## 🏗️ API Endpoints

### Authentication
- `POST /api/auth/student-register`
- `POST /api/auth/student-login`
- `POST /api/auth/admin-login`

### Student Operations
- `GET /api/students/profile`
- `PUT /api/students/update-profile`
- `PUT /api/students/update-academics`
- `GET /api/students/notifications`

### Company Management
- `GET /api/companies/all`
- `GET /api/companies/:id`
- `POST /api/companies/add` [Admin]
- `PUT /api/companies/:id` [Admin]
- `DELETE /api/companies/:id` [Admin]

### Eligibility System
- `GET /api/eligibility/check/:companyId` [Student]
- `GET /api/eligibility/my-eligible-companies` [Student]
- `GET /api/eligibility/eligible-students/:companyId` [Admin]
- `POST /api/eligibility/set-criteria` [Admin]

### Interview Management
- `GET /api/interview/rounds/:companyId`
- `POST /api/interview/rounds/add` [Admin]
- `POST /api/interview/rounds/:roundId/participants` [Admin]
- `PUT /api/interview/participants/:id/move-next` [Admin]
- `PUT /api/interview/participants/:id/eliminate` [Admin]

## 🔧 Key Features Explained

### Eligibility Checking Algorithm
The system performs comprehensive eligibility checks:
- **CGPA Threshold**
- **10th & 12th Marks**
- **Backlog Limits**
- **Department Filtering**
- **Gap Year Limits**
- **Skills Matching**

### Interview Board System
- **Round Creation**
- **Student Movement**
- **Real-time Updates**
- **Automatic Progression**
- **Elimination Tracking**

## 📱 Responsive Design
- **Desktop First** - Optimized for admin dashboards
- **Mobile Friendly** - Student-focused mobile experience
- **Tablet Support** - Medium screen compatibility

## 🔐 Security Features
- **JWT Authentication**
- **Password Hashing**
- **SQL Injection Prevention**
- **CORS Protection**
- **Input Validation**

## 📈 Performance Optimizations
- **Database Indexing**
- **Connection Pooling**
- **React Optimization**
- **Socket Optimization**

---

Project by **Your Name**

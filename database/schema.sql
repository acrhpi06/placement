-- ============================================
-- PLACEMENT ELIGIBILITY CRITERIA SYSTEM
-- Complete MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

-- ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(50) NOT NULL,
  year_of_passing YEAR NOT NULL,
  phone VARCHAR(15),
  gender ENUM('Male','Female','Other'),
  date_of_birth DATE,
  address TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACADEMIC DETAILS TABLE
CREATE TABLE IF NOT EXISTS academic_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT UNIQUE NOT NULL,
  tenth_percentage DECIMAL(5,2) DEFAULT 0,
  twelfth_percentage DECIMAL(5,2) DEFAULT 0,
  cgpa DECIMAL(4,2) DEFAULT 0,
  active_backlogs INT DEFAULT 0,
  total_backlogs INT DEFAULT 0,
  gap_years INT DEFAULT 0,
  skills TEXT,
  certifications TEXT,
  projects TEXT,
  internships TEXT,
  resume_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(150) NOT NULL,
  company_code VARCHAR(20) UNIQUE,
  job_role VARCHAR(100) NOT NULL,
  job_description TEXT,
  package_lpa DECIMAL(6,2) NOT NULL,
  job_location VARCHAR(100),
  job_type ENUM('Full-Time','Internship','Both') DEFAULT 'Full-Time',
  bond_years INT DEFAULT 0,
  drive_date DATE,
  last_apply_date DATE,
  status ENUM('Upcoming','Active','Closed') DEFAULT 'Upcoming',
  total_openings INT DEFAULT 0,
  selected_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ELIGIBILITY CRITERIA TABLE
CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT UNIQUE NOT NULL,
  min_cgpa DECIMAL(4,2) DEFAULT 0,
  min_tenth DECIMAL(5,2) DEFAULT 0,
  min_twelfth DECIMAL(5,2) DEFAULT 0,
  max_active_backlogs INT DEFAULT 0,
  max_total_backlogs INT DEFAULT 0,
  max_gap_years INT DEFAULT 0,
  allowed_departments VARCHAR(255) DEFAULT 'CSE,IT,ECE,EEE,MECH,CIVIL',
  allowed_year_of_passing VARCHAR(100),
  required_skills TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Applied','Shortlisted','Rejected','Selected') DEFAULT 'Applied',
  current_round VARCHAR(100) DEFAULT 'Application Review',
  remarks TEXT,
  UNIQUE KEY unique_application (student_id, company_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- INTERVIEW ROUNDS TABLE
CREATE TABLE IF NOT EXISTS interview_rounds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  round_number INT NOT NULL,
  round_name VARCHAR(100) NOT NULL,
  round_date DATETIME,
  round_status ENUM('Pending','Active','Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- INTERVIEW PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS interview_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  round_id INT NOT NULL,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  status ENUM('Present','Passed','Failed','Absent') DEFAULT 'Present',
  moved_to_next BOOLEAN DEFAULT FALSE,
  moved_at TIMESTAMP NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_participant (round_id, student_id),
  FOREIGN KEY (round_id) REFERENCES interview_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  admin_id INT,
  type VARCHAR(50),
  title VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Admin
INSERT INTO admins (name, email, password, role) VALUES
('Super Admin', 'admin@placement.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'superadmin');

-- Students (password: student123)
INSERT INTO students (name, email, password, roll_number, department, year_of_passing, phone, gender) VALUES
('Arjun Sharma', 'arjun@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'CSE2024001', 'Computer Science', 2024, '9876543210', 'Male'),
('Priya Patel', 'priya@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'IT2024002', 'Information Technology', 2024, '9876543211', 'Female'),
('Rahul Kumar', 'rahul@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'ECE2024003', 'Electronics', 2024, '9876543212', 'Male'),
('Sneha Reddy', 'sneha@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'CSE2024004', 'Computer Science', 2024, '9876543213', 'Female'),
('Vikram Singh', 'vikram@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'MECH2024005', 'Mechanical', 2024, '9876543214', 'Male');

-- Academic Details
INSERT INTO academic_details (student_id, tenth_percentage, twelfth_percentage, cgpa, active_backlogs, total_backlogs, gap_years, skills) VALUES
(1, 92.5, 88.0, 8.7, 0, 0, 0, 'JavaScript,React,Node.js,MySQL'),
(2, 85.0, 79.5, 7.9, 0, 1, 0, 'Python,Django,SQL,HTML'),
(3, 78.0, 72.5, 6.8, 1, 2, 0, 'C++,Embedded Systems,IoT'),
(4, 95.0, 91.0, 9.1, 0, 0, 0, 'Java,Spring Boot,React,AWS'),
(5, 70.0, 65.5, 6.2, 2, 3, 1, 'AutoCAD,MATLAB,Manufacturing');

-- Companies
INSERT INTO companies (company_name, company_code, job_role, job_description, package_lpa, job_location, job_type, drive_date, last_apply_date, status, total_openings) VALUES
('Microsoft', 'MSFT', 'Software Engineer', 'Build scalable cloud solutions', 45.0, 'Hyderabad', 'Full-Time', '2024-03-15', '2024-03-10', 'Active', 50),
('Google', 'GOOGL', 'SDE-1', 'Work on Google products', 52.0, 'Bangalore', 'Full-Time', '2024-03-20', '2024-03-15', 'Active', 30),
('TCS', 'TCS', 'Systems Engineer', 'Software development projects', 3.6, 'Mumbai', 'Full-Time', '2024-03-25', '2024-03-20', 'Active', 200),
('Infosys', 'INFY', 'Associate Engineer', 'Technology services', 3.8, 'Pune', 'Full-Time', '2024-04-01', '2024-03-28', 'Upcoming', 150),
('Amazon', 'AMZN', 'SDE-1', 'Build Amazon services', 38.0, 'Bangalore', 'Full-Time', '2024-04-05', '2024-04-01', 'Upcoming', 40);

-- Eligibility Criteria
INSERT INTO eligibility_criteria (company_id, min_cgpa, min_tenth, min_twelfth, max_active_backlogs, max_total_backlogs, max_gap_years, allowed_departments, allowed_year_of_passing) VALUES
(1, 8.0, 80.0, 75.0, 0, 0, 0, 'Computer Science, Information Technology', '2024'),
(2, 8.5, 85.0, 80.0, 0, 0, 0, 'Computer Science, Information Technology', '2024'),
(3, 6.0, 60.0, 60.0, 2, 3, 1, 'Computer Science, Information Technology, Electronics, Electrical, Mechanical, Civil', '2024'),
(4, 6.5, 65.0, 65.0, 1, 2, 1, 'Computer Science, Information Technology, Electronics, Electrical', '2024'),
(5, 7.5, 75.0, 70.0, 0, 1, 0, 'Computer Science, Information Technology', '2024');

-- Interview Rounds
INSERT INTO interview_rounds (company_id, round_number, round_name, round_date, round_status) VALUES
(1, 1, 'Online Assessment', '2024-03-15 09:00:00', 'Active'),
(1, 2, 'Technical Interview', '2024-03-16 09:00:00', 'Pending'),
(1, 3, 'HR Interview', '2024-03-17 09:00:00', 'Pending'),
(3, 1, 'Aptitude Test', '2024-03-25 09:00:00', 'Active'),
(3, 2, 'Technical Round', '2024-03-26 09:00:00', 'Pending');

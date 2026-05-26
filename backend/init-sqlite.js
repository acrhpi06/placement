const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database/placement.db');
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year_of_passing INTEGER NOT NULL,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  profile_complete INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER UNIQUE NOT NULL,
  tenth_percentage REAL DEFAULT 0,
  twelfth_percentage REAL DEFAULT 0,
  cgpa REAL DEFAULT 0,
  active_backlogs INTEGER DEFAULT 0,
  total_backlogs INTEGER DEFAULT 0,
  gap_years INTEGER DEFAULT 0,
  skills TEXT,
  certifications TEXT,
  projects TEXT,
  internships TEXT,
  resume_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  company_code TEXT UNIQUE,
  job_role TEXT NOT NULL,
  job_description TEXT,
  package_lpa REAL NOT NULL,
  job_location TEXT,
  job_type TEXT DEFAULT 'Full-Time',
  bond_years INTEGER DEFAULT 0,
  drive_date DATE,
  last_apply_date DATE,
  status TEXT DEFAULT 'Upcoming',
  total_openings INTEGER DEFAULT 0,
  selected_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER UNIQUE NOT NULL,
  min_cgpa REAL DEFAULT 0,
  min_tenth REAL DEFAULT 0,
  min_twelfth REAL DEFAULT 0,
  max_active_backlogs INTEGER DEFAULT 0,
  max_total_backlogs INTEGER DEFAULT 0,
  max_gap_years INTEGER DEFAULT 0,
  allowed_departments TEXT DEFAULT 'CSE,IT,ECE,EEE,MECH,CIVIL',
  allowed_year_of_passing TEXT,
  required_skills TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Applied',
  current_round TEXT DEFAULT 'Application Review',
  remarks TEXT,
  UNIQUE(student_id, company_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  round_name TEXT NOT NULL,
  round_date DATETIME,
  round_status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  status TEXT DEFAULT 'Present',
  moved_to_next INTEGER DEFAULT 0,
  moved_at DATETIME NULL,
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(round_id, student_id),
  FOREIGN KEY (round_id) REFERENCES interview_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  admin_id INTEGER,
  type TEXT,
  title TEXT,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
`;

db.exec(schema);
console.log('SQLite Schema Created');

// Insert Sample Data
const insertData = () => {
  // Admin (password: admin123)
  db.prepare("INSERT OR IGNORE INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    'Super Admin', 'admin@placement.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'superadmin'
  );

  // Sample Students (password: student123)
  const students = [
    ['Arjun Sharma', 'arjun@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'CSE2024001', 'Computer Science', 2024, '9876543210', 'Male'],
    ['Priya Patel', 'priya@test.com', '$2b$10$rOzJqB1H8QK6mN9P2L5YwO8vKqE4mX3nR7sT1uV6yW0xA9cD2eF', 'IT2024002', 'Information Technology', 2024, '9876543211', 'Female']
  ];

  for (const s of students) {
    const res = db.prepare("INSERT OR IGNORE INTO students (name, email, password, roll_number, department, year_of_passing, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(...s);
    if (res.changes > 0) {
      db.prepare("INSERT INTO academic_details (student_id, cgpa) VALUES (?, ?)").run(res.lastInsertRowid, 8.5);
    }
  }

  // Companies
  db.prepare("INSERT OR IGNORE INTO companies (company_name, company_code, job_role, package_lpa, status) VALUES (?, ?, ?, ?, ?)").run(
    'Microsoft', 'MSFT', 'Software Engineer', 45.0, 'Active'
  );

  console.log('Sample Data Inserted');
};

insertData();
db.close();

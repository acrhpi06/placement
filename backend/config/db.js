const mysql = require('mysql2/promise');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool;
let dbType = 'mysql';
let sqliteDb;

const initDb = async () => {
  if (process.env.DB_TYPE === 'sqlite') {
    return useSqlite();
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'placement_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Test connection
    const conn = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    conn.release();
    dbType = 'mysql';
  } catch (error) {
    console.warn('⚠️ MySQL Connection Failed, falling back to SQLite');
    useSqlite();
  }
};

const useSqlite = () => {
  const dbPath = path.join(__dirname, '../../database/placement.db');
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  sqliteDb = new sqlite3(dbPath);
  
  // Initialize schema if tables don't exist
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
  
  try {
    sqliteDb.exec(schema);
    
    // Seed default data if tables are empty
    const adminCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM admins").get().count;
    if (adminCount === 0) {
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      const studentPasswordHash = bcrypt.hashSync('student123', 10);
      
      sqliteDb.prepare("INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)").run(
        'Super Admin', 'admin@placement.com', adminPasswordHash, 'superadmin'
      );
      
      const students = [
        ['Arjun Sharma', 'arjun@test.com', studentPasswordHash, 'CSE2024001', 'Computer Science', 2024, '9876543210', 'Male'],
        ['Priya Patel', 'priya@test.com', studentPasswordHash, 'IT2024002', 'Information Technology', 2024, '9876543211', 'Female'],
        ['Rahul Kumar', 'rahul@test.com', studentPasswordHash, 'ECE2024003', 'Electronics', 2024, '9876543212', 'Male']
      ];

      for (const s of students) {
        const res = sqliteDb.prepare("INSERT INTO students (name, email, password, roll_number, department, year_of_passing, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(...s);
        sqliteDb.prepare("INSERT INTO academic_details (student_id, cgpa) VALUES (?, ?)").run(res.lastInsertRowid, 8.5);
      }
      
      console.log('✓ Database initialized with seed data');
      console.log('\n📝 Test Credentials:');
      console.log('   Admin: admin@placement.com / admin123');
      console.log('   Student: arjun@test.com / student123');
      console.log('   Student: priya@test.com / student123\n');
    }
  } catch (error) {
    console.error('Error initializing SQLite schema:', error.message);
  }
  
  console.log('✅ SQLite Connected Successfully at:', dbPath);
  dbType = 'sqlite';
};

const execute = async (sql, params = []) => {
  if (dbType === 'mysql') {
    return await pool.execute(sql, params);
  } else {
    // Convert ? to @ or keep as ? (better-sqlite3 supports ?)
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = stmt.all(...params);
      return [rows];
    } else {
      const info = stmt.run(...params);
      return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
    }
  }
};

const query = async (sql, params = []) => {
  return await execute(sql, params);
};

const getDbType = () => dbType;

module.exports = { pool, connectDB: initDb, execute, query, getDbType };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { execute } = require('../config/db');

const generateToken = (id, role, name, email) => {
  return jwt.sign({ id, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const studentRegister = async (req, res) => {
  try {
    const { name, email, password, roll_number, department, year_of_passing, phone, gender } = req.body;

    if (!name || !email || !password || !roll_number || !department || !year_of_passing) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const [existing] = await execute(
      'SELECT id FROM students WHERE email = ? OR roll_number = ?',
      [email, roll_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email or Roll Number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await execute(
      'INSERT INTO students (name, email, password, roll_number, department, year_of_passing, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, roll_number, department, year_of_passing, phone || null, gender || null]
    );

    await execute(
      'INSERT INTO academic_details (student_id) VALUES (?)',
      [result.insertId]
    );

    const token = generateToken(result.insertId, 'student', name, email);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: { id: result.insertId, name, email, role: 'student', department, roll_number }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [students] = await execute(
      'SELECT s.*, ad.cgpa, ad.tenth_percentage, ad.twelfth_percentage FROM students s LEFT JOIN academic_details ad ON s.id = ad.student_id WHERE s.email = ?',
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const student = students[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(student.id, 'student', student.name, student.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        department: student.department,
        roll_number: student.roll_number,
        year_of_passing: student.year_of_passing
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [admins] = await execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin.id, 'admin', admin.name, admin.email);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { studentRegister, studentLogin, adminLogin };

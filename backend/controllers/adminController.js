const { execute } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [totalStudentsRes] = await execute('SELECT COUNT(*) as count FROM students');
    const totalStudents = totalStudentsRes[0];
    
    const [completeProfilesRes] = await execute('SELECT COUNT(*) as count FROM students WHERE profile_complete = 1');
    const completeProfiles = completeProfilesRes[0];
    
    const [totalCompaniesRes] = await execute('SELECT COUNT(*) as count FROM companies');
    const totalCompanies = totalCompaniesRes[0];
    
    const [activeCompaniesRes] = await execute("SELECT COUNT(*) as count FROM companies WHERE status = 'Active'");
    const activeCompanies = activeCompaniesRes[0];
    
    const [totalApplicationsRes] = await execute('SELECT COUNT(*) as count FROM applications');
    const totalApplications = totalApplicationsRes[0];
    
    const [selectedStudentsRes] = await execute("SELECT COUNT(*) as count FROM applications WHERE status = 'Selected'");
    const selectedStudents = selectedStudentsRes[0];

    const [recentApplications] = await execute(
      `SELECT a.*, s.name, s.roll_number, c.company_name, c.job_role
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN companies c ON a.company_id = c.id
       ORDER BY a.applied_date DESC LIMIT 10`
    );

    const [companyStats] = await execute(
      `SELECT c.company_name, COUNT(a.id) as applications,
       SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) as selected
       FROM companies c
       LEFT JOIN applications a ON c.id = a.company_id
       GROUP BY c.id, c.company_name`
    );

    const [deptStats] = await execute(
      'SELECT department, COUNT(*) as count FROM students GROUP BY department'
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: totalStudents.count,
          completeProfiles: completeProfiles.count,
          totalCompanies: totalCompanies.count,
          activeCompanies: activeCompanies.count,
          totalApplications: totalApplications.count,
          selectedStudents: selectedStudents.count
        },
        recentApplications,
        companyStats,
        deptStats
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const { search, department, min_cgpa, max_cgpa } = req.query;
    let queryStr = `SELECT s.id, s.name, s.email, s.roll_number, s.department,
                  s.year_of_passing, s.phone, s.gender, s.date_of_birth,
                  s.address, s.profile_complete, s.is_active, s.created_at,
                  ad.cgpa, ad.tenth_percentage, ad.twelfth_percentage,
                  ad.active_backlogs, ad.total_backlogs, ad.gap_years, ad.skills
                  FROM students s
                  LEFT JOIN academic_details ad ON s.id = ad.student_id
                  WHERE 1=1`;
    const params = [];

    if (search) {
      queryStr += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR s.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) {
      queryStr += ' AND s.department = ?';
      params.push(department);
    }
    if (min_cgpa) {
      queryStr += ' AND ad.cgpa >= ?';
      params.push(min_cgpa);
    }
    if (max_cgpa) {
      queryStr += ' AND ad.cgpa <= ?';
      params.push(max_cgpa);
    }

    queryStr += ' ORDER BY s.created_at DESC';

    const [rows] = await execute(queryStr, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT s.id, s.name, s.email, s.roll_number, s.department,
       s.year_of_passing, s.phone, s.gender, s.date_of_birth, s.address,
       s.profile_complete, s.is_active, s.created_at,
       ad.id AS academic_id, ad.tenth_percentage, ad.twelfth_percentage,
       ad.cgpa, ad.active_backlogs, ad.total_backlogs, ad.gap_years,
       ad.skills, ad.certifications, ad.projects, ad.internships,
       ad.resume_url, ad.updated_at AS academics_updated_at
       FROM students s
       LEFT JOIN academic_details ad ON s.id = ad.student_id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [applications] = await execute(
      `SELECT a.*, c.company_name, c.job_role, c.package_lpa
       FROM applications a JOIN companies c ON a.company_id = c.id
       WHERE a.student_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], applications } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetDepartment } = req.body;

    let students;
    if (targetDepartment && targetDepartment !== 'all') {
      [students] = await execute(
        'SELECT id FROM students WHERE department = ?',
        [targetDepartment]
      );
    } else {
      [students] = await execute('SELECT id FROM students');
    }

    for (const student of students) {
      await execute(
        'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
        [student.id, 'broadcast', title, message]
      );
    }

    const io = req.app.get('io');
    io.emit('broadcastNotification', { title, message });

    res.json({ success: true, message: `Notification sent to ${students.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getAllStudents, getStudentById, broadcastNotification };

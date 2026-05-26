const { execute } = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT s.id, s.name, s.email, s.roll_number, s.department, 
       s.year_of_passing, s.phone, s.gender, s.date_of_birth, 
       s.address, s.profile_complete,
       ad.tenth_percentage, ad.twelfth_percentage, ad.cgpa,
       ad.active_backlogs, ad.total_backlogs, ad.gap_years,
       ad.skills, ad.certifications, ad.projects, ad.internships, ad.resume_url
       FROM students s 
       LEFT JOIN academic_details ad ON s.id = ad.student_id
       WHERE s.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, date_of_birth, address } = req.body;
    const studentId = req.user.id;

    await execute(
      'UPDATE students SET name = ?, phone = ?, gender = ?, date_of_birth = ?, address = ? WHERE id = ?',
      [name, phone, gender, date_of_birth || null, address, studentId]
    );

    const io = req.app.get('io');
    io.to(`student_${studentId}`).emit('profileUpdated', { message: 'Profile updated successfully' });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAcademics = async (req, res) => {
  try {
    const {
      tenth_percentage, twelfth_percentage, cgpa,
      active_backlogs, total_backlogs, gap_years,
      skills, certifications, projects, internships
    } = req.body;
    const studentId = req.user.id;

    await execute(
      `UPDATE academic_details SET 
       tenth_percentage = ?, twelfth_percentage = ?, cgpa = ?,
       active_backlogs = ?, total_backlogs = ?, gap_years = ?,
       skills = ?, certifications = ?, projects = ?, internships = ?
       WHERE student_id = ?`,
      [tenth_percentage, twelfth_percentage, cgpa,
       active_backlogs || 0, total_backlogs || 0, gap_years || 0,
       skills, certifications, projects, internships, studentId]
    );

    const profileComplete = tenth_percentage && twelfth_percentage && cgpa;
    if (profileComplete) {
      await execute(
        'UPDATE students SET profile_complete = 1 WHERE id = ?',
        [studentId]
      );
    }

    const io = req.app.get('io');
    io.to('admins').emit('studentAcademicsUpdated', {
      studentId,
      message: `Student ${req.user.name} updated their academic details`
    });

    res.json({ success: true, message: 'Academic details updated successfully' });
  } catch (error) {
    console.error('Update Academics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const [rows] = await execute(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await execute(
      'UPDATE notifications SET is_read = 1 WHERE student_id = ?',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile, updateProfile, updateAcademics,
  getNotifications, markNotificationRead, markAllNotificationsRead
};

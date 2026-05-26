const { execute } = require('../config/db');

const applyToCompany = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { company_id } = req.body;

    // Check if already applied
    const [existing] = await execute(
      'SELECT id FROM applications WHERE student_id = ? AND company_id = ?',
      [studentId, company_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already applied to this company' });
    }

    // Check profile complete
    const [profile] = await execute(
      'SELECT profile_complete FROM students WHERE id = ?',
      [studentId]
    );

    if (!profile[0].profile_complete) {
      return res.status(400).json({ success: false, message: 'Please complete your profile first' });
    }

    await execute(
      'INSERT INTO applications (student_id, company_id) VALUES (?, ?)',
      [studentId, company_id]
    );

    // Notify student
    await execute(
      'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
      [studentId, 'application', 'Application Submitted', `Your application has been submitted successfully`]
    );

    const io = req.app.get('io');
    io.to('admins').emit('newApplication', {
      studentId,
      companyId: company_id,
      studentName: req.user.name,
      message: `New application received from ${req.user.name}`
    });
    io.to(`student_${studentId}`).emit('applicationSubmitted', { companyId: company_id });

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT a.*, c.company_name, c.job_role, c.package_lpa, 
       c.job_location, c.drive_date, c.status as company_status
       FROM applications a
       JOIN companies c ON a.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_date DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApplicationsByCompany = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT a.*, s.name, s.email, s.roll_number, s.department,
       ad.cgpa, ad.tenth_percentage, ad.twelfth_percentage
       FROM applications a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN academic_details ad ON s.id = ad.student_id
       WHERE a.company_id = ?
       ORDER BY a.applied_date DESC`,
      [req.params.companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { id } = req.params;

    const [appRows] = await execute(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const app = appRows[0];

    await execute(
      'UPDATE applications SET status = ?, remarks = ? WHERE id = ?',
      [status, remarks || null, id]
    );

    // AUTO-MOVE TO INTERVIEW ROUND 1 IF SHORTLISTED
    if (status === 'Shortlisted') {
      try {
        // 1. Get first round for this company
        const [rounds] = await execute(
          'SELECT id FROM interview_rounds WHERE company_id = ? AND round_number = 1',
          [app.company_id]
        );

        let roundId;
        if (rounds.length > 0) {
          roundId = rounds[0].id;
        } else {
          // 2. Create Round 1 if it doesn't exist
          const [newRound] = await execute(
            'INSERT INTO interview_rounds (company_id, round_number, round_name) VALUES (?, 1, ?)',
            [app.company_id, 'Round 1: Screening']
          );
          roundId = newRound.insertId;
        }

        // 3. Add student to participants
        await execute(
          `INSERT OR IGNORE INTO interview_participants (round_id, student_id, company_id, status) 
           VALUES (?, ?, ?, 'Present')`,
          [roundId, app.student_id, app.company_id]
        );

        // 4. Update application current round
        await execute(
          'UPDATE applications SET current_round = ? WHERE id = ?',
          ['Round 1: Screening', id]
        );

        const io = req.app.get('io');
        io.to(`company_${app.company_id}`).emit('participantsAdded', {
          roundId,
          count: 1,
          message: `Student ${app.student_id} automatically moved to Round 1`
        });
      } catch (err) {
        console.error('Auto-move to interview error:', err);
        // We don't fail the whole request if auto-move fails, but we log it
      }
    }

    const statusMessages = {
      Shortlisted: 'Congratulations! You have been shortlisted',
      Selected: '🎉 Congratulations! You have been selected',
      Rejected: 'Your application status has been updated'
    };

    await execute(
      'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
      [app.student_id, 'status_update', 'Application Update', statusMessages[status] || 'Your application status changed']
    );

    const io = req.app.get('io');
    io.to(`student_${app.student_id}`).emit('applicationStatusChanged', {
      applicationId: id,
      status,
      message: statusMessages[status]
    });

    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { applyToCompany, getMyApplications, getApplicationsByCompany, updateApplicationStatus };

const { execute } = require('../config/db');

const getRounds = async (req, res) => {
  try {
    const { companyId } = req.params;
    const [rows] = await execute(
      'SELECT * FROM interview_rounds WHERE company_id = ? ORDER BY round_number ASC',
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRoundParticipants = async (req, res) => {
  try {
    const { roundId } = req.params;
    const [rows] = await execute(
      `SELECT ip.*, s.name, s.email, s.roll_number, s.department,
       ad.cgpa, ad.tenth_percentage, ad.twelfth_percentage
       FROM interview_participants ip
       JOIN students s ON ip.student_id = s.id
       LEFT JOIN academic_details ad ON s.id = ad.student_id
       WHERE ip.round_id = ?
       ORDER BY ip.created_at ASC`,
      [roundId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addParticipantsToRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { studentIds, companyId } = req.body;

    for (const studentId of studentIds) {
      await execute(
        `INSERT OR IGNORE INTO interview_participants 
         (round_id, student_id, company_id, status) VALUES (?, ?, ?, 'Present')`,
        [roundId, studentId, companyId]
      );
    }

    const io = req.app.get('io');
    io.to(`company_${companyId}`).emit('participantsAdded', {
      roundId,
      count: studentIds.length,
      message: `${studentIds.length} students added to round`
    });

    res.json({ success: true, message: `${studentIds.length} students added to round` });
  } catch (error) {
    console.error('Add Participants Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// KEY FEATURE: Move student to next round and remove from current
const moveStudentToNextRound = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { companyId } = req.body;

    // Get current participant info
    const [participant] = await execute(
      `SELECT ip.*, ir.round_number, ir.company_id
       FROM interview_participants ip
       JOIN interview_rounds ir ON ip.round_id = ir.id
       WHERE ip.id = ?`,
      [participantId]
    );

    if (participant.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const p = participant[0];

    // Find next round
    const [nextRound] = await execute(
      `SELECT * FROM interview_rounds 
       WHERE company_id = ? AND round_number = ?`,
      [p.company_id, p.round_number + 1]
    );

    if (nextRound.length === 0) {
      // No next round = Final selection
      await execute(
        'UPDATE interview_participants SET status = ?, moved_to_next = 1, moved_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['Passed', participantId]
      );

      await execute(
        'UPDATE applications SET status = ?, current_round = ? WHERE student_id = ? AND company_id = ?',
        ['Selected', 'Final Selection', p.student_id, p.company_id]
      );

      await execute(
        'UPDATE companies SET selected_count = selected_count + 1 WHERE id = ?',
        [p.company_id]
      );

      await execute(
        'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
        [p.student_id, 'selected', '🎉 Selected!', 'Congratulations! You have been selected for the final offer!']
      );

      const io = req.app.get('io');
      io.to(`student_${p.student_id}`).emit('finallySelected', {
        companyId: p.company_id,
        message: '🎉 Congratulations! You have been finally selected!'
      });
      io.to(`company_${p.company_id}`).emit('studentFinallySelected', {
        studentId: p.student_id,
        participantId
      });

      return res.json({ success: true, message: 'Student finally selected!', isLastRound: true });
    }

    // Move to next round
    await execute(
      'UPDATE interview_participants SET status = ?, moved_to_next = 1, moved_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['Passed', participantId]
    );

    // Add to next round
    await execute(
      `INSERT OR IGNORE INTO interview_participants 
       (round_id, student_id, company_id, status) VALUES (?, ?, ?, 'Present')`,
      [nextRound[0].id, p.student_id, p.company_id]
    );

    // Update application current round
    await execute(
      'UPDATE applications SET current_round = ? WHERE student_id = ? AND company_id = ?',
      [nextRound[0].round_name, p.student_id, p.company_id]
    );

    // Notify student
    await execute(
      'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
      [p.student_id, 'round_update', 'Round Cleared!', `You have been moved to ${nextRound[0].round_name}`]
    );

    const io = req.app.get('io');
    io.to(`student_${p.student_id}`).emit('movedToNextRound', {
      nextRound: nextRound[0].round_name,
      message: `You have been moved to ${nextRound[0].round_name}`
    });
    io.to(`company_${p.company_id}`).emit('studentMoved', {
      studentId: p.student_id,
      participantId,
      nextRoundId: nextRound[0].id,
      nextRoundName: nextRound[0].round_name
    });

    res.json({
      success: true,
      message: `Student moved to ${nextRound[0].round_name}`,
      nextRound: nextRound[0]
    });
  } catch (error) {
    console.error('Move Student Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const eliminateStudent = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { remarks } = req.body;

    const [participant] = await execute(
      `SELECT ip.*, ir.company_id
       FROM interview_participants ip
       JOIN interview_rounds ir ON ip.round_id = ir.id
       WHERE ip.id = ?`,
      [participantId]
    );

    if (participant.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const p = participant[0];

    await execute(
      'UPDATE interview_participants SET status = ?, remarks = ? WHERE id = ?',
      ['Failed', remarks || 'Not selected', participantId]
    );

    await execute(
      'UPDATE applications SET status = ?, remarks = ? WHERE student_id = ? AND company_id = ?',
      ['Rejected', remarks || 'Not selected in interview', p.student_id, p.company_id]
    );

    await execute(
      'INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)',
      [p.student_id, 'eliminated', 'Interview Update', 'Thank you for participating. Better luck next time!']
    );

    const io = req.app.get('io');
    io.to(`student_${p.student_id}`).emit('eliminatedFromRound', {
      companyId: p.company_id,
      message: 'You have not been selected for the next round'
    });
    io.to(`company_${p.company_id}`).emit('studentEliminated', {
      studentId: p.student_id,
      participantId
    });

    res.json({ success: true, message: 'Student eliminated from round' });
  } catch (error) {
    console.error('Eliminate Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addRound = async (req, res) => {
  try {
    const { company_id, round_name, round_date } = req.body;

    const [existing] = await execute(
      'SELECT MAX(round_number) as max_round FROM interview_rounds WHERE company_id = ?',
      [company_id]
    );

    const nextRoundNumber = (existing[0].max_round || 0) + 1;

    const [result] = await execute(
      'INSERT INTO interview_rounds (company_id, round_number, round_name, round_date) VALUES (?, ?, ?, ?)',
      [company_id, nextRoundNumber, round_name, round_date || null]
    );

    const io = req.app.get('io');
    io.to(`company_${company_id}`).emit('newRoundAdded', {
      roundId: result.insertId,
      roundName: round_name,
      roundNumber: nextRoundNumber
    });

    res.json({ success: true, message: 'Round added successfully', roundId: result.insertId });
  } catch (error) {
    console.error('Add Round Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateRoundStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { roundId } = req.params;

    await execute(
      'UPDATE interview_rounds SET round_status = ? WHERE id = ?',
      [status, roundId]
    );

    const [round] = await execute(
      'SELECT * FROM interview_rounds WHERE id = ?',
      [roundId]
    );

    const io = req.app.get('io');
    io.to(`company_${round[0].company_id}`).emit('roundStatusChanged', {
      roundId,
      status,
      roundName: round[0].round_name
    });

    res.json({ success: true, message: 'Round status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRounds, getRoundParticipants, addParticipantsToRound,
  moveStudentToNextRound, eliminateStudent, addRound, updateRoundStatus
};

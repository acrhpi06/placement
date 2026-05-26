const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getRounds, getRoundParticipants, addParticipantsToRound,
  moveStudentToNextRound, eliminateStudent, addRound, updateRoundStatus
} = require('../controllers/interviewController');

router.get('/rounds/:companyId', protect, getRounds);
router.get('/rounds/:roundId/participants', protect, getRoundParticipants);
router.post('/rounds/:roundId/participants', protect, adminOnly, addParticipantsToRound);
router.put('/participants/:participantId/move-next', protect, adminOnly, moveStudentToNextRound);
router.put('/participants/:participantId/eliminate', protect, adminOnly, eliminateStudent);
router.post('/rounds/add', protect, adminOnly, addRound);
router.put('/rounds/:roundId/status', protect, adminOnly, updateRoundStatus);

module.exports = router;

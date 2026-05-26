const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getDashboardStats, getAllStudents, getStudentById, broadcastNotification } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/dashboard-stats', getDashboardStats);
router.get('/all-students', getAllStudents);
router.get('/student/:id', getStudentById);
router.post('/broadcast-notification', broadcastNotification);

module.exports = router;

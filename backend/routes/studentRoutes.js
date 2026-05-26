const express = require('express');
const router = express.Router();
const { protect, studentOnly } = require('../middleware/authMiddleware');
const {
  getProfile, updateProfile, updateAcademics,
  getNotifications, markNotificationRead, markAllNotificationsRead
} = require('../controllers/studentController');

router.use(protect, studentOnly);
router.get('/profile', getProfile);
router.put('/update-profile', updateProfile);
router.put('/update-academics', updateAcademics);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;

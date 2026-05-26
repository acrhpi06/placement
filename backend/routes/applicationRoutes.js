const express = require('express');
const router = express.Router();
const { protect, adminOnly, studentOnly } = require('../middleware/authMiddleware');
const {
  applyToCompany, getMyApplications,
  getApplicationsByCompany, updateApplicationStatus
} = require('../controllers/applicationController');

router.post('/apply', protect, studentOnly, applyToCompany);
router.get('/my-applications', protect, studentOnly, getMyApplications);
router.get('/company/:companyId', protect, adminOnly, getApplicationsByCompany);
router.put('/update-status/:id', protect, adminOnly, updateApplicationStatus);

module.exports = router;

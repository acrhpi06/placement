const express = require('express');
const router = express.Router();
const { protect, adminOnly, studentOnly } = require('../middleware/authMiddleware');
const {
  checkEligibility, getMyEligibleCompanies,
  getEligibleStudentsForCompany, setCriteria
} = require('../controllers/eligibilityController');

router.get('/check/:companyId', protect, studentOnly, checkEligibility);
router.get('/my-eligible-companies', protect, studentOnly, getMyEligibleCompanies);
router.get('/my-companies', protect, studentOnly, getMyEligibleCompanies);
router.get('/eligible-students/:companyId', protect, adminOnly, getEligibleStudentsForCompany);
router.post('/set-criteria', protect, adminOnly, setCriteria);

module.exports = router;

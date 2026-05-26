const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllCompanies, getCompanyById, addCompany, updateCompany, deleteCompany } = require('../controllers/companyController');

router.get('/all', protect, getAllCompanies);
router.get('/:id', protect, getCompanyById);
router.post('/add', protect, adminOnly, addCompany);
router.put('/:id', protect, adminOnly, updateCompany);
router.delete('/:id', protect, adminOnly, deleteCompany);

module.exports = router;

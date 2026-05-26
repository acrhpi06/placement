const express = require('express');
const router = express.Router();
const { studentRegister, studentLogin, adminLogin } = require('../controllers/authController');

router.post('/student-register', studentRegister);
router.post('/student-login', studentLogin);
router.post('/admin-login', adminLogin);

module.exports = router;

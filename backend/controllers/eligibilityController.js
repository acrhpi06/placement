const { execute, getDbType } = require('../config/db');

const checkEligibility = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { companyId } = req.params;

    const [studentRows] = await execute(
      `SELECT s.department, s.year_of_passing,
       ad.tenth_percentage, ad.twelfth_percentage, ad.cgpa,
       ad.active_backlogs, ad.total_backlogs, ad.gap_years
       FROM students s 
       JOIN academic_details ad ON s.id = ad.student_id
       WHERE s.id = ?`,
      [studentId]
    );

    const [criteriaRows] = await execute(
      'SELECT * FROM eligibility_criteria WHERE company_id = ?',
      [companyId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (criteriaRows.length === 0) {
      return res.json({ success: true, isEligible: true, message: 'No criteria set', criteria: [] });
    }

    const student = studentRows[0];
    const criteria = criteriaRows[0];

    const checks = [];
    let isEligible = true;

    // CGPA Check
    const cgpaPassed = parseFloat(student.cgpa) >= parseFloat(criteria.min_cgpa);
    if (!cgpaPassed) isEligible = false;
    checks.push({
      parameter: 'CGPA',
      required: criteria.min_cgpa,
      studentValue: student.cgpa,
      passed: cgpaPassed,
      message: cgpaPassed
        ? `Your CGPA ${student.cgpa} meets requirement of ${criteria.min_cgpa}`
        : `Your CGPA ${student.cgpa} is below required ${criteria.min_cgpa}`
    });

    // 10th Check
    const tenthPassed = parseFloat(student.tenth_percentage) >= parseFloat(criteria.min_tenth);
    if (!tenthPassed) isEligible = false;
    checks.push({
      parameter: '10th Percentage',
      required: `${criteria.min_tenth}%`,
      studentValue: `${student.tenth_percentage}%`,
      passed: tenthPassed,
      message: tenthPassed
        ? `Your 10th marks ${student.tenth_percentage}% meets requirement`
        : `Your 10th marks ${student.tenth_percentage}% is below required ${criteria.min_tenth}%`
    });

    // 12th Check
    const twelfthPassed = parseFloat(student.twelfth_percentage) >= parseFloat(criteria.min_twelfth);
    if (!twelfthPassed) isEligible = false;
    checks.push({
      parameter: '12th Percentage',
      required: `${criteria.min_twelfth}%`,
      studentValue: `${student.twelfth_percentage}%`,
      passed: twelfthPassed,
      message: twelfthPassed
        ? `Your 12th marks ${student.twelfth_percentage}% meets requirement`
        : `Your 12th marks ${student.twelfth_percentage}% is below required ${criteria.min_twelfth}%`
    });

    // Backlogs Check
    const backlogsPassed = parseInt(student.active_backlogs) <= parseInt(criteria.max_active_backlogs);
    if (!backlogsPassed) isEligible = false;
    checks.push({
      parameter: 'Active Backlogs',
      required: `Max ${criteria.max_active_backlogs}`,
      studentValue: student.active_backlogs,
      passed: backlogsPassed,
      message: backlogsPassed
        ? `Active backlogs ${student.active_backlogs} is within limit`
        : `Active backlogs ${student.active_backlogs} exceeds maximum ${criteria.max_active_backlogs}`
    });

    // Department Check
    const deptString = criteria.allowed_departments || '';
    const allowedDepts = deptString.split(',').map(d => d.trim()).filter(d => d);
    const deptPassed = allowedDepts.length === 0 || allowedDepts.includes(student.department);
    if (!deptPassed) isEligible = false;
    checks.push({
      parameter: 'Department',
      required: criteria.allowed_departments || 'Any',
      studentValue: student.department,
      passed: deptPassed,
      message: deptPassed
        ? `Your department ${student.department} is eligible`
        : `Your department ${student.department} is not eligible. Required: ${criteria.allowed_departments}`
    });

    // Gap Years Check
    const gapPassed = parseInt(student.gap_years) <= parseInt(criteria.max_gap_years);
    if (!gapPassed) isEligible = false;
    checks.push({
      parameter: 'Gap Years',
      required: `Max ${criteria.max_gap_years}`,
      studentValue: student.gap_years,
      passed: gapPassed,
      message: gapPassed
        ? `Gap years ${student.gap_years} is within limit`
        : `Gap years ${student.gap_years} exceeds maximum ${criteria.max_gap_years}`
    });

    res.json({
      success: true,
      isEligible,
      passedCount: checks.filter(c => c.passed).length,
      totalCount: checks.length,
      criteria: checks
    });
  } catch (error) {
    console.error('Eligibility Check Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyEligibleCompanies = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [studentRows] = await execute(
      `SELECT s.department, s.year_of_passing,
       ad.tenth_percentage, ad.twelfth_percentage, ad.cgpa,
       ad.active_backlogs, ad.total_backlogs, ad.gap_years
       FROM students s 
       JOIN academic_details ad ON s.id = ad.student_id
       WHERE s.id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile incomplete or student not found' });
    }

    const s = studentRows[0];

    const [companies] = await execute(
      `SELECT c.*, ec.min_cgpa, ec.min_tenth, ec.min_twelfth, 
       ec.max_active_backlogs, ec.allowed_departments, ec.max_gap_years
       FROM companies c 
       LEFT JOIN eligibility_criteria ec ON c.id = ec.company_id
       WHERE c.status != 'Closed'`
    );

    const diagnostics = companies.map(company => {
      if (!company.allowed_departments) {
        return { ...company, isEligible: true, ineligibilityReason: null };
      }

      const reasons = [];
      const depts = company.allowed_departments.split(',').map(d => d.trim());

      if (parseFloat(s.cgpa) < parseFloat(company.min_cgpa)) {
        reasons.push(`CGPA too low (Min: ${company.min_cgpa})`);
      }
      if (parseFloat(s.tenth_percentage) < parseFloat(company.min_tenth)) {
        reasons.push(`10th % too low (Min: ${company.min_tenth}%)`);
      }
      if (parseFloat(s.twelfth_percentage) < parseFloat(company.min_twelfth)) {
        reasons.push(`12th % too low (Min: ${company.min_twelfth}%)`);
      }
      if (parseInt(s.active_backlogs) > parseInt(company.max_active_backlogs)) {
        reasons.push(`Too many backlogs (Max: ${company.max_active_backlogs})`);
      }
      if (parseInt(s.gap_years) > parseInt(company.max_gap_years)) {
        reasons.push(`Too many gap years (Max: ${company.max_gap_years})`);
      }
      if (depts.length > 0 && !depts.includes(s.department)) {
        reasons.push(`Department not eligible`);
      }

      return {
        ...company,
        isEligible: reasons.length === 0,
        ineligibilityReason: reasons.length > 0 ? reasons[0] : null,
        fullDiagnostics: reasons
      };
    });

    res.json({ success: true, data: diagnostics, count: diagnostics.length });
  } catch (error) {
    console.error('Get Eligible Companies Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEligibleStudentsForCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [criteria] = await execute(
      'SELECT * FROM eligibility_criteria WHERE company_id = ?',
      [companyId]
    );

    if (criteria.length === 0) {
      return res.json({ success: true, data: [], message: 'No criteria set' });
    }

    const c = criteria[0];
    const depts = c.allowed_departments.split(',').map(d => d.trim());
    const deptPlaceholders = depts.map(() => '?').join(',');

    const [students] = await execute(
      `SELECT s.id, s.name, s.email, s.roll_number, s.department,
       ad.cgpa, ad.tenth_percentage, ad.twelfth_percentage,
       ad.active_backlogs, ad.gap_years
       FROM students s
       JOIN academic_details ad ON s.id = ad.student_id
       WHERE ad.cgpa >= ? AND ad.tenth_percentage >= ? 
       AND ad.twelfth_percentage >= ?
       AND ad.active_backlogs <= ? AND ad.gap_years <= ?
       AND s.department IN (${deptPlaceholders})
       AND s.profile_complete = 1`,
      [c.min_cgpa, c.min_tenth, c.min_twelfth, c.max_active_backlogs, c.max_gap_years, ...depts]
    );

    res.json({ success: true, data: students, count: students.length });
  } catch (error) {
    console.error('Eligible Students Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const setCriteria = async (req, res) => {
  try {
    const {
      company_id, min_cgpa, min_tenth, min_twelfth,
      max_active_backlogs, max_total_backlogs, max_gap_years,
      allowed_departments, allowed_year_of_passing, required_skills
    } = req.body;

    if (getDbType() === 'mysql') {
      await execute(
        `INSERT INTO eligibility_criteria 
         (company_id, min_cgpa, min_tenth, min_twelfth, max_active_backlogs,
          max_total_backlogs, max_gap_years, allowed_departments, 
          allowed_year_of_passing, required_skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         min_cgpa = VALUES(min_cgpa), min_tenth = VALUES(min_tenth),
         min_twelfth = VALUES(min_twelfth), max_active_backlogs = VALUES(max_active_backlogs),
         max_total_backlogs = VALUES(max_total_backlogs), max_gap_years = VALUES(max_gap_years),
         allowed_departments = VALUES(allowed_departments),
         allowed_year_of_passing = VALUES(allowed_year_of_passing),
         required_skills = VALUES(required_skills)`,
        [company_id, min_cgpa, min_tenth, min_twelfth, max_active_backlogs,
         max_total_backlogs, max_gap_years, allowed_departments,
         allowed_year_of_passing, required_skills]
      );
    } else {
      await execute(
        `INSERT INTO eligibility_criteria 
         (company_id, min_cgpa, min_tenth, min_twelfth, max_active_backlogs,
          max_total_backlogs, max_gap_years, allowed_departments, 
          allowed_year_of_passing, required_skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(company_id) DO UPDATE SET
         min_cgpa = excluded.min_cgpa, min_tenth = excluded.min_tenth,
         min_twelfth = excluded.min_twelfth, max_active_backlogs = excluded.max_active_backlogs,
         max_total_backlogs = excluded.max_total_backlogs, max_gap_years = excluded.max_gap_years,
         allowed_departments = excluded.allowed_departments,
         allowed_year_of_passing = excluded.allowed_year_of_passing,
         required_skills = excluded.required_skills`,
        [company_id, min_cgpa, min_tenth, min_twelfth, max_active_backlogs,
         max_total_backlogs, max_gap_years, allowed_departments,
         allowed_year_of_passing, required_skills]
      );
    }

    const io = req.app.get('io');
    io.emit('criteriaUpdated', { companyId: company_id, message: 'Eligibility criteria updated' });

    res.json({ success: true, message: 'Eligibility criteria set successfully' });
  } catch (error) {
    console.error('Set Criteria Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { checkEligibility, getMyEligibleCompanies, getEligibleStudentsForCompany, setCriteria };

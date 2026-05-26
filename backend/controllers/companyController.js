const { execute } = require('../config/db');

const getAllCompanies = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT c.*, ec.min_cgpa, ec.min_tenth, ec.min_twelfth,
       ec.max_active_backlogs, ec.allowed_departments,
       COUNT(DISTINCT a.id) as total_applications,
       SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) as total_selected
       FROM companies c
       LEFT JOIN eligibility_criteria ec ON c.id = ec.company_id
       LEFT JOIN applications a ON c.id = a.company_id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const [rows] = await execute(
      `SELECT c.*, ec.* FROM companies c
       LEFT JOIN eligibility_criteria ec ON c.id = ec.company_id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addCompany = async (req, res) => {
  try {
    const {
      company_name, company_code, job_role, job_description,
      package_lpa, job_location, job_type, bond_years,
      drive_date, last_apply_date, status, total_openings
    } = req.body;

    const [result] = await execute(
      `INSERT INTO companies (company_name, company_code, job_role, job_description,
       package_lpa, job_location, job_type, bond_years, drive_date, 
       last_apply_date, status, total_openings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, company_code, job_role, job_description,
       package_lpa, job_location, job_type || 'Full-Time', bond_years || 0,
       drive_date, last_apply_date, status || 'Upcoming', total_openings || 0]
    );

    const io = req.app.get('io');
    io.emit('newCompanyAdded', {
      companyId: result.insertId,
      companyName: company_name,
      jobRole: job_role,
      package: package_lpa,
      message: `New company ${company_name} added for ${job_role}`
    });

    res.status(201).json({ success: true, message: 'Company added successfully', companyId: result.insertId });
  } catch (error) {
    console.error('Add Company Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const fields = req.body;
    const id = req.params.id;

    // Build dynamic SET clause from provided fields only
    const allowedFields = ['company_name', 'job_role', 'package_lpa', 'status', 'drive_date', 'last_apply_date', 'job_description', 'job_location', 'job_type', 'bond_years', 'total_openings'];
    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await execute(`UPDATE companies SET ${updates.join(', ')} WHERE id = ?`, values);

    const io = req.app.get('io');
    io.emit('companyUpdated', { companyId: id });

    res.json({ success: true, message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update Company Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await execute('DELETE FROM companies WHERE id = ?', [req.params.id]);
    const io = req.app.get('io');
    io.emit('companyDeleted', { companyId: req.params.id });
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllCompanies, getCompanyById, addCompany, updateCompany, deleteCompany };

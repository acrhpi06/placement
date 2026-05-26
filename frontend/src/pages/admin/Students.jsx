import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, deptFilter]);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/all-students', {
        params: { search: searchTerm, department: deptFilter }
      });
      setStudents(data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Student Directory" />

        <div className="page-content">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by name, roll no, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '200px' }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Backlogs</th>
                    <th>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{s.email}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{s.roll_number}</td>
                      <td>{s.department}</td>
                      <td>
                        <span className={`badge ${parseFloat(s.cgpa) >= 7.5 ? 'badge-success' : 'badge-primary'}`}>
                          {s.cgpa || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.active_backlogs > 0 ? 'badge-danger' : 'badge-gray'}`}>
                          {s.active_backlogs} Active
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm">View Profile</button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan="6" className="empty-state">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

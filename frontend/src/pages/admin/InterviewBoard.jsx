import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function InterviewBoard() {
  const { companyId } = useParams();
  const { socket } = useSocket();
  const [rounds, setRounds] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(null);
  
  // New States from User Request
  const [showAddRound, setShowAddRound] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(null);
  const [newRound, setNewRound] = useState({ round_name: '', round_date: '' });
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.emit('joinCompanyRoom', { companyId });
      
      socket.on('studentMoved', () => fetchData());
      socket.on('studentEliminated', () => fetchData());
      socket.on('newRoundAdded', () => fetchData());
      socket.on('roundStatusChanged', () => fetchData());
    }

    return () => {
      if (socket) {
        socket.emit('leaveCompanyRoom', { companyId });
        socket.off('studentMoved');
        socket.off('studentEliminated');
        socket.off('newRoundAdded');
        socket.off('roundStatusChanged');
      }
    };
  }, [socket, companyId]);

  const fetchData = async () => {
    try {
      const [compRes, roundsRes] = await Promise.all([
        api.get(`/companies/${companyId}`),
        api.get(`/interview/rounds/${companyId}`)
      ]);
      setCompany(compRes.data.data);
      
      const roundsWithStudents = await Promise.all(roundsRes.data.data.map(async (round) => {
        const partRes = await api.get(`/interview/rounds/${round.id}/participants`);
        return { ...round, students: partRes.data.data };
      }));
      
      setRounds(roundsWithStudents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToNext = async (participantId) => {
    setMoving(participantId);
    try {
      await api.put(`/interview/participants/${participantId}/move-next`, { companyId });
      toast.success('Student moved to next round');
    } catch (error) {
      toast.error('Move failed');
    } finally {
      setMoving(null);
    }
  };

  const handleEliminate = async (participantId) => {
    if (!window.confirm('Eliminate this student from the process?')) return;
    try {
      await api.put(`/interview/participants/${participantId}/eliminate`);
      toast.success('Student eliminated');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interview/rounds/add', { 
        company_id: companyId, 
        round_name: newRound.round_name,
        round_date: newRound.round_date 
      });
      toast.success('Round added');
      setShowAddRound(false);
      setNewRound({ round_name: '', round_date: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add round');
    }
  };

  const handleFetchEligible = async (roundId) => {
    try {
      const { data } = await api.get(`/eligibility/eligible-students/${companyId}`);
      setEligibleStudents(data.data);
      setShowAddStudents(roundId);
    } catch (error) {
      toast.error('Failed to fetch eligible students');
    }
  };

  const handleAddStudentsToRound = async (roundId) => {
    try {
      await api.post(`/interview/rounds/${roundId}/participants`, { studentIds: selectedStudents });
      toast.success(`${selectedStudents.length} students added`);
      setShowAddStudents(null);
      setSelectedStudents([]);
      fetchData();
    } catch (error) {
      toast.error('Failed to add students');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title={`Interview Board: ${company?.company_name}`} actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddRound(true)}>+ Add Round</button>
        } />

        <div className="page-content">
          <div className="interview-board">
            {rounds.map((round) => {
              const roundParticipants = round.students || [];
              return (
                <div key={round.id} className="interview-round-column">
                  <div className={`round-header ${round.round_status?.toLowerCase() || 'pending'}`}>
                    <div>
                      <div style={{ fontSize: '10px', opacity: 0.8 }}>ROUND {round.round_number}</div>
                      {round.round_name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-gray">{roundParticipants.length}</span>
                      {round.round_number === 1 && (
                        <button 
                          className="btn btn-xs btn-ghost" 
                          style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                          onClick={() => handleFetchEligible(round.id)}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="round-students">
                    {roundParticipants.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        No students in this round
                      </div>
                    ) : (
                      roundParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className={`student-card ${participant.status.toLowerCase()}`}
                        >
                          <div className="student-info">
                            <div className="student-avatar">
                              {participant.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{participant.name}</div>
                              <div className="student-meta">
                                {participant.roll_number} • {participant.department}
                              </div>
                              <div className="student-marks">
                                CGPA: {participant.cgpa} | 10th: {participant.tenth_percentage}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="student-actions">
                            <span className={`status-badge ${participant.status.toLowerCase()}`}>
                              {participant.status}
                            </span>
                            
                            {participant.status === 'Present' && !participant.moved_to_next && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                <button
                                  onClick={() => handleMoveToNext(participant.id)}
                                  className="btn btn-success btn-xs"
                                  title="Move to Next Round"
                                  disabled={moving === participant.id}
                                >
                                  {moving === participant.id ? '...' : '✅ Pass'}
                                </button>
                                <button
                                  onClick={() => handleEliminate(participant.id)}
                                  className="btn btn-danger btn-xs"
                                  title="Eliminate"
                                >
                                  ❌ Fail
                                </button>
                              </div>
                            )}
                            
                            {participant.moved_to_next && (
                               <div style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: '700', marginTop: '4px' }}>
                                 ✓ PROMOTED
                               </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Round Modal */}
          {showAddRound && (
            <div className="modal-overlay" onClick={() => setShowAddRound(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add Interview Round</h3>
                  <button onClick={() => setShowAddRound(false)}>×</button>
                </div>
                <form onSubmit={handleAddRound}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label required">Round Name</label>
                      <input
                        className="form-input"
                        placeholder="Technical Interview"
                        value={newRound.round_name}
                        onChange={e => setNewRound({...newRound, round_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Round Date & Time</label>
                      <input
                        className="form-input"
                        type="datetime-local"
                        value={newRound.round_date}
                        onChange={e => setNewRound({...newRound, round_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" onClick={() => setShowAddRound(false)} className="btn btn-ghost">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Add Round</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Students Modal */}
          {showAddStudents && (
            <div className="modal-overlay" onClick={() => setShowAddStudents(null)}>
              <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add Students to Round</h3>
                  <button onClick={() => setShowAddStudents(null)}>×</button>
                </div>
                <div className="modal-body">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{selectedStudents.length} students selected</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedStudents([])}
                          className="btn btn-ghost btn-sm"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setSelectedStudents(eligibleStudents.map(s => s.id))}
                          className="btn btn-ghost btn-sm"
                        >
                          Select All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="student-selection-list">
                    {eligibleStudents.length > 0 ? eligibleStudents.map(student => (
                      <div
                        key={student.id}
                        className={`student-selection-item ${selectedStudents.includes(student.id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedStudents(prev =>
                            prev.includes(student.id)
                              ? prev.filter(id => id !== student.id)
                              : [...prev, student.id]
                          );
                        }}
                      >
                        <div className="checkbox">
                          {selectedStudents.includes(student.id) && '✓'}
                        </div>
                        <div className="student-selection-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-meta">
                            {student.roll_number} • {student.department} • CGPA: {student.cgpa}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state">No eligible students found for this drive.</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowAddStudents(null)} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddStudentsToRound(showAddStudents)}
                    className="btn btn-primary"
                    disabled={selectedStudents.length === 0}
                  >
                    Add {selectedStudents.length} Students
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

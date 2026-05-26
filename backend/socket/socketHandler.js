const socketHandler = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join room based on user role
    socket.on('join', ({ userId, role, companyId }) => {
      if (role === 'student') {
        socket.join(`student_${userId}`);
        connectedUsers.set(socket.id, { userId, role });
        console.log(`👨🎓 Student ${userId} joined`);
      } else if (role === 'admin') {
        socket.join('admins');
        connectedUsers.set(socket.id, { userId, role });
        console.log(`👨💼 Admin ${userId} joined`);
      }

      if (companyId) {
        socket.join(`company_${companyId}`);
      }

      // Send online count to admins
      const onlineStudents = [...connectedUsers.values()].filter(u => u.role === 'student').length;
      io.to('admins').emit('onlineStudentsCount', { count: onlineStudents });
    });

    // Join company room for interview board
    socket.on('joinCompanyRoom', ({ companyId }) => {
      socket.join(`company_${companyId}`);
    });

    // Leave company room
    socket.on('leaveCompanyRoom', ({ companyId }) => {
      socket.leave(`company_${companyId}`);
    });

    // Admin triggers interview update
    socket.on('interviewUpdate', (data) => {
      io.to(`company_${data.companyId}`).emit('interviewUpdate', data);
    });

    // Real-time typing/status indicators
    socket.on('adminViewing', ({ companyId, adminName }) => {
      io.to(`company_${companyId}`).emit('adminViewing', { adminName });
    });

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      
      const onlineStudents = [...connectedUsers.values()].filter(u => u.role === 'student').length;
      io.to('admins').emit('onlineStudentsCount', { count: onlineStudents });
      
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
export const attachInterviewSocket = (io) => {
  io.use(async (socket, next) => { try { const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET); socket.user = await User.findById(payload.sub).select('name avatar'); if (!socket.user) throw new Error('Unauthorized'); next(); } catch { next(new Error('Unauthorized')); } });
  io.on('connection', (socket) => {
    socket.on('room:join', ({ roomId }) => { socket.join(roomId); socket.to(roomId).emit('participant:joined', { id: socket.user.id, name: socket.user.name }); });
    socket.on('signal', ({ roomId, signal }) => socket.to(roomId).emit('signal', { from: socket.id, signal }));
    socket.on('chat:message', ({ roomId, message }) => io.to(roomId).emit('chat:message', { ...message, sender: socket.user.name }));
    socket.on('notes:update', ({ roomId, notes }) => socket.to(roomId).emit('notes:update', notes));
    socket.on('code:update', ({ roomId, code, language }) => socket.to(roomId).emit('code:update', { code, language }));
    socket.on('whiteboard:update', ({ roomId, strokes }) => socket.to(roomId).emit('whiteboard:update', strokes));
    socket.on('room:leave', ({ roomId }) => { socket.leave(roomId); socket.to(roomId).emit('participant:left', { id: socket.user.id }); });
  });
};

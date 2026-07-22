import 'dotenv/config';
import http from 'node:http';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { Server } from 'socket.io';
import { attachInterviewSocket } from './socket/interviewSocket.js';

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' } });
attachInterviewSocket(io);

const startServer = async () => {
  await connectDatabase();
  server.listen(port, () => console.info(`API listening on port ${port}`));
};

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});

const shutdown = (signal) => {
  console.info(`${signal} received. Closing server.`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

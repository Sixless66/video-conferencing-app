import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
// ...rest of your imports
const userData = {}; // { roomId: { users: [{ id, name }], hostId } }

io.on('connection', (socket) => {
  console.log("User Connected:", socket.id);

  socket.on('create-room', ({ roomId, name }) => {
    socket.roomId = roomId;

    userData[roomId] = {
      users: [{ id: socket.id, name }],
      hostId: socket.id,
    };

    socket.join(roomId);
    io.to(roomId).emit('participants-update', userData[roomId].users);
    socket.emit('host-info', userData[roomId].hostId);
  });

  socket.on('join-room', ({ roomId, name }) => {
    if (!userData[roomId]) {
      userData[roomId] = {
        users: [],
        hostId: null,
      };
    }

    socket.roomId = roomId;

    // ✅ FIX: Check if user is already present
    const exists = userData[roomId].users.some(u => u.id === socket.id);
    if (!exists) {
      userData[roomId].users.push({ id: socket.id, name });
    }

    // Set host if not already
    if (!userData[roomId].hostId) {
      userData[roomId].hostId = socket.id;
    }

    socket.join(roomId);

    io.to(roomId).emit('participants-update', userData[roomId].users);
    socket.emit('host-info', userData[roomId].hostId);
    socket.to(roomId).emit('user-joined', { userId: socket.id });
  });

  socket.on('offer', ({ to, offer }) => {
    io.to(to).emit('offer', { from: socket.id, offer });
  });

  socket.on('answer', ({ to, answer }) => {
    io.to(to).emit('answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (!roomId || !userData[roomId]) return;

    // Remove user from list
    userData[roomId].users = userData[roomId].users.filter(
      (u) => u.id !== socket.id
    );

    // Reassign host if needed
    if (socket.id === userData[roomId].hostId && userData[roomId].users.length > 0) {
      userData[roomId].hostId = userData[roomId].users[0].id;
      io.to(roomId).emit('host-info', userData[roomId].hostId);
    }

    // If room is empty, delete it
    if (userData[roomId].users.length === 0) {
      delete userData[roomId];
    } else {
      io.to(roomId).emit('participants-update', userData[roomId].users);
    }

    console.log("User Disconnected:", socket.id);
  });
});

server.listen(5000, () =>
  console.log('🚀 Server running on http://localhost:5000')
);

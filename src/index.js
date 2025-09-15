// src/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const usersRouter = require('./routes/users');
const pollsRouter = require('./routes/polls');
const votesRouter = require('./routes/votes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// mount routers
app.use('/users', usersRouter);
app.use('/polls', pollsRouter);
app.use('/votes', votesRouter);

// health check
app.get('/', (req, res) =>
  res.json({ message: 'Voting API with JWT + Socket.IO realtime votes' })
);

// socket.io setup
const io = new Server(server, {
  cors: { origin: '*' }
});

// make io available inside all routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // allow client to subscribe to a poll’s room
  socket.on('join_poll', (data) => {
    if (data && data.pollId) {
      const room = `poll_${data.pollId}`;
      socket.join(room);
      console.log(`socket ${socket.id} joined ${room}`);
    }
  });

  socket.on('leave_poll', (data) => {
    if (data && data.pollId) {
      const room = `poll_${data.pollId}`;
      socket.leave(room);
      console.log(`socket ${socket.id} left ${room}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`socket disconnected: ${socket.id} (${reason})`);
  });
});

// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API at http://localhost:${PORT}`);
});

require('dotenv').config({ path: __dirname + '/.env', override: true });
const express = require('express');
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const videoRouter = require('./routes/videoCreator');
const aiRouter = require('./routes/aiChatting');
const contestRouter = require('./routes/contest');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-contest', (contestId) => {
    socket.join(contestId);
    console.log(`User ${socket.id} joined contest room: ${contestId}`);
  });

  socket.on('send-message', (data) => {
    // data = { contestId, message, user }
    io.to(data.contestId).emit('receive-message', {
      message: data.message,
      user: data.user,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// CORS Configuration - Permissive for development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/contest', contestRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database connections
const initializeConnection = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    await main(); // MongoDB
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ Database connection error:", err.message);
  }
};

initializeConnection();

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📡 Local health check: http://localhost:${PORT}/health`);
});
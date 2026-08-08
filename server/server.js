const dns = require('dns');

// Force Node.js to use Google's public DNS (8.8.8.8) for resolving
// MongoDB Atlas SRV records, bypassing local DNS servers that may
// block or fail to resolve _mongodb._tcp SRV lookups.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const submissionsRouter = require('./routes/submissions');
const authRouter = require('./routes/auth');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Supports multiple allowed origins: localhost for dev + Netlify URL for prod.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection (cached for serverless cold-start performance) ─────────
// Vercel serverless functions are stateless — each invocation may spin a new
// container. Caching the connection avoids exhausting the Atlas connection pool.
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  cachedConnection = await mongoose.connect(process.env.MONGO_URI);
  return cachedConnection;
}

// Attach DB connection to every request (required for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(503).json({ message: 'Database unavailable. Please try again.' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QR Code Exhibition API',
    timestamp: new Date().toISOString(),
    mongoState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/submissions', submissionsRouter);
app.use('/api/auth', authRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
});

// ─── Local Dev Server ─────────────────────────────────────────────────────────
// process.env.VERCEL is set automatically when deployed to Vercel.
// Skipping listen() in serverless avoids port-binding errors.
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      console.log('✅  Connected to MongoDB Atlas');
      app.listen(PORT, () => {
        console.log(`🚀  Server running at http://localhost:${PORT}`);
        console.log(`📋  Health: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.error('❌  MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

// Export app for Vercel serverless handler
module.exports = app;

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { initDatabase, getDialect } = require('./config/db');
const { initModels } = require('./models');
const { authenticate, optionalAuth } = require('./middleware/authMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files (supports standard and serverless process.cwd)
const publicPath = fs.existsSync(path.join(process.cwd(), 'public'))
  ? path.join(process.cwd(), 'public')
  : path.join(__dirname, 'public');
app.use(express.static(publicPath));

// View Engine (supports standard and serverless process.cwd)
app.set('view engine', 'ejs');
const viewsPath = fs.existsSync(path.join(process.cwd(), 'views'))
  ? path.join(process.cwd(), 'views')
  : path.join(__dirname, 'views');
app.set('views', viewsPath);

// Health check endpoint (Phase 1 spec)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    app: 'FitAdapt',
    sih: 'SIH26196',
    databaseDialect: getDialect(),
    timestamp: new Date().toISOString()
  });
});

// Database Initialization (Serverless & Persistent Compatible)
let dbPromise = null;
async function ensureDatabase() {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const sequelize = await initDatabase();
        initModels(sequelize);
        await sequelize.sync({ alter: false });
        return sequelize;
      } catch (err) {
        console.error('Database connection error:', err.message);
        throw err;
      }
    })();
  }
  return dbPromise;
}

// Ensure DB is initialized before handling requests (bypass static assets)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/css') || req.path.startsWith('/js') || req.path === '/favicon.ico') {
    return next();
  }
  try {
    await ensureDatabase();
    next();
  } catch (err) {
    console.error('Database connection error in request:', err);
    next(err);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exercises', exerciseRoutes);

// Page View Routes
app.get('/', optionalAuth, (req, res) => {
  res.render('index', { user: req.user, title: 'FitAdapt — Invisible Disability Fitness Companion' });
});

app.get('/login', optionalAuth, (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('login', { user: null, title: 'Log In' });
});

app.get('/signup', optionalAuth, (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('signup', { user: null, title: 'Sign Up & Condition Profile' });
});

app.get('/onboarding', authenticate, (req, res) => {
  res.render('onboarding', { user: req.user, title: 'Condition Safety Profile' });
});

app.get('/checkin', authenticate, (req, res) => {
  res.render('checkin', { user: req.user, title: 'Daily Symptom Check-in' });
});

app.get('/workout', authenticate, (req, res) => {
  res.render('workout', { user: req.user, title: "Today's Adaptive Workout" });
});

app.get('/dashboard', authenticate, (req, res) => {
  res.render('dashboard', { user: req.user, title: 'Consistency Dashboard' });
});

app.get('/exercises', optionalAuth, (req, res) => {
  res.render('exercises', { user: req.user, title: 'Condition-Safe Exercise Library' });
});

// 404 Handler
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  res.status(404).render('index', { user: req.user, title: 'Page Not Found' });
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ success: false, error: 'Internal server error: ' + err.message });
  }
  res.status(500).send(`An error occurred: ${err.message}. Please refresh or try again.`);
});

// Start Server & Sync DB
async function startServer() {
  try {
    await ensureDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  FitAdapt Server Running on http://localhost:${PORT}`);
      console.log(`  SIH 2026 Problem Statement SIH26196`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;

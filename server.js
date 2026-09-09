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
const cronRoutes = require('./routes/cronRoutes');

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
        dbPromise = null; // Reset so next request retries
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
app.use('/api/cron', cronRoutes);

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

  const isDnsError = err.message && (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED'));
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><title>FitAdapt — Database Service Alert</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-6 font-sans">
      <div class="max-w-xl w-full bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl">
          ⚠️
        </div>
        <div class="space-y-2">
          <h1 class="text-2xl font-black text-white">Database Service Unavailable</h1>
          <p class="text-sm text-gray-400 leading-relaxed">
            The web server is running, but cannot connect to your cloud MySQL database.
          </p>
        </div>
        <div class="p-4 rounded-2xl bg-gray-900/80 border border-gray-700/60 text-left space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-rose-400">Technical Diagnostic:</p>
          <code class="text-xs text-rose-300 font-mono block break-all">${err.message}</code>
        </div>
        ${isDnsError ? `
        <div class="p-4 rounded-2xl bg-brand-950/40 border border-indigo-800 text-left space-y-2 text-xs text-indigo-200">
          <p class="font-bold text-white">💡 How to fix this in 1 minute:</p>
          <ol class="list-decimal pl-4 space-y-1 text-indigo-300">
            <li>Open <a href="https://console.aiven.io" target="_blank" class="text-indigo-400 underline font-semibold">console.aiven.io</a> and check your MySQL service status.</li>
            <li>If it says <b>"POWERED OFF"</b> or <b>"PAUSED"</b>, click <b>"Power on"</b> / <b>"Resume"</b>.</li>
            <li>If you created a new service, update <code>DB_HOST</code> and <code>DB_PASSWORD</code> in your Vercel project settings.</li>
          </ol>
        </div>` : ''}
        <button onclick="window.location.reload()" class="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition">
          Retry Connection
        </button>
      </div>
    </body>
    </html>
  `;
  res.status(500).send(html);
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

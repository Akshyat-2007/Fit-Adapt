const express = require('express');
const router = express.Router();
const { models } = require('../models');

// GET /api/cron/daily-pacing
// Triggered on schedule by Vercel Cron or cron-job.org
router.get('/daily-pacing', async (req, res) => {
  // Optional security: Verify CRON_SECRET if configured in environment variables
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized cron request' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Example cron task: Calculate daily statistics and verify database health
    const totalUsers = await models.User.count();
    const todayCheckins = await models.Checkin.count({ where: { checkin_date: today } });

    console.log(`[CRON] Daily pacing job completed at ${new Date().toISOString()}`);
    console.log(`[CRON] Active Users: ${totalUsers} | Check-ins Today: ${todayCheckins}`);

    return res.json({
      success: true,
      job: 'daily-pacing',
      executed_at: new Date().toISOString(),
      database: 'healthy',
      metrics: {
        totalUsers,
        todayCheckins
      }
    });
  } catch (err) {
    console.error('[CRON Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

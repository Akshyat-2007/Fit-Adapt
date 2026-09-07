const { models } = require('../models');
const { getLocalDateString } = require('./checkinController');

// Mark today's workout session as completed
async function completeSession(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = getLocalDateString();
    const { exercise_ids } = req.body;

    // Check if session log exists for today
    let sessionLog = await models.SessionLog.findOne({
      where: {
        user_id: userId,
        session_date: todayStr
      }
    });

    if (sessionLog) {
      await sessionLog.update({
        completed: true,
        exercise_ids: exercise_ids || sessionLog.exercise_ids
      });
    } else {
      // Find today's checkin if available
      let todayCheckin = await models.Checkin.findOne({
        where: { user_id: userId, checkin_date: todayStr }
      });

      if (!todayCheckin) {
        return res.status(400).json({
          success: false,
          error: 'Please check in first before completing today’s session.'
        });
      }

      sessionLog = await models.SessionLog.create({
        user_id: userId,
        checkin_id: todayCheckin.id,
        exercise_ids: exercise_ids || '',
        completed: true,
        session_date: todayStr
      });
    }

    return res.json({
      success: true,
      message: 'Workout session successfully marked as complete! Great consistency today.',
      sessionLog
    });
  } catch (err) {
    console.error('Complete session error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  completeSession
};

const { models } = require('../models');
const { generateTodayWorkout } = require('../services/ruleEngine');
const { getLocalDateString } = require('./checkinController');

// Get today's adaptive workout recommendation
async function getTodayWorkout(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = getLocalDateString();

    // 1. Fetch user's condition profile
    const conditionProfile = await models.ConditionProfile.findOne({
      where: { user_id: userId }
    });

    // 2. Fetch today's checkin
    const todayCheckin = await models.Checkin.findOne({
      where: {
        user_id: userId,
        checkin_date: todayStr
      }
    });

    if (!todayCheckin) {
      return res.json({
        success: true,
        needsCheckin: true,
        conditionProfile,
        message: 'Please complete today\'s symptom check-in first to generate your adaptive workout.'
      });
    }

    // 3. Run adaptive rule engine
    const workoutData = await generateTodayWorkout({
      ExerciseModel: models.Exercise,
      conditionProfile,
      todayCheckin
    });

    // 4. Check if session has already been recorded/completed
    let sessionLog = await models.SessionLog.findOne({
      where: {
        user_id: userId,
        session_date: todayStr
      }
    });

    const exerciseIds = workoutData.exercises.map(e => e.id).join(',');

    // Create session_log draft if it doesn't exist yet
    if (!sessionLog && workoutData.exercises.length > 0) {
      sessionLog = await models.SessionLog.create({
        user_id: userId,
        checkin_id: todayCheckin.id,
        exercise_ids: exerciseIds,
        completed: false,
        session_date: todayStr
      });
    }

    return res.json({
      success: true,
      needsCheckin: false,
      workout: workoutData,
      session: {
        id: sessionLog ? sessionLog.id : null,
        completed: sessionLog ? sessionLog.completed : false,
        session_date: todayStr
      }
    });
  } catch (err) {
    console.error('Get today workout error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate workout. ' + err.message });
  }
}

module.exports = {
  getTodayWorkout
};

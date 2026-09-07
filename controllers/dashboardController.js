const { models } = require('../models');
const { getLocalDateString } = require('./checkinController');

// Calculate consecutive streak of days
function calculateStreak(checkinDatesSet, todayStr) {
  const today = new Date(todayStr);

  let currentCheck = new Date(today);
  let streak = 0;

  const formatDate = (d) => d.toISOString().split('T')[0];

  // If today is logged, start counting from today
  if (checkinDatesSet.has(formatDate(currentCheck))) {
    while (checkinDatesSet.has(formatDate(currentCheck))) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    }
  } else {
    // If today not yet logged, check if yesterday was logged to preserve streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    currentCheck = yesterday;

    while (checkinDatesSet.has(formatDate(currentCheck))) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    }
  }

  return streak;
}

// Get consistency dashboard statistics
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = getLocalDateString();

    // 1. Fetch user's condition profile
    const conditionProfile = await models.ConditionProfile.findOne({
      where: { user_id: userId }
    });

    // 2. Fetch all checkins for the user
    const checkins = await models.Checkin.findAll({
      where: { user_id: userId },
      order: [['checkin_date', 'DESC']]
    });

    // 3. Fetch completed sessions
    const sessions = await models.SessionLog.findAll({
      where: { user_id: userId },
      order: [['session_date', 'DESC']]
    });

    const completedSessionDates = new Set(
      sessions.filter(s => s.completed).map(s => s.session_date)
    );

    const checkinDatesSet = new Set(checkins.map(c => c.checkin_date));
    const checkinMap = new Map(checkins.map(c => [c.checkin_date, c]));

    // Counts
    const totalDays = checkins.length;
    let goodDays = 0;
    let flareDays = 0;

    checkins.forEach(c => {
      if (c.flare_flag) {
        flareDays++;
      } else {
        goodDays++;
      }
    });

    const streak = calculateStreak(checkinDatesSet, todayStr);

    // 4. Generate 14-day consistency matrix (for calendar heatmap)
    const recentActivity = [];
    const today = new Date(todayStr);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const checkin = checkinMap.get(dStr);
      const isCompleted = completedSessionDates.has(dStr);

      recentActivity.push({
        date: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        hasCheckin: !!checkin,
        flare: checkin ? Boolean(checkin.flare_flag) : false,
        energy: checkin ? checkin.energy_level : null,
        pain: checkin ? checkin.pain_level : null,
        breathlessness: checkin ? checkin.breathlessness : null,
        completed: isCompleted,
        isToday: dStr === todayStr
      });
    }

    const completedSessionsCount = sessions.filter(s => s.completed).length;

    return res.json({
      success: true,
      stats: {
        totalDays,
        goodDays,
        flareDays,
        streak,
        completedSessionsCount,
        goodDaysPercentage: totalDays > 0 ? Math.round((goodDays / totalDays) * 100) : 0,
        recentActivity,
        todayCheckedIn: checkinDatesSet.has(todayStr),
        conditionProfile: conditionProfile || null
      }
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  calculateStreak
};

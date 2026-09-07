const { models } = require('../models');

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Submit or update today's symptom check-in
async function submitCheckin(req, res) {
  try {
    let { energy_level, pain_level, breathlessness, flare_flag, checkin_date } = req.body;
    const userId = req.user.id;

    const dateStr = checkin_date || getLocalDateString();

    // Sanitize & validate values
    energy_level = Math.min(5, Math.max(1, parseInt(energy_level, 10) || 3));
    pain_level = Math.min(5, Math.max(0, parseInt(pain_level, 10) || 0));
    breathlessness = Math.min(5, Math.max(0, parseInt(breathlessness, 10) || 0));
    const isFlare = Boolean(flare_flag === true || flare_flag === 'true' || flare_flag === 1 || flare_flag === '1');

    // Find existing checkin for today
    let checkin = await models.Checkin.findOne({
      where: {
        user_id: userId,
        checkin_date: dateStr
      }
    });

    if (checkin) {
      await checkin.update({
        energy_level,
        pain_level,
        breathlessness,
        flare_flag: isFlare
      });
    } else {
      checkin = await models.Checkin.create({
        user_id: userId,
        checkin_date: dateStr,
        energy_level,
        pain_level,
        breathlessness,
        flare_flag: isFlare
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Check-in saved successfully.',
      checkin
    });
  } catch (err) {
    console.error('Submit checkin error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record check-in. ' + err.message });
  }
}

// Get today's check-in status
async function getTodayCheckin(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = getLocalDateString();

    const checkin = await models.Checkin.findOne({
      where: {
        user_id: userId,
        checkin_date: todayStr
      }
    });

    return res.json({
      success: true,
      hasCheckedIn: !!checkin,
      checkin: checkin || null,
      date: todayStr
    });
  } catch (err) {
    console.error('Get today checkin error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Get check-in history for logged-in user (up to 30 days)
async function getCheckinHistory(req, res) {
  try {
    const userId = req.user.id;
    const checkins = await models.Checkin.findAll({
      where: { user_id: userId },
      order: [['checkin_date', 'DESC']],
      limit: 30
    });

    return res.json({
      success: true,
      count: checkins.length,
      checkins
    });
  } catch (err) {
    console.error('Get checkin history error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  submitCheckin,
  getTodayCheckin,
  getCheckinHistory,
  getLocalDateString
};

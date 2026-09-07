const { models } = require('../models');
const { Op } = require('sequelize');

// List and filter exercises
async function getExercises(req, res) {
  try {
    const { condition, intensity, search } = req.query;
    const where = {};

    if (intensity) {
      where.intensity = intensity;
    }

    if (condition) {
      const conditionFieldMap = {
        asthma: 'safe_for_asthma',
        joint: 'safe_for_joint',
        pcos: 'safe_for_pcos',
        postnatal: 'safe_for_postnatal',
        anxiety_fatigue: 'safe_for_anxiety_fatigue'
      };
      const field = conditionFieldMap[condition];
      if (field) {
        where[field] = true;
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { target_muscle: { [Op.like]: `%${search}%` } }
      ];
    }

    const exercises = await models.Exercise.findAll({ where });
    return res.json({
      success: true,
      count: exercises.length,
      exercises
    });
  } catch (err) {
    console.error('Get exercises error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Get single exercise by ID
async function getExerciseById(req, res) {
  try {
    const exercise = await models.Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, error: 'Exercise not found' });
    }
    return res.json({ success: true, exercise });
  } catch (err) {
    console.error('Get exercise by ID error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getExercises,
  getExerciseById
};

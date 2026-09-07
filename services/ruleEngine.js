const { Op } = require('sequelize');

/**
 * FitAdapt Adaptive Workout Rule Engine (SIH 2026 Logic Spec)
 *
 * Implements Section 8 explainable rule logic:
 * Input: user condition_profile (condition_type, severity) + daily checkin (energy, pain, breathlessness, flare_flag)
 * Output: intensity ('rest', 'low', 'moderate'), explainable rationale, and 2 to 6 condition-safe exercises.
 */

function decideIntensity(checkin, severity) {
  // 1. Safety first: active flare-up triggers rest/recovery
  if (checkin.flare_flag) {
    return {
      intensity: 'rest',
      rationale: 'Active symptom flare-up reported. Protecting your body is priority #1—today is dedicated to restorative breathing and gentle recovery.'
    };
  }

  // 2. High acute pain or breathlessness triggers rest
  if (checkin.pain_level >= 4 || checkin.breathlessness >= 4) {
    return {
      intensity: 'rest',
      rationale: `Elevated acute symptoms detected (Pain: ${checkin.pain_level}/5, Breathlessness: ${checkin.breathlessness}/5). Switching to restorative recovery to avoid triggering an escalation.`
    };
  }

  // 3. Low energy (1-2) calls for gentle low-intensity movement
  if (checkin.energy_level <= 2) {
    return {
      intensity: 'low',
      rationale: `Low energy level (${checkin.energy_level}/5) reported. Pacing is key today—a gentle low-intensity sequence will stimulate circulation without causing post-exertional fatigue.`
    };
  }

  // 4. Moderate energy (3)
  if (checkin.energy_level === 3) {
    return {
      intensity: 'moderate',
      rationale: `Moderate energy (${checkin.energy_level}/5) with manageable symptoms. Safe for a balanced routine within your comfort threshold.`
    };
  }

  // 5. High energy (4-5) - check condition severity
  if (checkin.energy_level >= 4 && severity !== 'significant') {
    return {
      intensity: 'moderate',
      rationale: `High energy (${checkin.energy_level}/5) and stable symptoms. Adapted to an energizing moderate workout safe for your condition.`
    };
  }

  // 6. Conservative default for significant severity
  return {
    intensity: 'low',
    rationale: `High energy reported, but conservative pacing applied due to ${severity} condition severity to prevent rebound flare-ups.`
  };
}

/**
 * Select condition-safe exercises matching intensity ceiling
 * @param {Object} ExerciseModel - Sequelize Exercise model
 * @param {string} conditionType - 'asthma' | 'joint' | 'pcos' | 'postnatal' | 'anxiety_fatigue' | 'other'
 * @param {string} intensity - 'rest' | 'low' | 'moderate'
 */
async function pickExercises(ExerciseModel, conditionType, intensity) {
  const safetyFieldMap = {
    asthma: 'safe_for_asthma',
    joint: 'safe_for_joint',
    pcos: 'safe_for_pcos',
    postnatal: 'safe_for_postnatal',
    anxiety_fatigue: 'safe_for_anxiety_fatigue'
  };

  const safetyColumn = safetyFieldMap[conditionType];

  const whereClause = {};

  if (safetyColumn) {
    whereClause[safetyColumn] = true;
  }

  if (intensity === 'rest') {
    // Rest mode: 2 gentle breathing / stretch / restorative options
    whereClause.intensity = 'low';
    const exercises = await ExerciseModel.findAll({
      where: whereClause,
      limit: 10
    });

    // Pick top 2 gentle breathing or relaxation options
    const prioritized = exercises.filter(e =>
      e.name.toLowerCase().includes('breathing') ||
      e.name.toLowerCase().includes('relaxation') ||
      e.name.toLowerCase().includes('pose') ||
      e.name.toLowerCase().includes('gentle')
    );

    const picked = prioritized.length >= 2 ? prioritized.slice(0, 2) : exercises.slice(0, 2);
    return picked;
  }

  if (intensity === 'low') {
    // Low mode: 4-6 low-intensity exercises
    whereClause.intensity = 'low';
    const exercises = await ExerciseModel.findAll({
      where: whereClause,
      limit: 6
    });
    return exercises;
  }

  if (intensity === 'moderate') {
    // Moderate mode: up to moderate ceiling (can mix low and moderate)
    whereClause.intensity = { [Op.in]: ['low', 'moderate'] };
    const exercises = await ExerciseModel.findAll({
      where: whereClause,
      limit: 6
    });
    return exercises;
  }

  return [];
}

/**
 * Main function: generate adaptive workout recommendation
 */
async function generateTodayWorkout({ ExerciseModel, conditionProfile, todayCheckin }) {
  if (!todayCheckin) {
    return {
      status: 'NEEDS_CHECKIN',
      message: 'Please complete your daily symptom check-in first so FitAdapt can calibrate a safe workout for you today.'
    };
  }

  const conditionType = conditionProfile ? conditionProfile.condition_type : 'other';
  const severity = conditionProfile ? conditionProfile.severity : 'mild';

  const { intensity, rationale } = decideIntensity(todayCheckin, severity);
  const exercises = await pickExercises(ExerciseModel, conditionType, intensity);

  let stateMessage = '';
  if (intensity === 'rest') {
    stateMessage = 'Today looks like a rest/recovery day — here are 2 gentle breathing/stretch options.';
  } else if (intensity === 'low') {
    stateMessage = `Today's calibrated routine: ${exercises.length} gentle, low-intensity condition-safe exercises.`;
  } else {
    stateMessage = `Today's calibrated routine: ${exercises.length} balanced moderate-intensity exercises.`;
  }

  return {
    status: 'READY',
    intensity,
    rationale,
    stateMessage,
    conditionType,
    severity,
    checkinSummary: {
      energy: todayCheckin.energy_level,
      pain: todayCheckin.pain_level,
      breathlessness: todayCheckin.breathlessness,
      flare: todayCheckin.flare_flag
    },
    exercises
  };
}

module.exports = {
  decideIntensity,
  pickExercises,
  generateTodayWorkout
};

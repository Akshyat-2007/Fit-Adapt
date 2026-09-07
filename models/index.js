const defineUser = require('./User');
const defineConditionProfile = require('./ConditionProfile');
const defineCheckin = require('./Checkin');
const defineExercise = require('./Exercise');
const defineSessionLog = require('./SessionLog');

// Persistent models object so destructured references retain mutated keys
const models = {};

function initModels(sequelize) {
  const User = defineUser(sequelize);
  const ConditionProfile = defineConditionProfile(sequelize);
  const Checkin = defineCheckin(sequelize);
  const Exercise = defineExercise(sequelize);
  const SessionLog = defineSessionLog(sequelize);

  // User <-> ConditionProfile
  User.hasOne(ConditionProfile, { foreignKey: 'user_id', as: 'conditionProfile', onDelete: 'CASCADE' });
  ConditionProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Checkin
  User.hasMany(Checkin, { foreignKey: 'user_id', as: 'checkins', onDelete: 'CASCADE' });
  Checkin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> SessionLog
  User.hasMany(SessionLog, { foreignKey: 'user_id', as: 'sessionLogs', onDelete: 'CASCADE' });
  SessionLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Checkin <-> SessionLog
  Checkin.hasOne(SessionLog, { foreignKey: 'checkin_id', as: 'sessionLog', onDelete: 'CASCADE' });
  SessionLog.belongsTo(Checkin, { foreignKey: 'checkin_id', as: 'checkin' });

  // Mutate persistent models object
  Object.assign(models, {
    User,
    ConditionProfile,
    Checkin,
    Exercise,
    SessionLog,
    sequelize
  });

  return models;
}

module.exports = {
  initModels,
  models
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('SessionLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exercise_ids: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'session_logs',
    timestamps: false
  });
};

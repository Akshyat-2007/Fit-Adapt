const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ConditionProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    condition_type: {
      type: DataTypes.ENUM('asthma', 'joint', 'pcos', 'postnatal', 'anxiety_fatigue', 'other'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('mild', 'moderate', 'significant'),
      defaultValue: 'mild'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'condition_profiles',
    timestamps: false
  });
};

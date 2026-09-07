const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Exercise', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    intensity: {
      type: DataTypes.ENUM('low', 'moderate', 'high'),
      allowNull: false
    },
    safe_for_asthma: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    safe_for_joint: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    safe_for_pcos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    safe_for_postnatal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    safe_for_anxiety_fatigue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    target_muscle: {
      type: DataTypes.STRING(100),
      defaultValue: 'Full Body'
    }
  }, {
    tableName: 'exercises',
    timestamps: false
  });
};

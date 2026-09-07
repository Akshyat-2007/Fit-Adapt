const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Checkin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkin_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    energy_level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    pain_level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 0, max: 5 }
    },
    breathlessness: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 0, max: 5 }
    },
    flare_flag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'checkins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};

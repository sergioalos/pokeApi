const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypeEffectiveness = sequelize.define('TypeEffectiveness', {
  attacker_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defender_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  multiplier: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0
  }
}, {
  tableName: 'type_effectiveness',
  timestamps: false
});

module.exports = TypeEffectiveness;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Team = require('./Team');

const Battle = sequelize.define('Battle', {
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'finished'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'battles',
  timestamps: true
});


module.exports = Battle;

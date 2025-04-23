const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Team = sequelize.define('Team', {
  name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'teams',
  timestamps: true
});


module.exports = Team;

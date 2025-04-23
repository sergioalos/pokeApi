const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Type = sequelize.define('Type', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'types',
  timestamps: false
});

module.exports = Type;

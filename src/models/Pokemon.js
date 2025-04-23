const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pokemon = sequelize.define('Pokemon', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image_url: {
    type: DataTypes.STRING,
  },
  base_experience: DataTypes.INTEGER,
  height: DataTypes.INTEGER,
  weight: DataTypes.INTEGER,
  hp: DataTypes.INTEGER,
  attack: DataTypes.INTEGER,
  defense: DataTypes.INTEGER,
  special_attack: DataTypes.INTEGER,
  special_defense: DataTypes.INTEGER,
  speed: DataTypes.INTEGER
}, {
  tableName: 'pokemons',
  timestamps: true
});

module.exports = Pokemon;

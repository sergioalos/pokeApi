const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Team = require('./Team');
const Pokemon = require('./Pokemon');

const TeamPokemon = sequelize.define('TeamPokemon', {
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'team_pokemons',
  timestamps: false
});

Team.belongsToMany(Pokemon, {
  through: TeamPokemon,
  foreignKey: 'team_id',
  otherKey: 'pokemon_id',
  as: 'pokemons'
});

Pokemon.belongsToMany(Team, {
  through: TeamPokemon,
  foreignKey: 'pokemon_id',
  otherKey: 'team_id',
  as: 'teams'
});

module.exports = TeamPokemon;

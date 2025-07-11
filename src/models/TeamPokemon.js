const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const TeamPokemon = sequelize.define('TeamPokemon', {
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'team_pokemons',
  timestamps: false
});
if (process.env.NODE_ENV !== 'test') {

const Team = require('./Team');
const Pokemon = require('./Pokemon');
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

}

module.exports = TeamPokemon;

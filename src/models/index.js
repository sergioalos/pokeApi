const sequelize = require('../config/database');

const User = require('./User');
const Team = require('./Team');
const Pokemon = require('./Pokemon');
const Type = require('./Type');
const TypeEffectiveness = require('./TypeEffectiveness');
const TeamPokemon = require('./TeamPokemon');
const Battle = require('./Battle');
const BattleRound = require('./BattleRound');
const TeamPokemonStatus = require('./TeamPokemonStatus');

// Relaciones
User.hasMany(Team, { foreignKey: 'user_id', as: 'teams' });
Team.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Pokemon.belongsToMany(Type, {
  through: 'pokemon_types',
  foreignKey: 'pokemon_id',
  otherKey: 'type_id',
  timestamps: false
});
Type.belongsToMany(Pokemon, {
  through: 'pokemon_types',
  foreignKey: 'type_id',
  otherKey: 'pokemon_id',
  timestamps: false
});

// Alias
Team.belongsToMany(Pokemon, {
  through: TeamPokemon,
  foreignKey: 'team_id',
  otherKey: 'pokemon_id',
  as: 'teamPokemons'
});
Pokemon.belongsToMany(Team, {
  through: TeamPokemon,
  foreignKey: 'pokemon_id',
  otherKey: 'team_id',
  as: 'pokemonTeams'
});

TeamPokemon.belongsTo(Pokemon, { foreignKey: 'pokemon_id', as: 'pokemonInfo' });

TypeEffectiveness.belongsTo(Type, {
  foreignKey: 'attacker_type_id',
  as: 'attackerType'
});
TypeEffectiveness.belongsTo(Type, {
  foreignKey: 'defender_type_id',
  as: 'defenderType'
});

// Relaciones para combates con alias
Battle.belongsTo(Team, { foreignKey: 'team1_id', as: 'team1' });
Battle.belongsTo(Team, { foreignKey: 'team2_id', as: 'team2' });
Battle.belongsTo(Team, { foreignKey: 'winner_team_id', as: 'winner_team' });

// Relación para historial de combates del usuario
Team.hasMany(Battle, { foreignKey: 'team1_id', as: 'battlesAsTeam1' });
Team.hasMany(Battle, { foreignKey: 'team2_id', as: 'battlesAsTeam2' });

module.exports = {
  sequelize,
  User,
  Team,
  Pokemon,
  Type,
  TypeEffectiveness,
  TeamPokemon,
  Battle,
  BattleRound,
  TeamPokemonStatus
};

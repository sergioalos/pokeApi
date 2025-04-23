const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Battle = require('./Battle');
const Pokemon = require('./Pokemon');

const BattleRound = sequelize.define('BattleRound', {
  round_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  winning_team_id: {  
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'battle_rounds',
  timestamps: true
});

BattleRound.belongsTo(Battle, { foreignKey: 'battle_id' });
BattleRound.belongsTo(Pokemon, { as: 'team1_pokemon', foreignKey: 'team1_pokemon_id' });
BattleRound.belongsTo(Pokemon, { as: 'team2_pokemon', foreignKey: 'team2_pokemon_id' });
BattleRound.belongsTo(Pokemon, { as: 'winner_pokemon', foreignKey: 'winner_pokemon_id' });

module.exports = BattleRound;

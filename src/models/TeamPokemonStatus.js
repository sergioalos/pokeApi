const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const TeamPokemonStatus = sequelize.define('TeamPokemonStatus', {
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_defeated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  position: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'team_pokemon_status',
  timestamps: false
});
if (process.env.NODE_ENV !== 'test') {
const Team = require('./Team');
const Battle = require('./Battle');
const Pokemon = require('./Pokemon');

TeamPokemonStatus.belongsTo(Battle, { foreignKey: 'battle_id' });
TeamPokemonStatus.belongsTo(Team, { foreignKey: 'team_id' });
TeamPokemonStatus.belongsTo(Pokemon, { foreignKey: 'pokemon_id' });
}

module.exports = TeamPokemonStatus;

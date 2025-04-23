const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const auth = require('../middleware/authMiddleware');
const Battle = require('../models/Battle');
const BattleRound = require('../models/BattleRound');
const Team = require('../models/Team');
const Pokemon = require('../models/Pokemon');
const TeamPokemon = require('../models/TeamPokemon');
const TeamPokemonStatus = require('../models/TeamPokemonStatus');
const User = require('../models/User');

// POST /battles - Iniciar combate (elige rival aleatorio)
router.post('/', auth, async (req, res) => {
  const { team1_id } = req.body;

  try {
    const team1 = await Team.findByPk(team1_id);

    if (!team1 || team1.user_id !== req.user.id) {
      return res.status(403).json({ message: 'No puedes usar un equipo que no sea tuyo' });
    }

    const team1Pokemons = await TeamPokemon.findAll({ where: { team_id: team1_id } });
    if (team1Pokemons.length !== 4) {
      return res.status(400).json({ message: 'Tu equipo debe tener exactamente 4 Pokémon' });
    }

    const validRivalTeams = await Team.findAll({
      where: {
        user_id: { [Op.ne]: req.user.id }
      },
      include: [{
        model: Pokemon,
        as: 'teamPokemons',
        through: { attributes: [] }
      }]
    });

    const rivalTeam = validRivalTeams.find(team => team.teamPokemons.length === 4);

    if (!rivalTeam) {
      return res.status(404).json({ message: 'No hay equipos rivales disponibles con 4 Pokémon' });
    }

    const battle = await Battle.create({
      team1_id: team1.id,
      team2_id: rivalTeam.id,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const team2Pokemons = await TeamPokemon.findAll({ where: { team_id: rivalTeam.id } });

    const statusEntries = [];

    team1Pokemons.forEach(p => {
      statusEntries.push({
        battle_id: battle.id,
        team_id: team1.id,
        pokemon_id: p.pokemon_id,
        position: p.position,
        is_active: false,
        is_defeated: false
      });
    });

    team2Pokemons.forEach(p => {
      statusEntries.push({
        battle_id: battle.id,
        team_id: rivalTeam.id,
        pokemon_id: p.pokemon_id,
        position: p.position,
        is_active: false,
        is_defeated: false
      });
    });

    await TeamPokemonStatus.bulkCreate(statusEntries);

    res.status(201).json({ message: 'Combate iniciado contra rival aleatorio', battle });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar el combate', error: err.message });
  }
});

// POST /battles/:id/rounds - Iniciar ronda
router.post('/:id/rounds', auth, async (req, res) => {
  const battleId = req.params.id;
  const { team1_pokemon_id, team2_pokemon_id } = req.body;

  try {
    const battle = await Battle.findByPk(battleId);
    if (!battle || battle.status !== 'in_progress') {
      return res.status(404).json({ message: 'Combate no encontrado o ya finalizado' });
    }

    const team1Pokemon = await Pokemon.findByPk(team1_pokemon_id);
    const team2Pokemon = await Pokemon.findByPk(team2_pokemon_id);

    if (!team1Pokemon || !team2Pokemon) {
      return res.status(404).json({ message: 'Pokémon no encontrado' });
    }

    const winnerPokemonId = await determineRoundWinner(team1Pokemon, team2Pokemon, battle);

    const lastRound = await BattleRound.findOne({
      where: { battle_id: battleId },
      order: [['round_number', 'DESC']]
    });
    const roundNumber = lastRound ? lastRound.round_number + 1 : 1;

    const winnerTeamId = await determineWinningTeamId(winnerPokemonId, battle);

    const round = await BattleRound.create({
      battle_id: battleId,
      team1_pokemon_id,
      team2_pokemon_id,
      winner_pokemon_id: winnerPokemonId,
      round_number: roundNumber,
      winning_team_id: winnerTeamId,
      timestamp: new Date()
    });

    if (await checkBattleOver(battleId)) {
      await battle.update({ status: 'finished', winner_team_id: winnerTeamId });
    }

    res.status(201).json({ message: 'Ronda de combate iniciada', round });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar la ronda', error: err.message });
  }
});

// GET /battles/my-history - Ver historial del usuario autenticado
router.get('/my-history', auth, async (req, res) => {
  try {
    const userTeams = await Team.findAll({
      where: { user_id: req.user.id },
      attributes: ['id']
    });

    const teamIds = userTeams.map(team => team.id);

    const battles = await Battle.findAll({
      where: {
        [Op.or]: [
          { team1_id: teamIds },
          { team2_id: teamIds }
        ]
      },
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name'] },
        { model: Team, as: 'team2', attributes: ['id', 'name'] },
        { model: Team, as: 'winner_team', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(battles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial de combates', error: err.message });
  }
});

// GET /battles/:id — Ver detalle de un combate
router.get('/:id', auth, async (req, res) => {
  const battleId = req.params.id;

  try {
    const battle = await Battle.findByPk(battleId, {
      include: [
        { model: Team, as: 'team1', include: [{ model: User, as: 'user', attributes: ['username'] }] },
        { model: Team, as: 'team2', include: [{ model: User, as: 'user', attributes: ['username'] }] },
        { model: Team, as: 'winner_team', attributes: ['id', 'name'] }
      ]
    });

    if (!battle) {
      return res.status(404).json({ message: 'Combate no encontrado' });
    }

    const rounds = await BattleRound.findAll({
      where: { battle_id: battleId },
      include: [
        { model: Pokemon, as: 'team1_pokemon', attributes: ['id', 'name'] },
        { model: Pokemon, as: 'team2_pokemon', attributes: ['id', 'name'] },
        { model: Pokemon, as: 'winner_pokemon', attributes: ['id', 'name'] }
      ],
      order: [['round_number', 'ASC']]
    });

    const pokemonStatus = await TeamPokemonStatus.findAll({
      where: { battle_id: battleId },
      include: [{ model: Pokemon, attributes: ['id', 'name'] }],
      order: [['team_id', 'ASC'], ['position', 'ASC']]
    });

    res.json({
      battle: {
        id: battle.id,
        status: battle.status,
        createdAt: battle.createdAt,
        winner_team: battle.winner_team,
        team1: {
          id: battle.team1.id,
          name: battle.team1.name,
          user: battle.team1.user?.username
        },
        team2: {
          id: battle.team2.id,
          name: battle.team2.name,
          user: battle.team2.user?.username
        },
        rounds: rounds.map(r => ({
          round_number: r.round_number,
          team1_pokemon: r.team1_pokemon,
          team2_pokemon: r.team2_pokemon,
          winner_pokemon: r.winner_pokemon,
          winning_team_id: r.winning_team_id
        })),
        pokemon_status: pokemonStatus.map(p => ({
          team_id: p.team_id,
          pokemon: p.Pokemon,
          is_active: p.is_active,
          is_defeated: p.is_defeated,
          position: p.position
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el detalle del combate', error: err.message });
  }
});

// Funciones auxiliares
async function determineRoundWinner(team1Pokemon, team2Pokemon, battle) {
  let winnerPokemonId;
  let loserPokemonId;

  if (team1Pokemon.id === team2Pokemon.id) {
    const random = Math.random() < 0.5;
    winnerPokemonId = random ? team1Pokemon.id : team2Pokemon.id;
    loserPokemonId = random ? team2Pokemon.id : team1Pokemon.id;
  } else if (team1Pokemon.attack > team2Pokemon.attack) {
    winnerPokemonId = team1Pokemon.id;
    loserPokemonId = team2Pokemon.id;
  } else {
    winnerPokemonId = team2Pokemon.id;
    loserPokemonId = team1Pokemon.id;
  }

  await TeamPokemonStatus.update(
    { is_defeated: true },
    {
      where: {
        battle_id: battle.id,
        pokemon_id: loserPokemonId
      }
    }
  );

  return winnerPokemonId;
}

async function determineWinningTeamId(pokemonId, battle) {
  const entry = await TeamPokemonStatus.findOne({
    where: {
      battle_id: battle.id,
      pokemon_id: pokemonId
    }
  });
  return entry ? entry.team_id : null;
}

async function checkBattleOver(battleId) {
  const battle = await Battle.findByPk(battleId);

  const team1 = await TeamPokemonStatus.findAll({ where: { battle_id: battleId, team_id: battle.team1_id } });
  const team2 = await TeamPokemonStatus.findAll({ where: { battle_id: battleId, team_id: battle.team2_id } });

  const team1Defeated = team1.every(p => p.is_defeated);
  const team2Defeated = team2.every(p => p.is_defeated);

  return team1Defeated || team2Defeated;
}

module.exports = router;

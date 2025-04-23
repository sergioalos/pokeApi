const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');
const { Op } = require('sequelize');

const User = require('../models/User');
const Battle = require('../models/Battle');
const Team = require('../models/Team');

// 📈 Ruta pública para ver estadísticas propias
router.get('/my-stats', auth, async (req, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: err.message });
  }
});

// 🔐 Ruta root para ver estadísticas de un usuario por su ID
router.get('/user/:id', auth, checkIsRoot, async (req, res) => {
  try {
    const stats = await getUserStats(req.params.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas de usuario', error: err.message });
  }
});

// 🏆 Ranking global
router.get('/ranking', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username'],
      include: [{
        model: Team,
        as: 'teams',
        attributes: ['id'],
        include: [
          {
            model: Battle,
            as: 'battlesAsTeam1', 
            attributes: ['id', 'winner_team_id']
          },
          {
            model: Battle,
            as: 'battlesAsTeam2', 
            attributes: ['id', 'winner_team_id']
          }
        ]
      }]
    });

    const ranking = users.map(user => {
      let battlesPlayed = 0;
      let battlesWon = 0;

      user.teams.forEach(team => {
        // Batallas como team1
        team.battlesAsTeam1.forEach(b => {
          battlesPlayed++;
          if (b.winner_team_id === team.id) battlesWon++;
        });

        // Batallas como team2
        team.battlesAsTeam2.forEach(b => {
          battlesPlayed++;
          if (b.winner_team_id === team.id) battlesWon++;
        });
      });

      return {
        user_id: user.id,
        username: user.username,
        battles_played: battlesPlayed,
        battles_won: battlesWon
      };
    });

    // Ordenar: más victorias, y en caso de empate, menos combates jugados
    ranking.sort((a, b) => {
      if (b.battles_won !== a.battles_won) return b.battles_won - a.battles_won;
      return a.battles_played - b.battles_played;
    });

    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ranking', error: err.message });
  }
});

// 📌 Función reutilizable para obtener estadísticas por usuario
async function getUserStats(userId) {
  const teams = await Team.findAll({ where: { user_id: userId } });
  const teamIds = teams.map(team => team.id);

  if (teamIds.length === 0) {
    return {
      user_id: userId,
      battles_played: 0,
      battles_won: 0,
      battles_lost: 0
    };
  }

  const battles = await Battle.findAll({
    where: {
      [Op.or]: [
        { team1_id: teamIds },
        { team2_id: teamIds }
      ]
    }
  });

  const battlesPlayed = battles.length;
  const battlesWon = battles.filter(b => teamIds.includes(b.winner_team_id)).length;
  const battlesLost = battlesPlayed - battlesWon;

  return {
    user_id: userId,
    battles_played: battlesPlayed,
    battles_won: battlesWon,
    battles_lost: battlesLost
  };
}

module.exports = router;

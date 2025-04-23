const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Team = require('../models/Team');
const Pokemon = require('../models/Pokemon');
const TeamPokemon = require('../models/TeamPokemon');

// POST /team-pokemons/:teamId - Asignar 4 Pokémon a un equipo
router.post('/:teamId', auth, async (req, res) => {
  const { teamId } = req.params;
  const { pokemonIds } = req.body; // array de 4 pokémon IDs

  if (!Array.isArray(pokemonIds) || pokemonIds.length !== 4) {
    return res.status(400).json({ message: 'Debes enviar exactamente 4 Pokémon' });
  }

  try {
    const team = await Team.findOne({ where: { id: teamId, user_id: req.user.id } });

    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado o no es tuyo' });
    }

    // Eliminar Pokémon anteriores (si los hay)
    await TeamPokemon.destroy({ where: { team_id: teamId } });

    // Asignar nuevos Pokémon
    const inserts = pokemonIds.map((pokemonId, index) => ({
      team_id: teamId,
      pokemon_id: pokemonId,
      position: index + 1
    }));

    await TeamPokemon.bulkCreate(inserts);

    res.status(201).json({ message: 'Pokémon asignados correctamente al equipo' });
  } catch (err) {
    res.status(500).json({ message: 'Error al asignar Pokémon', error: err.message });
  }
});

// GET /team-pokemons/:teamId - Ver los Pokémon de un equipo
router.get('/:teamId', auth, async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findOne({
      where: { id: teamId, user_id: req.user.id }
    });

    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado o no es tuyo' });
    }

    const pokemons = await TeamPokemon.findAll({
      where: { team_id: teamId },
      include: {
        model: Pokemon,
        as: 'pokemonInfo' 
      },
      order: [['position', 'ASC']]
    });

    const pokemonList = pokemons.map(tp => tp.pokemonInfo); 

    res.json({ team: team.name, pokemons: pokemonList });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los pokémon del equipo', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const auth = require('../middleware/authMiddleware');
const TeamPokemon = require('../models/TeamPokemon');
const Pokemon = require('../models/Pokemon');

// POST /teams - Crear un equipo (usuario autenticado)
router.post('/', auth, async (req, res) => {
  const { name } = req.body;

  try {
    const newTeam = await Team.create({
      name,
      user_id: req.user.id
    });

    res.status(201).json({
      message: 'Equipo creado correctamente',
      team: newTeam
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el equipo', error: err.message });
  }
});

// ✅ GET /teams/my - Ver los equipos del usuario autenticado
router.get('/my', auth, async (req, res) => {
  try {
    // Buscar los equipos
    const teams = await Team.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    // Si no se encuentran equipos, devolver un mensaje de error
    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: 'No tienes equipos creados' });
    }

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tus equipos', error: err.message });
  }
});
  // DELETE /teams/:id — eliminar equipo del usuario
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
  
    try {
      const team = await Team.findOne({ where: { id, user_id: req.user.id } });
  
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado o no es tuyo' });
      }
  
      // Eliminar relaciones en team_pokemons primero
      await TeamPokemon.destroy({ where: { team_id: id } });
  
      // Eliminar el equipo
      await team.destroy();
  
      res.json({ message: `Equipo "${team.name}" eliminado correctamente` });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el equipo', error: err.message });
    }
  });
  // PUT /teams/:id — editar nombre y pokemons del equipo
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { name, pokemonIds } = req.body;
  
    try {
      const team = await Team.findOne({ where: { id, user_id: req.user.id } });
  
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado o no es tuyo' });
      }
  
      // Actualizar nombre si se ha proporcionado
      if (name) {
        team.name = name;
        await team.save();
      }
  
      // Si vienen nuevos Pokémon, reemplazamos los anteriores
      if (Array.isArray(pokemonIds)) {
        if (pokemonIds.length !== 4) {
          return res.status(400).json({ message: 'Debes enviar exactamente 4 Pokémon' });
        }
  
        await TeamPokemon.destroy({ where: { team_id: team.id } });
  
        const inserts = pokemonIds.map((pokemonId, index) => ({
          team_id: team.id,
          pokemon_id: pokemonId,
          position: index + 1
        }));
  
        await TeamPokemon.bulkCreate(inserts);
      }
  
      res.json({ message: 'Equipo actualizado correctamente', team });
    } catch (err) {
      res.status(500).json({ message: 'Error al actualizar el equipo', error: err.message });
    }
  });

module.exports = router;

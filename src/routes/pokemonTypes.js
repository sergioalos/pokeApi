const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');
const Pokemon = require('../models/Pokemon');
const Type = require('../models/Type');

// POST /pokemon-types — Asignar tipos a un Pokémon (solo root)
router.post('/', auth, checkIsRoot, async (req, res) => {
  const { pokemon_id, type_ids } = req.body;

  if (!pokemon_id || !Array.isArray(type_ids) || type_ids.length === 0) {
    return res.status(400).json({ message: 'Debes enviar un pokemon_id y un array con uno o más type_ids' });
  }

  try {
    const pokemon = await Pokemon.findByPk(pokemon_id);
    if (!pokemon) return res.status(404).json({ message: 'Pokémon no encontrado' });

    await pokemon.setTypes(type_ids); // reemplaza todos los tipos actuales por los nuevos

    res.json({ message: 'Tipos asignados correctamente al Pokémon' });
  } catch (err) {
    res.status(500).json({ message: 'Error al asignar tipos', error: err.message });
  }
});

// GET /pokemons/:id/types — Ver tipos de un Pokémon
router.get('/pokemons/:id/types', async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id, {
      include: {
        model: Type,
        through: { attributes: [] } // no incluir datos de la tabla intermedia
      }
    });

    if (!pokemon) {
      return res.status(404).json({ message: 'Pokémon no encontrado' });
    }

    res.json({ pokemon: pokemon.name, types: pokemon.Types });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tipos del Pokémon', error: err.message });
  }
});

// DELETE /pokemon-types — Quitar un tipo de un Pokémon (solo root)
router.delete('/', auth, checkIsRoot, async (req, res) => {
  const { pokemon_id, type_id } = req.body;

  try {
    const pokemon = await Pokemon.findByPk(pokemon_id);
    if (!pokemon) return res.status(404).json({ message: 'Pokémon no encontrado' });

    await pokemon.removeType(type_id);

    res.json({ message: 'Tipo eliminado del Pokémon correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar tipo del Pokémon', error: err.message });
  }
});

module.exports = router;
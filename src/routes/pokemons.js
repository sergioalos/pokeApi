const express = require('express');
const router = express.Router();
const Pokemon = require('../models/Pokemon');
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');

// ✅ GET /pokemons — público
router.get('/', async (req, res) => {
  try {
    const pokemons = await Pokemon.findAll();
    res.json(pokemons);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener Pokémon', error: err.message });
  }
});

// ✅ GET /pokemons/:id — público
router.get('/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id);
    if (!pokemon) {
      return res.status(404).json({ message: 'Pokémon no encontrado' });
    }
    res.json(pokemon);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el Pokémon', error: err.message });
  }
});

// ✅ POST /pokemons — solo root
router.post('/', auth, checkIsRoot, async (req, res) => {
  try {
    const newPokemon = await Pokemon.create(req.body);
    res.status(201).json({ message: 'Pokémon creado correctamente', pokemon: newPokemon });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el Pokémon', error: err.message });
  }
});

// ✅ DELETE /pokemons/:id — solo root
router.delete('/:id', auth, checkIsRoot, async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id);
    if (!pokemon) {
      return res.status(404).json({ message: 'Pokémon no encontrado' });
    }

    await pokemon.destroy();
    res.json({ message: `Pokémon ${pokemon.name} eliminado correctamente` });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el Pokémon', error: err.message });
  }
});
// ✅ PUT /pokemons/:id — solo root
router.put('/:id', auth, checkIsRoot, async (req, res) => {
    try {
      const pokemon = await Pokemon.findByPk(req.params.id);
      if (!pokemon) {
        return res.status(404).json({ message: 'Pokémon no encontrado' });
      }
  
      await pokemon.update(req.body);
      res.json({ message: 'Pokémon actualizado correctamente', pokemon });
    } catch (err) {
      res.status(500).json({ message: 'Error al actualizar el Pokémon', error: err.message });
    }
  });

module.exports = router;

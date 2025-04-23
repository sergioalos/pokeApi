const express = require('express');
const router = express.Router();
const Type = require('../models/Type');
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');

// GET /types — pública
router.get('/', async (req, res) => {
  try {
    const types = await Type.findAll();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tipos', error: err.message });
  }
});

// GET /types/:id — pública
router.get('/:id', async (req, res) => {
  try {
    const type = await Type.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el tipo', error: err.message });
  }
});

// POST /types — solo root
router.post('/', auth, checkIsRoot, async (req, res) => {
  try {
    const newType = await Type.create(req.body);
    res.status(201).json({ message: 'Tipo creado correctamente', type: newType });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el tipo', error: err.message });
  }
});

// PUT /types/:id — solo root
router.put('/:id', auth, checkIsRoot, async (req, res) => {
  try {
    const type = await Type.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }

    await type.update(req.body);
    res.json({ message: 'Tipo actualizado correctamente', type });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el tipo', error: err.message });
  }
});

// DELETE /types/:id — solo root
router.delete('/:id', auth, checkIsRoot, async (req, res) => {
  try {
    const type = await Type.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }

    await type.destroy();
    res.json({ message: `Tipo "${type.name}" eliminado correctamente` });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el tipo', error: err.message });
  }
});

module.exports = router;

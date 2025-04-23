const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');
const TypeEffectiveness = require('../models/TypeEffectiveness');
const Type = require('../models/Type');

// ✅ GET /effectiveness — Pública
router.get('/', async (req, res) => {
  try {
    const effectiveness = await TypeEffectiveness.findAll({
      include: [
        { model: Type, as: 'attackerType' },
        { model: Type, as: 'defenderType' }
      ],
      order: [['attacker_type_id', 'ASC'], ['defender_type_id', 'ASC']]
    });
    res.json(effectiveness);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener efectividad', error: err.message });
  }
});

// ✅ POST /effectiveness — Solo root
router.post('/', auth, checkIsRoot, async (req, res) => {
  const { attacker_type_id, defender_type_id, multiplier } = req.body;

  try {
    const exists = await TypeEffectiveness.findOne({
      where: { attacker_type_id, defender_type_id }
    });

    if (exists) {
      return res.status(400).json({ message: 'Ya existe esta relación de efectividad' });
    }

    const newRelation = await TypeEffectiveness.create({ attacker_type_id, defender_type_id, multiplier });
    res.status(201).json({ message: 'Relación de efectividad creada', effectiveness: newRelation });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear relación', error: err.message });
  }
});

// ✅ PUT /effectiveness — Solo root
router.put('/', auth, checkIsRoot, async (req, res) => {
  const { attacker_type_id, defender_type_id, multiplier } = req.body;

  try {
    const relation = await TypeEffectiveness.findOne({
      where: { attacker_type_id, defender_type_id }
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    relation.multiplier = multiplier;
    await relation.save();

    res.json({ message: 'Relación actualizada correctamente', effectiveness: relation });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar relación', error: err.message });
  }
});

// ✅ DELETE /effectiveness — Solo root
router.delete('/', auth, checkIsRoot, async (req, res) => {
  const { attacker_type_id, defender_type_id } = req.body;

  try {
    const relation = await TypeEffectiveness.findOne({
      where: { attacker_type_id, defender_type_id }
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    await relation.destroy();
    res.json({ message: 'Relación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar relación', error: err.message });
  }
});

module.exports = router;

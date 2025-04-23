const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const Pokemon = require('../models/Pokemon');
const auth = require('../middleware/authMiddleware');
const checkIsRoot = require('../middleware/checkIsRoot');
const bcrypt = require('bcrypt');
const Battle = require('../models/Battle'); 
// ✅ GET /admin/users
router.get('/users', auth, checkIsRoot, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
});

// ✅ DELETE /admin/users/:id
router.delete('/users/:id', auth, checkIsRoot, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role === 'root') {
      return res.status(403).json({ message: 'No se puede eliminar un usuario root' });
    }

    await user.destroy();
    res.json({ message: `Usuario ${user.username} eliminado correctamente` });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
});

// ✅ PUT /admin/users/:id — editar un usuario (solo root)
router.put('/users/:id', auth, checkIsRoot, async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role === 'root' && role !== 'root') {
      return res.status(403).json({ message: 'No se puede degradar un usuario root' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password_hash = hash;
    }

    await user.save();

    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: err.message });
  }
});

// ✅ GET /admin/teams — listar todos los equipos de todos los usuarios (solo root)
router.get('/teams', auth, checkIsRoot, async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Pokemon,
          as: 'pokemons',
          through: { attributes: ['position'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener equipos', error: err.message });
  }
});
// GET /admin/battles - Listar todos los combates (root)
router.get('/battles', auth, checkIsRoot, async (req, res) => {
  try {
    const battles = await Battle.findAll({
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name'] },
        { model: Team, as: 'team2', attributes: ['id', 'name'] },
        { model: Team, as: 'winner_team', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(battles);
  } catch (err) {
    res.status(500).json({
      message: 'Error al obtener combates',
      error: err.message
    });
  }
});

module.exports = router;

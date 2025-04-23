const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password_hash });

    return res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser.username });
  } catch (err) {
    return res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ message: 'Login exitoso', token });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el login', error: err.message });
  }
});

module.exports = router;

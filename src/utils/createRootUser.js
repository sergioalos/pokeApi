const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createRootUser() {
  const existing = await User.findOne({ where: { email: 'root@pokeapi.com' } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('rootpassword', 10);

    await User.create({
      username: 'root',
      email: 'root@pokeapi.com',
      password_hash: passwordHash,
      role: 'root'
    });

    console.log('👑 Usuario root creado: root@pokeapi.com / rootpassword');
  } else {
    console.log('🔐 Usuario root ya existe');
  }
}

module.exports = createRootUser;

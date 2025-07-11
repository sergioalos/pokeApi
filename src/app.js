// src/app.js
const express = require('express');
const { sequelize } = require('./models');
const createRootUser = require('./utils/createRootUser');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teamRoutes = require('./routes/teams');
const teamPokemonsRoutes = require('./routes/teamPokemons');
const pokemonRoutes = require('./routes/pokemons');
const typeRoutes = require('./routes/types');
const effectivenessRoutes = require('./routes/effectiveness');
const pokemonTypesRoutes = require('./routes/pokemonTypes');
const battleRoutes = require('./routes/battles');
const statsRoutes = require('./routes/stats');
// FIN Rutas

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas 
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teams', teamRoutes);
app.use('/team-pokemons', teamPokemonsRoutes);
app.use('/pokemons', pokemonRoutes);
app.use('/types', typeRoutes);
app.use('/effectiveness', effectivenessRoutes);
app.use('/', pokemonTypesRoutes); // puedes usar otro prefijo si quieres
app.use('/battles', battleRoutes);
app.use('/stats', statsRoutes);
// FIN Rutas 

// Ruta base
app.get('/', (req, res) => {
  res.send('¡PokéAPI funcionando!');
});

// Conexión y sincronización con la base de datos
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conectado correctamente a la base de datos');
      return sequelize.sync({ alter: true });
    })
    .then(() => {
      console.log('📦 Modelos sincronizados correctamente');
      return createRootUser();
    })
    .then(() => {
      console.log('👑 Usuario root verificado');
    })
    .catch((err) => {
      console.error('❌ Error al iniciar:', err);
    });
}
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;

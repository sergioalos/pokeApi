const request = require('supertest');
const app = require('../app');

// Mock modelos
const Team = require('../models/Team');
const TeamPokemon = require('../models/TeamPokemon');
const Battle = require('../models/Battle');
const TeamPokemonStatus = require('../models/TeamPokemonStatus');
const Pokemon = require('../models/Pokemon');

// Mock de middleware de autenticación
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, username: 'usuarioTest' };
  next();
});

// Mocks individuales
jest.mock('../models/Team', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn()
}));

jest.mock('../models/TeamPokemon', () => ({
  findAll: jest.fn()
}));

jest.mock('../models/Battle', () => ({
  create: jest.fn()
}));

jest.mock('../models/TeamPokemonStatus', () => ({
  bulkCreate: jest.fn()
}));

describe('POST /battles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('✅ debería iniciar un combate exitosamente', async () => {
    const team1_id = 10;

    // Simular que el equipo pertenece al usuario
    Team.findByPk.mockResolvedValue({ id: team1_id, user_id: 1 });

    // Simular que el equipo tiene 4 pokémon
    const team1Pokemons = [
      { pokemon_id: 1, position: 1 },
      { pokemon_id: 2, position: 2 },
      { pokemon_id: 3, position: 3 },
      { pokemon_id: 4, position: 4 }
    ];
    TeamPokemon.findAll
      .mockResolvedValueOnce(team1Pokemons) // Para team1
      .mockResolvedValueOnce(team1Pokemons); // Para team2 (rival)

    // Simular rival con 4 Pokémon
    Team.findAll.mockResolvedValue([
      {
        id: 20,
        user_id: 2,
        teamPokemons: [{}, {}, {}, {}] // solo interesa length
      }
    ]);

    // Simular creación de combate
    Battle.create.mockResolvedValue({ id: 123, team1_id, team2_id: 20 });

    // Simular inserción de estados
    TeamPokemonStatus.bulkCreate.mockResolvedValue([]);

    const res = await request(app)
      .post('/battles')
      .send({ team1_id });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Combate iniciado contra rival aleatorio');
    expect(res.body.battle).toHaveProperty('id', 123);
    expect(Battle.create).toHaveBeenCalled();
    expect(TeamPokemonStatus.bulkCreate).toHaveBeenCalled();
  });
});

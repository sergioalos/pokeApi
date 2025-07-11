const request = require('supertest');
const app = require('../app');
const Pokemon = require('../models/Pokemon');

// Mock del modelo
jest.mock('../models/Pokemon', () => ({
  findAll: jest.fn()
}));

describe('GET /pokemons', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('✅ debería devolver una lista de Pokémon', async () => {
    const mockPokemons = [
      { id: 1, name: 'Bulbasaur', attack: 49, defense: 49 },
      { id: 2, name: 'Charmander', attack: 52, defense: 43 }
    ];

    Pokemon.findAll.mockResolvedValue(mockPokemons);

    const res = await request(app).get('/pokemons');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name', 'Bulbasaur');
    expect(Pokemon.findAll).toHaveBeenCalled();
  });

  it('❌ debería devolver 500 si ocurre un error en la consulta', async () => {
    Pokemon.findAll.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/pokemons');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener Pokémon');
    expect(res.body).toHaveProperty('error');
  });
});

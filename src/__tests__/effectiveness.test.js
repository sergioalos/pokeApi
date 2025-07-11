const request = require('supertest');
const app = require('../app');
const TypeEffectiveness = require('../models/TypeEffectiveness');

// Mock del modelo TypeEffectiveness
jest.mock('../models/TypeEffectiveness', () => ({
  findAll: jest.fn()
}));

describe('GET /effectiveness', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('✅ debería devolver una lista de relaciones de efectividad', async () => {
    const mockData = [
      {
        attacker_type_id: 1,
        defender_type_id: 2,
        multiplier: 2,
        attackerType: { id: 1, name: 'Fuego' },
        defenderType: { id: 2, name: 'Planta' }
      },
      {
        attacker_type_id: 3,
        defender_type_id: 4,
        multiplier: 0.5,
        attackerType: { id: 3, name: 'Agua' },
        defenderType: { id: 4, name: 'Fuego' }
      }
    ];

    TypeEffectiveness.findAll.mockResolvedValue(mockData);

    const res = await request(app).get('/effectiveness');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('multiplier', 2);
    expect(res.body[0].attackerType.name).toBe('Fuego');
  });

  it('❌ debería devolver 500 si ocurre un error al obtener efectividad', async () => {
    TypeEffectiveness.findAll.mockRejectedValue(new Error('Fallo DB'));

    const res = await request(app).get('/effectiveness');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener efectividad');
    expect(res.body).toHaveProperty('error');
  });
});

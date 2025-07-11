const request = require('supertest');
const app = require('../app'); // tu app Express
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Mock de User y bcrypt
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}));

describe('POST /auth/register', () => {
  const endpoint = '/auth/register';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('✅ debería registrar un usuario correctamente', async () => {
    const mockUser = { username: 'AshKetchum', email: 'ash@pokeapi.com', password: 'pikachu' };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    User.create.mockResolvedValue({ username: mockUser.username });

    const res = await request(app)
      .post(endpoint)
      .send(mockUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: 'Usuario registrado correctamente',
      user: mockUser.username
    });

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    expect(User.create).toHaveBeenCalledWith({
      username: mockUser.username,
      email: mockUser.email,
      password_hash: 'hashedPassword123'
    });
  });

  it('⚠️ debería devolver 409 si el email ya está registrado', async () => {
    User.findOne.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post(endpoint)
      .send({ username: 'Ash', email: 'ash@pokeapi.com', password: 'pikachu' });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'El email ya está registrado');
  });

  it('❌ debería devolver 500 si ocurre un error inesperado', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post(endpoint)
      .send({ username: 'Ash', email: 'ash@pokeapi.com', password: 'pikachu' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al registrar usuario');
    expect(res.body).toHaveProperty('error');
  });
});

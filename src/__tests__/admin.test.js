const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// Mockear middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, username: 'rootUser', role: 'root' }; // simulamos usuario root
  next();
});

jest.mock('../middleware/checkIsRoot', () => (req, res, next) => {
  if (req.user?.role !== 'root') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
});

// Mockear método User.findAll
jest.mock('../models/User', () => ({
  findAll: jest.fn(),
}));

describe('GET /admin/users', () => {
  it('debería devolver una lista de usuarios', async () => {
    // Datos de prueba
    const mockUsers = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'root', createdAt: '2024-01-01' },
      { id: 2, username: 'usuario', email: 'usuario@example.com', role: 'user', createdAt: '2024-01-02' }
    ];

    // Configurar mock
    User.findAll.mockResolvedValue(mockUsers);

    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', 'Bearer fake-token'); // no se usa realmente porque mockeamos auth

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('username', 'admin');
    expect(res.body[1]).toHaveProperty('email', 'usuario@example.com');
  });

  it('debería devolver error 500 si falla User.findAll', async () => {
    User.findAll.mockRejectedValue(new Error('Fallo en DB'));

    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', 'Bearer fake-token');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener usuarios');
    expect(res.body).toHaveProperty('error');
  });
});

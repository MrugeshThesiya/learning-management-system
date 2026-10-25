const request = require('supertest');
const app = require('../src/index');

describe('auth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com', full_name: 'A', password: 'pass123' });
    expect(res.status).toBe(201);
  });
  it('logs in', async () => {
    await request(app).post('/auth/register').send({ email: 'b@b.com', full_name: 'B', password: 'pass123' });
    const res = await request(app).post('/auth/login').send({ email: 'b@b.com', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
  });
});

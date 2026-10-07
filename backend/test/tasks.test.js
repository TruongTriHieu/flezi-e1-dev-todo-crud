process.env.NODE_ENV = 'test';

const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

async function loginAs(userId) {
  const res = await request(app).post('/dev-login').send({ userId });
  return res.body.token;
}

describe('Task CRUD API', () => {
  let tokenA;
  let tokenB;

  beforeAll(async () => {
    tokenA = await loginAs('user-a');
    tokenB = await loginAs('user-b');
  });

  // Scenario 1: empty/whitespace title -> 400
  test('rejects creating a task with a whitespace-only title', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.fields.title).toBeDefined();
  });

  test('creates a task and returns 201 with the created resource', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Write report', description: 'Q3 summary' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write report');
    expect(res.body.status).toBe('open');
    expect(res.body.id).toBeDefined();
  });

  // Scenario 2: cross-owner access denied
  test('denies another user from updating or deleting someone else\'s task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Owned by A' });

    const taskId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hijacked' });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(deleteRes.status).toBe(403);
  });

  // Scenario 3: toggle status open -> done -> open
  test('toggles a task status between open and done', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Toggle me' });
    const taskId = createRes.body.id;

    const toDone = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'done' });
    expect(toDone.status).toBe(200);
    expect(toDone.body.status).toBe('done');

    const toOpen = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'open' });
    expect(toOpen.status).toBe(200);
    expect(toOpen.body.status).toBe('open');
  });

  // Scenario 4: non-existent task ID -> 404
  test('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app)
      .delete('/tasks/does-not-exist')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });

  test('returns 404 when updating a non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/does-not-exist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'anything' });
    expect(res.status).toBe(404);
  });

  // Scenario 5: filter by status returns only matching tasks
  test('lists only tasks matching the requested status filter', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Filter open task' });

    const doneSeed = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Filter done task' });
    await request(app)
      .put(`/tasks/${doneSeed.body.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'done' });

    const openList = await request(app)
      .get('/tasks?status=open')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(openList.status).toBe(200);
    expect(openList.body.items.every((t) => t.status === 'open')).toBe(true);
    expect(openList.body.items.some((t) => t.id === doneSeed.body.id)).toBe(false);
  });

  test('rejects requests without a valid auth token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  test('each user only sees their own tasks', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'B-only task' });

    const listA = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(listA.body.items.every((t) => t.ownerId === 'user-a')).toBe(true);
  });
});

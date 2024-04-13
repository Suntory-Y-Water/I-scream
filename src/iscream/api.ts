import { Hono } from 'hono';
import { Bindings, Iscream } from '../types';
import {
  getIscream,
  createIscream,
  newIscream,
  getAllIscream,
  deleteIscream,
  getIscreamById,
} from './model';

const iscream = new Hono<{ Bindings: Bindings }>();

iscream.get('/', async (c) => {
  const iscream = await getIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

iscream.get('/all', async (c) => {
  const iscream = await getAllIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

iscream.post('/', async (c) => {
  const params = await c.req.json<Iscream[]>();
  const newIscream = await createIscream(c.env.HONO_ISCREAM, params);
  return c.json(newIscream, 201);
});

iscream.get('/new', async (c) => {
  const iscream = await newIscream();
  return c.json(iscream);
});

iscream.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const iscream = await getIscreamById(c.env.HONO_ISCREAM, id);
  if (!iscream) {
    return c.json({ message: 'Not found' }, 404);
  }

  await deleteIscream(c.env.HONO_ISCREAM, id);
  return new Response(null, { status: 204 });
});

export { iscream };

import { MessageAPIResponseBase, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Bindings, Iscream } from '../types';
import {
  getIscream,
  createIscream,
  newIscream,
  getAllIscream,
  deleteIscream,
  getIscreamById,
  deleteAllIscream,
} from './model';

const router = new Hono<{ Bindings: Bindings }>();
router.use(logger());

router.get('/', async (c) => {
  const iscream = await getIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

router.get('/all', async (c) => {
  const iscream = await getAllIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

router.post('/', async (c) => {
  const params = await c.req.json<Iscream[]>();
  const newIscream = await createIscream(c.env.HONO_ISCREAM, params);
  return c.json(newIscream, 201);
});

router.get('/new', async (c) => {
  const iscream = await newIscream();
  return c.json(iscream);
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const iscream = await getIscreamById(c.env.HONO_ISCREAM, id);
  if (!iscream) {
    return c.json({ message: 'Not found' }, 404);
  }

  await deleteIscream(c.env.HONO_ISCREAM, id);
  return new Response(null, { status: 204 });
});

router.delete('/', async (c) => {
  await deleteAllIscream(c.env.HONO_ISCREAM);
  return new Response(null, { status: 204 });
});

router.post('/test', async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;
  const accessToken: string = c.env.CHANNEL_ACCESS_TOKEN;
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(event, accessToken);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
        return c.json({
          status: 'error',
        });
      }
    }),
  );
  return c.json({ message: 'ok' });
});

const textEventHandler = async (
  event: WebhookEvent,
  accessToken: string,
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;
  const response: TextMessage = {
    type: 'text',
    text,
  };
  await fetch('https://api.line.me/v2/bot/message/reply', {
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [response],
    }),
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

export { router };

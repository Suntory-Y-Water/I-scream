import { FlexMessage, MessageAPIResponseBase, WebhookEvent } from '@line/bot-sdk';
import { Hono } from 'hono';
import { Bindings, Iscream } from './types';
import { getIscream, createIscream, newIscream, deleteAllIscream } from './model';

const router = new Hono<{ Bindings: Bindings }>();

// アイスクリームの情報をランダムで1件取得する
router.get('/', async (c) => {
  const iscream = await getIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

// アイスクリームの情報を登録する。
router.post('/', async (c) => {
  const params = await c.req.json<Iscream[]>();
  const isCreate = await createIscream(c.env.HONO_ISCREAM, params);
  if (!isCreate) {
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 201 });
});

// 最新のアイスクリーム情報を取得する。
router.get('/new', async (c) => {
  const iscream = await newIscream();
  return c.json(iscream);
});

// アイスクリームの情報を全件削除する。
router.delete('/', async (c) => {
  await deleteAllIscream(c.env.HONO_ISCREAM);
  return new Response(null, { status: 204 });
});

// Webhookのエンドポイント
router.post('/webhook', async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;
  const accessToken: string = c.env.CHANNEL_ACCESS_TOKEN;
  const nameSpace = c.env.HONO_ISCREAM;

  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(event, accessToken, nameSpace);
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
  return c.json({ message: 'ok' }, 200);
});

const textEventHandler = async (
  event: WebhookEvent,
  accessToken: string,
  KVNamespace: KVNamespace,
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  if (event.message.text !== '今日のアイスクリーム') {
    return;
  }

  // アイスクリームの情報をランダムで取得
  const iscream = await getIscream(KVNamespace);

  const { replyToken } = event;
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: 'アイスクリーム情報',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [],
      },
      hero: {
        type: 'image',
        url: iscream.itemImage,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: iscream.itemName,
            weight: 'bold',
            size: 'xl',
            wrap: true,
            color: '#333333',
          },
          {
            type: 'text',
            text: iscream.itemPrice,
            weight: 'regular',
            size: 'md',
            color: '#333333',
          },
        ],
      },
    },
  };

  await fetch('https://api.line.me/v2/bot/message/reply', {
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [flexMessage],
    }),
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    console.log(`LINE API error: ${err}`);
    return null;
  });
};

export { router };

import { WebhookEvent } from '@line/bot-sdk';
import { Hono } from 'hono';
import { Bindings } from './types';
import { getIscream } from './model';

const router = new Hono<{ Bindings: Bindings }>();

// アイスクリームの情報をランダムで1件取得する
router.get('/', async (c) => {
  const iscream = await getIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
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
): Promise<void> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const { replyToken } = event;
  const receivedText = event.message.text;
  let messages = [];

  if (receivedText === '今日のアイスクリーム') {
    const iscream = await getIscream(KVNamespace);
    messages.push({
      type: 'flex',
      altText: 'アイスクリーム情報',
      contents: {
        type: 'bubble',
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
    });
  } else {
    messages.push({
      type: 'text',
      text: '「今日のアイスクリーム」と送信すると、アイスクリームの情報をお届けします！🍨',
    });
  }

  // メッセージをLINE APIを通じて送信
  await sendMessage(replyToken, messages, accessToken);
};

// LINE APIにメッセージを送信する共通関数
async function sendMessage(replyToken: string, messages: Array<any>, accessToken: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  }).catch((err) => console.error('LINE API error:', err));
}

export { router };

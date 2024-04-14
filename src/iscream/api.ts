import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Bindings, Iscream } from '../types';
import { getIscream, createIscream, newIscream, getAllIscream, deleteAllIscream } from './model';

const router = new Hono<{ Bindings: Bindings }>();
router.use(logger());

// アイスクリームの情報をランダムで1件取得する
router.get('/', async (c) => {
  const iscream = await getIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

// アイスクリームの情報を全件取得する
router.get('/all', async (c) => {
  const iscream = await getAllIscream(c.env.HONO_ISCREAM);
  return c.json(iscream);
});

// アイスクリームの情報を登録する。
router.post('/', async (c) => {
  const params = await c.req.json<Iscream[]>();
  const newIscream = await createIscream(c.env.HONO_ISCREAM, params);
  return c.json(newIscream, 201);
});

// 最新のアイスクリーム情報を取得する。
router.get('/new', async (c) => {
  const iscream = await newIscream();
  return c.json(iscream);
});

// 保守用のエンドポイント: アイスクリームの情報を全件削除する。
// TODO: 認証認可はデプロイ前に設定すること
router.delete('/', async (c) => {
  await deleteAllIscream(c.env.HONO_ISCREAM);
  return new Response(null, { status: 204 });
});

export { router };

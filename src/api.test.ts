import { Iscream, PREFIX } from './types';
import { router as app } from './api';
import { createIscream, deleteAllIscream, newIscream } from './model';

const env = getMiniflareBindings();

const seed = async () => {
  const iscreamList: Iscream[] = [
    {
      id: 'uuid1',
      itemName: '森永　パルム　チョコレート',
      itemPrice: '160円（税込172.80円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
    },
  ];
  for (const iscream of iscreamList) {
    await env.HONO_ISCREAM.put(`${PREFIX}${iscream.id}`, JSON.stringify(iscream));
  }
};

describe('アイスクリーム情報を登録するAPI', () => {
  beforeEach(() => {
    seed();
  });

  test('アイスクリーム情報を取得する', async () => {
    const res = await app.fetch(new Request('http://localhost'), env);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      id: 'uuid1',
      itemName: '森永　パルム　チョコレート',
      itemPrice: '160円（税込172.80円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
    });
  });

  test('アイスクリーム情報を登録する', async () => {
    const newIscream: Iscream[] = [
      {
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
      {
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
    ];
    const res = await createIscream(env.HONO_ISCREAM, newIscream);
    expect(res).toBe(true);
  });

  test('アイスクリームの削除処理が正常処理が正常終了するか', async () => {
    // 正常処理
    const res1 = await deleteAllIscream(env.HONO_ISCREAM);
    expect(res1).toBe(true);
  });

  test('全てのアイスクリームを削除して、データが取得できないか確認', async () => {
    const deleteKV = await deleteAllIscream(env.HONO_ISCREAM);
    expect(deleteKV).toBe(true);

    const getIscreamData = await app.fetch(new Request('http://localhost'), env);
    expect(getIscreamData.status).toBe(500);
  });

  test('アイスクリームを削除して登録後、ランダムで取得できるか', async () => {
    const deleteKV = await deleteAllIscream(env.HONO_ISCREAM);
    expect(deleteKV).toBe(true);

    const newIscream: Iscream[] = [
      {
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
    ];
    const postsIscream = await createIscream(env.HONO_ISCREAM, newIscream);
    expect(postsIscream).toBe(true);

    const response = await app.fetch(new Request('http://localhost'), env);
    expect(response.status).toBe(200);

    const body = (await response.json()) as Iscream;

    expect(body).toEqual({
      id: body.id,
      itemName: '森永　パルム　チョコレート',
      itemPrice: '160円（税込172.80円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
    });
  });

  test('最新のアイスクリーム情報を取得後、元のKVを削除してから登録する。', async () => {
    const deleteKV = await deleteAllIscream(env.HONO_ISCREAM);
    expect(deleteKV).toBe(true);

    // 最新のアイスクリーム情報を取得
    const newIscreamData = await newIscream();
    expect(newIscreamData).not.toBeNull();

    const res = await createIscream(env.HONO_ISCREAM, newIscreamData);
    expect(res).toBe(true);
  });
});

import { Iscream, PREFIX } from './types';
import { router as app } from './api';

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
        id: 'uuid2',
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
      {
        id: 'uuid3',
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
    ];
    const res = await app.fetch(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIscream),
      }),
      env,
    );
    expect(res.status).toBe(201);
  });

  test('全てのアイスクリームを削除して、データが取得できないか確認', async () => {
    const res1 = await app.fetch(
      new Request('http://localhost', {
        method: 'DELETE',
      }),
      env,
    );
    expect(res1.status).toBe(204);

    const res2 = await app.fetch(new Request('http://localhost'), env);
    expect(res2.status).toBe(500);
  });

  test('アイスクリームを削除して登録後、ランダムで取得できるか', async () => {
    const res1 = await app.fetch(
      new Request('http://localhost', {
        method: 'DELETE',
      }),
      env,
    );
    expect(res1.status).toBe(204);

    const newIscream: Iscream[] = [
      {
        itemName: '森永　パルム　チョコレート',
        itemPrice: '160円（税込172.80円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
      },
    ];
    const res2 = await app.fetch(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIscream),
      }),
      env,
    );
    expect(res2.status).toBe(201);

    const res3 = await app.fetch(new Request('http://localhost'), env);
    expect(res3.status).toBe(200);

    const body = (await res3.json()) as Iscream;

    expect(body).toEqual({
      id: body.id,
      itemName: '森永　パルム　チョコレート',
      itemPrice: '160円（税込172.80円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg',
    });
  });

  test('最新のアイスクリーム情報を取得後、元のKVを削除してから登録する。', async () => {
    // 最新のアイスクリーム情報を取得
    const res = await app.fetch(new Request('http://localhost/new'), env);
    const resBody = (await res.json()) as Iscream[];
    expect(res.status).toBe(200);

    // 既に作成済みのKVを削除
    const deleteResponse = await app.fetch(
      new Request('http://localhost', {
        method: 'DELETE',
      }),
      env,
    );
    expect(deleteResponse.status).toBe(204);

    // 最新のアイスクリーム情報を登録
    const createResponse = await app.fetch(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resBody),
      }),
      env,
    );
    expect(createResponse.status).toBe(201);
  });
});

# 障害発生

以下の事象が発生しています。

- 先ほどと同様に余計な`\`と`"`が入っている

```json
"[{\"itemImage\":\"https://img.7api-01.dp1.sej.co.jp/item-image/450160/9111EA038EC6FE2A8452060E1DF3D403.jpg\",\"itemName\":\"フタバ食品　サクレＷメロン\",\"itemPrice\":\"150円（税込162円）\"},{\"itemImage\":\"https://img.7api-01.dp1.sej.co.jp/item-image/450286/A1A70222ECD677E4F5B0850355513D02.jpg\",\"itemName\":\"赤城　大人なガリガリ君　まる搾り白桃\",\"itemPrice\":\"120円（税込129.60円）\"},{\"itemImage\":\"https://img.7api-01.dp1.sej.co.jp/item-image/450222/4E50D323C879BF15B9A4CA43C669E52C.jpg\",\"itemName\":\"森永　パルム　杏仁ミルクストロベリー\",\"itemPrice\":\"160円（税込172.80円）\"},{\"itemImage\":\"https://img.7api-01.dp1.sej.co.jp/item-image/450301/A3DB40EBBCC299F0BE893BF545FC31EE.jpg\"
```

# あるべき姿

```json
[
  {
    "itemName": "森永　パルム　チョコレート",
    "itemPrice": "160円（税込172.80円）",
    "itemImage": "https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg"
  },
  {
    "itemName": "森永　パルム　チョコレート",
    "itemPrice": "160円（税込172.80円）",
    "itemImage": "https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg"
  }
]
```

# ルールの追加

- TypeScript なので型定義を忘れないでください
  - 型は既にインポート済みです。
- コメントは必ず日本語で書いてください

```ts
/**
 * @example { id: 'uuid', itemName: '森永　パルム　チョコレート', itemPrice: '160円（税込172.80円）', itemImage: 'https://img.7api-01.dp1.sej.co.jp/item-image/450390/09C2FFA85EAEA2B4A6F374EA2CC1727F.jpg'}
 * @description アイスクリームの情報を提供する型
 * @interface Iscream
 */
export interface Iscream {
  id?: string;
  itemName: string;
  itemPrice: string;
  itemImage: string;
}

export type Bindings = {
  HONO_ISCREAM: KVNamespace;
};

export const PREFIX = 'v1:iscream:';
```

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
  CHANNEL_ACCESS_TOKEN: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}

export const PREFIX = 'v1:iscream:';

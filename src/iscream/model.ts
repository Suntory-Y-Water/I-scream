import { Iscream, PREFIX } from '../types';

/**
 *
 * @description アイスクリームの情報をランダムで取得する
 */
export const getIscream = async (KV: KVNamespace): Promise<Iscream> => {
  const list = await KV.list({ prefix: PREFIX });

  if (list.keys.length === 0) {
    throw new Error('No ice creams found');
  }

  // リストからランダムにキーを選択
  const randomIndex = Math.floor(Math.random() * list.keys.length);
  const randomKey = list.keys[randomIndex];

  // ランダムに選んだキーに対応するアイスクリームのデータを取得
  const iscream: Iscream | null = await KV.get<Iscream>(randomKey.name, 'json');

  if (!iscream) {
    throw new Error('Failed to retrieve the ice cream');
  }

  return iscream;
};

/**
 *
 * @description 指定したIDと一致するアイスクリームの情報を取得する
 */
export const getIscreamById = (KV: KVNamespace, id: string): Promise<Iscream | null> => {
  return KV.get<Iscream>(`${PREFIX}${id}`, 'json');
};

/**
 *
 * @description 保存されている全てのアイスクリームの情報を取得する
 * @param {KVNamespace} KV
 * @return {*}  {Promise<Iscream[]>}
 */
export const getAllIscream = async (KV: KVNamespace): Promise<Iscream[]> => {
  const list = await KV.list({ prefix: PREFIX });
  const iscreamList: Iscream[] = [];

  for (const key of list.keys) {
    const value = await KV.get<Iscream>(key.name, 'json');
    if (value) {
      iscreamList.push(value);
    }
  }
  return iscreamList;
};

/**
 *
 * @description 新しいアイスクリームの情報を追加する
 * @param {KVNamespace} KV
 * @param {Iscream[]} params
 * @return {*}
 */
export const createIscream = async (KV: KVNamespace, params: Iscream[]) => {
  const newIscream: Iscream[] = params.map((param) => ({
    id: crypto.randomUUID(),
    itemName: param.itemName,
    itemPrice: param.itemPrice,
    itemImage: param.itemImage,
  }));

  await KV.put(`${PREFIX}`, JSON.stringify(newIscream));

  return newIscream;
};

/**
 *
 * @description セブンイレブンの公式ホームページから、関東地方で販売しているアイスクリームの情報を取得する
 * @return {*}  {Promise<Iscream[]>}
 */
export const newIscream = async (): Promise<Iscream[]> => {
  const response = await fetch(
    'https://www.sej.co.jp/products/a/cat/060020010000000/kanto/1/l100/',
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    },
  );

  if (!response.ok) {
    throw new Error('データの取得に失敗しました');
  }

  const results: Iscream[] = [];
  let currentProduct: Iscream = { itemName: '', itemPrice: '', itemImage: '' };

  const rewriter = new HTMLRewriter()
    .on('.list_inner', {
      element() {
        // 新しい商品ブロックが開始するタイミングで現在の商品を保存
        if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
          results.push(currentProduct);
          currentProduct = { itemName: '', itemPrice: '', itemImage: '' };
        }
      },
    })
    .on('.list_inner .item_ttl a', {
      text(text) {
        // テキストが分割されている場合を考慮して連結する
        currentProduct.itemName += text.text.trim();
      },
    })
    .on('.list_inner .item_price p', {
      text(text) {
        // テキストが分割されている場合を考慮して連結する
        currentProduct.itemPrice += text.text.trim();
      },
    })
    .on('.list_inner figure a img', {
      element(element) {
        const imgSrc = element.getAttribute('data-original');
        if (imgSrc) {
          currentProduct.itemImage = imgSrc;
        }
      },
    });
  // HTMLの書き換えを確実に完了させる
  await rewriter.transform(response).arrayBuffer();

  // 最後の商品が保存されていない場合はここで保存
  if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
    results.push(currentProduct);
  }

  // JSON形式で結果を返す
  return results;
};

/**
 *
 * @description 指定したIDと一致するアイスクリームの情報を削除する
 * @param {KVNamespace} KV
 * @param {string} id
 * @return {*}
 */
export const deleteIscream = async (KV: KVNamespace, id: string) => {
  return KV.delete(`${PREFIX}${id}`);
};

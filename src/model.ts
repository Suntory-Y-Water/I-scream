import { Iscream, PREFIX } from './types';

/**
 *
 * @description アイスクリームの情報をランダムで取得する
 */
export const getIscream = async (KV: KVNamespace): Promise<Iscream> => {
  const list = await KV.list({ prefix: PREFIX });

  if (list.keys.length === 0) {
    throw new Error('アイスクリームが一個もないよ！😭');
  }

  // リストからランダムにキーを選択
  const randomIndex = Math.floor(Math.random() * list.keys.length);
  const randomKey = list.keys[randomIndex];

  // ランダムに選んだキーに対応するアイスクリームのデータを取得
  const iscream: Iscream | null = await KV.get<Iscream>(randomKey.name, 'json');

  if (!iscream) {
    throw new Error('そんなアイスクリームはないよ！😭');
  }

  return iscream;
};

/**
 *
 * @description アイスクリームの情報を新規作成する
 */
export const createIscream = async (KV: KVNamespace, params: Iscream[]) => {
  try {
    params.map(async (param) => {
      const id = crypto.randomUUID();
      const iscreamData = {
        id: id,
        itemName: param.itemName,
        itemPrice: param.itemPrice,
        itemImage: param.itemImage,
      };
      await KV.put(`${PREFIX}${id}`, JSON.stringify(iscreamData));
    });
    return true;
  } catch (error) {
    console.error(`データの登録に失敗しました。: ${error}`);
    return false;
  }
};

/**
 *
 * @description セブンイレブンの公式ホームページから、関東地方で販売しているアイスクリームの情報を取得する
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

  // TODO: global.Resposeで型を指定しているが、型が合わないため強引に変換している
  await rewriter.transform(response as unknown as Response).arrayBuffer();

  // 最後の商品が保存されていない場合はここで保存
  if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
    results.push(currentProduct);
  }

  // JSON形式で結果を返す
  return results;
};

/**
 *
 * @description 保守用:保存されている全てのアイスクリームの情報を削除する
 */
export const deleteAllIscream = async (KV: KVNamespace) => {
  try {
    const list = await KV.list({ prefix: PREFIX });
    for (const key of list.keys) {
      await KV.delete(key.name);
    }
    return true;
  } catch (error) {
    return false;
  }
};

'use server';

import { OutputEventSchema, Address, AddressSchema } from '../type';
import { Genkit, z } from 'genkit';

export const eventSearchPrompt = async (genkit: Genkit, input: { address: Address }) => {
  return await genkit.definePrompt(
    {
      name: 'eventSearchPrompt',
      input: {
        schema: z.object({
          ...AddressSchema.shape,
        }),
      },
      output: {
        format: 'json',
        schema: OutputEventSchema.array(),
      },
    },
    `
    以下の条件で開催されるイベント情報検索して応答する

    ## output
    - json 内の value は全て日本語で返すこと。
    - 施設を返すのではなく施設で開催される予定の具体的なイベント内容を返す
    - 例)
      - NG
        - 石橋プレミアムアウトレット
      - OK
        - 石橋プレミアムアウトレットで開催されるバレンタインデーイベント
    - eventCategories は英単語1語で返すこと
      - 例) Art

    ## 検索条件
    - {{prefecture}} のみ
    - イベント対象期間
      - 2025年1月 - 2025年2月
    `
  )(
    {
      ...input.address,
    }
  );
};

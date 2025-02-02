import { Genkit } from "genkit";
import { OutputEventSchema, Address, AddressSchema } from "../types/event";
import { z } from "zod";

export const eventSearchPrompt = async (
  genkit: Genkit,
  input: {
    address: Address;
    targetDate: string;
  }
) => {
  return await genkit.definePrompt(
    {
      name: "eventSearchPrompt",
      input: {
        schema: AddressSchema.extend({
          targetDate: z.string(),
        }),
      },
      output: {
        format: "json",
        schema: OutputEventSchema.array(),
      },
    },
    `
    以下の条件で開催されるイベント情報検索して応答する

    ## output
    - 施設を返すのではなく施設で開催される予定の具体的なイベント内容を返す
    - 例)
      - NG
        - 石橋プレミアムアウトレット
      - OK
        - 石橋プレミアムアウトレットで開催されるバレンタインデーイベント
    - eventCategoryEn は英単語1語で返すこと
      - 例)
        - Art

    ## 検索条件
    - {{prefecture}} {{targetDate}}
    `
  )(
    {
      ...input.address,
      targetDate: input.targetDate,
    }
  );
};

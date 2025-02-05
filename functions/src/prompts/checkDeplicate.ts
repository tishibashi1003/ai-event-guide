import { Genkit } from "genkit";
import { z } from "zod";
import { Event, EventSchema } from "../types/firestoreDocument";
import { OutputEvent, OutputEventSchema } from "../types/prompt";
import { gemini20FlashExp } from "@genkit-ai/googleai";

export const checkDuplicateEvent = async (
  genkit: Genkit,
  input: {
    target: OutputEvent;
    eventList: Event[];
  }
) => {
  return await genkit.definePrompt(
    {
      name: "checkDuplicateEvent",
      input: {
        schema: z.object({
          target: OutputEventSchema,
          eventList: EventSchema.array(),
        }),
      },
      output: {
        format: 'json',
        schema: z.object({
          isDuplicate: z.boolean(),
          message: z.string(),
        }),
      },
      model: gemini20FlashExp,
    },
    `
    ## 要件
    - eventList に target と同じイベントが存在するかどうかを判定する
      - 判定の際は
        - target.eventTitleJa と eventList.eventTitleJa を比較
        - target.eventLocationNameJa と eventList.eventLocationNameJa を比較
    - eventList が空の場合は常に isDuplicate: false を返す

    ## eventList
    {{eventList}}

    ## target
    {{target}}

    ## 出力形式
    {
      "isDuplicate": boolean,
      "message": string
    }

    ## 出力例
    類似がある場合：
    {
      "isDuplicate": true,
      "message": "既存のイベント「{イベント名}」と類似しています。"
    }

    類似がない場合：
    {
      "isDuplicate": false,
      "message": "類似するイベントは見つかりませんでした。"
    }

    ## 判定例
    target のイベントが "岐阜城下町フェス" で eventList に "岐阜城下町フェスティバル" がある場合は isDuplicate: true を返す。
    target のイベントが "岐阜城下町フェス" で eventList に全く異なるイベントしかない場合は isDuplicate: false を返す。
    `
  )(
    {
      target: input.target,
      eventList: input.eventList,
    }
  );
};

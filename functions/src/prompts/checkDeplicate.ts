import { Event } from "../types/firestoreDocument";
import { OutputEvent } from "../types/prompt";

import OpenAI from 'openai';

export const checkDuplicateEvent = async (
  input: {
    target: OutputEvent;
    eventList: Event[];
  }
) => {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'checkDuplicateEvent',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            isDuplicate: {
              type: 'boolean',
              description: 'Indicates if the message is a duplicate',
            },
            message: {
              type: 'string',
              description: 'A message related to the duplication status',
            },
          },
          required: ['isDuplicate', 'message'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `
        ## 要件
        - eventList に target と同じイベントが存在するかどうかを判定する
          - 判定の際は
            - target.eventTitleJa と eventList.eventTitleJa を比較
            - target.eventLocationNameJa と eventList.eventLocationNameJa を比較
        - eventList が空の場合は常に isDuplicate: false を返す

        ## eventList
        ${JSON.stringify(input.eventList, null, 2)}

        ## target
        ${JSON.stringify(input.target, null, 2)}

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
        `,
      },
    ],
  });
  return completion.choices[0].message.content;
}

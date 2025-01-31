'use server';

import { SearchedEventSchema } from '@/features/common/types/searchedEvent';
import { SearchEventInput, SearchEventInputSchema } from '../type';
import { Genkit } from 'genkit';

export const eventSearchPrompt = async (genkit: Genkit, input: SearchEventInput) => {
  return await genkit.definePrompt(
    {
      name: 'eventSearchPrompt',
      input: {
        schema: SearchEventInputSchema,
      },
      output: {
        format: 'json',
        schema: SearchedEventSchema.array(),
      },
    },
    `
        以下の条件でイベント情報を収集する
        - 家族向けイベント
        - 子供が楽しめるイベント
        - アウトドアアクティビティ
        - 文化・教育イベント
        - 開催場所は {{prefecture}} 付近
        - 開催期間は 2025-01-01 から 2025-02-28 まで
        `
  )(
    {
      prefecture: input.prefecture,
      city: input.city,
    }
  );
};

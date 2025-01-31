'use server';

import { AddressSchema, Address, OutputFacilitySchema } from '../type';
import { Genkit } from 'genkit';

export const facilitySearchPrompt = async (genkit: Genkit, input: { address: Address }) => {
  return await genkit.definePrompt(
    {
      name: 'facilitySearchPrompt',
      input: {
        schema: AddressSchema,
      },
      output: {
        format: 'json',
        schema: OutputFacilitySchema.array(),
      },
    },
    `
    以下の条件で子供向けのイベントの開催施設を検索して応答する

    ## output
    - 出力は必ず 10 件

    ## 検索条件
    - 場所: {{prefecture}} 周辺

    `
  )(
    {
      prefecture: input.address.prefecture,
      city: input.address.city,
    }
  );
};

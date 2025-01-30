'use server';

import { getGenkitInstance } from '@/utils/genkit';
import { gemini15Flash } from '@genkit-ai/vertexai';
import { z } from 'genkit';
import { GenkitGroundingResponse } from '@/types/genkitGrounding';
import { SearchedEventSchema } from '@/features/common/types/searchedEvent';

const GenkitGroundingResponseSchema = z.any() as z.ZodSchema<GenkitGroundingResponse>;

export const searchGrounding = async (query: string) => {
  try {
    const genkitInstance = await getGenkitInstance({ model: gemini15Flash.withConfig({ googleSearchRetrieval: { disableAttribution: true } }) });

    const result = await genkitInstance.generate({
      prompt: query,
      output: { schema: SearchedEventSchema.array() }
    });

    const output = result.output

    const genkitGroundingResponse = GenkitGroundingResponseSchema.parse(result);
    const candidates = genkitGroundingResponse.custom.candidates;
    const groundingChunks = candidates.map((candidate) => candidate.groundingMetadata.groundingChunks);
    const groundingSupports = candidates.map((candidate) => candidate.groundingMetadata.groundingSupports);

    console.log("🚀  searchGrounding  candidates:", JSON.stringify(groundingChunks, null, 2));
    console.log("🚀  searchGrounding  candidates:", JSON.stringify(groundingSupports, null, 2));
    console.log("🚀  searchGrounding  candidates:", JSON.stringify(result.text, null, 2));
    console.log("🚀  searchGrounding  candidates:", JSON.stringify(output, null, 2));

    if (!genkitGroundingResponse) {
      throw new Error('検索結果の生成に失敗しました');
    }

    return {
      success: true,
      data: result.text,
      query: query
    };

  } catch (error) {
    console.error('グラウンディング処理でエラーが発生しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      query: query
    };
  }
};


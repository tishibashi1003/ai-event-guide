'use server';

import { getGenkitInstance } from '@/utils/genkit';
import { gemini15Flash } from '@genkit-ai/vertexai';
import { eventSearchPrompt } from '../prompts/eventSearch.prompt';
import { OutputEventSchema } from '../type';

const address = {
  prefecture: '岐阜県',
  city: '垂井町',
}

export const searchGrounding = async () => {
  try {
    const genkitInstance = await getGenkitInstance({
      model: gemini15Flash.withConfig({ googleSearchRetrieval: { disableAttribution: true } })
    });

    const eventResult = await eventSearchPrompt(genkitInstance, { address });
    const parsedEventResult = OutputEventSchema.array().parse(eventResult.output);

    return {
      success: true,
      data: parsedEventResult,
    };

  } catch (error) {
    console.error('グラウンディング処理でエラーが発生しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};


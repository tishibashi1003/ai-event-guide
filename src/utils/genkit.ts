'use server';

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, ModelArgument } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGenkitInstance = async ({ model = gemini15Flash }: { model?: ModelArgument<any> }) => {
  return genkit({
    plugins: [googleAI(), vertexAI({ location: 'asia-northeast1' }),],
    model,
  });
};


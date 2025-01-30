'use server';

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, ModelArgument } from 'genkit';

export const getGenkitInstance = async ({ model = gemini15Flash }: { model?: ModelArgument<any> }) => {
  return genkit({
    plugins: [googleAI()],
    model,
  });
};


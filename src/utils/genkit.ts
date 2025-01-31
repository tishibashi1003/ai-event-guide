'use server';

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, ModelArgument } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGenkitInstance = async ({ model = gemini15Flash }: { model?: ModelArgument<any> }) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require('../../credentials.serviceAccount.json');

  return genkit({
    plugins: [googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }
    ), vertexAI({
      location: 'asia-northeast1',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      googleAuth: {
        credentials: serviceAccount,
      },
    }),],
    model,
  });
};


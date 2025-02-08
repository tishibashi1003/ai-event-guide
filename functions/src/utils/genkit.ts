import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, ModelArgument } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

enableFirebaseTelemetry({
  // Configuration options
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGenkitInstance = async ({ model = gemini15Flash }: { model?: ModelArgument<any> }) => {
  return genkit({
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
      }),
      vertexAI({
        location: 'asia-northeast1',
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        googleAuth: {
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        },
      }),
    ],
    model,
  });
};

'use server';

import { getGenkitInstance } from '@/utils/genkit';

export const helloFlow = async (name: string) => {
  const genkitInstance = await getGenkitInstance({});
  const { text } = await genkitInstance.generate(`Hello Gemini, my name is ${name}`);
  console.log(text);
  return text;
};

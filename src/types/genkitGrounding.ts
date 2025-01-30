import { z } from "zod";

const textPartSchema = z.object({
  text: z.string(),
});

const contentSchema = z.object({
  role: z.literal("model"),
  parts: z.array(textPartSchema).optional(),
  text: z.string().optional(),
});

const messageSchema = z.object({
  role: z.enum(["model", "user"]),
  content: z.array(contentSchema),
});

const usageSchema = z.object({
  inputCharacters: z.number(),
  inputImages: z.number(),
  inputVideos: z.number(),
  inputAudioFiles: z.number(),
  outputCharacters: z.number(),
  outputImages: z.number(),
  outputVideos: z.number(),
  outputAudioFiles: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
});

const safetyRatingSchema = z.object({
  category: z.string(),
  probability: z.string(),
  probabilityScore: z.number(),
  severity: z.string(),
  severityScore: z.number(),
});

const webSchema = z.object({
  uri: z.string(),
  title: z.string(),
});

const groundingChunkSchema = z.object({
  web: webSchema,
});

const searchEntryPointSchema = z.object({
  renderedContent: z.string(),
});

const segmentSchema = z.object({
  startIndex: z.number(),
  endIndex: z.number(),
  text: z.string(),
});

const groundingSupportSchema = z.object({
  segment: segmentSchema,
  groundingChunkIndices: z.array(z.number()),
  confidenceScores: z.array(z.number()),
});

const groundingMetadataSchema = z.object({
  webSearchQueries: z.array(z.string()),
  searchEntryPoint: searchEntryPointSchema,
  groundingChunks: z.array(groundingChunkSchema),
  groundingSupports: z.array(groundingSupportSchema),
  retrievalMetadata: z.record(z.never()),
});

const candidateContentSchema = z.object({
  role: z.literal("model"),
  parts: z.array(textPartSchema),
});

const candidateSchema = z.object({
  content: candidateContentSchema,
  finishReason: z.literal("STOP"),
  safetyRatings: z.array(safetyRatingSchema),
  groundingMetadata: groundingMetadataSchema,
  avgLogprobs: z.number(),
  index: z.number(),
});

const tokensDetailsSchema = z.object({
  modality: z.literal("TEXT"),
  tokenCount: z.number(),
});

const usageMetadataSchema = z.object({
  promptTokenCount: z.number(),
  candidatesTokenCount: z.number(),
  totalTokenCount: z.number(),
  promptTokensDetails: z.array(tokensDetailsSchema),
  candidatesTokensDetails: z.array(tokensDetailsSchema),
});

const customSchema = z.object({
  candidates: z.array(candidateSchema),
  usageMetadata: usageMetadataSchema,
  modelVersion: z.string(),
  createTime: z.string(),
  responseId: z.string(),
});

const requestMessageSchema = z.object({
  role: z.literal("user"),
  content: z.array(textPartSchema),
});

const googleSearchRetrievalSchema = z.object({
  disableAttribution: z.boolean(),
});

const configSchema = z.object({
  googleSearchRetrieval: googleSearchRetrievalSchema,
});

const requestSchema = z.object({
  messages: z.array(requestMessageSchema),
  config: configSchema,
  tools: z.array(z.never()),
  output: z.record(z.never()),
});

export const genkitGroundingResponseSchema = z.object({
  message: messageSchema,
  finishReason: z.string(),
  usage: usageSchema,
  custom: customSchema,
  request: requestSchema,
});

export type GenkitGroundingResponse = z.infer<typeof genkitGroundingResponseSchema>;


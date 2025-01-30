type TextPart = {
  text: string;
};

type Content = {
  role: "model";
  parts?: TextPart[];
  text?: string;
};

type Message = {
  role: "model" | "user";
  content: Content[];
};

type Usage = {
  inputCharacters: number;
  inputImages: number;
  inputVideos: number;
  inputAudioFiles: number;
  outputCharacters: number;
  outputImages: number;
  outputVideos: number;
  outputAudioFiles: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

type SafetyRating = {
  category: string;
  probability: string;
  probabilityScore: number;
  severity: string;
  severityScore: number;
};

type Web = {
  uri: string;
  title: string;
};

type GroundingChunk = {
  web: Web;
};

type SearchEntryPoint = {
  renderedContent: string;
};

type Segment = {
  startIndex: number;
  endIndex: number;
  text: string;
};

type GroundingSupport = {
  segment: Segment;
  groundingChunkIndices: number[];
  confidenceScores: number[];
};

type GroundingMetadata = {
  webSearchQueries: string[];
  searchEntryPoint: SearchEntryPoint;
  groundingChunks: GroundingChunk[];
  groundingSupports: GroundingSupport[];
  retrievalMetadata: Record<string, never>;
};

type CandidateContent = {
  role: "model";
  parts: TextPart[];
};

type Candidate = {
  content: CandidateContent;
  finishReason: "STOP";
  safetyRatings: SafetyRating[];
  groundingMetadata: GroundingMetadata;
  avgLogprobs: number;
  index: number;
};

type TokensDetails = {
  modality: "TEXT";
  tokenCount: number;
};

type UsageMetadata = {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  promptTokensDetails: TokensDetails[];
  candidatesTokensDetails: TokensDetails[];
};

type Custom = {
  candidates: Candidate[];
  usageMetadata: UsageMetadata;
  modelVersion: string;
  createTime: string;
  responseId: string;
};

type RequestMessage = {
  role: "user";
  content: TextPart[];
};

type GoogleSearchRetrieval = {
  disableAttribution: boolean;
};

type Config = {
  googleSearchRetrieval: GoogleSearchRetrieval;
};

type Request = {
  messages: RequestMessage[];
  config: Config;
  tools: [];
  output: Record<string, never>;
};

export type GenkitGroundingResponse = {
  message: Message;
  finishReason: string;
  usage: Usage;
  custom: Custom;
  request: Request;
};


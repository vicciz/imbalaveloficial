import {
  setAIProvider,
} from "./client";

import {
  GeminiProvider,
} from "./providers/gemini";

setAIProvider(
  new GeminiProvider()
);
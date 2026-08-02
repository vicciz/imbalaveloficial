import {
  cleanStage,
} from "./stages/clean";

import {
  enrichStage,
} from "./stages/enrich";

import type {
  ProductPipelineContext,
} from "./types";

export async function executarPipeline(
  ctx: ProductPipelineContext
) {

  await cleanStage(ctx);

  await enrichStage(ctx);

  return ctx;

}
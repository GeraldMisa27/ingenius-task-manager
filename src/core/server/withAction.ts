/**
 * Wraps a Server Action handler with the standard error mapping pipeline.
 *
 * Every Server Action follows the same try/catch pattern: run the handler,
 * return ok:true on success, or pass the error through toActionResponse to
 * produce a uniform { ok: false, error } shape. This wrapper centralizes
 * that pattern so individual actions stay focused on their domain logic.
 *
 * Usage:
 *
 *   export const archiveProject = withAction(async (input: { projectId: string }) => {
 *     const user = await requireUser();
 *     const data = schema.parse(input);
 *     // ... domain + repo work ...
 *     return result;
 *   });
 */

import { toActionResponse } from "@/core/errors/mapper";
import type { ActionResponse } from "@/core/errors/types";

export function withAction<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<ActionResponse<TOutput>> {
  return async (input: TInput) => {
    try {
      const data = await handler(input);
      return { ok: true, data };
    } catch (error) {
      return toActionResponse(error);
    }
  };
}

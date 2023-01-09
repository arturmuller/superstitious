import type {
  AnyResponse,
  AnySpec,
  ExtractRequest,
  ExtractResponse,
} from "@superstitious/core";

import { fail } from "@superstitious/core";

export type TransportFailure = {
  ok: false;
  code: "TRANSPORT_FAILURE";
  payload: {
    error: unknown;
  };
};

export type ExtractClientResponse<S extends AnySpec, N extends S["NAME"]> =
  | ExtractResponse<S, N>
  | TransportFailure;

export function createClient<S extends AnySpec>(
  url: string,
  options?: { runSideEffects?: (response: AnyResponse) => void },
) {
  const { runSideEffects = () => {} } = options ?? {};

  return async function dispatchAction<N extends S["NAME"]>(
    name: N,
    payload: ExtractRequest<S, N>,
  ): Promise<ExtractClientResponse<S, N>> {
    // Stringify outside the try/catch block to make sure errors propagate.
    const body = JSON.stringify({ name, payload });

    try {
      const httpResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body,
      });

      if (!httpResponse.ok) {
        const actionResponse = fail("TRANSPORT_FAILURE", {
          error: await httpResponse.text(),
        });

        runSideEffects(actionResponse);
        return actionResponse;
      }

      const actionResponse = await httpResponse.json();

      runSideEffects(actionResponse);
      return actionResponse;
    } catch (error: unknown) {
      const actionResponse = fail("TRANSPORT_FAILURE", { error });

      runSideEffects(actionResponse);
      return actionResponse;
    }
  };
}

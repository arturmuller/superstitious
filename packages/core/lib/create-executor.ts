import type { StructError } from "superstruct";
import type { AnyAction, AnyResponse, Executor } from "./types";

import { create, mask } from "superstruct";
import { fail } from "./result";

function createLookupTable(actions: AnyAction[]) {
  const lookup = new Map<string, AnyAction>();
  const duplicates = new Map<string, number>();

  for (const action of actions) {
    if (lookup.has(action.name)) {
      duplicates.set(action.name, (duplicates.get(action.name) ?? 1) + 1);
    } else {
      lookup.set(action.name, action);
    }
  }

  if (duplicates.size > 0) {
    const hint = explainDuplicates(duplicates);

    throw new Error(
      `Duplicate action names were supplied to "createExecutor" function. ${hint}`,
    );
  }

  return lookup;
}

function explainDuplicates(duplicates: Map<string, number>) {
  let explanations: string[] = [];

  for (const [name, n] of duplicates) {
    explanations.push(`"${name}" used ${n}x`);
  }

  return explanations.join(", ");
}

function withName<R>(name: string, r: R) {
  return Object.assign({ name }, r);
}

function appError(message: string) {
  return fail("APPLICATION_ERROR", { message });
}

type AppError = {
  ok: false;
  code: "APPLICATION_ERROR";
  payload: { message: string };
};

export function createExecutor<
  A extends AnyAction,
  NotImplementedE extends AnyResponse = AppError,
  ContextE extends AnyResponse = AppError,
  PayloadE extends AnyResponse = AppError,
  ResolverE extends AnyResponse = AppError,
>(
  actions: A[],
  options?: {
    resolveNotImplementedError?: (name: string) => NotImplementedE;
    resolveContextError?: (error: unknown) => ContextE;
    resolvePayloadError?: (error: unknown) => PayloadE;
    resolveResolverError?: (error: unknown) => ResolverE;
    runSideEffects?: (action: {
      name: string;
      response: {
        ok: boolean;
        code: string;
        payload?: unknown;
      };

      // Request input might or might not be validated
      request: {
        payload: unknown;
        context: unknown;
      };
    }) => void;
  },
): Executor<A, PayloadE | ContextE | ResolverE | NotImplementedE> {
  const lookup = createLookupTable(actions);

  const {
    resolveNotImplementedError = (name: string) => {
      return appError(`An action with the name "${name}" was not found.`);
    },

    resolveContextError = (error: StructError) => {
      return appError(
        `Action context did not pass validation. ${error.message}`,
      );
    },

    resolvePayloadError = (error: StructError) => {
      return appError(
        `Action payload did not pass validation. ${error.message}`,
      );
    },

    resolveResolverError = (error: unknown) => {
      const isError = error instanceof Error;
      const thrownType = isError ? "An error" : "A non-error";
      const hint = isError ? error.message : error;

      return appError(
        `${thrownType} was thrown inside of an action resolver. ${hint}`,
      );
    },

    runSideEffects = () => {},
  } = options ?? {};

  const executeAction: Executor<A, any> = async (input) => {
    const action = lookup.get(input.name);

    if (!action) {
      const errorResponse = withName(
        input.name,
        resolveNotImplementedError(input.name),
      );

      runSideEffects({
        name: input.name,
        request: { payload: input.payload, context: input.context },
        response: errorResponse,
      });

      return errorResponse;
    }

    let context;
    try {
      context = mask(input.context, action.context);
    } catch (error: any) {
      const errorResponse = withName(input.name, resolveContextError(error));

      runSideEffects({
        name: input.name,
        request: { payload: input.payload, context: input.context },
        response: errorResponse,
      });

      return errorResponse;
    }

    let payload;
    try {
      payload = create(input.payload, action.payload);
    } catch (error: any) {
      const errorResponse = withName(input.name, resolvePayloadError(error));

      runSideEffects({
        name: input.name,
        request: { payload: input.payload, context: input.context },
        response: errorResponse,
      });

      return errorResponse;
    }

    let response;
    const request = { name: input.name, payload, context };
    try {
      response = await action.resolve(request);
    } catch (error) {
      const errorResponse = withName(input.name, resolveResolverError(error));

      runSideEffects({
        name: input.name,
        request: { payload: input.payload, context: input.context },
        response: errorResponse,
      });

      return errorResponse;
    }

    response = withName(action.name, response);

    runSideEffects({
      name: input.name,
      request: { payload: input.payload, context: input.context },
      response,
    });

    return response;
  };

  return executeAction;
}

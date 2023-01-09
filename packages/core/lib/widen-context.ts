import type { Infer } from "superstruct";
import type {
  AnyAction,
  AnyResponse,
  AnyStruct,
  InferResponse,
  Resolver,
} from "./types";

export type Context<C> = { context: C };

export function context<C>(c: C): Context<C> {
  return { context: c };
}

export function widenContext<
  ReturnValue extends AnyResponse | Context<Infer<A["context"]>>,
  ContextStruct extends AnyStruct,
  A extends AnyAction,
>(
  actions: A[],
  props: {
    context: ContextStruct;
    resolve: (context: Infer<ContextStruct>) => Promise<ReturnValue>;
  },
): Array<
  // We return the same array of actions, but replace resolve and context with
  // the ones specified here.
  A extends {
    name: infer N extends string;
    payload: infer S;
    resolve: Resolver<any, infer P, any, infer R>;
  }
    ? {
        name: N;
        payload: S;

        // We replace the context struct of the action with the provided one,
        // as we know how to "get" from the looser to more strict one.
        context: ContextStruct;

        // This is the important part
        resolve: (input: {
          payload: P;
          context: Infer<ContextStruct>;
        }) => Promise<R | InferResponse<ReturnValue>>;
      }
    : never
> {
  return <any>actions.map((action) => {
    return {
      ...action,
      context: props.context,
      resolve: async (input: {
        payload: any;
        context: any;
        name: any;
      }): Promise<any> => {
        const returnValue = await props.resolve(input.context);

        if ("ok" in returnValue) {
          return returnValue;
        }

        return action.resolve({
          name: input.name,
          payload: input.payload,
          context: returnValue.context,
        });
      },
    };
  });
}

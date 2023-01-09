import type { Infer, Struct } from "superstruct";
import type { AnyAction, AnyResponse, AnyStruct, InferResponse } from "./types";

import { intersection, unknown } from "superstruct";

type Next = { next: true };

export function next(): Next {
  return { next: true };
}

export function guard<
  A extends AnyAction,
  ReturnValue extends AnyResponse | Next,
  PayloadStruct extends AnyStruct = Struct<unknown, null>,
  ContextStruct extends AnyStruct = Struct<unknown, null>,
>(
  actions: A[],
  props: {
    payload?: PayloadStruct;
    context?: ContextStruct;
    resolve: (input: {
      name: A["name"];
      payload: Infer<PayloadStruct>;
      context: Infer<ContextStruct>;
    }) => Promise<ReturnValue>;
  },
): Array<
  // We return the same array of actions, but their resolve function now includes
  // possible responses from the guard function.
  A extends {
    name: infer N extends string;
    payload: Struct<infer P, any>;
    context: Struct<infer C, any>;
    resolve: (input: infer I) => Promise<infer R>;
  }
    ? {
        name: N;
        payload: Struct<Infer<PayloadStruct> & P, null>; // An intersection of action/guard payload
        context: Struct<Infer<ContextStruct> & C, null>; // An intersection of action/guard context
        resolve: (input: I) => Promise<InferResponse<R | ReturnValue>>; // This is the important part
      }
    : never
> {
  return <any>actions.map((action) => {
    return {
      ...action,
      payload: intersection([props.payload ?? unknown(), action.payload]),
      context: intersection([props.context ?? unknown(), action.context]),
      resolve: async (input: any): Promise<any> => {
        const returnValue = await props.resolve(input);

        if ("ok" in returnValue) {
          return returnValue;
        }

        return await action.resolve(input);
      },
    };
  });
}

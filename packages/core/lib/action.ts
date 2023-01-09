import type { Infer, Struct } from "superstruct";
import type { AnyResponse, AnyStruct, Resolver } from "./types";

import { unknown } from "superstruct";

export function defineAction<
  Name extends string,
  Response extends AnyResponse,
  PayloadStruct extends AnyStruct = Struct<unknown, null>,
  ContextStruct extends AnyStruct = Struct<unknown, null>,
>(props: {
  name: `${Name}`;
  payload?: PayloadStruct;
  context?: ContextStruct;
  resolve: Resolver<
    `${Name}`,
    Infer<PayloadStruct>,
    Infer<ContextStruct>,
    Response
  >;
}): {
  name: `${Name}`;
  payload: PayloadStruct;
  context: ContextStruct;
  resolve: Resolver<
    `${Name}`,
    Infer<PayloadStruct>,
    Infer<ContextStruct>,
    Response
  >;
} {
  return <any>{
    ...props,
    payload: props.payload ?? unknown(),
    context: props.context ?? unknown(),
  };
}

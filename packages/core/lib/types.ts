import type { Infer, Struct } from "superstruct";

export type AnyStruct = Struct<any, any>;

export type Action<
  P extends AnyStruct,
  C extends AnyStruct,
  R extends AnyResolver,
> = {
  name: string;
  payload: P;
  context: C;
  resolve: R;
};

export type AnyAction = Action<AnyStruct, AnyStruct, AnyResolver>;

export type Response<IsOk extends boolean, Code extends string, P> = {
  ok: IsOk;
  code: Code;
  payload: P;
};

export type AnyResponse =
  | { ok: boolean; code: string }
  | { ok: boolean; code: string; payload: any };

export type Resolver<N, P, C, R> = (input: {
  name: N;
  payload: P;
  context: C;
}) => Promise<R>;

export type AnyResolver = Resolver<any, any, any, any>;

type ResponseOf<A extends AnyAction, N extends string> = Awaited<
  ReturnType<Extract<A, { name: N }>["resolve"]>
>;

type ExtractAction<A extends AnyAction, N extends string> = Extract<
  A,
  { name: N }
>;

export type InferResponse<R> = R extends {
  ok: infer IsOk extends boolean;
  code: infer C extends string;
  payload: infer P;
}
  ? { ok: IsOk; code: C; payload: P }
  : R extends { ok: infer IsOk extends boolean; code: infer C extends string }
  ? { ok: IsOk; code: C }
  : never;

export type Executor<A extends AnyAction, Failure> = <
  N extends A["name"],
>(input: {
  name: N;
  payload: Infer<ExtractAction<A, N>["payload"]>;
  context: Infer<ExtractAction<A, N>["context"]>;
}) => Promise<{ name: N } & (ResponseOf<A, N> | InferResponse<Failure>)>;

export type AnySpec = Spec<string, any, any>;

export type Spec<Name, Request, Response> = {
  NAME: Name;
  REQUEST: Request;
  RESPONSE: Response;
};

/**
 * Creates an AppSpec ready to be used in your app.
 *
 * @example
 * ```ts
 * type AppSpec = SpecOf<typeof execute>
 *
 * const execute = createExecutor(actions)
 * ```
 */
export type SpecOf<T> = T extends Executor<infer A, infer F>
  ? A extends {
      name: infer N extends string;
      payload: infer P extends AnyStruct;
      resolve: (input: any) => Promise<infer R>;
    }
    ? Spec<N, Infer<P>, R | InferResponse<F>>
    : never
  : never;

/**
 * Creates an LookupSpec given an AppSpec
 *
 * This type is useful for ergonomic retrieval of various parts of your spec
 * by name. For example:
 *
 * @example
 * ```ts
 * type Lookup = LookupOf<AppSpec>
 * type GetUserResponse = Lookup["GET_USER"]["RESPONSE"] // A union of responses
 * type GetUserNotFound = Lookup["GET_USER"]["PAYLOAD"]["NOT_FOUND"] // Payload of response/responses with { code: "NOT_FOUND" }
 * type GetUserOk = Lookup["GET_USER"]["OK"] // Payload of response/responses with { ok: true }
 * ```
 */
export type LookupOf<S extends AnySpec> = {
  [Name in S["NAME"]]: ActionLookup<Extract<S, { NAME: Name }>>;
};

type ActionLookup<T extends AnySpec> = {
  NAME: T["NAME"];
  REQUEST: T["REQUEST"];
  RESPONSE: T["RESPONSE"];
  PAYLOAD: {
    [Code in T["RESPONSE"]["code"]]: Extract<
      T["RESPONSE"],
      { code: Code }
    >["payload"];
  };
  OK: Extract<T["RESPONSE"], { ok: true }>["payload"];
};

export type ExtractResponse<S extends AnySpec, N extends S["NAME"]> = Extract<
  S,
  { NAME: N }
>["RESPONSE"];

export type ExtractRequest<S extends AnySpec, N extends S["NAME"]> = Extract<
  S,
  { NAME: N }
>["REQUEST"];

export type ExtractOkPayload<S extends { ok: boolean }> = S extends {
  ok: true;
  payload: infer P;
}
  ? P
  : never;

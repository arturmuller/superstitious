import type { AnyAction } from "./types";

export function prefix<Prefix extends string, A extends AnyAction>(
  p: Prefix,
  actions: A[],
): Array<
  A extends {
    name: infer N extends string;
    payload: infer S;
    context: infer C;
    resolve: infer R;
  }
    ? {
        name: `${Prefix}${N}`;
        payload: S;
        context: C;
        resolve: R;
      }
    : never
> {
  return <any>actions.map((action) => {
    return { ...action, name: `${p}${action.name}` };
  });
}

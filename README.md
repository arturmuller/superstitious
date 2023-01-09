# :crossed_fingers: Superstitious

> Trust your API.

A typesafe, compositional RPC-style framework with a functional API.

## Feaures

- End-to-end type safety including per-action errors.
- No code generation or build step. Typescript will pick up errors between server and client as soon as you make your changes.
- Lightweight functional API.
- Clear separation between transport and application layer.
- Deep integration with the excellent validation library Superstruct.
- Clean output types and plenty of type helpers make it a breeze to extends and customize.

## Minimal Example

```typescript
import { defineAction } from "superstitious";

const getUser = defineAction({
  name: "GET_USER",
  payload: object({ id: string() }),
  async resolve({ payload }) {
    const user = { name: "John", email: "johnny97@example.com" };

    if (!user) {
      return fail("NOT_FOUND");
    }

    return ok("RETRIEVED", user);
  },
});

const getOrg = defineAction({
  // etc...
});

const createProject = defineAction({
  // etc...
});

// Second, create executor
const execute = createExecutor([getUser, getOrg, createProject]);

// Last, export Spec
type AppSpec = SpecOf<typeof execute>;
```

## Typings

You can easily extract types from your spec:

```ts
type GetUserResponse = ExtractResponse<AppSpec, "GET_USER">;
```

If you don't want to repeatedly import AppSpec into every file where you are using the type helpers, you can wrap them into your own module whihc makes things a little more ergonomic, like so:

```ts
import { ExtractResponse } from "rpc/core";
import { AppSpec } from "./app";

type ResponseOf<N extends AppSpec["NAME"]> = ExtractResponse<AppSpec, N>;
```

## Similar Libraries

- [tRPC](https://trpc.io)
- [Gravity](https://gravity.digitak.dev)
- [fnapi](https://fnapi.dev)

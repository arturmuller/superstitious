# API

## `defineAction`

Defines Superstitious actions. This function has two possible signatures.

For very simple actions, you can use:

```
defineAction<T>(name: string, resolver: () => Promise<T>)
```

Or, for more complex actions where you want to validate incoming payload and context, you should use:

```
defineAction<T, C, P>(spec: {
  name: string;
  context?: Struct<C>;
  payload?: Struct<P>;
  resolver: (input: { context: C, payload: P }) => Promise<T>;
});
```

### Params

- `name` --- the name of your action. You will use this to call the action from the other side. Note that the name has to be unique within the actions supplied to `createExecutor`.
- `context` (optional) --- any Superstruct struct. The `context` property of the `input` parameter to the `resolver` function will be typed according to this struct. Defaults to `unknown()` if not provided.
- `payload` (optional) --- any Superstruct struct. The `payload` property of the `input` parameter to the `resolver` function will be typed according to this struct. Defaults to `unknown()` if not provided.
- `resolver` --- an async function that returns either an `ok()` or `fail()`.

### Examples

```ts
const ping = defineAction("PING", async () => ok("PONG"));
```

```ts
import { defineAction, ok, fail } from "superstitious";
import { object, string } from "superstruct";
import { db } from "./db"; // Your database interface

const getUser = defineAction({
  name: "GET_USER",
  context: object({
    authUserId: string(),
  }),
  payload: object({
    userId: string(),
  }),
  async resolve({ payload, context }) {
    const user = db.getUser();
    // const user = { id: "lovelace", name: "Ada Lovelace" }
  },
});
```

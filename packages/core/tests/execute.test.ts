import { object, string } from "superstruct";
import { defineAction } from "../lib/action";
import { createExecutor } from "../lib/create-executor";
import { ok } from "../lib/result";

describe("Returns correct payload", () => {
  test("when action request is provided.", async () => {
    const greet = defineAction({
      name: "GREET",
      async resolve() {
        return ok("RETRIEVED", "Hello world!");
      },
    });

    const execute = createExecutor([greet]);

    const result = await execute({
      name: "GREET",
      context: null,
      payload: null,
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": "RETRIEVED",
        "name": "GREET",
        "ok": true,
        "payload": "Hello world!",
      }
    `);
  });
});

describe("Validates context", () => {
  test("handles validation failure.", async () => {
    const greet = defineAction({
      name: "GREET",
      context: object({ name: string() }),
      async resolve({ context }) {
        return ok("RETRIEVED", `Hello ${context.name}`);
      },
    });

    const execute = createExecutor([greet]);

    const result = await execute({
      name: "GREET",
      context: <any>1,
      payload: null,
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GREET",
        "ok": false,
        "payload": Object {
          "message": "Action context did not pass validation. Expected an object, but received: 1",
        },
      }
    `);
  });

  test("masks extra properties.", async () => {
    const greet = defineAction({
      name: "GREET",
      context: object({ name: string() }),
      async resolve({ context }) {
        return ok("RETRIEVED", `Hello: ${JSON.stringify(context)}`);
      },
    });

    const execute = createExecutor([greet]);

    const result = await execute({
      name: "GREET",
      context: <any>{ name: "World", size: 6371 },
      payload: null,
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": "RETRIEVED",
        "name": "GREET",
        "ok": true,
        "payload": "Hello: {\\"name\\":\\"World\\"}",
      }
    `);
  });
});

describe("Validates payload", () => {
  test("handles validation failure.", async () => {
    const greet = defineAction({
      name: "GREET",
      payload: object({ name: string() }),
      async resolve({ payload }) {
        return ok("RETRIEVED", `Hello ${payload.name}`);
      },
    });

    const execute = createExecutor([greet]);

    const result = await execute({
      name: "GREET",
      context: null,
      payload: <any>1,
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GREET",
        "ok": false,
        "payload": Object {
          "message": "Action payload did not pass validation. Expected an object, but received: 1",
        },
      }
    `);
  });

  test("rejects extra properties.", async () => {
    const greet = defineAction({
      name: "GREET",
      payload: object({ name: string() }),
      async resolve({ context }) {
        return ok("RETRIEVED", `Hello: ${JSON.stringify(context)}`);
      },
    });

    const execute = createExecutor([greet]);

    const result = await execute({
      name: "GREET",
      context: null,
      payload: <any>{ name: "World", size: 6371 },
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GREET",
        "ok": false,
        "payload": Object {
          "message": "Action payload did not pass validation. At path: size -- Expected a value of type \`never\`, but received: \`6371\`",
        },
      }
    `);
  });
});

describe("Calls resolve function", () => {
  test("when action is exectued.", async () => {
    const resolve = jest.fn(async (input: { context: string, payload: string}) =>
      ok(
        "RETRIEVED",
        `Hello ${input.payload} -- a greeting by ${input.context}`,
      ),
    );

    const greet = defineAction({
      name: "GREET",
      payload: string(),
      context: string(),
      resolve,
    });

    const execute = createExecutor([greet]);

    execute({ name: "GREET", context: "James", payload: "World" });

    expect(resolve).toBeCalledTimes(1);
    expect(resolve).toBeCalledWith({
      name: "GREET",
      context: "James",
      payload: "World",
    });
  });
});

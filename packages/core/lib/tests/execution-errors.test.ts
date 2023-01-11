import { any, object, string } from "superstruct";
import { createExecutor } from "../create-executor";
import { ok } from "../result";
import { defineAction } from "../action";

const getUser = defineAction({
  name: "GET_USER",
  payload: object({ user_id: string() }),
  context: object({ auth_user_id: string() }),
  async resolve({ payload }) {
    return ok("RETRIEVED", { id: payload.user_id });
  },
});
const executeAction = createExecutor([getUser]);

describe("Returns NOT_IMPLEMENTED", () => {
  test("when action with supplied name is not found.", async () => {
    const response = await executeAction(<any>{
      name: "XXX",
    });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "XXX",
        "ok": false,
        "payload": Object {
          "message": "An action with the name \\"XXX\\" was not found.",
        },
      }
    `);
  });
});

describe("Returns INVALID_CONTEXT", () => {
  test("when action context does not pass validation.", async () => {
    const response = await executeAction({
      name: "GET_USER",
      payload: { user_id: "abc" },
      context: { auth_user_id: <any>1 },
    });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GET_USER",
        "ok": false,
        "payload": Object {
          "message": "Action context did not pass validation. At path: auth_user_id -- Expected a string, but received: 1",
        },
      }
    `);
  });
});

describe("Returns INVALID_CONTEXT", () => {
  test("when action payload does not pass validation.", async () => {
    const response = await executeAction({
      name: "GET_USER",
      payload: { user_id: <any>1 },
      context: { auth_user_id: "1" },
    });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GET_USER",
        "ok": false,
        "payload": Object {
          "message": "Action payload did not pass validation. At path: user_id -- Expected a string, but received: 1",
        },
      }
    `);
  });
});

describe("Returns INVALID_CONTEXT", () => {
  test("when an error is thrown inside the action's resolver function.", async () => {
    const getUser = defineAction({
      name: "GET_USER",
      payload: any(),
      context: any(),
      async resolve() {
        const x = <any>undefined;
        return ok("YAY", { name: x.x });
      },
    });
    const executeAction = createExecutor([getUser]);

    const response = await executeAction({
      name: "GET_USER",
      payload: { user_id: <any>1 },
      context: { auth_user_id: "1" },
    });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GET_USER",
        "ok": false,
        "payload": Object {
          "message": "An error was thrown inside of an action resolver. Cannot read properties of undefined (reading 'x')",
        },
      }
    `);
  });

  test("when a non-error is thrown inside the action's resolver function.", async () => {
    const getUser = defineAction({
      name: "GET_USER",
      payload: any(),
      context: any(),
      async resolve() {
        throw "This is not an instance of Error.";
      },
    });
    const executeAction = createExecutor([getUser]);

    const response = await executeAction({
      name: "GET_USER",
      payload: { user_id: <any>1 },
      context: { auth_user_id: "1" },
    });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "code": "APPLICATION_ERROR",
        "name": "GET_USER",
        "ok": false,
        "payload": Object {
          "message": "A non-error was thrown inside of an action resolver. This is not an instance of Error.",
        },
      }
    `);
  });
});

describe("create executor", () => {
  test("throws when duplicate actions are provided", () => {
    const a = defineAction({
      name: "A",
      payload: string(),
      context: string(),
      resolve: async () => ok("RETRIEVED"),
    });

    const b = defineAction({
      name: "B",
      payload: string(),
      context: string(),
      resolve: async () => ok("RETRIEVED"),
    });

    const c = defineAction({
      name: "C",
      payload: string(),
      context: string(),
      resolve: async () => ok("RETRIEVED"),
    });

    expect(() =>
      createExecutor([a, a, a, b, b, c]),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Duplicate action names were supplied to \\"createExecutor\\" function. \\"A\\" used 3x, \\"B\\" used 2x"`,
    );
  });
});

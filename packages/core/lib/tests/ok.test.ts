import { ok } from "../result";

describe("Returns response object", () => {
  test("when payload is provided", async () => {
    const result = ok("DONE", { hello: "world" });

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "DONE",
        "ok": true,
        "payload": {
          "hello": "world",
        },
      }
    `);
  });

  test("when payload is not provided", async () => {
    const result = ok("DONE");

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "DONE",
        "ok": true,
      }
    `);
  });
});

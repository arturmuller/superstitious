import { fail } from "../result";

describe("Returns response object", () => {
  test("when payload is provided", async () => {
    const result = fail("BOOM", { message: "This blew up..." });

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "BOOM",
        "ok": false,
        "payload": {
          "message": "This blew up...",
        },
      }
    `);
  });

  test("when payload is not provided", async () => {
    const result = fail("BOOM");

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "BOOM",
        "ok": false,
      }
    `);
  });
});

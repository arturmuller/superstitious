import type { Infer } from "superstruct";
import { number, object, string } from "superstruct";
import { defineAction } from "../lib/action";
import { ok } from "../lib/result";

describe("Returns action object", () => {
  test("when all props supplied", async () => {
    const name = "REPEAT_STRING";
    const payload = object({ string: string() });
    const context = object({ number: number() });
    const resolve = async (input: {
      payload: Infer<typeof payload>;
      context: Infer<typeof context>;
    }) => {
      return ok("REPEATED", {
        c: input.payload.string.repeat(input.context.number),
      });
    };

    const a = defineAction({ name, payload, context, resolve });

    expect(a.name).toBe(name);
    expect(a.payload).toBe(payload);
    expect(a.context).toBe(context);
    expect(a.resolve).toBe(resolve);
  });

  test("when all minimal props are supplied", async () => {
    const name = "HELLO";
    const resolve = async () => {
      return ok("RESPONDED", "WORLD");
    };

    const a = defineAction({ name, resolve });

    expect(a.name).toBe(name);
    expect(a.payload.type).toBe("unknown");
    expect(a.context.type).toBe("unknown");
    expect(a.resolve).toBe(resolve);
  });
});

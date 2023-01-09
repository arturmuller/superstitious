import type { NextApiRequest, NextApiResponse } from "next";
import type { Context, Executor } from "@superstitious/core";

import { is, object, string, unknown } from "superstruct";
import { context } from "@superstitious/core";

const action = object({
  name: string(),
  payload: unknown(),
});

function getOpaqueObjectDescription(value: unknown) {
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Unserializable Object";
    }
  }

  return `${value}`;
}

export function createHandler(props: {
  execute: Executor<any, any>;
  getContext?: (request: NextApiRequest) => Context<any>;
}) {
  const { getContext = () => context({}) } = props;

  return async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      res.status(405);
      return res.send(
        `Only POST request method is allowed. You sent: "${req.method}"`,
      );
    }

    if (req.headers["content-type"] !== "application/json") {
      res.status(415);
      return res.send(
        `Only application/json content type is allowed. You sent: "${req.headers["content-type"]}"`,
      );
    }

    if (!is(req.body, action)) {
      res.status(400);
      const hint = getOpaqueObjectDescription(req.body);
      return res.send(
        `Request body must be an object with exactly these properties: "name", "payload". You sent: "${hint}"`,
      );
    }

    try {
      const { context } = getContext(req);

      res.status(200);
      res.json(
        await props.execute({
          name: req.body.name,
          payload: req.body.payload,
          context,
        }),
      );
    } catch (error: unknown) {
      res.status(500);

      const hint = error instanceof Error ? error.message : error;
      return res.send(`Actions handler error: ${hint}`);
    }
  };
}

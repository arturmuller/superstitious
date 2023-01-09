# Tutorial

In this tutorial we will go step by step to create and end-to-end typesafe API using Superstitious and Next.js. At the end, you will have a Next.js app with a client that is using types inferred from your server-side code, with an extremely snappy DX and end-to-end typesafe API. Let's get to it!

## Bootstrap the App

First, we have to bootstrap the Next.js app and install our core dependencies.

```sh
npx create-next-app@latest --ts --eslint tutorial # Creates Next.js app
cd tutorial # Navigates to the `tutorial` directory
npm install superstruct superstitious # Installs dependencies
```

Once we have this out of the way, we can start with Superstitious. Let's start by creating our action definitions. These are the absolute core of the library and the basis of your future inferred type definitions.

We will create a file called `actions.ts` in a new directory `server` and open it up. For starters, we will write a super simple action `PING` that just returns `PONG` upon success.

```ts
// server/actions.ts

import { defineAction, ok } from "superstitious";

const ping = defineAction("PING", () => ok("PONG"));
```

Open that the actions

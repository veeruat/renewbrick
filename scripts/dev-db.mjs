// LOCAL DEVELOPMENT AND TESTS ONLY — never use as the production database.
// Runs PGlite (Postgres compiled to WASM) behind a Postgres wire-protocol
// socket so the app's normal `pg` driver can connect to it.
//
// Usage: node scripts/dev-db.mjs [--port 54329] [--data .pglite]
//   Without --data the database lives in memory and is lost on exit.
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const port = Number(arg("--port", "54329"));
const dataDir = arg("--data", undefined);

const db = await PGlite.create(dataDir);
await db.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 20 });
await server.start();
console.log(`dev-db listening on postgres://postgres@127.0.0.1:${port}/postgres (${dataDir ?? "in-memory"})`);

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

// Local development database: a Postgres-compatible server on port 5433.
// Production uses Neon through DATABASE_URL; nothing here runs on Vercel.
import os from "node:os";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

// Data lives outside the project folder: files changing inside it would make
// the dev server reload pages in a loop.
const dir = process.env.PGLITE_DIR ?? path.join(os.tmpdir(), "carsipazar-dev-db");
const db = await PGlite.create(dir);
// maxConnections lets a second client (psql, a test script) connect while the site is running.
const server = new PGLiteSocketServer({ db, port: 5433, host: "127.0.0.1", maxConnections: 5 });
await server.start();
console.log("Local database listening on postgres://postgres@127.0.0.1:5433/postgres");
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  });
}

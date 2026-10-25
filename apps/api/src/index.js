import { createApp } from "./app.js"; import { connectDb } from "./db/prisma.js"; import { bootstrap } from "./services/bootstrap.js"; import { startWorker, recoverOnStartup } from "./queues/worker.js"; import { env } from "./config/env.js";
const app=createApp();
connectDb().then(async ()=>{ await bootstrap(); await recoverOnStartup(); startWorker(); app.listen(env.port, ()=>console.log(`autoshorts api listening on ${env.port}`)); }).catch(e=>{ console.error("startup failed", e.message); process.exit(1); });

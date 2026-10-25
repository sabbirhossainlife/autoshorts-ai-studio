import { execSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(dir, "..", "prisma", "test.db");
process.env.DATABASE_URL = "file:./test.db";
export async function setupDb(){
  for(const f of [dbPath, dbPath+"-journal"]) { try{ fs.unlinkSync(f); }catch{} }
  execSync("npx prisma migrate deploy", {stdio:"pipe", env:{...process.env}});
}

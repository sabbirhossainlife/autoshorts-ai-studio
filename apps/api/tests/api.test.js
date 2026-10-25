import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { setupDb } from "./setup.js";
let app, agent, cookies="", csrf="";
function authReq(method, path){ const r=request(app)[method](path); if(cookies) r.set("Cookie", cookies); if(csrf) r.set("x-csrf-token", csrf); return r; }
beforeAll(async ()=>{ await setupDb(); const { createApp } = await import("../src/app.js"); const { bootstrap } = await import("../src/services/bootstrap.js"); const { connectDb } = await import("../src/db/prisma.js"); await connectDb(); await bootstrap(); app=createApp(); agent=request.agent(app); const res=await agent.post("/api/auth/register").send({email:"tester@example.com", password:"Password123"}).expect(201); const setCookie=res.headers["set-cookie"]||[]; cookies=setCookie.map(c=>c.split(";")[0]).join("; "); const m=cookies.match(/autoshorts_csrf=([^;]+)/); csrf=m?decodeURIComponent(m[1]):""; }, 120000);
describe("auth + projects + transitions", ()=>{
  it("rejects unauthenticated access", async ()=>{ await request(app).get("/api/projects").expect(401); });
  it("creates a project and rejects an invalid transition", async ()=>{
    const p=await authReq("post","/api/projects").send({title:"Test Short"}).expect(201);
    expect(p.body.data.state).toBe("draft");
    await authReq("patch",`/api/projects/${p.body.data.id}/state`).send({state:"published"}).expect(400);
    const ok=await authReq("patch",`/api/projects/${p.body.data.id}/state`).send({state:"researching"}).expect(200);
    expect(ok.body.data.state).toBe("researching");
  });
  it("validates titles and ranks topics honestly", async ()=>{
    await authReq("post","/api/projects").send({title:"x".repeat(101)}).expect(400);
    const t=await authReq("post","/api/trends/topics").send({topic:"Test topic", momentum:100, freshness:100, relevance:100, sourceQuality:100, feasibility:100}).expect(201);
    expect(t.body.data.score).toBe(100); expect(t.body.data.scoreExplanation).toContain("30%");
  });
  it("rejects OAuth callback with bad CSRF state", async ()=>{ await authReq("get","/api/youtube/callback?code=x&state=bad").expect(400); });
  it("reports YouTube as not connected, not fake-connected", async ()=>{ const s=await authReq("get","/api/youtube/status").expect(200); expect(s.body.data.connected).toBe(false); });
  it("reports system health without fabricating model availability", async ()=>{ const s=await authReq("get","/api/system").expect(200); expect(typeof s.body.data.ollama.available).toBe("boolean"); expect(typeof s.body.data.comfyui.available).toBe("boolean"); });
  it("requires CSRF token for mutations", async ()=>{
    await request(app).post("/api/projects").set("Cookie", cookies).send({title:"No csrf"}).expect(401);
  });
});

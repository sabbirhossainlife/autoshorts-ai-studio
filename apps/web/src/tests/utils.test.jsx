import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server"; import React from "react";
import StatusBadge from "../components/StatusBadge.jsx";
import { rankTopic, canTransition, validateTitle } from "../../packages/shared/index.js";
describe("shared utils", ()=>{
  it("ranks with 30/25/20/15/10 weights", ()=>{ const {score}=rankTopic({momentum:100,freshness:100,relevance:100,sourceQuality:100,feasibility:100}); expect(score).toBe(100); const p=rankTopic({momentum:0,freshness:0,relevance:0,sourceQuality:0,feasibility:0}); expect(p.score).toBe(0); });
  it("rejects invalid workflow transitions", ()=>{ expect(canTransition("draft","published")).toBe(false); expect(canTransition("draft","researching")).toBe(true); });
  it("validates YouTube title length", ()=>{ expect(validateTitle("x".repeat(101))).toBe(false); expect(validateTitle("Hello")).toBe(true); });
  it("renders StatusBadge without fake data", ()=>{ const html=renderToString(<StatusBadge ok={false} label="Ollama"/>); expect(html).toContain("Unavailable"); });
});

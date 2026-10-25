import React, { useEffect, useState } from "react"; import { api } from "../services/api.js"; import { Capability } from "../components/StatusBadge.jsx";
export default function Overview(){ const [projects,setProjects]=useState([]); const [sys,setSys]=useState(null); const [yt,setYt]=useState(null); const [err,setErr]=useState("");
  useEffect(()=>{ api.get("/api/projects").then(setProjects).catch(e=>setErr(e.message)); api.get("/api/system").then(setSys).catch(()=>{}); api.get("/api/youtube/status").then(setYt).catch(()=>{}); },[]);
  const byState=s=>projects.filter(p=>p.state===s).length;
  return <div><h2 className="text-2xl font-bold">Overview</h2>{err && <p className="text-red-400">{err}</p>}
  <div className="grid md:grid-cols-4 gap-4 mt-4">
    <div className="card"><div className="text-3xl font-bold">{projects.length}</div><div>Projects (real data)</div></div>
    <div className="card"><div className="text-3xl font-bold">{projects.filter(p=>p.state==="awaiting_approval").length}</div><div>Awaiting approval</div></div>
    <div className="card"><div className="text-3xl font-bold">{byState("rendering")}</div><div>Rendering</div></div>
    <div className="card"><div className="text-3xl font-bold">{byState("failed")}</div><div>Failed</div></div>
  </div>
  <div className="grid md:grid-cols-3 gap-4 mt-4">
    <Capability ok={!!sys?.ollama?.available} label="Ollama" note={sys?.ollama?.available?`Model ${sys.ollama.model}`:"Ollama is not reachable. Script generation will fail with a clear error; you can still write scripts manually."}/>
    <Capability ok={!!sys?.comfyui?.available} label="ComfyUI" note={sys?.comfyui?.available?"ComfyUI reachable":"ComfyUI is not reachable. Use manual image import instead."}/>
    <Capability ok={!!sys?.tts?.available} label="Local TTS" note={sys?.tts?.note||""}/>
    <Capability ok={!!yt?.connected} label="YouTube" note={yt?.connected?`Connected: ${yt.channelTitle||yt.channelId}`:"YouTube is not connected. Upload is unavailable until OAuth is configured."}/>
    <Capability ok={true} label="System" note={sys?`CPU load ${sys.cpu.load1.toFixed(2)} · ${sys.cpu.cores} cores · Free RAM ${Math.round(sys.memory.freeBytes/1e9)} GB`:"Loading system data…"}/>
    <Capability ok={true} label="Demo project" note="The demo project is clearly labelled DEMO and contains no real metrics."/>
  </div>
  <h3 className="text-lg font-bold mt-6">Recent projects</h3>
  <div className="space-y-2 mt-2">{projects.slice(0,10).map(p=><div key={p.id} className="card flex justify-between"><span>{p.title} {p.isDemo && <span className="badge badge-warn">DEMO</span>}</span><span>{p.state}</span></div>)}</div></div>; }

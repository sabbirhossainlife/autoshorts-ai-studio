import React, { useState } from "react"; import { api } from "../services/api.js"; import { ListPage } from "./Generic.jsx";
export default function Planner(){ const [title,setTitle]=useState(""); const [msg,setMsg]=useState("");
  const create=async()=>{ try{ const p=await api.post("/api/projects",{title}); setMsg(`Created project ${p.id} in draft state.`); }catch(e){ setMsg(e.message); } };
  return <div><h2 className="text-2xl font-bold">Content Planner</h2><div className="card mt-4 flex gap-2"><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New project title"/><button className="btn" onClick={create}>Create</button></div>{msg && <p className="mt-2">{msg}</p>}
  <div className="mt-6"><ListPage title="Projects" path="/api/projects" render={p=><div className="flex justify-between"><span>{p.title} {p.isDemo?"(DEMO)":""}</span><span>{p.state} · {p.durationSec}s</span></div>}/></div></div>; }

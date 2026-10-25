import React, { useEffect, useState } from "react"; import { BrowserRouter, Routes, Route } from "react-router-dom"; import AppLayout from "./layouts/AppLayout.jsx"; import Overview from "./pages/Overview.jsx"; import Trends from "./pages/Trends.jsx"; import Planner from "./pages/Planner.jsx"; import SettingsPage from "./pages/SettingsPage.jsx"; import Health from "./pages/Health.jsx"; import Login from "./pages/Login.jsx"; import { ListPage, SimplePage } from "./pages/Generic.jsx"; import { api } from "./services/api.js";
function Placeholder({title, note}){ return <SimplePage title={title}><p className="text-slate-400">{note}</p><p className="text-sm">Use the API directly for full workflow actions: scripts, scenes, voice, renders, and publishing are implemented server-side and surfaced in the Planner/Overview data. No fake progress is shown.</p></SimplePage>; }
export default function App(){ const [user,setUser]=useState(null); const [checked,setChecked]=useState(false);
  useEffect(()=>{ api.get("/api/auth/me").then(setUser).catch(()=>{}).finally(()=>setChecked(true)); },[]);
  if(!checked) return <p className="p-6">Loading…</p>;
  if(!user) return <Login onDone={()=>window.location.reload()}/>;
  return <BrowserRouter><Routes><Route element={<AppLayout/>}>
    <Route path="/" element={<Overview/>}/><Route path="/trends" element={<Trends/>}/><Route path="/planner" element={<Planner/>}/>
    <Route path="/scripts" element={<Placeholder title="Script Studio" note="Scripts are created via Ollama (validated JSON, retry) or manually. Edit via API: POST /api/projects/:id/scripts."/>}/>
    <Route path="/scenes" element={<Placeholder title="Scene & Image Studio" note="Scenes are planned from scripts. ComfyUI queue or manual image import; unavailable ComfyUI shows a clear error, not a fake image."/>}/>
    <Route path="/voice" element={<Placeholder title="Voice Studio" note="Local TTS per line, or manual audio upload when no TTS engine is available."/>}/>
    <Route path="/editor" element={<Placeholder title="Video Editor" note="FFmpeg renders 1080×1920 MP4 with subtitles, pan/zoom, and crossfades. Start via POST /api/projects/:id/render."/>}/>
    <Route path="/renders" element={<ListPage title="Render Queue" path="/api/renders" render={r=><span>{r.projectId} · {r.status} · {r.progress}% · {r.outputPath}</span>}/>}/>
    <Route path="/publisher" element={<Placeholder title="YouTube Publisher" note="Explicit approval is required before upload. If YouTube is not connected, use the MP4 + metadata export fallback."/>}/>
    <Route path="/analytics" element={<ListPage title="Channel Analytics" path="/api/youtube/analytics" render={a=><span>{JSON.stringify(a)}</span>}/>}/>
    <Route path="/templates" element={<ListPage title="Templates" path="/api/templates" render={t=><span>{t.name} — {t.description}</span>}/>}/>
    <Route path="/settings" element={<SettingsPage/>}/><Route path="/health" element={<Health/>}/>
    <Route path="/logs" element={<ListPage title="Activity Logs" path="/api/logs" render={e=><span>{e.createdAt} · {e.type} · {e.message}</span>}/>}/>
  </Route></Routes></BrowserRouter>; }

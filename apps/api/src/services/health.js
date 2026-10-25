import os from "os"; import fs from "fs"; import { execFile } from "child_process"; import { promisify } from "util";
const run=promisify(execFile);
async function probe(url, timeoutMs=1200){ const c=new AbortController(); const t=setTimeout(()=>c.abort(),timeoutMs); try{ const r=await fetch(url,{signal:c.signal}); return {available:r.ok, status:r.status}; }catch(e){ return {available:false, status:null, error:"unreachable"}; }finally{ clearTimeout(t); } }
async function hasCommand(cmd){ try{ await run("which",[cmd]); return true; }catch{ return false; } }
export async function systemHealth(settings){
  let disk=null; try{ const s=fs.statfsSync(process.cwd()); disk={ totalBytes:Number(s.blocks)*Number(s.bsize), freeBytes:Number(s.bfree)*Number(s.bsize) }; }catch{ disk=null; }
  const ollama=await probe(`${settings?.ollamaUrl||"http://127.0.0.1:11434"}/api/tags`);
  const comfy=await probe(`${settings?.comfyUrl||"http://127.0.0.1:8188"}/system_stats`);
  const ttsCmd=settings?.ttsCommand||""; const ttsAvailable = ttsCmd ? await hasCommand(ttsCmd.split(" ")[0]) : (await hasCommand("espeak-ng")) || (await hasCommand("piper"));
  return { cpu:{ load1:os.loadavg()[0], cores:os.cpus().length }, memory:{ totalBytes:os.totalmem(), freeBytes:os.freemem() }, disk, ollama:{available:ollama.available, url:settings?.ollamaUrl||"", model:settings?.ollamaModel||""}, comfyui:{available:comfy.available, url:settings?.comfyUrl||""}, tts:{available:ttsAvailable, command:ttsCmd||"auto (espeak-ng/piper if installed)", note: ttsAvailable?"":"No local TTS engine found; use manual audio upload."}, youtube:{configured:!!process.env.YOUTUBE_CLIENT_ID, note: process.env.YOUTUBE_CLIENT_ID?"":"YouTube OAuth is not configured; upload is unavailable until client ID/secret are set."} };
}

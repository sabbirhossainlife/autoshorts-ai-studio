import { env } from "../config/env.js";
export async function ollamaGenerate({model, prompt, settings}){
  const url=`${settings?.ollamaUrl||env.ollamaUrl}/api/generate`;
  const body={ model: model||settings?.ollamaModel||env.ollamaModel, prompt, stream:false, format:"json" };
  const c=new AbortController(); const t=setTimeout(()=>c.abort(), 120000);
  try{ const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:c.signal}); if(!r.ok) throw new Error(`Ollama HTTP ${r.status}`); const j=await r.json(); const txt=j.response||""; let parsed; try{ parsed=JSON.parse(txt); }catch{ const m=txt.match(/\{[\s\S]*\}/); if(!m) throw new Error("Ollama returned malformed JSON"); parsed=JSON.parse(m[0]); } return parsed; }finally{ clearTimeout(t); }
}
export function validateScriptJson(j){
  const errs=[]; if(!j || typeof j!=="object") errs.push("not an object"); if(!j.title) errs.push("title required"); if(!j.hook) errs.push("hook required"); if(!Array.isArray(j.scenes)||j.scenes.length===0) errs.push("scenes array required"); (j.scenes||[]).forEach((s,i)=>{ if(!s.narration) errs.push(`scene ${i+1} narration required`); if(!s.imagePrompt) errs.push(`scene ${i+1} imagePrompt required`); });
  return errs;
}

import { execFile } from "child_process"; import { promisify } from "util"; import fs from "fs";
const run=promisify(execFile);
export async function ttsAvailable(settings){
  const cmd=(settings?.ttsCommand||"").split(" ")[0];
  const candidates=cmd?[cmd]:["espeak-ng","piper"];
  for(const c of candidates){ try{ await run("which",[c]); return c; }catch{} }
  return null;
}
export async function synthesize({settings, text, outPath, voice="", speed=1}){
  const engine=await ttsAvailable(settings); if(!engine) throw new Error("No local TTS engine available. Upload audio manually instead.");
  if(engine==="espeak-ng") await run("espeak-ng",["-w",outPath,"-s",String(Math.round(175*speed)),text]);
  else if(engine==="piper"){ const args=["--model",voice||"en_US-lessac-medium","--output_file",outPath]; await run("piper",args,{input:text}); }
  else { const cmd=(settings.ttsCommand||"").split(" "); await run(cmd[0],[...cmd.slice(1),outPath,text]); }
  if(!fs.existsSync(outPath)) throw new Error("TTS produced no audio file");
  return {engine, path:outPath};
}

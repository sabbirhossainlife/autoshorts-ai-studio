import { execFile } from "child_process"; import { promisify } from "util"; import fs from "fs"; import path from "path";
const run=promisify(execFile);
export async function probe(file){ const {stdout}=await run("ffprobe",["-v","quiet","-print_format","json","-show_format","-show_streams",file]); return JSON.parse(stdout); }
export function assFromScenes(scenes){
  let out="[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,52,&H00FFFFFF,&H0000FFFF,&H80000000,&H80000000,1,0,0,0,100,100,0,0,1,3,0,2,80,80,220,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
  let t=0; const fmt=s=>{ const cs=Math.floor(s*100); const h=String(Math.floor(cs/360000)).padStart(1,"0"), m=String(Math.floor(cs/6000)%60).padStart(2,"0"), sec=String(Math.floor(cs/100)%60).padStart(2,"0"), hund=String(cs%100).padStart(2,"0"); return `${h}:${m}:${sec}.${hund}`; };
  scenes.forEach(sc=>{ const d=Number(sc.durationSec||3); out+=`Dialogue: 0,${fmt(t)},${fmt(t+d)},Default,,0,0,0,,${(sc.subtitle||sc.narration||"").replace(/\n/g," ").replace(/\{/g,"(").replace(/\}/g,")")}\n`; t+=d; });
  return out;
}
export async function renderVideo({scenes, audioPath, outputPath, thumbnailPath}){
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  const assPath=outputPath+".ass"; fs.writeFileSync(assPath, assFromScenes(scenes));
  const total=scenes.reduce((a,s)=>a+Number(s.durationSec||3),0);
  // Build inputs: each scene image or a solid colour; zoompan for subtle motion, xfade chain.
  const args=["-y"]; const inputs=[]; const filters=[]; const isImage=[];
  scenes.forEach((sc,i)=>{ const hasImg = sc.imagePath && fs.existsSync(sc.imagePath); isImage.push(hasImg); if(hasImg){ args.push("-i",sc.imagePath); } else { args.push("-f","lavfi","-t",String(sc.durationSec||3),"-i",`color=c=0x0b1026:s=1080x1920:r=30`); } });
  scenes.forEach((sc,i)=>{ if(isImage[i]){ filters.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=yuv420p,zoompan=z='min(zoom+0.0008,1.15)':d=${Math.round((sc.durationSec||3)*30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920,fps=30[v${i}]`); } else { filters.push(`[${i}:v]scale=1080:1920,setsar=1,format=yuv420p,fps=30[v${i}]`); } });
  let last=`[v0]`; let offset=0;
  if(scenes.length===1){ filters.push(`${last}ass=${assPath.replace(/:/g,"\\:")}[vout]`); }
  else { scenes.slice(1).forEach((sc,i)=>{ const dur=0.5; const off=offset+Number(scenes[i].durationSec||3)-dur; filters.push(`${last}[v${i+1}]xfade=transition=fade:duration=${dur}:offset=${off}[xf${i}]`); last=`[xf${i}]`; offset=off; }); filters.push(`${last}ass=${assPath.replace(/:/g,"\\:")}[vout]`); }
  args.push("-filter_complex", filters.join(";"), "-map","[vout]");
  if(audioPath && fs.existsSync(audioPath)) args.push("-i",audioPath,"-map",`${scenes.length}:a`,"-shortest");
  args.push("-c:v","libx264","-pix_fmt","yuv420p","-r","30","-c:a","aac","-movflags","+faststart",outputPath);
  await run("ffmpeg",args);
  if(thumbnailPath){ await run("ffmpeg",["-y","-ss","1","-i",outputPath,"-frames:v","1",thumbnailPath]); }
  const info=await probe(outputPath); const vs=info.streams.find(s=>s.codec_type==="video"); if(!vs || vs.width!==1080 || vs.height!==1920) throw new Error(`Render validation failed: expected 1080x1920, got ${vs?.width}x${vs?.height}`);
  return { outputPath, thumbnailPath, duration: Number(info.format.duration||total), width:vs.width, height:vs.height };
}

import { prisma } from "../db/prisma.js";
import { ollamaGenerate, validateScriptJson } from "../integrations/ollama.js";
import { renderVideo } from "../services/ffmpeg.js";
import fs from "fs"; import path from "path";
let running=false;
export function startWorker(){
  if(running) return; running=true;
  setInterval(tick, 3000); tick().catch(()=>{});
  console.log("queue worker started");
}
async function tick(){
  const jobs=await prisma.queueJob.findMany({where:{status:"queued", nextRunAt:{lte:new Date()}}, orderBy:{createdAt:"asc"}, take:2}).catch(()=>[]);
  for(const job of jobs) await processJob(job).catch(e=>console.error("job error", job.id, e.message));
}
async function processJob(job){
  await prisma.queueJob.update({where:{id:job.id}, data:{status:"processing"}});
  try{
    const payload=JSON.parse(job.payload||"{}"); const project=await prisma.project.findUnique({where:{id:job.projectId}, include:{scenes:{orderBy:{number:"asc"}}, scripts:true}});
    if(job.type==="script"){
      const settings=await prisma.settings.findUnique({where:{id:"default"}});
      const prompt=`Write original educational YouTube Shorts script JSON for topic: ${payload.topic||project?.title}. Durations: ${payload.durationSec||30}s. Return ONLY JSON with keys title, hook, narrative, payoff, cta, sources (array of strings), pronunciation (array), scenes (array of {number, narration, durationSec, imagePrompt, negativePrompt, subtitle}). No copied text.`;
      let parsed=null, errs=[];
      for(let a=0;a<3;a++){ parsed=await ollamaGenerate({prompt, settings}); errs=validateScriptJson(parsed); if(errs.length===0) break; }
      if(errs.length) throw new Error("Ollama output failed validation: "+errs.join("; "));
      await prisma.script.create({data:{projectId:project.id, title:parsed.title, hook:parsed.hook||"", narrative:parsed.narrative||"", payoff:parsed.payoff||"", cta:parsed.cta||"", sources:JSON.stringify(parsed.sources||[]), pronunciation:JSON.stringify(parsed.pronunciation||[]), durationSec:payload.durationSec||30, rawJson:JSON.stringify(parsed)}});
      for(const sc of parsed.scenes) await prisma.scene.create({data:{projectId:project.id, number:sc.number, narration:sc.narration, durationSec:sc.durationSec||3, imagePrompt:sc.imagePrompt, negativePrompt:sc.negativePrompt||"", subtitle:sc.subtitle||sc.narration}});
      await prisma.project.update({where:{id:project.id}, data:{state:"script_review"}});
    } else if(job.type==="render"){
      const outDir=path.join(process.cwd(),"storage/videos"); fs.mkdirSync(outDir,{recursive:true});
      const out=path.join(outDir, `${project.id}.mp4`); const thumb=path.join(process.cwd(),"storage/thumbnails", `${project.id}.jpg`);
      const audio=project ? path.join(process.cwd(),"storage/audio", `${project.id}.wav`) : null;
      const r=await renderVideo({scenes:project.scenes, audioPath: fs.existsSync(audio)?audio:null, outputPath:out, thumbnailPath:thumb});
      await prisma.renderJob.create({data:{projectId:project.id, status:"done", outputPath:r.outputPath, thumbnailPath:thumb, progress:100}});
      await prisma.project.update({where:{id:project.id}, data:{state:"quality_review"}});
    } else if(job.type==="recover"){
      await prisma.jobEvent.create({data:{projectId:project.id, type:"recovery", message:"Startup recovery: stale processing jobs reset to queued"}});
    }
    await prisma.queueJob.update({where:{id:job.id}, data:{status:"done"}});
  }catch(e){
    const attempts=job.attempts+1;
    if(attempts>=job.maxAttempts){ await prisma.queueJob.update({where:{id:job.id}, data:{status:"failed", attempts, error:String(e.message).slice(0,500)}}); await prisma.project.update({where:{id:job.projectId}, data:{state:"failed"}}).catch(()=>{}); }
    else { const backoff=Math.min(60000, 5000*2**attempts); await prisma.queueJob.update({where:{id:job.id}, data:{status:"queued", attempts, error:String(e.message).slice(0,500), nextRunAt:new Date(Date.now()+backoff)}}); }
  }
}
export async function recoverOnStartup(){
  await prisma.queueJob.updateMany({where:{status:"processing"}, data:{status:"queued"}});
}

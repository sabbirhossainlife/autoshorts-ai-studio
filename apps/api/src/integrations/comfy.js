export async function comfyQueue({settings, workflow, prompt}){
  const base=settings?.comfyUrl||"http://127.0.0.1:8188";
  const wf=workflow||{ "1":{class_type:"EmptyLatentImage",inputs:{width:768,height:1344,batch_size:1}}, "2":{class_type:"CLIPTextEncode",inputs:{text:prompt,clip:[4,0]}} };
  const r=await fetch(`${base}/prompt`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:wf})});
  if(!r.ok) throw new Error(`ComfyUI HTTP ${r.status}`); return r.json();
}
export async function comfyHistory({settings, promptId}){
  const base=settings?.comfyUrl||"http://127.0.0.1:8188";
  const r=await fetch(`${base}/history/${promptId}`); if(!r.ok) throw new Error(`ComfyUI HTTP ${r.status}`); return r.json();
}

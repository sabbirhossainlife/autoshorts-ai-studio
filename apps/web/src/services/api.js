const API = import.meta.env.VITE_API_URL || "";
async function req(path, opts={}){
  const headers={ "Content-Type":"application/json", ...(opts.headers||{}) };
  const csrf=document.cookie.split("; ").find(x=>x.startsWith("autoshorts_csrf="))?.split("=")[1];
  if(csrf && !["GET","HEAD"].includes(opts.method||"GET")) headers["x-csrf-token"]=decodeURIComponent(csrf);
  const r=await fetch(API+path, {...opts, headers, credentials:"include"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j?.error?.message || `Request failed ${r.status}`);
  return j.data;
}
export const api={ get:(p)=>req(p), post:(p,b)=>req(p,{method:"POST", body:JSON.stringify(b||{})}), patch:(p,b)=>req(p,{method:"PATCH", body:JSON.stringify(b||{})}) };

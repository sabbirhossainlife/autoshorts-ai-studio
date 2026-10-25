import crypto from "crypto";
export const SCOPES=["https://www.googleapis.com/auth/youtube.upload","https://www.googleapis.com/auth/youtube.readonly","https://www.googleapis.com/auth/yt-analytics.readonly"];
export function authUrl({clientId, redirect, state}){ const p=new URLSearchParams({client_id:clientId,redirect_uri:redirect,response_type:"code",scope:SCOPES.join(" "),access_type:"offline",prompt:"consent",state}); return `https://accounts.google.com/o/oauth2/v2/auth?${p}`; }
export function hashState(s){ return crypto.createHash("sha256").update(s).digest("hex"); }
export async function exchangeCode({clientId, clientSecret, redirect, code}){
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirect,grant_type:"authorization_code"})});
  const j=await r.json(); if(!r.ok) throw new Error(j.error_description||j.error||"Token exchange failed"); return j;
}
export async function refreshToken({clientSecret, clientId, refresh}){
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({refresh_token:refresh,client_id:clientId,client_secret:clientSecret,grant_type:"refresh_token"})});
  const j=await r.json(); if(!r.ok) throw new Error("Token refresh failed"); return j;
}
// Resumable upload: init session, then PUT bytes. Returns video id only on confirmed 200/201.
export async function uploadVideo({accessToken, metadata, videoPath, onProgress}){
  const fs=await import("fs"); const size=fs.statSync(videoPath).size;
  const init=await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",{method:"POST",headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json","X-Upload-Content-Length":String(size),"X-Upload-Content-Type":"video/mp4"},body:JSON.stringify(metadata)});
  if(!init.ok) throw new Error(`YouTube upload init failed HTTP ${init.status}`);
  const loc=init.headers.get("location"); if(!loc) throw new Error("YouTube did not return an upload session");
  const data=fs.readFileSync(videoPath);
  const up=await fetch(loc,{method:"PUT",headers:{"Content-Type":"video/mp4","Content-Length":String(size)},body:data});
  if(![200,201].includes(up.status)) throw new Error(`YouTube upload failed HTTP ${up.status}`);
  const j=await up.json(); if(!j.id) throw new Error("YouTube did not confirm a video id"); return j;
}

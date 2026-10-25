import { rankTopic } from "../shared.js";
export function scoreTopic(input){ const {score, explanation}=rankTopic(input); return {score, explanation}; }
export function parseRss(xml){
  const items=[]; const blocks=xml.match(/<item[\s\S]*?<\/item>/g)||[];
  for(const b of blocks){ const pick=t=>{ const m=b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m?m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/,"$1").trim():""; }; items.push({title:pick("title"), link:pick("link"), pubDate:pick("pubDate"), description:pick("description").slice(0,500)}); }
  return items;
}
export async function fetchRss(url){ const r=await fetch(url,{headers:{"User-Agent":"AutoShorts/1.0"}}); if(!r.ok) throw new Error(`RSS HTTP ${r.status}`); return parseRss(await r.text()); }
export async function youtubeSearch({apiKey, q, maxResults=10}){
  if(!apiKey) throw new Error("YouTube API key is not configured");
  const u=new URL("https://www.googleapis.com/youtube/v3/search"); u.searchParams.set("part","snippet"); u.searchParams.set("q",q); u.searchParams.set("type","video"); u.searchParams.set("videoDuration","short"); u.searchParams.set("maxResults",String(maxResults)); u.searchParams.set("key",apiKey);
  const r=await fetch(u); if(!r.ok) throw new Error(`YouTube search HTTP ${r.status}`); return r.json();
}

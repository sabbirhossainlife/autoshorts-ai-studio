export const WORKFLOW_STATES = ["draft","researching","script_review","asset_generation","voice_generation","rendering","quality_review","awaiting_approval","uploading","published","paused","cancelled","failed","retry_pending"];
const ALLOWED = { draft:["researching","cancelled"], researching:["script_review","failed","cancelled","paused"], script_review:["asset_generation","failed","cancelled","paused"], asset_generation:["voice_generation","failed","cancelled","paused"], voice_generation:["rendering","failed","cancelled","paused"], rendering:["quality_review","failed","cancelled","paused"], quality_review:["awaiting_approval","rendering","failed","cancelled","paused"], awaiting_approval:["uploading","rendering","failed","cancelled","paused"], uploading:["published","failed","cancelled"], published:[], paused:["draft","researching","script_review","asset_generation","voice_generation","rendering","quality_review","awaiting_approval","cancelled"], failed:["retry_pending","cancelled"], retry_pending:["draft","researching","script_review","asset_generation","voice_generation","rendering","quality_review","awaiting_approval","cancelled"], cancelled:[] };
export function canTransition(from, to){ return (ALLOWED[from]||[]).includes(to); }
export function rankTopic({momentum=0,freshness=0,relevance=0,sourceQuality=0,feasibility=0}={}){
  const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
  const m=clamp(momentum),f=clamp(freshness),r=clamp(relevance),q=clamp(sourceQuality),fe=clamp(feasibility);
  const score=Math.round((m*0.30+f*0.25+r*0.20+q*0.15+fe*0.10)*10)/10;
  return { score, explanation:`Score = momentum ${m}×30% + freshness ${f}×25% + relevance ${r}×20% + source quality ${q}×15% + feasibility ${fe}×10% = ${score}/100. Components are editor-entered or heuristic estimates, not live search volume or audience data.` };
}
export function validateTitle(t){ return typeof t==="string" && t.trim().length>0 && t.length<=100; }
export function isValidDuration(d){ return [20,30,45,60].includes(Number(d)); }
export const CATEGORIES = ["AI and Technology","Science and Space","History and Mystery","Business and Entrepreneurship","Educational Facts","Nature and Wildlife"];

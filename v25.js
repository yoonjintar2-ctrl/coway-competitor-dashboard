/* v25 — 2026-11-03: 캠페인 분석 빠르게 — 한 번 받은 상세는 화면에 보관, 막대·카드에 마우스를 올리면 미리 받아 둠 */
var v25Cache=new Map(),v25BaseApi=api;
api=async function(path,payload){
 if(payload){v25Cache.clear();return v25BaseApi(path,payload)}
 if(typeof path==='string'&&path.startsWith('/api/campaign/')){
  if(!v25Cache.has(path)){const pr=v25BaseApi(path).catch(e=>{v25Cache.delete(path);throw e});v25Cache.set(path,pr)}
  const data=await v25Cache.get(path);return typeof structuredClone==='function'?structuredClone(data):JSON.parse(JSON.stringify(data));
 }
 return v25BaseApi(path,payload);
};
function v25Url(id){return '/api/campaign/'+id+'?'+new URLSearchParams({start:listing.period.history_start||listing.period.start,end:listing.period.end})}
function v25Prefetch(id){if(!id||!listing||String(id).startsWith('ytc-'))return;const u=v25Url(id);if(!v25Cache.has(u))api(u).catch(()=>{})}
var v25Timer=null;
document.addEventListener('pointerover',e=>{const el=e.target.closest('[data-gantt],[data-campaign]');if(!el)return;const id=el.dataset.gantt||el.dataset.campaign;clearTimeout(v25Timer);v25Timer=setTimeout(()=>v25Prefetch(id),250)},true);
// 업데이트 단추·필터 변경 시에는 새로 받기
document.addEventListener('click',e=>{if(e.target.closest('#refresh'))v25Cache.clear()},true);
document.addEventListener('change',e=>{if(e.target.closest('header .toolbar'))v25Cache.clear()},true);

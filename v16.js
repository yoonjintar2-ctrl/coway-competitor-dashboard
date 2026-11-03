/* v16 — 2026-11-03: YouTube 신규 캠페인 후보(경쟁사 공식 YouTube 조회수 10만+ · 아덱스 미연결) 타임라인 표시와 팝업 */
var v16BaseTimeline=timeline;
timeline=function(){
 let h=v16BaseTimeline();
 return h.replace(/<button class="gantt-bar v5-flight([^"]*)" data-gantt="(ytc-[^"]+)"([\s\S]*?)<\/button>/g,(a,cls,id,rest)=>{
  const c=listing.campaigns.find(x=>x.id===id);if(!c)return a;
  rest=rest.replace(/<small>[\s\S]*?<\/small>/,`<small><i class="v5-mi yt">${v5Icon.yt}</i> 조회수 ${number(c.youtube_views)}회 · 영상 ${c.candidate_videos.length}개 · 아덱스 확인 전</small>`);
  rest=rest.replace(/(<strong>)(?:<span>)?YouTube 신규 후보 · /,'$1<em class="v16-badge">신규 후보</em><span>');
  return `<button class="gantt-bar v5-flight v16-yt${cls}" data-gantt="${id}"${rest}</button>`;
 });
};
function v16OpenCandidate(id){
 const c=listing.campaigns.find(x=>x.id===id);if(!c)return;const dialog=$('#detail');dialog.className='post-dialog v12-yt-dialog';
 $('#detail-body').innerHTML=`<small>${esc(c.category_label)} · ${esc(c.advertiser)} · YouTube 신규 캠페인 후보</small><h2>공식 YouTube 조회수 10만+ 영상 ${c.candidate_videos.length}개</h2><p class="footnote">아덱스 디지털 집계가 늦어 아직 광고비·소재와 연결되지 않은 영상입니다. 같은 광고주·품목에 공개일 전후 아덱스 집행이 없을 때만 후보로 올립니다. 아덱스 반영 후 다른 매체와 함께 캠페인으로 확정합니다.</p><div class="v12-yt-list">${c.candidate_videos.map(x=>`<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${x.thumbnail?`<img src="${esc(safeUrl(x.thumbnail))}" alt="">`:'<i></i>'}<div><b>${esc(x.title||'')}</b><small>${esc(x.published_at)} · 조회수 ${number(x.view_count)}회</small></div><span>열기 ↗</span></a>`).join('')}</div>`;
 dialog.showModal();
}
document.addEventListener('click',e=>{const b=e.target.closest('#gantt-scroll [data-gantt^="ytc-"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const box=$('#campaign-hover');if(box)box.hidden=true;v16OpenCandidate(b.dataset.gantt)},true);
var v16BaseDetail=detailView;
detailView=function(d){return v16BaseDetail(d).replace(/<option value="ytc-[^"]*"[^>]*>[^<]*<\/option>/g,'')};

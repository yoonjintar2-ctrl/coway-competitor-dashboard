/* v19 — 2026-11-03: 단색 선형 로딩, YouTube 신규 후보 팝업 카드(자세히 보기 → 영상 목록) */
function v17Loader(node){if(node.dataset.v17)return;node.dataset.v17='1';const text=node.textContent.trim();
 node.innerHTML=`<svg class="v19-loader" viewBox="0 0 260 110" aria-hidden="true"><path class="v19-axis" d="M14 92H246"/><path class="v19-area" d="M14 92 L14 70 C40 66 52 48 78 52 S118 78 142 60 S186 22 210 30 S238 40 246 34 L246 92 Z"/><path class="v19-line" d="M14 70 C40 66 52 48 78 52 S118 78 142 60 S186 22 210 30 S238 40 246 34"/><circle class="v19-dot" r="4" cx="246" cy="34"/></svg><p>${esc(text||'자료를 집계하고 있습니다.')}</p>`}
document.querySelectorAll('#content .loading').forEach(n=>{delete n.dataset.v17;v17Loader(n)});
// YouTube 신규 후보: 아덱스 광고비·소재가 아직 없어 캠페인 분석 대신 영상 목록 팝업
document.addEventListener('click',e=>{const b=e.target.closest('[data-campaign^="ytc-"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const box=$('#campaign-hover');if(box)box.hidden=true;v16OpenCandidate(b.dataset.campaign)},true);
var v19BaseShow=v5Show;
v5Show=function(id,target){v19BaseShow(id,target);if(!String(id).startsWith('ytc-'))return;const c=listing.campaigns.find(x=>x.id===id),box=$('#campaign-hover');if(!c||!box)return;
 for(const dt of box.querySelectorAll('dt')){const dd=dt.nextElementSibling;if(!dd)continue;
  if(dt.textContent.includes('집행액')){dt.textContent='YouTube 조회수';dd.textContent=number(c.youtube_views)+'회 · 영상 '+c.candidate_videos.length+'개'}
  else if(dt.textContent.includes('기간')){dt.textContent='영상 공개';dd.textContent=dateLabel(c.first_seen)+' ~'}
  else if(dt.textContent.includes('매체')){dd.textContent='YouTube (아덱스 광고비 확인 전)'}}
 const h=box.querySelector('h3,h2,strong');if(h)h.textContent=h.textContent.replace(/^YouTube 신규 후보 · /,'');
 const btn=box.querySelector('[data-campaign]');if(btn)btn.innerHTML='영상 보기 ↗';
};

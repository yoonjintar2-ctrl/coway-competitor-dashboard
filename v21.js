/* v21 — 2026-11-03: 상단 최근 캠페인 띠는 최근 30일 안에 시작한 새 캠페인(YouTube 후보 포함)만, 없으면 비움 */
function v17Recent(){
 const end=v3Day(listing.period.end);
 const rows=listing.campaigns.filter(c=>(c.review_status==='yt_candidate'?end-v3Day(c.first_seen)<=60:end-v3Day(c.first_seen)<=60&&c.review_status!=='evergreen')&&(category==='all'||c.category===category)).sort((x,y)=>y.first_seen.localeCompare(x.first_seen)||y.adjusted_amount-x.adjusted_amount);
 const head=`<div class="v17-recent-head"><b>최근 2개월 새로 시작한 캠페인</b><small>${rows.length?rows.length+'건 · 시작일 최신순 · 누르면 분석':'없음'}</small></div>`;
 if(!rows.length)return `<section class="v17-recent v21-empty">${head}</section>`;
 return `<section class="v17-recent">${head}<div class="v17-recent-rail">${rows.map(c=>{const yt=c.review_status==='yt_candidate';
  return `<button class="v17-rc${yt?' yt':''}" ${yt?`data-v17-ytc="${c.id}"`:`data-campaign="${c.id}"`}><em>${yt?'YouTube 신규 후보':'NEW'}</em>${c.thumbnail?`<img src="${esc(safeUrl(c.thumbnail))}" alt="" loading="lazy">`:`<i>${esc(c.advertiser.slice(0,1))}</i>`}<span><small>${esc(c.category_label)} · ${esc(c.advertiser)}</small><b>${esc(v5Short(c).replace(/^YouTube 신규 후보 · /,''))}</b><small>${dateLabel(c.first_seen).slice(5)} ${yt?'공개':'시작'}${!yt&&v17Open(c)?' · 진행 중':''}</small><small>${yt?'조회수 '+number(c.youtube_views)+'회 · 아덱스 확인 전':v17Money(v4Money(c.adjusted_amount)+'원')}</small></span></button>`}).join('')}</div></section>`;
}
// 최근 캠페인 띠 좌우 이동 단추(영역에 마우스를 올렸을 때만, 넘칠 때만)
var v21BaseTimeline=timeline;
timeline=function(){return v21BaseTimeline().replace(/(<div class="v17-recent-rail">)/,'<button class="v21-nav prev" data-v21-nav="-1" aria-label="이전 캠페인">‹</button><button class="v21-nav next" data-v21-nav="1" aria-label="다음 캠페인">›</button>$1')};
function v21NavState(){const r=document.querySelector('.v17-recent-rail');if(!r)return;const p=document.querySelector('.v21-nav.prev'),n=document.querySelector('.v21-nav.next');const over=r.scrollWidth>r.clientWidth+2;if(p)p.hidden=!over||r.scrollLeft<=2;if(n)n.hidden=!over||r.scrollLeft>=r.scrollWidth-r.clientWidth-2}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v21-nav]');if(!b)return;e.preventDefault();const r=document.querySelector('.v17-recent-rail');if(r)r.scrollBy({left:Number(b.dataset.v21Nav)*Math.max(300,r.clientWidth*.8),behavior:'smooth'})});
document.addEventListener('scroll',e=>{if(e.target.classList?.contains('v17-recent-rail'))v21NavState()},true);
new MutationObserver(()=>{if(document.querySelector('.v17-recent-rail'))requestAnimationFrame(v21NavState)}).observe(document.getElementById('content')||document.body,{childList:true});
addEventListener('resize',v21NavState);

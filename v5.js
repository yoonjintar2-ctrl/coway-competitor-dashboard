/* v5 — 2026-11-03 Claude: 타임라인(막대+하단 라벨, 대각선 팝업, 플로팅 스크롤), 캠페인 분석 레이아웃 개편. v4 다음에 로드. */
const v5Icon={
 tv:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="13" rx="2.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 21h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 yt:'<svg viewBox="0 0 28 20" aria-hidden="true"><rect x="0.5" y="0.5" width="27" height="19" rx="5" fill="currentColor"/><path d="M11.2 5.6v8.8l7.4-4.4z" fill="#fff"/></svg>',
 video:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 9v6l5-3z" fill="currentColor"/></svg>',
 banner:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M7 10h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 radio:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="8" width="19" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="15.5" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 8l12-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 print:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function v5MediaIcons(c){
 const m=c.media||{},out=[];const tv=(m.terrestrial||0)+(m.general||0)+(m.cable||0);
 if(tv>0)out.push(['tv','TV',tv]);if(c.youtube_spend>0)out.push(['yt','YouTube',c.youtube_spend]);
 const otherVideo=(m.digital_video||0)-(c.youtube_spend||0);if(otherVideo>1)out.push(['video','기타 디지털 영상',otherVideo]);
 if(m.digital_banner>0)out.push(['banner','디지털 배너',m.digital_banner]);if(m.radio>0)out.push(['radio','라디오',m.radio]);if(m.print>0)out.push(['print','신문·잡지',m.print]);
 return out.sort((a,b)=>b[2]-a[2]).map(([k,label,v])=>`<i class="v5-mi ${k}" title="${label} ${v4Money(v)}원">${v5Icon[k]}</i>`).join('');
}
function v5Short(c){let n=c.name;if(n.startsWith(c.advertiser+' · '))n=n.slice(c.advertiser.length+3);if(n.startsWith(c.advertiser))n=n.slice(c.advertiser.length).replace(/^\s*·\s*/,'')||n;return n}

/* ---------- 타임라인 ---------- */
var v5LaneH=58;
var v5BaseTimeline=timeline;
timeline=function(){
 let html=v5BaseTimeline();
 // 막대 마크업 교체: 기간은 채워진 얇은 막대, 라벨은 막대 아래
 html=html.replace(/<button class="gantt-bar ([^"]*)" data-gantt="([^"]+)"([^>]*)style="([^"]*)top:(\d+)px">[\s\S]*?<\/button>/g,(all,cls,id,attrs,style,top)=>{
   const c=listing.campaigns.find(x=>x.id===id);if(!c)return all;const color=brandColor(c.advertiser),ever=c.review_status==='evergreen';
   return `<button class="gantt-bar v5-flight ${cls} ${ever?'is-evergreen':''}" data-gantt="${id}"${attrs}style="${style}top:${top}px;--brand:${color}"><i class="v5-bar"></i>${c.ongoing_observed?'<i class="onair-edge" aria-hidden="true"></i>':''}<span class="gantt-bar-content v5-label"><strong>${esc(c.advertiser)} <span>${esc(v5Short(c))}</span>${ever?'<em>상시</em>':''}</strong><small>${v4Money(c.adjusted_amount)}원 <span class="v5-mis">${v5MediaIcons(c)}</span>${c.ongoing_observed?'<b class="v5-onair">ON AIR</b>':''}</small></span></button>`});
 html=html.replace('<div class="glass gantt-shell">','<div class="glass gantt-shell v5-shell"><button class="v5-float prev" data-gantt-scroll="-1" aria-label="과거로 이동">‹</button><button class="v5-float next" data-gantt-scroll="1" aria-label="최근으로 이동">›</button>');
 return html;
};
placeBrandFlights=function(rows,left,right){
 const by=new Map();for(const c of rows){if(!by.has(c.advertiser))by.set(c.advertiser,[]);by.get(c.advertiser).push(c)}
 const groups=[...by].map(([name,items])=>({name,items:items.sort((a,b)=>a.first_seen.localeCompare(b.first_seen)||a.id.localeCompare(b.id))})).sort((a,b)=>a.items[0].first_seen.localeCompare(b.items[0].first_seen)||a.name.localeCompare(b.name));
 // 같은 광고주는 인접 배치, 라벨 길이까지 고려해 겹치지 않게 레인 배정
 const laneEdge=[];const items=[];let base=0;
 for(const g of groups){const local=[];for(const c of g.items){if(c._left+c._span<left||c._left>right)continue;const begin=Math.max(left,c._left),finish=Math.max(Math.min(right,c._left+c._span),begin+(c._labelDays||6));let lane=0;while(local[lane]!==undefined&&begin<=local[lane]+1)lane++;local[lane]=finish;items.push({c,lane:base+lane})}base+=local.length}
 return {items,count:base};
};
layoutVisibleFlights=function(){
 const el=$('#gantt-scroll');if(!el)return;const label=innerWidth<=800?130:164,px=parseFloat(el.style.getPropertyValue('--day'))||12,left=el.scrollLeft/px,right=left+(el.clientWidth-label)/px;
 const origin=v3Day(listing.period.history_start||listing.period.start),from=v3ISO(origin+Math.floor(left)),to=v3ISO(Math.min(v3Day(listing.period.end),origin+Math.ceil(right)-1));$('#subtitle').textContent=dateLabel(from)+' — '+dateLabel(to)+' 표시 · 좌우 버튼으로 이동';const cap=$('#gantt-window-label');if(cap)cap.textContent=dateLabel(from)+' — '+dateLabel(to);
 for(const month of el.querySelectorAll('.gantt-month-track span')){const next=month.nextElementSibling,inside=el.scrollLeft>=month.offsetLeft&&el.scrollLeft<(next?.offsetLeft||Infinity);month.style.paddingLeft=(inside?el.scrollLeft-month.offsetLeft+9:9)+'px'}
 for(const row of el.querySelectorAll('.gantt-row')){
   const bars=[...row.querySelectorAll('[data-gantt]')],byId=new Map(bars.map(b=>[b.dataset.gantt,b])),rows=bars.map(b=>{const c=listing.campaigns.find(x=>x.id===b.dataset.gantt);const lab=b.querySelector('.v5-label');c._labelDays=((lab?.scrollWidth||120)+14)/px;return c});
   const placed=placeBrandFlights(rows,left,right);for(const b of bars)b.hidden=true;
   for(const {c,lane} of placed.items){const b=byId.get(c.id);b.hidden=false;b.style.top=(12+lane*v5LaneH)+'px';const lab=b.querySelector('.v5-label');const offset=Math.max(0,el.scrollLeft-b.offsetLeft);lab.style.left=offset+'px'}
   row.style.height=Math.max(78,placed.count*v5LaneH+20)+'px';const s=row.querySelector('.gantt-category small');if(s)s.textContent=placed.items.length+'개 캠페인';
 }
};
// 팝업: 커서 기준 우측 위 대각선, 오른쪽 끝이면 좌측 위. 다른 막대로 지나갈 때는 잠깐 기다려 팝업으로 이동할 수 있게 함
var v5Pointer={x:0,y:0},v5Pending=null;
document.addEventListener('pointermove',e=>{v5Pointer={x:e.clientX,y:e.clientY}},{passive:true});
var v5BaseHover=showCampaignHover;
showCampaignHover=function(id,target){
 const box=$('#campaign-hover');clearTimeout(v5Pending);
 if(box&&!box.hidden&&v3HoverId&&v3HoverId!==id){v5Pending=setTimeout(()=>v5Show(id,target),260);return}
 v5Show(id,target);
};
function v5Show(id,target){
 v5BaseHover(id,target);const box=$('#campaign-hover');if(!box)return;box.classList.add('v5-hover');
 const r=target.getBoundingClientRect(),useRect=!(v5Pointer.x||v5Pointer.y)||document.activeElement===target&&!target.matches(':hover');
 const px=useRect?r.left+Math.min(r.width,140):v5Pointer.x,py=useRect?r.top:v5Pointer.y,w=box.offsetWidth||310,h=box.offsetHeight||300,gap=18;
 let x=px+gap,y=py-h-gap;if(x+w>innerWidth-12)x=px-w-gap;if(y<12)y=Math.min(innerHeight-h-12,py+gap);
 box.style.left=Math.max(12,x)+'px';box.style.top=Math.max(12,y)+'px';
}
document.addEventListener('pointerover',e=>{if(e.target.closest('#campaign-hover'))clearTimeout(v5Pending)},true);
var v5BaseMount=mountTimeline;mountTimeline=function(){v5BaseMount();const el=$('#gantt-scroll');if(!el||el.dataset.v5)return;el.dataset.v5='1';el.addEventListener('scroll',v5FloatState,{passive:true});v5FloatState()};
function v5FloatState(){const el=$('#gantt-scroll');if(!el)return;const p=document.querySelector('.v5-float.prev'),n=document.querySelector('.v5-float.next');if(p)p.disabled=el.scrollLeft<=2;if(n)n.disabled=el.scrollLeft>=el.scrollWidth-el.clientWidth-2}

/* ---------- 캠페인 분석 ---------- */
var v5TrendKey='';
function v5TopMedia(d){const t=new Map();for(const r of d.treemap||[]){const k=r.parent==='TV'?'TV · '+r.group:r.parent==='디지털'?r.group:r.parent;t.set(k,(t.get(k)||0)+r.amount)}const total=[...t.values()].reduce((a,b)=>a+b,0)||1;return [...t].sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k} ${Math.round(v/total*100)}%`)}
function v5Kpis(d){const c=d.campaign,s=c.flight_start,e=c.ongoing?'':c.flight_end,top=v5TopMedia(d);
 return `<div class="campaign-kpis v5-kpis"><div class="glass"><span>${adjusted()?'보정 추정 광고비':'관측 광고비'}</span><strong>${v4Money(d.amount)}원</strong><small>원본 ${number(d.raw_amount)}원</small></div><div class="glass"><span>캠페인 기간</span><strong class="v5-period">${dateLabel(s)} ~ ${e?dateLabel(e):''}</strong><small>${c.ongoing?'최근 3일 내 집행 관측 · 종료일 미정':'광고비 관측 첫날 ~ 마지막 날'}</small></div><div class="glass"><span>소재</span><strong>${d.creatives.length}개</strong><small>${d.creatives.filter(r=>r.thumbnail).length}개 원본 이미지 확인</small></div><div class="glass"><span>주요 운영 매체</span><strong class="v5-media-kpi">${esc(top[0]||'—')}</strong><small>${esc(top[1]?'다음 '+top[1]:'')}</small></div></div>`}
// 주요 소재 버튼
v4MediaBadges=function(){return ''};
v4YoutubeRow=function(r){
 const v=r.youtube_videos||[],tv=(r.media||[]).some(k=>['terrestrial','general','cable'].includes(k));let out='';
 if(r.storyboard&&tv)out+=`<button class="v5-link tv" data-story-creative="${esc(r.creative_id)}" data-storyboard="${esc(r.storyboard)}" data-story-title="${esc(r.copyline)}">${v5Icon.tv}<span>TV 스토리보드 확인하기</span>↗</button>`;
 else if(tv)out+=`<div class="v4-yt muted">TV 스토리보드 미확보 · ${esc(r.image_status==='unmatched'?'AdCreative 정확 매칭 미확정':'AdCreative 대조 전')}</div>`;
 if(r.youtube_status==='matched'){const main=v.find(x=>!x.shorts)||v[0],views=v.some(x=>x.view_count!=null)?v.reduce((a,x)=>a+(x.view_count||0),0):null;out+=`<a class="v5-link yt" href="${esc(safeUrl(main.url))}" target="_blank" rel="noopener" title="${esc(main.title)}">${v5Icon.yt}<span>YouTube 소재 확인하기</span>↗</a>${views!=null?`<small class="v5-views">누적 조회수 ${number(views)}회${v.length>1?' · '+v.length+'개 버전':''}</small>`:''}`}
 else if(r.youtube_status==='not_found')out+='<div class="v4-yt muted">공식 YouTube에서 같은 소재 미확인</div>';
 else if(r.youtube_status==='no_channel')out+='<div class="v4-yt muted">공식 YouTube 채널 미확인 광고주</div>';
 return `<div class="v5-links">${out}</div>`;
};
// 주차별 검색 관심도 + 뉴스 하이라이트
function v5TrendPanel(d){
 const g=d.trends;const points=(g?.points||[]);const series=new Map();for(const p of points){if(!series.has(p.keyword))series.set(p.keyword,[]);series.get(p.keyword).push(p)}
 if(!series.size)return `<section class="glass section">${header('주차별 브랜드 검색 관심도')}${empty('이 광고주의 주간 트렌드 연결을 확인 중입니다.')}</section>`;
 const keys=[...series.keys()].slice(0,5);if(!keys.includes(v5TrendKey))v5TrendKey=keys[0];
 let rows=series.get(v5TrendKey);if(g.time_unit!=='week'){const m=new Map();for(const r of rows){const t=new Date(r.day+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);const k=t.toISOString().slice(0,10);if(!m.has(k))m.set(k,[]);m.get(k).push(r.ratio)}rows=[...m].map(([day,vs])=>({day,ratio:vs.reduce((a,b)=>a+b,0)/vs.length}))}
 rows=[...rows].sort((a,b)=>a.day.localeCompare(b.day));
 const W=640,H=330,L=44,R=14,T=104,B=30,peak=Math.max(1,...rows.map(r=>r.ratio)),x=i=>L+i*(W-L-R)/Math.max(1,rows.length-1),y=v=>H-B-v/peak*(H-T-B);
 const weekOf=s=>{const t=new Date(s.slice(0,10)+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);return t.toISOString().slice(0,10)};
 const idx=new Map(rows.map((r,i)=>[r.day,i]));const news=(d.news||[]).filter(n=>idx.has(weekOf(n.published_at))).sort((a,b)=>a.published_at.localeCompare(b.published_at));
 const byWeek=new Map();for(const n of news){const w=weekOf(n.published_at);if(!byWeek.has(w))byWeek.set(w,[]);byWeek.get(w).push(n)}
 let lastX=-999,level=0;const marks=[...byWeek].map(([w,list])=>{const i=idx.get(w),cx=x(i),cy=y(rows[i].ratio);level=cx-lastX<120?(level+1)%3:0;lastX=cx;const ly=18+level*28,title=list[0].title.replace(/\[[^\]]*\]|\([^)]*\)/g,'').trim(),short=title.length>16?title.slice(0,15)+'…':title;
   return `<g class="v5-news-mark" data-news="${esc(list.map(n=>n.id).join(','))}" tabindex="0" role="button" aria-label="${esc(w)} 주 뉴스 ${list.length}건: ${esc(title)}"><line x1="${cx}" y1="${ly+12}" x2="${cx}" y2="${cy-7}" stroke="#f08a24" stroke-width="1.4" stroke-dasharray="3 2"/><rect x="${Math.min(W-R-150,Math.max(L,cx-75))}" y="${ly-4}" width="150" height="20" rx="5" fill="#fff4e8" stroke="#f3b071"/><text x="${Math.min(W-R-75,Math.max(L+75,cx))}" y="${ly+10}" text-anchor="middle" class="v5-news-text">${esc(short)}${list.length>1?' 외 '+(list.length-1):''}</text><circle cx="${cx}" cy="${cy}" r="7" fill="#f08a24" fill-opacity=".25" stroke="#f08a24" stroke-width="2"/></g>`}).join('');
 const svg=`<svg class="v3-chart v5-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="주차별 네이버 검색 관심도와 뉴스">${[0,.5,1].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(peak*v)}" y2="${y(peak*v)}" stroke="#dce8ef"/><text x="${L-8}" y="${y(peak*v)+4}" text-anchor="end">${Number((peak*v).toFixed(1))}</text>`).join('')}<polyline points="${rows.map((r,i)=>x(i)+','+y(r.ratio)).join(' ')}" fill="none" stroke="#25a4dc" stroke-width="2.5"/>${rows.map((r,i)=>`<circle cx="${x(i)}" cy="${y(r.ratio)}" r="2.5" fill="#25a4dc"><title>${r.day} 주 · ${r.ratio.toFixed(2)}</title></circle>`).join('')}${marks}${rows.filter((r,i)=>i%Math.max(1,Math.ceil(rows.length/6))===0).map(r=>`<text x="${x(idx.get(r.day))}" y="${H-8}" text-anchor="middle">${r.day.slice(2,7).replace('-','.')}</text>`).join('')}</svg>`;
 return `<section class="glass section v5-trend-panel">${header('주차별 브랜드 검색 관심도',`네이버 주간 상대지수 · 주황 표시는 기사 원문 발행일이 확인된 뉴스(${news.length}건) · 클릭하면 상세`)}<div class="v5-chips">${keys.map(k=>`<button data-trend-key="${esc(k)}" class="${k===v5TrendKey?'active':''}">${esc(k)}</button>`).join('')}</div>${svg}<p class="footnote">${esc(g.definition||'')} <a href="${esc(safeUrl(g.source_url))}" target="_blank" rel="noopener">네이버 원본 ↗</a></p></section>`;
}
function v5ShowNews(ids){const list=(detailData?.news||[]).filter(n=>ids.includes(n.id));if(!list.length)return;const dialog=$('#detail');dialog.className='post-dialog v5-news-dialog';
 $('#detail-body').innerHTML=`<small>주요 뉴스 · ${list.length}건</small>${list.map(n=>`<article class="v5-news-item"><time class="v4-post-date static">${dateLabel(n.published_at.slice(0,10))}</time><h2>${esc(n.title)}</h2><p>${esc(n.publisher||'')} · 관련 상품 ${esc(n.product||'—')} · ${n.match_type==='campaign_related'?'캠페인 관련 기사 원문 확인':'상품·광고주 관련 기사 (캠페인 직접 연계는 별도 확인)'}</p><a class="primary post-original" href="${esc(safeUrl(n.url))}" target="_blank" rel="noopener">기사 원문 열기 ↗</a></article>`).join('')}<p class="footnote">기사 본문은 저작권 보호를 위해 저장·재게시하지 않고, 원문 발행일과 제목만 검증해 보관합니다.</p>`;dialog.showModal()}
// 경쟁사 1년 광고비: 표식 hover 카드
var v5BaseAnnual=annualPanel;
annualPanel=function(d){let h=v5BaseAnnual(d);h=h.replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="3" fill="([^"]+)"><title>([^<]+) · (\d{4}-\d{2}) · ([^<]+)<\/title><\/circle>/g,(a,cx,cy,fill,name,month,amt)=>`<circle cx="${cx}" cy="${cy}" r="4" fill="${fill}"/><circle class="v5-annual-hit" cx="${cx}" cy="${cy}" r="11" fill="transparent" data-annual-point="${name}|${month}" tabindex="0"/>`);return h.replace('한 그래프에서 월별 관측 광고비를 비교합니다.','월별 관측 광고비 · 표식에 마우스를 올리면 해당 월 매체·소재 요약');};
function v5AnnualCard(el){const key=el.dataset.annualPoint,info=detailData?.annual_detail?.[key];let box=$('#annual-card');if(!box){box=document.createElement('aside');box.id='annual-card';box.className='glass';document.body.appendChild(box)}
 const [adv,month]=key.split('|');const total=info?Object.values(info.media).reduce((a,b)=>a+b,0):0;
 box.innerHTML=info?`<small style="color:${signatureColor(adv)}">${esc(adv)} · ${month.replace('-','.')}</small><strong>${v4Money(total)}원</strong><div class="v5-card-media">${Object.entries(info.media).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||k} ${Math.round(v/total*100)}%</span>`).join('')}</div><ol>${info.creatives.map(c=>`<li>${c.thumbnail?`<img src="${esc(safeUrl(c.thumbnail))}" alt="">`:'<i class="v5-noimg"></i>'}<div><b>${esc(c.product)}</b><small>${esc((c.copyline||'').replace(/^,/,''))}</small><em>${v4Money(c.amount)}원</em></div></li>`).join('')}</ol>${info.creative_count>3?`<p>외 소재 ${info.creative_count-3}개</p>`:''}`:`<small>${esc(adv)} · ${month}</small><p>세부 소재 자료 없음</p>`;
 box.hidden=false;const r=el.getBoundingClientRect(),w=box.offsetWidth,h=box.offsetHeight;let x=r.right+14,y=r.top-h-10;if(x+w>innerWidth-12)x=r.left-w-14;if(y<12)y=r.bottom+10;box.style.left=Math.max(12,x)+'px';box.style.top=Math.max(12,Math.min(y,innerHeight-h-12))+'px'}
document.addEventListener('pointerover',e=>{const p=e.target.closest('[data-annual-point]');if(p)v5AnnualCard(p)});
document.addEventListener('pointerout',e=>{const p=e.target.closest('[data-annual-point]');if(p){const b=$('#annual-card');if(b)b.hidden=true}});
document.addEventListener('focusin',e=>{const p=e.target.closest('[data-annual-point]');if(p)v5AnnualCard(p)});
// 브랜드 포스팅: Instagram / YouTube(광고 소재 제외) 분리
var v5BasePosts=brandPostsPanel;
brandPostsPanel=function(d){const info=d.brand_posts;if(!info)return '';const all=info.posts,ig=all.filter(p=>p.platform==='instagram'),yt=all.filter(p=>p.platform==='youtube'&&!p.is_ad),excluded=all.filter(p=>p.platform==='youtube'&&p.is_ad).length;
 const section=(title,rows,note)=>{const h=v5BasePosts({...d,brand_posts:{...info,posts:rows}});return h.replace('캠페인 기간 브랜드 포스팅',title).replace(/id="brand-post-rail"/,'').replace(/<select id="post-sort"[\s\S]*?<\/select>/,'').replace('<p class="footnote">',`<p class="footnote">${note} `)};
 return `<div class="v5-posts">${ig.length?section('캠페인 기간 Instagram 포스팅',ig,'공식 Instagram 게시물 ·'):''}${section('캠페인 기간 YouTube 포스팅',yt,`광고 소재(공식 업로드된 TV·디지털 광고 영상 ${excluded}개)는 제외 ·`)}</div>`};
// 다른 캠페인: 썸네일 비지 않게
otherCampaignsPanel=function(d){const rows=d.other_campaigns||[];return `<section class="glass section other-campaigns">${header(`${esc(d.campaign.advertiser)}의 다른 캠페인`,'최근 12개월 · 전체 등록 품목 · 클릭해 캠페인 분석 이동')}<div class="other-campaign-rail">${rows.map(c=>`<button data-campaign="${c.id}" class="other-campaign-card" style="--brand:${signatureColor(c.advertiser)}">${c.thumbnail?`<img src="${esc(safeUrl(c.thumbnail))}" alt="">`:`<div class="v5-thumb-fill"><b>${esc(c.category_label)}</b><span>${esc((c.products||[])[0]||v5Short(c))}</span><small>${c.review_status==='evergreen'?'상시 캠페인':'소재 이미지 미확보'}</small></div>`}<div><small>${esc(c.category_label)} · ${dateLabel(c.first_seen)}${c.review_status==='evergreen'?' · 상시':''}</small><strong>${esc(c.name)}</strong><span>${v4Money(c.adjusted_amount)}원 · ${buckets[c.main_media]||c.main_media}</span></div></button>`).join('')||empty('확인된 다른 캠페인이 없습니다.')}</div></section>`};
detailView=function(d){const c=d.campaign;return `<div class="analysis-heading"><div><span class="eyebrow">${esc(c.advertiser)} · ${esc(listing.categories.find(x=>x.code===c.category)?.label)}${c.review_status==='evergreen'?' · 상시 캠페인':''}</span><h2>${esc(c.name)}</h2>${nameEvidence(c)}<details class="campaign-rationale"><summary>캠페인 묶음 판단 근거</summary><p>${esc(c.rationale)}</p></details></div><label>다른 캠페인<select id="campaign-switch" aria-label="다른 캠페인">${[...new Map([c,...(d.other_campaigns||[]),...listing.campaigns].map(g=>[g.id,g])).values()].map(g=>`<option value="${g.id}" ${g.id===c.id?'selected':''}>${esc(g.advertiser+' · '+g.name)}</option>`).join('')}</select></label></div>${v5Kpis(d)}${materialCarousel(d)}<section class="glass section">${header('집행 매체별 광고비','TV 채널·PP, 디지털 비디오·기기, 인쇄 매체를 구분합니다.')}${treeMap(d.treemap)}</section><div class="v5-two">${weeklyPanel(d.daily_media||d.daily)}${v5TrendPanel(d)}</div>${annualPanel(d)}${brandPostsPanel(d)}${otherCampaignsPanel(d)}${advertiserMonthlyPanel(d)}`};
document.addEventListener('click',async e=>{
 const k=e.target.closest('[data-trend-key]');if(k){v5TrendKey=k.dataset.trendKey;const p=document.querySelector('.v5-trend-panel');if(p)p.outerHTML=v5TrendPanel(detailData);return}
 const n=e.target.closest('[data-news]');if(n){v5ShowNews(n.dataset.news.split(','));return}
});
document.addEventListener('keydown',e=>{const n=e.target.closest?.('[data-news]');if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();v5ShowNews(n.dataset.news.split(','))}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-post-scroll]');if(!b)return;const rail=b.closest('.brand-posts')?.querySelector('.brand-post-rail');if(rail){e.stopImmediatePropagation();rail.scrollBy({left:Number(b.dataset.postScroll)*470,behavior:'smooth'})}},true);
function v5FloatPos(){const shell=document.querySelector('.v5-shell');if(!shell)return;const r=shell.getBoundingClientRect(),top=Math.max(r.top,60),bot=Math.min(r.bottom,innerHeight);if(bot<=top)return;shell.style.setProperty('--float-top',((top+bot)/2-r.top)+'px')}
window.addEventListener('scroll',v5FloatPos,{passive:true});window.addEventListener('resize',v5FloatPos);
var v5BaseMount2=mountTimeline;mountTimeline=function(){v5BaseMount2();v5FloatPos()};

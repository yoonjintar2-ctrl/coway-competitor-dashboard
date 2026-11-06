/* v17 — 2026-11-03 Claude: 타임라인(연/월 2단 머리글, 최근 캠페인 띠, 최근 30일 강조, 진행 중 캡슐 우측 열림, 10월 칸 확장, 카드 여백·정렬, 팝업 대각선, 금액 표기),
   로딩 애니메이션, 캠페인 분석(YouTube 버튼 2줄, 트리맵 범례·소액 칸, 주차 그래프 꽉 차게, 쿼리 추이 단순화, 경쟁사 그라데이션 영역, Instagram 안내, 다른 캠페인 무채색). */
var V17_EXTRA=24;                 // 마지막 달(진행 중 정보 표시 공간) 확장 일수
var V17_PAD=12,V17_BAR=42,V17_GAP=12,V17_CARDGAP=10;
function v17Money(h){return h.replace(/([\d,]+)\.(\d)만/g,(a,i,d)=>Math.round(Number(i.replace(/,/g,'')+'.'+d)).toLocaleString('ko-KR')+'만')}
function v17Range(){const a=v3Day(listing.period.history_start||listing.period.start),b=v3Day(listing.period.end);return {a,b,days:b-a+1}}
function v17IsNew(c){return c.review_status!=='evergreen'&&c.review_status!=='yt_candidate'&&v3Day(listing.period.end)-v3Day(c.first_seen)<=30}
function v17Active(c){return c.review_status!=='evergreen'&&c.review_status!=='yt_candidate'&&v3Day(listing.period.end)-v3Day(c.last_seen)<=30}
function v17Open(c){return c.review_status!=='yt_candidate'&&(c.ongoing_observed||v3Day(listing.period.end)-v3Day(c.last_seen)<=2)}

/* 1. 타임라인 마크업 */
var v17BaseTimeline=timeline;
timeline=function(){
 let h=v17BaseTimeline();const {a,b,days}=v17Range();
 h=h.replace(/data-visible="(\d+)"/,(m,v)=>`data-visible="${Number(v)+V17_EXTRA}"`).replace(/data-days="(\d+)"/,`data-days="${days+V17_EXTRA}"`);
 // 캡슐: 진행 중은 오른쪽 끝까지 열림, 최근 30일 시작은 강조
 h=h.replace(/<button class="gantt-bar v5-flight([^"]*)" data-gantt="([^"]+)"([^>]*?)style="([^"]*)"/g,(m,cls,id,attrs,style)=>{
  const c=listing.campaigns.find(x=>x.id===id);if(!c)return m;let extra='';
  if(v17Open(c)){style=style.replace(/width:calc\(var\(--day\)\*([\d.]+)\)/,()=>`width:calc(var(--day)*${days+V17_EXTRA-c._left})`);extra+=' v17-open'}
  if(v17Active(c))extra+=' v17-hot';if(v17IsNew(c))extra+=' v17-new';
  return `<button class="gantt-bar v5-flight${cls}${extra}" data-gantt="${id}"${attrs}style="${style}"`;
 });
 h=h.replace(/<b class="v5-onair">ON AIR<\/b>/g,'').replace(/<i class="onair-edge"[^>]*><\/i>/g,'');
 h=h.replace(/(<strong>)(?:<em class="v16-badge">신규 후보<\/em>)?/g,'$1');
 h=h.replace(/(<button class="gantt-bar v5-flight[^"]*v17-new[^"]*"[\s\S]*?<span class="v15-text"><strong>)/g,'$1<em class="v17-newb">NEW</em>');
 h=h.replace(/(<button class="gantt-bar v5-flight v16-yt[^"]*"[\s\S]*?<span class="v15-text"><strong>)/g,'$1<em class="v16-badge">신규 후보</em>');
 // 머리글: 연도(위) / 월(아래)
 const years=[];h=h.replace(/<span style="left:calc\(var\(--day\)\*(\d+)\)">(\d{4})\.(\d{2})<\/span>/g,(m,l,y,mo)=>{if(!years.length||years.at(-1).y!==y)years.push({y,l:Number(l)});return `<span style="left:calc(var(--day)*${l})">${Number(mo)}월</span>`});
 h=h.replace(/<span style="left:calc\(var\(--day\)\*(\d+)\)"><\/span>/g,(m,l)=>Number(l)>=days-3?'':`<span style="left:calc(var(--day)*${l})">${new Date((a+Number(l))*86400000).getUTCMonth()+1}월</span>`);
 if(years.length&&years[0].l>0){const y0=new Date(a*86400000).getUTCFullYear();years.unshift({y:String(y0),l:0})}
 h=h.replace('<div class="gantt-month-track">',`<div class="v17-year-track">${years.map((y,i)=>`<span style="left:calc(var(--day)*${y.l});width:calc(var(--day)*${(years[i+1]?.l??days+V17_EXTRA)-y.l})">${y.y}년</span>`).join('')}</div><div class="gantt-month-track">`);
 // 최근 캠페인 띠
 h=h.replace(/<div class="glass gantt-shell[^"]*">/,m=>v17Recent()+m);
 return v17Money(h);
};
function v17Recent(){
 const end=v3Day(listing.period.end);
 const rows=listing.campaigns.filter(c=>(v17Active(c)||c.review_status==='yt_candidate')&&(category==='all'||c.category===category)).sort((x,y)=>y.first_seen.localeCompare(x.first_seen)||y.adjusted_amount-x.adjusted_amount).slice(0,10);
 if(!rows.length)return '';
 return `<section class="v17-recent"><div class="v17-recent-head"><b>최근 30일 온에어 캠페인</b><small>${rows.length}건 · 시작일 최신순 · NEW는 최근 30일 안에 시작 · 누르면 분석</small></div><div class="v17-recent-rail">${rows.map(c=>{const yt=c.review_status==='yt_candidate';const d=end-v3Day(c.first_seen)+1;
  return `<button class="v17-rc${yt?' yt':''}" ${yt?`data-v17-ytc="${c.id}"`:`data-campaign="${c.id}"`}>${yt?'<em>YouTube 신규 후보</em>':v17IsNew(c)?'<em>NEW</em>':''}${c.thumbnail?`<img src="${esc(safeUrl(c.thumbnail))}" alt="" loading="lazy">`:`<i>${esc(c.advertiser.slice(0,1))}</i>`}<span><small>${esc(c.category_label)} · ${esc(c.advertiser)}</small><b>${esc(v5Short(c).replace(/^YouTube 신규 후보 · /,''))}</b><small>${dateLabel(c.first_seen).slice(5)} ${yt?'공개':'시작'}${v17Open(c)?' · 진행 중':yt?'':' ~ '+dateLabel(c.last_seen).slice(5)}</small><small>${yt?'조회수 '+number(c.youtube_views)+'회 · 아덱스 확인 전':v17Money(v4Money(c.adjusted_amount)+'원')}</small></span></button>`}).join('')}</div></section>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v17-ytc]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();v16OpenCandidate(b.dataset.v17Ytc)},true);

/* 2. 타임라인 배치: 광고주 카드 안에 위·아래 여백을 두고 캡슐 배치 */
var v17BaseLayout=layoutVisibleFlights;
layoutVisibleFlights=function(){
 v17BaseLayout();
 if(route==='timeline')$('#subtitle').textContent='';
 const el=$('#gantt-scroll');if(!el)return;
 for(const row of el.querySelectorAll('.gantt-row')){
  const bars=[...row.querySelectorAll('[data-gantt]:not([hidden])')];if(!bars.length)continue;
  const groups=new Map();for(const b of bars){const lane=Math.round((parseFloat(b.style.top)-12)/v6LaneH);const k=b.dataset.adv||'';if(!groups.has(k))groups.set(k,[]);groups.get(k).push([b,lane])}
  const ordered=[...groups].map(([k,list])=>({k,list,min:Math.min(...list.map(x=>x[1]))})).sort((p,q)=>p.min-q.min);
  let y=V17_CARDGAP/2;const boxes=[];
  for(const g of ordered){const lanes=[...new Set(g.list.map(x=>x[1]))].sort((p,q)=>p-q);const idx=new Map(lanes.map((l,i)=>[l,i]));
   for(const [b,l] of g.list)b.style.top=(y+V17_PAD+idx.get(l)*(V17_BAR+V17_GAP))+'px';
   const hgt=V17_PAD*2+lanes.length*V17_BAR+(lanes.length-1)*V17_GAP;boxes.push([y,hgt]);y+=hgt+V17_CARDGAP}
  const advs=[...row.querySelectorAll('.v6-adv')],bands=[...row.querySelectorAll('.v6-bands i')];
  boxes.forEach(([t,hh],i)=>{for(const n of [advs[i],bands[i]])if(n){n.style.top=t+'px';n.style.height=hh+'px'}});
  row.style.height=Math.max(78,y+V17_CARDGAP/2)+'px';
  for(const s of row.querySelectorAll('.v6-adv small'))if(!s.dataset.v17){s.dataset.v17='1';s.textContent=v17Money(s.textContent)}
 }
 for(const b of el.querySelectorAll('.v15-cap:not([hidden])')){const lab=b.querySelector('.v5-label');const w=lab?parseFloat(lab.style.width)||b.offsetWidth:b.offsetWidth;b.classList.toggle('v15-tiny',w<128);b.classList.toggle('v15-tight',w<190)}
};

/* 3. 막대 팝업: 마우스 진행 경로를 막지 않도록 막대 위쪽 대각선(오른쪽 위 / 화면 오른쪽이면 왼쪽 위) */
var v17BaseShow=v5Show;
v5Show=function(id,target){
 v17BaseShow(id,target);const box=$('#campaign-hover');if(!box||!target)return;
 const r=target.getBoundingClientRect(),w=box.offsetWidth||320,h=box.offsetHeight||300,px=(v5Pointer&&v5Pointer.x)||r.left+40,off=56;
 let x=px<innerWidth*0.6?px+off:px-w-off;let y=r.top-h-14;if(y<12)y=r.bottom+14;if(y+h>innerHeight-8)y=Math.max(12,innerHeight-h-8);
 box.style.left=Math.max(12,Math.min(x,innerWidth-w-12))+'px';box.style.top=y+'px';
};

/* 4. 로딩: 단색 그래프가 그려지는 애니메이션 */
// 로딩 그림은 v19의 선 그래프 하나로 통일 (11-06 15:34) — 예전 막대 로딩이 잠깐 보이던 문제
/* 로딩 그림은 v00.js 한 곳에서만 그림 (11-06 15:34 정리) */

/* 5. 캠페인 분석 */
// YouTube 버튼: 위 '소재 확인하기', 아래 작은 글씨 'N개 버전' / 아래 중복 문구 제거
var v17BaseYt=v4YoutubeRow;
v4YoutubeRow=function(r){let h=v17BaseYt(r);const n=(r.youtube_videos||[]).length;
 if(n>1){h=h.replace(/<span>YouTube 소재 확인하기 · \d+개 버전<\/span>/,`<span class="v17-two">YouTube 소재 확인하기<small>${n}개 버전</small></span>`).replace(/ · \d+개 버전<\/small>/,'</small>')}
 return h};
// 섹션 표시: 트리맵 범례 오른쪽 위, 주차 그래프 설명은 하단 주석으로
function v17MoveSub(h,title){return h.replace(new RegExp(`<div class="section-head"><div><h2>${title}</h2><p>([^<]*)</p></div>`),(m,sub)=>`<div class="section-head"><div><h2>${title}</h2></div><!--v17sub:${sub}-->`).replace(/<!--v17sub:([^>]*)-->([\s\S]*?)<p class="footnote">/,(m,sub,mid)=>`${mid}<p class="footnote">${sub} · `)}
var v17BaseDetail=detailView;
detailView=function(d){let h=v17BaseDetail(d);
 h=h.replace('<section class="glass section"><div class="section-head"><div><h2>집행 매체별 광고비</h2>','<section class="glass section v17-tree"><div class="section-head"><div><h2>집행 매체별 광고비</h2>');
 return h};
var v17BaseWeekly=weeklyPanel;
weeklyPanel=function(rows,title='주차별 매체 광고비',raw=false){
 const weeks=weeklyData(rows),keys=[...new Set(rows.map(r=>r.bucket||r.kind))],active=keys.filter(k=>!v3HiddenMedia.has(k));if(!weeks.length)return v17BaseWeekly(rows,title,raw);
 const width=1000,height=Math.round(v12WeeklyH),top=26,bottom=30,peak=Math.max(...weeks.map(w=>active.reduce((s,k)=>s+(w.media[k]||0),0)),1),step=width/weeks.length,bar=Math.min(56,step*.72);
 const ticks=[.5,1].map(v=>{const y=height-bottom-v*(height-top-bottom);return `<line x1="0" x2="${width}" y1="${y}" y2="${y}" stroke="#e8eff3"/><text x="4" y="${y-5}" class="v12-axis">${money(peak*v)}</text>`}).join('')+`<line x1="0" x2="${width}" y1="${height-bottom}" y2="${height-bottom}" stroke="#d9e5eb"/>`;
 const bars=weeks.map((w,i)=>{let run=0;return active.map(k=>{const amount=w.media[k]||0,y=height-bottom-(run+amount)/peak*(height-top-bottom),hh=amount/peak*(height-top-bottom);run+=amount;return `<rect x="${step*i+(step-bar)/2}" y="${y}" width="${bar}" height="${hh}" fill="${v3MediaColors[k]||'#a8bbc5'}"><title>${w.week} 주 · ${buckets[k]||names[k]||k} · ${number(amount)}원</title></rect>`}).join('')+(i%Math.max(1,Math.ceil(weeks.length/10))===0?`<text x="${step*(i+.5)}" y="${height-10}" text-anchor="middle" class="v12-axis">${w.week.slice(5).replace('-','.')}</text>`:'')}).join('');
 return `<section class="glass section v12-weekly-panel">${header(title)}<div class="stack-legend">${keys.map(k=>`<button data-week-media="${k}" class="${v3HiddenMedia.has(k)?'muted':''}"><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||names[k]||k}</button>`).join('')}</div><div class="v17-bleed"><svg class="v3-chart v12-weekly" viewBox="0 0 ${width} ${height}" role="img" aria-label="주차별 매체 광고비 누적 막대">${ticks}${bars}</svg></div><p class="footnote">월요일 시작 주차 · 매체별 누적 막대 · ${raw?'보정 전 원본':'선택한 보정 가정 반영'} · 막대에 마우스를 올리면 원 단위 금액. ${weeks[0].week} 주 — ${weeks.at(-1).week} 주 · 기간 양끝은 부분 주차일 수 있습니다.</p></section>`;
};
// 쿼리 추이: 가로선·y축·큰 숫자 제거, 전주 대비 증감만
var v17BaseTrend=v5TrendPanel;
v5TrendPanel=function(d){let h=v17BaseTrend(d);
 h=h.replace(/<line x1="0" x2="\d+" y1="[\d.]+" y2="[\d.]+" stroke="#e3edf2"\/><text x="4" y="[\d.-]+" class="v12-axis">[^<]*<\/text>/g,'');
 h=h.replace(/<div class="v12-trend-kpi"><strong>[^<]*<\/strong>(<em class="(up|down)">([^<]*)<\/em>)?<small>[^<]*<\/small><\/div>/,(m,em,cls,val)=>em?`<div class="v12-trend-kpi v17-kpi"><span>지난주 대비</span><em class="${cls}">${val}</em></div>`:'');
 return v17MoveSub(h,'주차별 쿼리 추이');
};
// 경쟁사 광고비: 선 없이 그라데이션 영역(위로 갈수록 진하게), 집행 없는 달은 0으로 이어서
function v17Path(pts,base){if(!pts.length)return '';let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;const c1=[p1[0]+(p2[0]-p0[0])/6,Math.min(base,p1[1]+(p2[1]-p0[1])/6)],c2=[p2[0]-(p3[0]-p1[0])/6,Math.min(base,p2[1]-(p3[1]-p1[1])/6)];d+=` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`}return d}
annualPanel=function(d){
 const by=new Map();for(const r of d.annual){if(!by.has(r.advertiser))by.set(r.advertiser,new Map());by.get(r.advertiser).set(r.month,(by.get(r.advertiser).get(r.month)||0)+r.amount)}
 const sum=n=>[...(by.get(n)||new Map()).values()].reduce((x,y)=>x+y,0);
 const ranked=[...by.keys()].sort((p,q)=>sum(q)-sum(p)),selected=d.campaign.advertiser,names=[selected,...ranked.filter(a=>a!==selected).slice(0,4)],months=[...new Set(d.annual.map(r=>r.month))].sort(),shown=names.filter(n=>!v3HiddenAnnual.has(n));
 if(!months.length)return '';
 const width=1100,height=280,left=70,right=20,top=20,bottom=36,base=height-bottom,peak=Math.max(...shown.flatMap(n=>[...(by.get(n)||new Map()).values()]),1),x=i=>left+i*(width-left-right)/Math.max(1,months.length-1),y=v=>base-v/peak*(height-top-bottom);
 const order=[...shown].sort((p,q)=>sum(q)-sum(p));
 const defs=order.map((n,i)=>`<linearGradient id="v17g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${signatureColor(n)}" stop-opacity="${n===selected?.62:.5}"/><stop offset="1" stop-color="${signatureColor(n)}" stop-opacity=".04"/></linearGradient>`).join('');
 const layers=order.map((n,i)=>{const map=by.get(n)||new Map();const pts=months.map((m,j)=>[x(j),y(map.get(m)||0)]);const line=v17Path(pts,base);return `<path d="${line} L${x(months.length-1)},${base} L${x(0)},${base} Z" fill="url(#v17g${i})"/>`}).join('');
 const bands=months.map((m,i)=>{const w=(width-left-right)/Math.max(1,months.length-1);return `<rect class="v12-month-band" data-m="${i}" x="${Math.max(left-w/2,x(i)-w/2)}" y="${top-6}" width="${w}" height="${base-top+6}" fill="#2a7fb0" fill-opacity="0"/>`}).join('');
 v12Annual={by,months,shown:order,selected};
 return `<section class="glass section v12-annual">${header('경쟁사 광고비 비교')}<div class="stack-legend">${names.map(n=>`<button data-annual-brand="${esc(n)}" class="${v3HiddenAnnual.has(n)?'muted':''}"><i style="background:${signatureColor(n)}"></i>${esc(n)}</button>`).join('')}</div><svg class="v3-chart v12-annual-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="경쟁사 월별 광고비 비교"><defs>${defs}</defs>${[.5,1].map(v=>`<line x1="${left}" x2="${width-right}" y1="${y(peak*v)}" y2="${y(peak*v)}" stroke="#eef3f6"/><text x="${left-9}" y="${y(peak*v)+4}" text-anchor="end">${money(peak*v)}</text>`).join('')}<line x1="${left}" x2="${width-right}" y1="${base}" y2="${base}" stroke="#d9e5eb"/>${bands}${layers}${months.map((m,i)=>`<text x="${x(i)}" y="${height-12}" text-anchor="middle">${m.slice(2).replace('-','.')}</text>`).join('')}</svg><p class="footnote">월별 관측 광고비 · 그래프 위에 마우스를 올리면 해당 월이 강조되고 광고주별 매체·소재 카드가 열립니다. 광고주명을 눌러 표시를 바꿉니다. ${months[0]} — ${months.at(-1)} · 집행이 없는 달은 0으로 표시 · 양끝은 부분월입니다.</p></section>`;
};
// 브랜드 포스팅: Instagram 게시물이 없을 때 안내
var v17BasePosts=brandPostsPanel;
brandPostsPanel=function(d){let h=v17BasePosts(d);if(!h)return h;
 const ig=(d.brand_posts?.posts||[]).some(p=>p.platform==='instagram');if(ig)return h;
 const ch=(d.social_channels||[]).find(s=>s.platform==='instagram');
 const note=`<section class="glass section v17-ig-note"><div class="section-head"><div><h2>캠페인 기간 Instagram 포스팅</h2></div></div><p>${ch?`공식 Instagram(<a href="${esc(safeUrl(ch.url))}" target="_blank" rel="noopener">${esc(ch.url.replace(/^https?:\/\/(www\.)?instagram\.com\//,'@').replace(/\/$/,''))}</a>)에서 이 캠페인 기간에 확인된 게시물이 없습니다.`:'공식 Instagram 계정이 아직 확인되지 않았습니다.'}</p><p class="footnote">Instagram은 자동 수집 전 단계라, 원문을 확인해 등록한 게시물만 표시합니다.</p></section>`;
 return h.replace('<div class="v5-posts">','<div class="v5-posts">'+note)};

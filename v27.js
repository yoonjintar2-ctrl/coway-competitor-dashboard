/* v27 — 2026-11-03: 열 너비·테두리 설명·YouTube 선공개 표현·디지털 아이콘(마우스/PC/모바일)·분석 화면(헤더·KPI·트리맵·주차 그래프) */
V17_EXTRA=8;
// 1) 표현: 신규 후보 → YouTube 선공개(광고 모니터링 금액 미집계)
function v27Say(h){return h.replace(/YouTube 신규 캠페인 후보/g,'YouTube 선공개 캠페인').replace(/YouTube 신규 후보/g,'YouTube 선공개').replace(/>신규 후보</g,'>YouTube 선공개<')
 .replace(/아덱스 확인 전/g,'광고 모니터링 금액 미집계').replace(/아덱스 광고비 확인 전/g,'광고 모니터링 금액 미집계').replace(/아덱스 광고비·소재 확인 전/g,'YouTube에 먼저 공개 · 광고 모니터링(아덱스) 금액은 아직 집계 전')}
// 2) 매체 아이콘
Object.assign(v5Icon,{
 mouse:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="3" width="11" height="18" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6.5v3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 pc:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 20h6M12 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 mo:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 18.5h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'});
v5MediaIcons=function(c){
 const m=c.media||{},out=[];const tv=(m.terrestrial||0)+(m.general||0)+(m.cable||0);
 if(tv>0)out.push(['tv','TV',tv]);if(c.youtube_spend>0)out.push(['yt','YouTube',c.youtube_spend]);
 const dig=Math.max(0,(m.digital_video||0)-(c.youtube_spend||0))+(m.digital_banner||0);
 if(dig>1){const dv=c.devices||{};const pc=dv.PC||0,mo=dv.MO||0,etc=Math.max(0,dig-pc-mo);
  if(pc>1)out.push(['pc','디지털 PC',pc]);if(mo>1)out.push(['mo','디지털 모바일',mo]);if(etc>1||(!pc&&!mo))out.push(['mouse','디지털',pc||mo?etc:dig])}
 if(m.radio>0)out.push(['radio','라디오',m.radio]);if(m.print>0)out.push(['print','신문·잡지',m.print]);
 return out.sort((a,b)=>b[2]-a[2]).map(([k,label,v])=>`<i class="v5-mi ${k}" title="${label} ${v4Money(v)}원">${v5Icon[k]}</i>`).join('');
};
// 3) 타임라인: 테두리 기준 설명(오른쪽 위 작은 글씨) + 표현
var v27BaseTimeline=timeline;
timeline=function(){let h=v27Say(v27BaseTimeline());
 return h.replace(/<div class="glass gantt-shell[^"]*">/,m=>`<p class="v27-legend"><b class="hot"></b>진한 테두리 = 최근 30일 안에 집행 관측 · <b class="open"></b>오른쪽이 열린 캡슐 = 최근 14일 안에 집행(진행 중) · <b class="yt"></b>빨간 테두리 = YouTube 선공개(광고 모니터링 금액 미집계)</p>`+m)};
var v27BaseRecent=v17Recent;v17Recent=function(){return v27Say(v27BaseRecent())};
var v27BaseShow=v5Show;v5Show=function(id,t){v27BaseShow(id,t);const b=$('#campaign-hover');if(b&&String(id).startsWith('ytc-'))b.innerHTML=v27Say(b.innerHTML)};
var v27BaseYtView=v20CandidateView;v20CandidateView=async function(c){return v27Say(await v27BaseYtView(c))};
var v27BaseOpenCand=null;
// 4) 캠페인 분석: 돌아가기 단추는 제목 영역 밖, '해당 광고주의 다른 캠페인', 주요 운영 매체 전체
function v27MediaAll(d){const t=new Map();for(const r of d.treemap||[]){const k=r.parent==='TV'?'TV '+r.group:r.parent==='디지털'?(r.group||'디지털'):r.parent;t.set(k,(t.get(k)||0)+r.amount)}const total=[...t.values()].reduce((a,b)=>a+b,0)||1;return [...t].sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,Math.round(v/total*100)])}
var v27BaseDetail=detailView;
detailView=function(d){let h=v27BaseDetail(d);const c=d.campaign;
 h=h.replace(/<button class="v6-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인<\/button>/,'');
 h='<button class="v6-back v27-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인</button>'+h;
 h=h.replace('<label>다른 캠페인<select id="campaign-switch" aria-label="다른 캠페인">','<label>해당 광고주의 다른 캠페인<select id="campaign-switch" aria-label="해당 광고주의 다른 캠페인">');
 h=h.replace(/(<select id="campaign-switch"[^>]*>)([\s\S]*?)(<\/select>)/,(m,a,opts,z)=>{const keep=[...opts.matchAll(/<option value="([^"]+)"[^>]*>[^<]*<\/option>/g)].filter(o=>{const id=o[1];if(id===c.id)return true;const g=listing.campaigns.find(x=>x.id===id)||(d.other_campaigns||[]).find(x=>x.id===id);return g&&g.advertiser===c.advertiser&&!String(id).startsWith('ytc-')}).map(o=>o[0]);return a+keep.join('')+z});
 const all=v27MediaAll(d);
 h=h.replace(/<span>주요 운영 매체<\/span><strong class="v5-media-kpi">[\s\S]*?<\/strong><small>[\s\S]*?<\/small>/,`<span>집행 매체</span><div class="v27-media-list">${all.map(([k,p])=>`<span><b>${esc(k)}</b><em>${p}%</em></span>`).join('')||'—'}</div>`);
 return h};
// 5) 주차별 매체 광고비: 가로선·y축 없애고 마우스를 올리면 주차별 금액 카드
var v27Weeks=[];
weeklyPanel=function(rows,title='주차별 매체 광고비',raw=false){
 const weeks=weeklyData(rows),keys=[...new Set(rows.map(r=>r.bucket||r.kind))],active=keys.filter(k=>!v3HiddenMedia.has(k));if(!weeks.length)return `<section class="glass section v12-weekly-panel">${header(title)}${empty('관측된 광고비가 없습니다.')}</section>`;
 v27Weeks=weeks.map(w=>({week:w.week,media:active.map(k=>[k,w.media[k]||0]).filter(x=>x[1]>0)}));
 const width=1000,height=Math.round(v12WeeklyH),top=16,bottom=30,peak=Math.max(...weeks.map(w=>active.reduce((s,k)=>s+(w.media[k]||0),0)),1),step=width/weeks.length,bar=Math.min(56,step*.72);
 const bars=weeks.map((w,i)=>{let run=0;return `<g class="v27-wk" data-wk="${i}"><rect class="v27-wk-hit" x="${step*i}" y="0" width="${step}" height="${height-bottom}" fill="transparent"/>`+active.map(k=>{const amount=w.media[k]||0,y=height-bottom-(run+amount)/peak*(height-top-bottom),hh=amount/peak*(height-top-bottom);run+=amount;return `<rect x="${step*i+(step-bar)/2}" y="${y}" width="${bar}" height="${hh}" fill="${v3MediaColors[k]||'#a8bbc5'}"/>`}).join('')+`</g>`+(i%Math.max(1,Math.ceil(weeks.length/10))===0?`<text x="${step*(i+.5)}" y="${height-10}" text-anchor="middle" class="v12-axis">${w.week.slice(5).replace('-','.')}</text>`:'')}).join('');
 return `<section class="glass section v12-weekly-panel">${header(title)}<div class="stack-legend">${keys.map(k=>`<button data-week-media="${k}" class="${v3HiddenMedia.has(k)?'muted':''}"><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||names[k]||k}</button>`).join('')}</div><div class="v17-bleed v27-wk-wrap"><svg class="v3-chart v12-weekly" viewBox="0 0 ${width} ${height}" role="img" aria-label="주차별 매체 광고비 누적 막대"><line x1="0" x2="${width}" y1="${height-bottom}" y2="${height-bottom}" stroke="#d9e5eb"/>${bars}</svg><div class="v27-wk-tip" hidden></div></div><p class="footnote">월요일 시작 주차 · 매체별 누적 막대 · ${raw?'보정 전 원본':'선택한 보정 가정 반영'} · 막대에 마우스를 올리면 주차별 금액. ${weeks[0].week} 주 — ${weeks.at(-1).week} 주 · 기간 양끝은 부분 주차일 수 있습니다.</p></section>`;
};
document.addEventListener('pointerover',e=>{const g=e.target.closest('.v27-wk');if(!g)return;const wrap=g.closest('.v27-wk-wrap'),tip=wrap.querySelector('.v27-wk-tip'),w=v27Weeks[Number(g.dataset.wk)];if(!w)return;
 wrap.querySelectorAll('.v27-wk.on').forEach(x=>x.classList.remove('on'));g.classList.add('on');
 const total=w.media.reduce((s,x)=>s+x[1],0);const end=new Date(w.week+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+6);
 tip.innerHTML=v17Money(`<small>${dateLabel(w.week)} ~ ${dateLabel(end.toISOString().slice(0,10))}</small><b>${v4Money(total)}원</b>${w.media.sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||k} ${v4Money(v)}원</span>`).join('')}`);
 tip.hidden=false;const r=wrap.getBoundingClientRect(),gr=g.getBoundingClientRect();const tw=tip.offsetWidth;let x=gr.left-r.left+gr.width/2-tw/2;x=Math.max(4,Math.min(r.width-tw-4,x));tip.style.left=x+'px';tip.style.top='6px'});
document.addEventListener('pointerout',e=>{const wrap=e.target.closest('.v27-wk-wrap');if(!wrap||wrap.contains(e.relatedTarget))return;wrap.querySelector('.v27-wk-tip').hidden=true;wrap.querySelectorAll('.v27-wk.on').forEach(x=>x.classList.remove('on'))});
// 6) 트리맵: 이름이 빠진 작은 칸에도 들어갈 만하면 작은 글씨로 매체명
function v27TreeLabels(){for(const el of document.querySelectorAll('.v4-leaf')){if(el.dataset.v27)continue;el.dataset.v27='1';if(el.querySelector('span'))continue;const w=el.offsetWidth,h=el.offsetHeight;if(w<34||h<16)continue;const [path,amt,share]=(el.dataset.treeTip||'').split('|');const name=path.split(' › ').pop();el.insertAdjacentHTML('beforeend',`<span class="v27-mini"><small>${esc(name)}</small>${h>=28?`<em>${esc(share)}</em>`:''}</span>`)}}
new MutationObserver(()=>{if(document.querySelector('.v4-leaf:not([data-v27])'))requestAnimationFrame(v27TreeLabels)}).observe(document.getElementById('content')||document.body,{childList:true,subtree:true});

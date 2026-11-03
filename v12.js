var V27_INSET=16,V27_L=2;
/* v12 — 2026-11-03 Claude 6차: 신문 아이콘, 미확인 소재 주석, YouTube 다중 버전 브릿지, 스크롤 버튼 hover 전용,
   주차별 매체 광고비 높이 맞춤, 주차별 쿼리 추이(영역형·hover), 경쟁사 광고비(투명 영역형·월 하이라이트), 브라우저 뒤로가기. */

/* 1. 인쇄 = 신문 아이콘 */
v5Icon.print='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h13v13a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V9h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 9v8a1 1 0 0 1-2 0" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="8" width="7" height="3.5" fill="currentColor"/><path d="M8 14.5h7M8 17h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

/* 2. 주요 소재: 원본 확인 불가 소재는 카드 대신 하단 주석 */
function v12Unverified(r){return !r.thumbnail&&!(r.copy_versions||[]).length&&!(r.youtube_videos||[]).length&&!(r.print_images||[]).length&&!r.storyboard}
function v12MediaText(r){const m=r.media_spend||{};const parts=Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${buckets[k]||k} ${v4Money(v)}원`);return parts.length?parts.join(' · '):''}
var v12BaseMaterial=materialCarousel;
materialCarousel=function(d){
 const bad=d.creatives.filter(v12Unverified),good=d.creatives.filter(r=>!v12Unverified(r));
 const notes=bad.length?`<div class="v12-unverified"><b>원본 미확인 소재 ${bad.length}개</b><ul>${bad.sort((a,b)=>b.amount-a.amount).map(r=>{const name=(r.copyline||'').replace(/^,+/,'').trim()||r.product;const media=v12MediaText(r);return `<li>‘${esc(name)}’ 소재는 ${dateLabel(r.first_seen)}~${dateLabel(r.last_seen)} ${media?esc(media)+' ':''}(합계 ${v4Money(r.amount)}원) 집행으로 잡히지만, 소재 원본(이미지·영상·카피)은 확인되지 않습니다.</li>`}).join('')}</ul></div>`:'';
 if(!good.length)return `<section class="glass section carousel-section">${header('주요 소재','원본을 확인한 소재가 없습니다.')}${notes}</section>`;
 const h=v12BaseMaterial({...d,creatives:good});const i=h.lastIndexOf('</section>');return h.slice(0,i)+notes+h.slice(i);
};

/* 3. YouTube 다중 버전: 소재 확인하기 → 버전 선택 팝업 */
var v12BaseYt=v4YoutubeRow;
v4YoutubeRow=function(r){
 let h=v12BaseYt(r);const v=r.youtube_videos||[];
 if(v.length>1)h=h.replace(/<a class="v5-link yt"[\s\S]*?<\/a>/,`<button class="v5-link yt" data-yt-multi="${esc(r.creative_id)}">${v5Icon.yt}<span>YouTube 소재 확인하기 · ${v.length}개 버전</span>↗</button>`);
 return h;
};
function v12OpenYt(id){
 const r=(detailData?.creatives||[]).find(x=>x.creative_id===id);if(!r)return;const dialog=$('#detail');dialog.className='post-dialog v12-yt-dialog';
 $('#detail-body').innerHTML=`<small>YouTube 소재 · ${r.youtube_videos.length}개 버전</small><h2>${esc(r.product)}</h2><p class="footnote">같은 광고 소재로 확인된 공식 채널 영상입니다. 보려는 버전을 누르면 YouTube로 이동합니다.</p><div class="v12-yt-list">${r.youtube_videos.map(x=>`<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${x.thumbnail?`<img src="${esc(safeUrl(x.thumbnail))}" alt="">`:'<i></i>'}<div><b>${esc(x.title||'')}</b><small>${x.shorts?'Shorts · ':''}${esc(x.published_at||'')}${x.view_count!=null?' · 조회수 '+number(x.view_count)+'회':''}</small></div><span>열기 ↗</span></a>`).join('')}</div>`;
 dialog.showModal();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-yt-multi]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();v12OpenYt(b.dataset.ytMulti)},true);

/* 4. 주차별 매체 광고비: 오른쪽 패널 높이에 맞춰 그래프 높이 조정 */
var v12WeeklyH=280;
weeklyPanel=function(rows,title='주차별 매체 광고비',raw=false){
 const weeks=weeklyData(rows),keys=[...new Set(rows.map(r=>r.bucket||r.kind))],active=keys.filter(k=>!v3HiddenMedia.has(k));if(!weeks.length)return `<section class="glass section">${header(title)}${empty('관측된 광고비가 없습니다.')}</section>`;
 const width=1000,height=Math.round(v12WeeklyH),left=75,right=22,top=24,bottom=48,peak=Math.max(...weeks.map(w=>active.reduce((s,k)=>s+(w.media[k]||0),0)),1),bar=Math.min(48,(width-left-right)/weeks.length*.68),step=(width-left-right)/weeks.length;
 const ticks=[0,.25,.5,.75,1].map(v=>`<g><line x1="${left}" x2="${width-right}" y1="${height-bottom-v*(height-top-bottom)}" y2="${height-bottom-v*(height-top-bottom)}" stroke="#d9e5eb"/><text x="${left-8}" y="${height-bottom-v*(height-top-bottom)+4}" text-anchor="end">${money(peak*v)}</text></g>`).join('');
 const bars=weeks.map((w,i)=>{let running=0;return active.map(k=>{const amount=w.media[k]||0,y=height-bottom-(running+amount)/peak*(height-top-bottom),h=amount/peak*(height-top-bottom);running+=amount;return `<rect x="${left+step*i+(step-bar)/2}" y="${y}" width="${bar}" height="${h}" fill="${v3MediaColors[k]||'#a8bbc5'}"><title>${w.week} 주 · ${buckets[k]||names[k]||k} · ${number(amount)}원</title></rect>`}).join('')+(i%Math.max(1,Math.ceil(weeks.length/10))===0?`<text x="${left+step*(i+.5)}" y="${height-23}" text-anchor="middle">${w.week.slice(5)}</text>`:'')}).join('');
 return `<section class="glass section v12-weekly-panel">${header(title,`월요일 시작 주차 · 매체별 누적 막대 · ${raw?'보정 전 원본':'선택한 보정 가정 반영'} · 마우스를 올려 원 단위 금액 확인`)}<div class="stack-legend">${keys.map(k=>`<button data-week-media="${k}" class="${v3HiddenMedia.has(k)?'muted':''}"><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||names[k]||k}</button>`).join('')}</div><svg class="v3-chart v12-weekly" viewBox="0 0 ${width} ${height}" role="img" aria-label="주차별 매체 광고비 누적 막대">${ticks}${bars}</svg><p class="footnote">${weeks[0].week} 주 — ${weeks.at(-1).week} 주 · 기간 양끝은 부분 주차일 수 있습니다. 자료 미반영 매체는 확인된 금액까지만 합산합니다.</p></section>`;
};
function v12FitWeekly(){
 const two=document.querySelector('.v5-two');if(!two||!detailData)return;const a=two.querySelector('.v12-weekly-panel'),b=two.querySelector('.v12-trend-panel');if(!a||!b)return;
 const svg=a.querySelector('svg.v12-weekly');if(!svg||!svg.clientWidth)return;const diff=b.offsetHeight-a.offsetHeight;if(Math.abs(diff)<3)return;
 const scale=svg.clientWidth/1000;const next=Math.max(220,v12WeeklyH+diff/scale);if(Math.abs(next-v12WeeklyH)<2)return;
 v12WeeklyH=next;a.outerHTML=weeklyPanel(detailData.daily_media||detailData.daily);
}
addEventListener('resize',()=>{if(route==='analysis'){v12WeeklyH=280;const a=document.querySelector('.v12-weekly-panel');if(a&&detailData){a.outerHTML=weeklyPanel(detailData.daily_media||detailData.daily);requestAnimationFrame(v12FitWeekly)}}});

/* 5. 주차별 쿼리 추이: 좌우 끝까지 이어지는 영역형, hover 수치 */
function v12Smooth(pts){if(pts.length<2)return pts.length?`M${pts[0][0]},${pts[0][1]}`:'';let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`}return d}
var v12TrendRows=[];
v5TrendPanel=function(d){
 const g=d.trends;const points=(g?.points||[]);const series=new Map();for(const p of points){if(!series.has(p.keyword))series.set(p.keyword,[]);series.get(p.keyword).push(p)}
 if(!series.size)return `<section class="glass section v12-trend-panel">${header('주차별 쿼리 추이')}${empty('이 광고주의 주간 검색 추이 연결을 확인 중입니다.')}</section>`;
 const keys=[...series.keys()].slice(0,5);if(!keys.includes(v5TrendKey))v5TrendKey=keys[0];
 let rows=series.get(v5TrendKey);if(g.time_unit!=='week'){const m=new Map();for(const r of rows){const t=new Date(r.day+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);const k=t.toISOString().slice(0,10);if(!m.has(k))m.set(k,[]);m.get(k).push(r.ratio)}rows=[...m].map(([day,vs])=>({day,ratio:vs.reduce((a,b)=>a+b,0)/vs.length}))}
 rows=[...rows].sort((a,b)=>a.day.localeCompare(b.day));v12TrendRows=rows;
 const W=640,H=300,T=78,B=26,n=rows.length,peak=Math.max(1,...rows.map(r=>r.ratio)),x=i=>n<2?W/2:V27_L+i*(W-V27_L-V27_INSET)/(n-1),y=v=>H-B-v/peak*(H-T-B);
 const weekOf=s=>{const t=new Date(s.slice(0,10)+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);return t.toISOString().slice(0,10)};
 const idx=new Map(rows.map((r,i)=>[r.day,i]));const news=(d.news||[]).filter(n=>idx.has(weekOf(n.published_at))).sort((a,b)=>a.published_at.localeCompare(b.published_at));
 const byWeek=new Map();for(const n of news){const w=weekOf(n.published_at);if(!byWeek.has(w))byWeek.set(w,[]);byWeek.get(w).push(n)}
 let lastX=-999,level=0;const marks=[...byWeek].map(([w,list])=>{const i=idx.get(w),cx=x(i),cy=y(rows[i].ratio);level=cx-lastX<120?(level+1)%3:0;lastX=cx;const ly=8+level*22,title=list[0].title.replace(/\[[^\]]*\]|\([^)]*\)/g,'').trim(),short=title.length>16?title.slice(0,15)+'…':title;
   return `<g class="v5-news-mark" data-news="${esc(list.map(n=>n.id).join(','))}" tabindex="0" role="button" aria-label="${esc(w)} 주 뉴스 ${list.length}건: ${esc(title)}"><line x1="${cx}" y1="${ly+12}" x2="${cx}" y2="${cy-7}" stroke="#f08a24" stroke-width="1.2" stroke-dasharray="3 2"/><rect x="${Math.min(W-150,Math.max(0,cx-75))}" y="${ly-4}" width="150" height="18" rx="5" fill="#fff4e8" stroke="#f3b071"/><text x="${Math.min(W-75,Math.max(75,cx))}" y="${ly+9}" text-anchor="middle" class="v5-news-text">${esc(short)}${list.length>1?' 외 '+(list.length-1):''}</text><circle cx="${cx}" cy="${cy}" r="6" fill="#f08a24" fill-opacity=".25" stroke="#f08a24" stroke-width="2"/></g>`}).join('');
 const pts=rows.map((r,i)=>[x(i),y(r.ratio)]),line=v12Smooth(pts),area=line+` L${x(n-1)},${H-B} L${x(0)},${H-B} Z`;
 const last=rows.at(-1),prev=rows.at(-2),avg=rows.reduce((a,r)=>a+r.ratio,0)/Math.max(1,n),chg=prev&&prev.ratio?(last.ratio-prev.ratio)/prev.ratio*100:null;
 const grid=[.5,1].map(v=>`<line x1="0" x2="${W}" y1="${y(peak*v)}" y2="${y(peak*v)}" stroke="#e3edf2"/><text x="4" y="${y(peak*v)-4}" class="v12-axis">${Number((peak*v).toFixed(0))}</text>`).join('');
 const ticks=rows.map((r,i)=>[r,i]).filter(([r,i])=>i>0&&i<n-1&&i%Math.max(1,Math.ceil(n/6))===0).map(([r,i])=>`<text x="${x(i)}" y="${H-8}" text-anchor="middle" class="v12-axis">${r.day.slice(2,7).replace('-','.')}</text>`).join('');
 const svg=`<svg class="v3-chart v12-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="주차별 네이버 검색 상대지수"><defs><linearGradient id="v12-trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b8fe0" stop-opacity=".38"/><stop offset="1" stop-color="#2b8fe0" stop-opacity=".02"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#v12-trend-fill)"/><path d="${line}" fill="none" stroke="#2b8fe0" stroke-width="2.4" vector-effect="non-scaling-stroke"/>${n?`<circle class="v27-last" cx="${x(n-1)}" cy="${y(rows[n-1].ratio)}" r="5"/><circle class="v27-last-ring" cx="${x(n-1)}" cy="${y(rows[n-1].ratio)}" r="5"/>`:''}<line class="v12-guide" x1="0" x2="0" y1="${T-6}" y2="${H-B}" stroke="#2b8fe0" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" visibility="hidden"/>${ticks}${marks}</svg>`;
 return `<section class="glass section v12-trend-panel">${header('주차별 쿼리 추이',`네이버 주간 상대지수(최대=100) · 그래프에 마우스를 올리면 주차별 수치 · 주황 표시는 원문 발행일이 확인된 뉴스(${news.length}건)`)}<div class="v5-chips">${keys.map(k=>`<button data-trend-key="${esc(k)}" class="${k===v5TrendKey?'active':''}">${esc(k)}</button>`).join('')}</div><div class="v12-trend-kpi"><strong>${last.ratio.toFixed(1)}</strong>${chg!=null?`<em class="${chg>=0?'up':'down'}">${chg>=0?'+':''}${chg.toFixed(0)}%</em>`:''}<small>최근 주(${dateLabel(last.day)}) · 전주 대비 · 기간 평균 ${avg.toFixed(1)}</small></div><div class="v12-trend-wrap">${svg}<div class="v12-dot" hidden></div><div class="v12-tip" hidden></div></div><p class="footnote">${esc(g.definition||'')} <a href="${esc(safeUrl(g.source_url))}" target="_blank" rel="noopener">네이버 원본 ↗</a></p></section>`;
};
document.addEventListener('pointermove',e=>{
 const wrap=e.target.closest('.v12-trend-wrap');if(!wrap||!v12TrendRows.length)return;const svg=wrap.querySelector('svg'),r=svg.getBoundingClientRect(),n=v12TrendRows.length;
 const i=Math.max(0,Math.min(n-1,Math.round(((e.clientX-r.left)/r.width*640-V27_L)/(640-V27_L-V27_INSET)*(n-1))));const row=v12TrendRows[i];const px=n<2?r.width/2:(V27_L+i*(640-V27_L-V27_INSET)/(n-1))*r.width/640;
 const vb=svg.viewBox.baseVal,peak=Math.max(1,...v12TrendRows.map(x=>x.ratio)),T=78,B=26,yv=(vb.height-B-row.ratio/peak*(vb.height-T-B))*r.height/vb.height;
 const g=svg.querySelector('.v12-guide');g.setAttribute('x1',V27_L+i*(vb.width-V27_L-V27_INSET)/Math.max(1,n-1));g.setAttribute('x2',V27_L+i*(vb.width-V27_L-V27_INSET)/Math.max(1,n-1));g.setAttribute('visibility','visible');
 const dot=wrap.querySelector('.v12-dot'),tip=wrap.querySelector('.v12-tip');dot.hidden=false;dot.style.left=px+'px';dot.style.top=yv+'px';
 const wk=new Date(row.day+'T00:00:00Z'),we=new Date(wk);we.setUTCDate(we.getUTCDate()+6);
 tip.hidden=false;tip.innerHTML=`<small>${dateLabel(row.day)} ~ ${dateLabel(we.toISOString().slice(0,10))}</small><b>${row.ratio.toFixed(1)}</b><span>${esc(v5TrendKey)} 검색 상대지수</span>`;
 const tw=tip.offsetWidth;tip.style.left=Math.max(0,Math.min(r.width-tw,px-tw/2))+'px';tip.style.top=Math.max(0,yv-tip.offsetHeight-14)+'px';
});
document.addEventListener('pointerout',e=>{const wrap=e.target.closest('.v12-trend-wrap');if(!wrap||wrap.contains(e.relatedTarget))return;wrap.querySelector('.v12-tip').hidden=true;wrap.querySelector('.v12-dot').hidden=true;wrap.querySelector('.v12-guide')?.setAttribute('visibility','hidden')});

/* 6. 경쟁사 광고비: 투명 영역형, 월 하이라이트 + 해당 월 카드(겹치는 광고주 모두) */
var v12Annual=null;
annualPanel=function(d){
 const by=new Map();for(const r of d.annual){if(!by.has(r.advertiser))by.set(r.advertiser,new Map());by.get(r.advertiser).set(r.month,(by.get(r.advertiser).get(r.month)||0)+r.amount)}
 const ranked=[...by].sort((a,b)=>[...b[1].values()].reduce((x,y)=>x+y,0)-[...a[1].values()].reduce((x,y)=>x+y,0)),selected=d.campaign.advertiser,names=[selected,...ranked.map(r=>r[0]).filter(a=>a!==selected).slice(0,4)],months=[...new Set(d.annual.map(r=>r.month))].sort(),shown=names.filter(n=>!v3HiddenAnnual.has(n));
 if(!months.length)return '';
 const width=1100,height=280,left=70,right=20,top=20,bottom=36,peak=Math.max(...shown.flatMap(n=>[...(by.get(n)||new Map()).values()]),1),x=i=>left+i*(width-left-right)/Math.max(1,months.length-1),y=v=>height-bottom-v/peak*(height-top-bottom),base=height-bottom;
 const order=[...shown].sort((a,b)=>[...(by.get(b)||new Map()).values()].reduce((x,y)=>x+y,0)-[...(by.get(a)||new Map()).values()].reduce((x,y)=>x+y,0));
 const layers=order.map(name=>{const map=by.get(name)||new Map(),color=signatureColor(name);const segs=[];let part=[];months.forEach((m,i)=>{if(map.has(m))part.push([x(i),y(map.get(m)),i]);else if(part.length){segs.push(part);part=[]}});if(part.length)segs.push(part);
   return segs.map(p=>{const line=v12Smooth(p.map(q=>[q[0],q[1]]));const area=p.length>1?line+` L${p.at(-1)[0]},${base} L${p[0][0]},${base} Z`:'';return `${area?`<path d="${area}" fill="${color}" fill-opacity="${name===selected?.34:.2}"/>`:''}<path d="${line}" fill="none" stroke="${color}" stroke-width="${name===selected?2.6:1.8}" stroke-opacity=".95"/>`}).join('')+[...map].filter(([m])=>months.includes(m)).map(([m,v])=>`<circle class="v12-annual-pt" data-m="${months.indexOf(m)}" cx="${x(months.indexOf(m))}" cy="${y(v)}" r="5.5" fill="#fff" stroke="${color}" stroke-width="2.4"/>`).join('')}).join('');
 const bands=months.map((m,i)=>{const w=(width-left-right)/Math.max(1,months.length-1);return `<rect class="v12-month-band" data-m="${i}" x="${Math.max(left-w/2,x(i)-w/2)}" y="${top-6}" width="${w}" height="${base-top+6}" fill="#2a7fb0" fill-opacity="0"/>`}).join('');
 v12Annual={by,months,shown:order,selected};
 return `<section class="glass section v12-annual">${header('경쟁사 광고비 비교','월별 관측 광고비 · 그래프 위에 마우스를 올리면 해당 월이 강조되고 광고주별 매체·소재 요약 카드가 열립니다. 광고주명을 눌러 표시를 바꿉니다.')}<div class="stack-legend">${names.map(n=>`<button data-annual-brand="${esc(n)}" class="${v3HiddenAnnual.has(n)?'muted':''}"><i style="background:${signatureColor(n)}"></i>${esc(n)}</button>`).join('')}</div><svg class="v3-chart v12-annual-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="경쟁사 월별 광고비 비교">${[0,.25,.5,.75,1].map(v=>`<line x1="${left}" x2="${width-right}" y1="${y(peak*v)}" y2="${y(peak*v)}" stroke="#e1ebf0"/><text x="${left-9}" y="${y(peak*v)+4}" text-anchor="end">${money(peak*v)}</text>`).join('')}${bands}${layers}${months.map((m,i)=>`<text x="${x(i)}" y="${height-12}" text-anchor="middle">${m.slice(2).replace('-','.')}</text>`).join('')}</svg><p class="footnote">${months[0]} — ${months.at(-1)} · 월별 합계이며 양끝은 부분월입니다. 미확인 구간은 0으로 채우지 않습니다.</p></section>`;
};
function v12AnnualCard(i,ev){
 if(!v12Annual)return;const {by,months,shown}=v12Annual,m=months[i];let box=$('#annual-card');if(!box){box=document.createElement('aside');box.id='annual-card';box.className='glass';document.body.appendChild(box)}
 const rows=shown.filter(a=>by.get(a)?.has(m)).sort((a,b)=>by.get(b).get(m)-by.get(a).get(m));
 box.classList.add('v12-multi');
 box.innerHTML=`<small>${m.replace('-','.')} · 광고주 ${rows.length}곳</small>${rows.map(a=>{const info=detailData?.annual_detail?.[a+'|'+m];const total=by.get(a).get(m);const top=info?.creatives?.[0];return `<div class="v12-card-row"><b style="color:${signatureColor(a)}">${esc(a)}</b><strong>${v4Money(total)}원</strong>${info?`<div class="v5-card-media">${Object.entries(info.media).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,v])=>`<span><i style="background:${v3MediaColors[k]||'#a8bbc5'}"></i>${buckets[k]||k} ${Math.round(v/Object.values(info.media).reduce((s,z)=>s+z,0)*100)}%</span>`).join('')}</div>${top?`<p>${top.thumbnail?`<img src="${esc(safeUrl(top.thumbnail))}" alt="">`:''}<span>${esc(top.product)}${top.copyline?' · '+esc(top.copyline.replace(/^,/,'')):''}</span></p>`:''}`:''}</div>`}).join('')||'<p>관측 광고비 없음</p>'}`;
 box.hidden=false;const w=box.offsetWidth,h=box.offsetHeight;let px=ev.clientX+18,py=ev.clientY-h/2;if(px+w>innerWidth-12)px=ev.clientX-w-18;box.style.left=Math.max(12,px)+'px';box.style.top=Math.max(12,Math.min(py,innerHeight-h-12))+'px';
}
document.addEventListener('pointermove',e=>{
 const svg=e.target.closest('.v12-annual-svg');if(!svg||!v12Annual)return;const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,n=v12Annual.months.length;
 const vx=(e.clientX-r.left)*vb.width/r.width;const i=Math.max(0,Math.min(n-1,Math.round((vx-70)/((vb.width-90)/Math.max(1,n-1)))));
 svg.querySelectorAll('.v12-month-band').forEach(b=>b.setAttribute('fill-opacity',Number(b.dataset.m)===i?.08:0));
 svg.querySelectorAll('.v12-annual-pt').forEach(p=>p.setAttribute('r',Number(p.dataset.m)===i?7.5:5.5));
 v12AnnualCard(i,e);
},true);
document.addEventListener('pointerout',e=>{const svg=e.target.closest('.v12-annual-svg');if(!svg||svg.contains(e.relatedTarget))return;svg.querySelectorAll('.v12-month-band').forEach(b=>b.setAttribute('fill-opacity',0));svg.querySelectorAll('.v12-annual-pt').forEach(p=>p.setAttribute('r',5.5));const b=$('#annual-card');if(b)b.hidden=true});

/* 7. 브라우저 뒤로가기: 타임라인 ↔ 캠페인 분석 ↔ 이전 분석 */
var v12Pop=false,v12BaseRender=render;
render=async function(){
 const out=await v12BaseRender.apply(this,arguments);
 try{const st={route,activeId:route==='analysis'?activeId:''};const cur=history.state;
  if(!v12Pop&&(!cur||cur.route!==st.route||cur.activeId!==st.activeId))(cur?history.pushState:history.replaceState).call(history,st,'');}catch(e){}
 v12Pop=false;if(route==='analysis'){v12WeeklyH=280;requestAnimationFrame(()=>requestAnimationFrame(v12FitWeekly))}
 return out;
};
addEventListener('popstate',async e=>{const st=e.state;if(!st)return;v12Pop=true;route=st.route;if(st.activeId)activeId=st.activeId;if(route==='timeline'&&typeof v6Saved!=='undefined'&&v6Saved)v6Saved.restore=true;await render();if(route==='analysis')window.scrollTo({top:0,behavior:'instant'})});

/* 타임라인 좌우 단추: 타임라인 영역 위에 있을 때만 */
document.addEventListener('pointerover',e=>{const on=!!e.target.closest('.gantt-shell,.v5-float');document.body.classList.toggle('v12-gantt-hover',on)});

/* v35 — 2026-11-04 14:00 캠페인 분석 다듬기
   1) 머리: 'YouTube 추정 포함' 딱지에 마우스 → 추정 방식·금액 설명, 머리 높이 1.5배,
      '해당 광고주의 다른 캠페인'은 '← 타임라인'과 같은 줄 오른쪽, 캠페인 기간은 시작·종료 한 줄씩, 집행 매체 글씨 진하게.
   2) 주차별 매체 광고비 · 주차별 쿼리 추이: 같은 주차 축(주차 수·X축 글자 동일, 광고비가 짧으면 왼쪽을 빈 주로 채움),
      매체 순서 지상파 → 케이블&종편 → 라디오 → 인쇄 → 디지털 영상 → 디지털 배너(TV끼리·디지털끼리 비슷한 색),
      한쪽에 마우스를 올리면 다른 쪽도 같은 주가 강조, 성별 토글은 오른쪽.
   3) 경쟁사 광고비 비교 카드: 마우스 위치에서 비켜서, 광고주는 색 캡슐, 총액만, 운영 매체는 아래 작은 글씨. */

// ---------- 1) 머리 영역 ----------
var v35BaseDetail=detailView;
detailView=function(d){let h=v35BaseDetail(d);
 // 다른 캠페인 드롭다운 → '← 타임라인'과 같은 줄 오른쪽
 const lab=h.match(/<label>해당 광고주의 다른 캠페인<select id="campaign-switch"[\s\S]*?<\/select><\/label>/);
 if(lab){h=h.replace(lab[0],'');h=h.replace('<button class="v6-back v27-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인</button>',
   `<div class="v35-toolbar"><button class="v6-back v27-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인</button>${lab[0].replace('<label>','<label class="v35-switch">')}</div>`)}
 // 캠페인 기간: 시작·종료 한 줄씩, 설명 문구는 진행 중일 때만 아래 작게
 h=h.replace(/<strong class="v5-period">([^<~]*?)\s*~\s*([^<]*)<\/strong><small>([^<]*)<\/small>/,(m,a,b,s)=>`<strong class="v5-period v35-period"><span>${a.trim()}</span><span>~ ${b.trim()||'진행 중'}</span></strong>${/미정/.test(s)?`<small>${s}</small>`:''}`);
 return h};
// 'YouTube 추정 포함' 딱지 설명(마우스를 올리면)
function v35EstTip(){const d=typeof detailData!=='undefined'?detailData:null;const e=d&&d.youtube_estimate;const chip=document.querySelector('#content .v34-est');if(!e||!chip||chip.dataset.v35Tip)return;
 chip.removeAttribute('title');chip.tabIndex=0;
 const cut=e.digital_cutoff?e.digital_cutoff.replace(/-/g,'.'):'';
 chip.dataset.v35Tip=`<span class="v35-tip" role="tooltip"><b>YouTube 광고비 추정 방식</b>
  <span>아덱스 디지털 광고비가 ${cut}까지만 공개돼 있어, 그 뒤에 올라온 공식 YouTube 영상은 광고비를 직접 확인할 수 없어요.</span>
  <span>그래서 <b>조회수 × CPV</b>로 계산했어요. CPV는 설정 > 소재·추정 기준 값이에요.</span>
  <span class="v35-tip-calc">영상 ${e.videos.length}개 · 조회수 ${number(e.views)}회 × ${number(e.cpv)}원 = <b>${v4Money(e.amount)}원</b></span>
  <span>이 금액은 보정 추정 광고비에 포함돼 있어요. 아덱스에 디지털 광고비가 들어오면 실제 금액으로 바뀌어요.</span></span>`;chip.classList.add('v35-has-tip')}
// 딱지 설명은 화면 맨 위 레이어에 띄움(머리 영역 밖으로 잘리지 않게)
function v35TipOpen(chip){let box=document.getElementById('v35-esttip');if(!box){box=document.createElement('div');box.id='v35-esttip';document.body.appendChild(box)}
 box.innerHTML=chip.dataset.v35Tip;box.hidden=false;const r=chip.getBoundingClientRect(),w=box.offsetWidth,h=box.offsetHeight;let x=r.left,y=r.bottom+10;if(x+w>innerWidth-12)x=innerWidth-w-12;if(y+h>innerHeight-12)y=r.top-h-10;box.style.left=Math.max(12,x)+'px';box.style.top=Math.max(12,y)+'px'}
function v35TipClose(){const b=document.getElementById('v35-esttip');if(b)b.hidden=true}
document.addEventListener('pointerover',e=>{const c=e.target.closest&&e.target.closest('.v35-has-tip');if(c)v35TipOpen(c)});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.v35-has-tip');if(c&&!c.contains(e.relatedTarget))v35TipClose()});
document.addEventListener('focusin',e=>{const c=e.target.closest&&e.target.closest('.v35-has-tip');if(c)v35TipOpen(c)});
document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.v35-has-tip'))v35TipClose()});
addEventListener('scroll',v35TipClose,{passive:true});
var v35BaseAV=v32AnalysisVideos;
v32AnalysisVideos=function(){v35BaseAV();v35EstTip()};

// ---------- 2) 주차별 매체 광고비 · 주차별 쿼리 추이 (같은 주차 축) ----------
var V35_ORDER=['terrestrial','paytv','radio','print','digital_video','digital_banner'];
var V35_COLORS={terrestrial:'#1764a8',paytv:'#5fb0e6',radio:'#d9a441',print:'#9a7cc8',digital_video:'#0f9e86',digital_banner:'#83d8c5'};
var V35_NAMES={terrestrial:'지상파',paytv:'케이블&종편',radio:'라디오',print:'인쇄(신문·잡지)',digital_video:'디지털 영상',digital_banner:'디지털 배너'};
function v35Key(k){return k==='general'||k==='cable'?'paytv':(V35_ORDER.includes(k)?k:k)}
function v35Monday(s){const t=new Date(String(s).slice(0,10)+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);return t.toISOString().slice(0,10)}
function v35AddDays(s,n){const t=new Date(s+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function v35SpendWeeks(rows){const m=new Map();for(const r of rows||[]){if(!(r.amount>0))continue;const w=v35Monday(r.day),k=v35Key(r.bucket||r.kind);const e=m.get(w)||{};e[k]=(e[k]||0)+r.amount;m.set(w,e)}return m}
// 쿼리 추이 원자료(v28 추정 검색수 → 없으면 상대지수) · 주 단위
function v35TrendSource(d){let g=null;try{g=typeof v28QueryTrends==='function'?v28QueryTrends(d):null}catch(e){g=null}
 const est=!!g;g=g||d.trends;const pts=(g&&g.points)||[];if(!pts.length)return null;
 const series=new Map();for(const p of pts){if(!series.has(p.keyword))series.set(p.keyword,[]);series.get(p.keyword).push(p)}
 const keys=[...series.keys()].slice(0,5);if(!keys.includes(v5TrendKey))v5TrendKey=keys[0];
 const weekly=k=>{let rows=series.get(k)||[];if(g.time_unit!=='week'){const m=new Map();for(const r of rows){const w=v35Monday(r.day);if(!m.has(w))m.set(w,[]);m.get(w).push(r)}rows=[...m].map(([day,vs])=>({day,ratio:vs.reduce((a,b)=>a+b.ratio,0)/vs.length}))}
  return new Map(rows.map(r=>[v35Monday(r.day),r]))};
 const allWeeks=new Set();for(const k of keys)for(const w of weekly(k).keys())allWeeks.add(w);
 return {g,est,keys,cur:weekly(v5TrendKey),allWeeks,isCnt:(g.count_keywords||[]).includes(v5TrendKey)}}
// 두 그래프가 함께 쓰는 주차(빈 주 포함, 월요일 연속)
function v35Axis(d){const sp=v35SpendWeeks(d.daily_media||d.daily),tr=v35TrendSource(d);const ws=[...sp.keys(),...(tr?tr.allWeeks:[])].sort();
 if(!ws.length)return [];const out=[];for(let w=ws[0];w<=ws.at(-1);w=v35AddDays(w,7))out.push(w);return out}
function v35Ticks(weeks){const n=weeks.length,step=Math.max(1,Math.ceil(n/6)),off=Math.floor((n-1-Math.floor((n-1)/step)*step)/2);
 return `<div class="v35-x">${weeks.map((w,i)=>(i-off)%step===0&&i>=off?`<span style="left:${(i+.5)/n*100}%">${w.slice(2,7).replace('-','.')}<i>${+w.slice(8,10)}일 주</i></span>`:'').join('')}</div>`}
var v35Ctx={weeks:[],spend:new Map(),trend:null,keys:[]};
weeklyPanel=function(rows,title='주차별 매체 광고비',raw=false){
 const inAnalysis=route==='analysis'&&typeof detailData!=='undefined'&&detailData;
 const sp=v35SpendWeeks(rows);let weeks=inAnalysis?v35Axis(detailData):[];
 if(!weeks.length){const ws=[...sp.keys()].sort();for(let w=ws[0];ws.length&&w<=ws.at(-1);w=v35AddDays(w,7))weeks.push(w)}
 const present=new Set();sp.forEach(e=>Object.keys(e).forEach(k=>present.add(k)));
 const keys=[...V35_ORDER.filter(k=>present.has(k)),...[...present].filter(k=>!V35_ORDER.includes(k))],active=keys.filter(k=>!v3HiddenMedia.has(k));
 v35Ctx.weeks=weeks;v35Ctx.spend=sp;v35Ctx.keys=active;
 if(!weeks.length)return `<section class="glass section v12-weekly-panel">${header(title)}${empty('관측된 광고비가 없습니다.')}</section>`;
 const W=1000,H=Math.round(typeof v12WeeklyH!=='undefined'?v12WeeklyH:280),T=16,B=6,n=weeks.length,step=W/n,bw=Math.min(56,step*.72);
 const peak=Math.max(1,...weeks.map(w=>active.reduce((s,k)=>s+((sp.get(w)||{})[k]||0),0)));
 const bars=weeks.map((w,i)=>{const e=sp.get(w)||{};let run=0;
  return `<g class="v35-slot" data-v35-i="${i}"><rect class="v35-band" x="${step*i}" y="0" width="${step}" height="${H-B}"/>`+active.map(k=>{const a=e[k]||0;if(!a)return '';const hh=a/peak*(H-T-B),y=H-B-run-hh;run+=hh;return `<rect x="${step*i+(step-bw)/2}" y="${y}" width="${bw}" height="${hh}" fill="${V35_COLORS[k]||'#a8bbc5'}"/>`}).join('')+`</g>`}).join('');
 const first=weeks.findIndex(w=>sp.has(w));
 return `<section class="glass section v12-weekly-panel v35-weekly">${header(title)}<div class="stack-legend">${keys.map(k=>`<button data-week-media="${k}" class="${v3HiddenMedia.has(k)?'muted':''}"><i style="background:${V35_COLORS[k]||'#a8bbc5'}"></i>${V35_NAMES[k]||buckets[k]||k}</button>`).join('')}</div>
  <div class="v35-chart v35-wk-wrap"><svg class="v3-chart v12-weekly" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="주차별 매체 광고비 누적 막대"><line x1="0" x2="${W}" y1="${H-B}" y2="${H-B}" stroke="#d9e5eb" vector-effect="non-scaling-stroke"/>${bars}</svg>${v35Ticks(weeks)}<div class="v35-tip v35-wk-tip" hidden></div></div>
  <p class="footnote">월요일 시작 주차 · 매체별 누적 막대 · ${raw?'보정 전 원본':'선택한 보정 가정 반영'} · ${inAnalysis?'오른쪽 쿼리 추이와 같은 주차 축(광고비가 없는 주는 빈칸)':''} · 막대에 마우스를 올리면 주차별 금액${first>0?' · 캠페인 시작 전 주는 비워 둠':''}</p></section>`};
v5TrendPanel=function(d){
 const tr=v35TrendSource(d);
 if(!tr)return `<section class="glass section v12-trend-panel">${header('주차별 쿼리 추이')}${empty('이 광고주의 주간 검색 추이 연결을 확인 중입니다.')}</section>`;
 const weeks=v35Axis(d),n=weeks.length;v35Ctx.trend=tr;
 if(v35Ctx.weeks.join()!==weeks.join())setTimeout(()=>{const a=document.querySelector('.v12-weekly-panel');if(a&&route==='analysis'&&detailData){a.outerHTML=weeklyPanel(detailData.daily_media||detailData.daily)}},0);
 const W=640,H=300,T=78,B=8,vals=weeks.map(w=>tr.cur.get(w)?tr.cur.get(w).ratio:null),peak=Math.max(1,...vals.filter(v=>v!=null));
 const x=i=>(i+.5)*W/n,y=v=>H-B-v/peak*(H-T-B);
 const segs=[];let part=[];vals.forEach((v,i)=>{if(v==null){if(part.length)segs.push(part);part=[]}else part.push([x(i),y(v)])});if(part.length)segs.push(part);
 const paths=segs.map(p=>{const line=v12Smooth(p);return (p.length>1?`<path d="${line} L${p.at(-1)[0]},${H-B} L${p[0][0]},${H-B} Z" fill="url(#v35-trend-fill)"/>`:'')+`<path d="${line}" fill="none" stroke="#2b8fe0" stroke-width="2.4" vector-effect="non-scaling-stroke"/>${p.length===1?`<circle cx="${p[0][0]}" cy="${p[0][1]}" r="3" fill="#2b8fe0"/>`:''}`}).join('');
 const bands=weeks.map((w,i)=>`<rect class="v35-band" data-v35-i="${i}" x="${i*W/n}" y="0" width="${W/n}" height="${H-B}"/>`).join('');
 const grid=[.5,1].map(v=>`<line x1="0" x2="${W}" y1="${y(peak*v)}" y2="${y(peak*v)}" stroke="#e3edf2" vector-effect="non-scaling-stroke"/>`).join('');
 // 뉴스 표시(원문 발행일이 확인된 뉴스)
 const idx=new Map(weeks.map((w,i)=>[w,i]));const byWeek=new Map();for(const nw of (d.news||[])){const w=v35Monday(nw.published_at);if(!idx.has(w)||vals[idx.get(w)]==null)continue;if(!byWeek.has(w))byWeek.set(w,[]);byWeek.get(w).push(nw)}
 let lastX=-999,level=0;const marks=[...byWeek].sort((a,b)=>a[0].localeCompare(b[0])).map(([w,list])=>{const i=idx.get(w),cx=x(i),cy=y(vals[i]);level=cx-lastX<120?(level+1)%3:0;lastX=cx;const ly=8+level*22,title=list[0].title.replace(/\[[^\]]*\]|\([^)]*\)/g,'').trim(),short=title.length>16?title.slice(0,15)+'…':title;
  return `<g class="v5-news-mark" data-news="${esc(list.map(z=>z.id).join(','))}" tabindex="0" role="button" aria-label="${esc(w)} 주 뉴스 ${list.length}건: ${esc(title)}"><line x1="${cx}" y1="${ly+12}" x2="${cx}" y2="${cy-7}" stroke="#f08a24" stroke-width="1.2" stroke-dasharray="3 2"/><rect x="${Math.min(W-150,Math.max(0,cx-75))}" y="${ly-4}" width="150" height="18" rx="5" fill="#fff4e8" stroke="#f3b071"/><text x="${Math.min(W-75,Math.max(75,cx))}" y="${ly+9}" text-anchor="middle" class="v5-news-text">${esc(short)}${list.length>1?' 외 '+(list.length-1):''}</text><circle cx="${cx}" cy="${cy}" r="6" fill="#f08a24" fill-opacity=".25" stroke="#f08a24" stroke-width="2"/></g>`}).join('');
 const isCnt=tr.isCnt,fmt=v=>v==null?'—':isCnt?number(Math.round(v))+'회':v.toFixed(1);
 const known=vals.map((v,i)=>[v,i]).filter(z=>z[0]!=null),last=known.at(-1),prev=known.at(-2),avg=known.reduce((a,z)=>a+z[0],0)/Math.max(1,known.length),chg=last&&prev&&prev[0]?(last[0]-prev[0])/prev[0]*100:null;
 const hasSeg=!!(d.query_estimates&&Object.values(d.query_estimates.segments||{}).some(z=>z.m||z.f));
 const seg=hasSeg&&tr.est?`<div class="v28-unit v35-seg">${[['all','전체'],['m','남성'],['f','여성']].map(([k,l])=>`<button data-v28-seg="${k}" class="${v28QSeg===k?'on':''}">${l}</button>`).join('')}</div>`:'';
 const badge=tr.est?`<span class="v28-est-badge">${v28QSeg==='all'?'추정치':'지수 · 건수 아님'}</span>`:'';
 const st=(d.query_estimates&&d.query_estimates.keywords||[]).find(k=>k.keyword===v5TrendKey&&k.status==='ok');
 const skipped=(d.query_estimates&&d.query_estimates.keywords||[]).filter(k=>k.status!=='ok');
 const note=tr.est&&v28QSeg==='all'?`<p class="footnote v28-formula v34-easy"><b>이렇게 추정했어요</b> 네이버 검색광고에서 최근 30일 실제 검색 건수를 받고, 데이터랩에서 날짜별로 검색이 얼마나 많았는지(비율)를 받아, 30일 건수를 그 비율대로 날짜마다 나눴어요. 주별 값은 그 주 7일을 더한 값이에요.${st&&st.monthly_pc&&st.monthly_mo?` 예를 들어 ‘${esc(st.keyword)}’는 최근 30일 동안 PC ${number(+st.monthly_pc)}건, 모바일 ${number(+st.monthly_mo)}건 검색됐고, 이 건수를 날짜별 검색 비율대로 나눴어요.`:''}</p>${skipped.length?`<p class="footnote v28-skip">추정하지 않은 키워드(빈칸): ${skipped.map(k=>esc(k.keyword)).join(' · ')} · 데이터랩 비율에 빈 날이 있으면 건수를 나눌 수 없어 비워 둬요.</p>`:''}`
  :`<p class="footnote">${esc(tr.g.definition||'')}</p>`;
 return `<section class="glass section v12-trend-panel v35-trend">${header('주차별 쿼리 추이',`${isCnt?(tr.est?'네이버 주간 추정 검색수(추정치)':'네이버 주간 추산 검색수'):'네이버 주간 상대지수(최대=100)'} · 마우스를 올리면 주차별 수치(왼쪽 광고비 그래프도 같은 주가 표시돼요) · 주황 표시는 뉴스(${[...byWeek.values()].reduce((a,l)=>a+l.length,0)}건)`)}
  <div class="v35-chiprow"><div class="v5-chips">${tr.keys.map(k=>`<button data-trend-key="${esc(k)}" class="${k===v5TrendKey?'active':''}">${esc(k)}</button>`).join('')}</div>${badge}${seg}</div>
  <div class="v12-trend-kpi"><strong>${fmt(last&&last[0])}</strong>${chg!=null?`<em class="${chg>=0?'up':'down'}">${chg>=0?'+':''}${chg.toFixed(0)}%</em>`:''}<small>${last?`최근 주(${dateLabel(weeks[last[1]])})`:''} · 전주 대비 · 기간 평균 ${fmt(avg)}</small></div>
  <div class="v35-chart v35-tr-wrap"><svg class="v3-chart v35-trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="주차별 네이버 검색 추이"><defs><linearGradient id="v35-trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b8fe0" stop-opacity=".38"/><stop offset="1" stop-color="#2b8fe0" stop-opacity=".02"/></linearGradient></defs>${grid}${bands}${paths}<line class="v35-guide" x1="0" x2="0" y1="${T-6}" y2="${H-B}" stroke="#2b8fe0" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" visibility="hidden"/>${marks}</svg>${v35Ticks(weeks)}<div class="v35-dot" hidden></div><div class="v35-tip v35-tr-tip" hidden></div></div>
  ${note}<p class="footnote"><a href="${esc(safeUrl(tr.g.source_url||'https://datalab.naver.com/'))}" target="_blank" rel="noopener">네이버 원본 ↗</a></p></section>`};
// 같은 주 강조(두 그래프 함께)
function v35Range(w){return `${dateLabel(w)} ~ ${dateLabel(v35AddDays(w,6))}`}
function v35Show(i){const weeks=v35Ctx.weeks.length?v35Ctx.weeks:[];if(i==null||!weeks.length)return v35Hide();const w=weeks[i];
 document.querySelectorAll('#content .v35-band').forEach(b=>b.classList.toggle('on',+(b.dataset.v35I??b.parentElement.dataset.v35I)===i));
 document.querySelectorAll('#content .v35-slot').forEach(g=>g.classList.toggle('on',+g.dataset.v35I===i));
 // 광고비 카드
 const wk=document.querySelector('#content .v35-wk-wrap');if(wk){const tip=wk.querySelector('.v35-wk-tip'),e=v35Ctx.spend.get(w)||{},parts=v35Ctx.keys.map(k=>[k,e[k]||0]).filter(z=>z[1]>0),tot=parts.reduce((a,z)=>a+z[1],0);
  tip.innerHTML=`<small>${v35Range(w)}</small><b>${tot?v4Money(tot)+'원':'광고비 없음'}</b>${parts.map(([k,v])=>`<span><i style="background:${V35_COLORS[k]||'#a8bbc5'}"></i>${V35_NAMES[k]||k} ${v4Money(v)}원</span>`).join('')}`;
  v35Place(wk,tip,i,6)}
 // 쿼리 카드·점
 const tw=document.querySelector('#content .v35-tr-wrap');const tr=v35Ctx.trend;if(tw&&tr){const tip=tw.querySelector('.v35-tr-tip'),row=tr.cur.get(w),svg=tw.querySelector('svg'),r=svg.getBoundingClientRect(),n=weeks.length;
  const vals=weeks.map(x=>tr.cur.get(x)?tr.cur.get(x).ratio:null),peak=Math.max(1,...vals.filter(v=>v!=null)),vb=svg.viewBox.baseVal,T=78,B=8;
  const gx=(i+.5)*vb.width/n,g=svg.querySelector('.v35-guide');g.setAttribute('x1',gx);g.setAttribute('x2',gx);g.setAttribute('visibility','visible');
  const dot=tw.querySelector('.v35-dot');let top=40;
  if(row){const yv=(vb.height-B-row.ratio/peak*(vb.height-T-B))*r.height/vb.height;dot.hidden=false;dot.style.left=((i+.5)/n*r.width)+'px';dot.style.top=yv+'px';top=Math.max(0,yv-90)}else dot.hidden=true;
  tip.innerHTML=`<small>${v35Range(w)}</small><b>${row?(tr.isCnt?number(Math.round(row.ratio))+'회':row.ratio.toFixed(1)):'자료 없음'}</b><span>${esc(v5TrendKey)} ${tr.isCnt?'쿼리수':'검색 지수'}</span>${row&&row.pc!=null&&row.mo!=null?`<span class="v28-pm"><i>PC</i> ${number(Math.round(row.pc))}회<br><i>MO</i> ${number(Math.round(row.mo))}회</span>`:''}`;
  v35Place(tw,tip,i,top)}}
function v35Place(wrap,tip,i,top){tip.hidden=false;const n=v35Ctx.weeks.length,r=wrap.getBoundingClientRect(),cx=(i+.5)/n*r.width,tw=tip.offsetWidth,gap=Math.max(14,r.width/n/2+8);
 let x=cx+gap;if(x+tw>r.width-2)x=cx-gap-tw;tip.style.left=Math.max(0,x)+'px';tip.style.top=top+'px'}
function v35Hide(){document.querySelectorAll('#content .v35-band.on,#content .v35-slot.on').forEach(x=>x.classList.remove('on'));document.querySelectorAll('#content .v35-chart .v35-tip,#content .v35-dot').forEach(x=>x.hidden=true);
 const g=document.querySelector('#content .v35-guide');if(g)g.setAttribute('visibility','hidden')}
document.addEventListener('pointermove',e=>{const wrap=e.target.closest&&e.target.closest('.v35-chart');if(!wrap)return;const svg=wrap.querySelector('svg'),r=svg.getBoundingClientRect(),n=v35Ctx.weeks.length;if(!n)return;
 if(e.clientY>r.bottom+24)return;const i=Math.max(0,Math.min(n-1,Math.floor((e.clientX-r.left)/r.width*n)));if(wrap.__v35i===i)return;
 document.querySelectorAll('.v35-chart').forEach(x=>x.__v35i=i);v35Show(i)},{passive:true});
document.addEventListener('pointerout',e=>{const wrap=e.target.closest&&e.target.closest('.v35-chart');if(!wrap||wrap.contains(e.relatedTarget))return;document.querySelectorAll('.v35-chart').forEach(x=>x.__v35i=null);v35Hide()});

// ---------- 3) 경쟁사 광고비 비교 카드 ----------
v12AnnualCard=function(i,ev){
 if(!v12Annual)return;const {by,months,shown}=v12Annual,m=months[i];let box=$('#annual-card');if(!box){box=document.createElement('aside');box.id='annual-card';box.className='glass';document.body.appendChild(box)}
 const color=a=>(typeof v28AnnualMap!=='undefined'&&v28AnnualMap[a])||signatureColor(a);
 const rows=shown.filter(a=>by.get(a)?.has(m)).sort((a,b)=>by.get(b).get(m)-by.get(a).get(m));
 box.classList.add('v12-multi','v35-annual-card');
 box.innerHTML=`<small class="v35-ac-month">${m.replace('-','.')} · 광고주 ${rows.length}곳</small>${rows.map(a=>{const info=detailData?.annual_detail?.[a+'|'+m];const media=info?Object.entries(info.media).filter(z=>z[1]>0).sort((x,y)=>y[1]-x[1]).map(([k])=>buckets[k]||k):[];
  return `<div class="v35-ac-row"><div class="v35-ac-top"><span class="v35-cap" style="--c:${color(a)}">${esc(a)}</span><strong>${v4Money(by.get(a).get(m))}원</strong></div>${media.length?`<small class="v35-ac-media">운영 매체 · ${esc([...new Set(media)].join(', '))}</small>`:''}</div>`}).join('')||'<p>관측 광고비 없음</p>'}`;
 box.hidden=false;
 // 마우스를 올린 달의 띠 밖으로 비켜서(띠 오른쪽, 자리가 없으면 왼쪽) · 그래프 위쪽에 맞춤
 const svg=document.querySelector('.v12-annual-svg'),band=svg&&svg.querySelector(`.v12-month-band[data-m="${i}"]`);const br=band?band.getBoundingClientRect():{left:ev.clientX-20,right:ev.clientX+20},sr=svg?svg.getBoundingClientRect():{top:ev.clientY-100};
 const w=box.offsetWidth,h=box.offsetHeight,gap=28;let px=br.right+gap;if(px+w>innerWidth-12)px=br.left-gap-w;
 box.style.left=Math.max(12,px)+'px';box.style.top=Math.max(12,Math.min(sr.top,innerHeight-h-12))+'px'};

/* v41 — 2026-11-06 도달률 비교
   품목 안 광고주별 TV 광고비 · 15초 환산 노출량(Eq GRP) · 유효도달률(R3+) 버블 차트.
   자료: 아리아나(닐슨) TV 집행 — 먼슬리 리포트 Raw_04 집계(data/arianna). 카드를 누르면 지상파·케이블 세부 운영 내역. */
var V41_TITLE='TV 통합 분석',v41Meta=null,v41Cat='전체',v41Year=null,v41D=null,v41Req=0,v41Per='ytd';
var V41_TYPE={PR:'일반프로',SP:'스팟',TJ:'특집/재방',YG:'예고'};
function v41Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="reach"]'))return;const b=document.createElement('button');b.className='nav';b.dataset.route='reach';b.textContent=V41_TITLE;
 const after=nav.querySelector('[data-route="heatmap"]')||nav.querySelector('[data-route="monthly"]');if(after)after.after(b);else nav.appendChild(b)}
// 메뉴 순서: … 광고비 통합 분석 → TV 통합 분석 → 검색쿼리 히트맵 …, 뉴스 클리핑은 맨 아래 (11-06 15:26)
function v41Order(){const nav=document.querySelector('.sidebar nav');if(!nav)return;const g=r=>nav.querySelector(`[data-route="${r}"]`),m=g('monthly'),rc=g('reach'),nw=g('news');
 if(m&&rc&&m.nextElementSibling!==rc)m.after(rc);if(nw&&nav.lastElementChild!==nw)nav.appendChild(nw)}
v41Nav();v41Order();document.addEventListener('DOMContentLoaded',()=>{v41Nav();v41Order()});[400,1500,3000].forEach(t=>setTimeout(()=>{v41Nav();v41Order()},t));
async function v41Get(path){if(v32Static()){const r=await fetch('data/reach/'+path,{cache:'no-cache'});if(!r.ok)throw new Error('자료 없음');return r.json()}return api('/api/reach/'+path)}
async function v41Load(){if(!v41Meta)v41Meta=v32Static()?await v41Get('meta.json'):await api('/api/reach/meta');
 const cats=v41Meta.categories||[];if(!cats.length)return null;if(v41Cat==='전체')return v41LoadAll(cats);v41AllBack=null;if(!v41Cat||!cats.find(c=>c.label===v41Cat))v41Cat=(cats.find(c=>c.label==='정수기')||cats[0]).label;
 const req=++v41Req;const d=v32Static()?await v41Get('c-'+encodeURIComponent(v41Cat).replace(/%/g,'_')+'.json'):await api('/api/reach/rows?category='+encodeURIComponent(v41Cat));if(req!==v41Req)return null;
 const ci=Object.fromEntries(d.cols.map((k,i)=>[k,i]));d.R=d.rows.map(r=>Object.fromEntries(d.cols.map(k=>[k,r[ci[k]]])));
 d.years=[...new Set(d.R.map(r=>r.y))].sort((a,b)=>b-a);if(!v41Year||!d.years.includes(v41Year))v41Year=d.years[0];v41D=d;return d}
function v41M(y,m){return `${y}-${String(m).padStart(2,'0')}`}
function v41Pick(per){const d=v41D;return d.R.filter(r=>r.y===v41Year&&(per==='ytd'||v41M(r.y,r.m)===per))}
function v41Sum(rows,key){const o={};rows.forEach(r=>{const k=key?r[key]:'all';const a=o[k]||(o[k]={inv:0,net:0,ins:0,grp:0,eq:0,adj:0});a.inv+=r.inv;a.net+=r.net;a.ins+=r.ins;a.grp+=r.grp;a.eq+=r.eq;a.adj+=r.adj||0});return o}
function v41Won(k){return v38Money((k||0)*1000)}  // 천 원 → 표시
function v41Reach(adv,per){const r=(v41D.reach||{})[adv]||{};const k=per==='ytd'?String(v41Year):per;return r[k]||null}
function v41Months(){return [...new Set(v41D.R.filter(r=>r.y===v41Year).map(r=>v41M(r.y,r.m)))].sort()}
function v41Controls(show){let box=document.querySelector('main>header .v41-ctrl');if(!show){if(box)box.remove();return}const head=document.querySelector('main>header');if(!head)return;
 if(!box){box=document.createElement('div');box.className='v32-ctrl v41-ctrl';head.appendChild(box)}
 box.innerHTML=`<label>품목<select id="v41-cat" class="chip"><option value="전체" ${v41Cat==='전체'?'selected':''}>전체</option>${(v41Meta.categories||[]).map(c=>`<option value="${esc(c.label)}" ${c.label===v41Cat?'selected':''}>${esc(c.name||c.label)}</option>`).join('')}</select></label>`}
// 먼슬리 리포트 기준 자료(2026년) — 카드·팝업 맨 위 표 (11-06 14:04)
function v41Rep(){const r=v41D&&v41D.report;return r&&r.year===v41Year&&Object.keys(r.bubbles||{}).length?r:null}
function v41RepPts(rep){const by={};Object.entries(rep.bubbles).forEach(([k,v])=>{const [sec,a]=k.split('|');const o=by[a]||(by[a]={a,secs:[],won:0,eq:0,r3:null});o.secs.push(sec);o.won+=v.won/1000;o.eq+=v.eq;o.r3=v.r3});
 
 return Object.values(by).map(o=>{let r=o.secs.length>1?v41Reach(o.a,'ytd'):{r3:o.r3};return {a:o.a,eq:o.eq,won:o.won,inv:0,ins:0,r,secs:o.secs}})}
function v41RepRows(adv,per){const r=v41Rep();if(!r)return null;const rows=r.rows.filter(x=>x.brand===adv&&(per==='ytd'||v41M(v41Year,x.m)===per));return rows.length?rows:null}
function v41PtsNow(){const rows=v41Pick('ytd'),by=v41Sum(rows,'adv');
 const advs=Object.keys(by).filter(a=>by[a].inv>0||by[a].eq>0).sort((a,b)=>(b==='코웨이')-(a==='코웨이')||by[b].adj-by[a].adj);
 let pts=advs.map(a=>({a,eq:by[a].eq,won:by[a].adj,inv:by[a].inv,ins:by[a].ins,r:v41Reach(a,'ytd')}));
 const rep=v41Rep();if(rep)pts=v41RepPts(rep);return {pts,rep}}
function v41View(){const d=v41D,ALL=v41Cat==='전체';if(!ALL)v41Focus='';let pts,rep=null;
 if(ALL){pts=[];const save=v41D;const reps=[];try{for(const c of Object.keys(v41All)){const dc=v41All[c];if(!dc.years.includes(v41Year))continue;v41D=dc;const o=v41PtsNow();o.pts.forEach(p=>{p.cat=c});pts.push(...o.pts);if(o.rep)reps.push(o.rep)}}finally{v41D=save}rep=reps.length?{months:[Math.max(...reps.map(r=>Math.max(...r.months)))]}:null}
 else ({pts,rep}=v41PtsNow());
 const hasR=pts.some(p=>p.r&&p.r.r3!=null);
 const host=$('#content'),W=Math.max(900,(host.clientWidth||1200)-60),H=ALL?Math.max(620,Math.min(820,innerHeight-160)):Math.max(460,Math.min(640,innerHeight-260)),L=62,R=40,T=26,B=46,PW=W-L-R,PH=H-T-B;
 const xmax=(()=>{const m=Math.max(1,...pts.map(p=>p.eq))*1.15;const st=[100,200,250,500,1000,2000,2500,5000];const s=st.find(v=>m/v<=9)||10000;return Math.ceil(m/s)*s})();
 const XST=(()=>{for(const s of [50,100,200,250,500,1000,2000,2500,5000,10000])if(xmax/s<=10)return s;return 20000})(),YMAX=hasR?Math.max(70,Math.ceil(Math.max(...pts.map(p=>p.r&&p.r.r3||0))/10)*10+10):70;
 const X=v=>L+v/xmax*PW,Y=v=>T+PH-v/YMAX*PH;let g='';
 for(let v=0;v<=xmax+.1;v+=XST)g+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+PH}" stroke="#e4ebf0"/><text x="${X(v)}" y="${T+PH+18}" text-anchor="middle" font-size="11" fill="#7d8a96">${Math.round(v).toLocaleString()}</text>`;
 for(let v=0;v<=YMAX;v+=10)g+=`<line x1="${L}" x2="${L+PW}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e4ebf0"/><text x="${L-10}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#7d8a96">${v}</text>`;
 g+=`<line x1="${L}" x2="${L}" y1="${T}" y2="${T+PH}" stroke="#9aa8b3"/><line x1="${L}" x2="${L+PW}" y1="${T+PH}" y2="${T+PH}" stroke="#9aa8b3"/>
  <text x="${L}" y="${T-10}" font-size="11.5" font-weight="700" fill="#55697a">유효도달률 (R3+, %)</text><text x="${L+PW}" y="${T+PH-8}" text-anchor="end" font-size="11.5" font-weight="700" fill="#55697a">15초 환산 노출량 (Eq GRP)</text>`;
 if(!hasR)g+=`<text x="${L+PW/2}" y="${T+PH/2-60}" text-anchor="middle" font-size="13" font-weight="700" fill="#9aa8b3">R3+(유효도달률) 자료를 아직 받지 않아 노출량(가로축)만 표시해요</text>`;
 // 카드 위치: 점 둘레 여러 방향·거리 중 다른 카드·점과 안 겹치는 곳 — 점이 몰리면 멀리 두고 선으로 잇기 (11-06 10:12)
 pts.forEach((p,i)=>{p.px=X(p.eq);p.py=p.r&&p.r.r3!=null?Y(p.r.r3):T+PH-14});
 const cards=[],cw=ALL?156:178,ch=ALL?54:40,ov=(a,b,pad)=>!(a.x+a.w+pad<b.x||a.x>b.x+b.w+pad||a.y+a.h+pad<b.y||a.y>b.y+b.h+pad);
 const near=(c,x,y)=>[Math.max(c.x,Math.min(x,c.x+c.w)),Math.max(c.y,Math.min(y,c.y+c.h))],rd2=(c,x,y)=>{const [nx,ny]=near(c,x,y);return Math.hypot(nx-x,ny-y)};
 const segPt=(x1,y1,x2,y2,px,py)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l));return Math.hypot(x1+t*dx-px,y1+t*dy-py)};
 const segX=(a,b,c,d)=>{const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)};
 const segRect=(a,b,c)=>{if(b[0]>=c.x&&b[0]<=c.x+c.w&&b[1]>=c.y&&b[1]<=c.y+c.h)return false;const E=[[[c.x,c.y],[c.x+c.w,c.y]],[[c.x+c.w,c.y],[c.x+c.w,c.y+c.h]],[[c.x,c.y+c.h],[c.x+c.w,c.y+c.h]],[[c.x,c.y],[c.x,c.y+c.h]]];return E.some(([u,v])=>segX(a,b,u,v))};
 const ANG=Array.from({length:ALL?36:24},(_,k)=>k*(ALL?10:15)*Math.PI/180),RAD=ALL?[16,34,58,86,120,160,210,270,340,420,510,610,720,840]:[16,34,58,86,120,160,210,270,340];
 // 카드 자리: 다른 카드·점과 안 겹치고, 선이 다른 점·카드·선을 지나지 않고, 카드가 자기 점에 가장 가깝게 — 몰린 곳은 멀리 빼서 선으로 (11-06 10:24)
 const FIX=ALL?pts.filter(p=>v41Focus&&p.cat===v41Focus):pts;  // 전체: 상시 카드 없음 — 품목 칩을 고를 때만 그 품목 카드(코웨이 포함)를 펼침 (11-06 19:21)
 [...FIX].sort((a,b)=>(b.a==='코웨이')-(a.a==='코웨이')||b.eq-a.eq).forEach(p=>{let best=null,bs=1e12;
  for(const rd of RAD)for(const an of ANG){const cs=Math.cos(an),sn=Math.sin(an),qx=p.px+cs*rd,qy=p.py+sn*rd;
   const c={x:qx-(cs<-.35?cw:cs>.35?0:cw/2),y:qy-(sn<-.35?ch:sn>.35?0:ch/2),w:cw,h:ch};
   if(c.x<L+4||c.x+cw>L+PW-2||c.y<T+2||c.y+ch>T+PH-4)continue;
   if(c.x+cw>L+PW-178&&c.y+ch>T+PH-24)continue;  // 가로축 제목 자리
   if(ALL&&(cards.some(o=>ov(c,o,5))||pts.some(q=>q!==p&&q.px>c.x-9&&q.px<c.x+cw+9&&q.py>c.y-9&&q.py<c.y+ch+9)))continue;  // 전체 보기: 카드끼리·남의 점과는 절대 겹치지 않게
   const [nx,ny]=near(c,p.px,p.py),own=Math.hypot(nx-p.px,ny-p.py),A=[p.px,p.py],B=[nx,ny];let sc=own*.35;
   cards.forEach(o=>{if(ov(c,o,6))sc+=5000;if(own>12&&segRect(A,B,o))sc+=900;if(o.ln&&own>12&&segX(A,B,o.ln[0],o.ln[1]))sc+=400});
   pts.forEach(q=>{if(q===p)return;if(q.px>c.x-12&&q.px<c.x+cw+12&&q.py>c.y-12&&q.py<c.y+ch+12)sc+=3000;if(own>12&&segPt(A[0],A[1],B[0],B[1],q.px,q.py)<14)sc+=1500;if(rd2(c,q.px,q.py)<own+14)sc+=1200});
   if(sc<bs){bs=sc;best=c;best.ln=[A,B]}}
  if(!best)best={x:Math.min(L+PW-cw-2,Math.max(L+4,p.px+14)),y:Math.max(T+2,p.py-ch-14),w:cw,h:ch};best.p=p;cards.push(best)});
 // 연결선(점 → 카드의 가장 가까운 테두리)
 cards.forEach(c=>{const p=c.p,nx=Math.max(c.x,Math.min(p.px,c.x+c.w)),ny=Math.max(c.y,Math.min(p.py,c.y+c.h)),dd=Math.hypot(nx-p.px,ny-p.py);
  if(dd>14)g+=`<line class="v41-ln" x1="${p.px}" y1="${p.py}" x2="${nx}" y2="${ny}" stroke="${p.a==='코웨이'?'#8fa0d4':'#b9c3ca'}" stroke-width="1.2"/>`});
 pts.forEach((p,i)=>{const me=p.a==='코웨이',dl=(.08+i*(ALL?.035:.07)).toFixed(2);
  if(ALL){const col=v41CatCol(p.cat),dim=v41Focus&&p.cat!==v41Focus?' dim':'';g+=`<g class="v41-dot${dim}" data-v41-i="${i}" data-v41-cat="${esc(p.cat)}">`;if(me)g+=v41Ping(p.px,p.py,col);g+=`<circle class="v41-pt${me?' me':''}" style="animation-delay:${dl}s;transform-origin:${p.px}px ${p.py}px" cx="${p.px}" cy="${p.py}" r="${me?9:7}" fill="${col}" fill-opacity="${me?1:.82}" stroke="#fff" stroke-width="2"/>`;if(me)g+=`<circle class="v41-spark" cx="${p.px}" cy="${p.py}" r="3.2" fill="#fff" opacity=".35"><animate attributeName="opacity" values=".25;.95;.25" dur="1.4s" repeatCount="indefinite"/><animate attributeName="r" values="2.4;4;2.4" dur="1.4s" repeatCount="indefinite"/></circle>`;g+=`<circle class="v41-hit" cx="${p.px}" cy="${p.py}" r="14" fill="transparent"/></g>`;return}
  g+=`<circle class="v41-pt" style="animation-delay:${dl}s;transform-origin:${p.px}px ${p.py}px" cx="${p.px}" cy="${p.py}" r="${me?11:8}" fill="${me?'#4c66b2':'#a3acb4'}" fill-opacity="${me?1:.9}" stroke="#fff" stroke-width="2"/>`});
 const html=cards.map(c=>{const p=c.p,me=p.a==='코웨이',r3=p.r&&p.r.r3!=null?`R3+${Math.round(p.r.r3)}%`:'R3+ 준비 중';
  return `<button type="button" class="v41-card${me?' me':''}${ALL?' all':''}" data-v41-adv="${esc(p.a)}"${ALL?` data-v41-cat="${esc(p.cat)}" data-v41-i="${pts.indexOf(p)}"`:''} style="left:${c.x}px;top:${c.y}px;width:${c.w}px;animation-delay:${(.35+pts.indexOf(p)*(ALL?.035:.07)).toFixed(2)}s">${ALL?`<i class="cap" style="background:${v41CatCol(p.cat)}">${esc(p.cat)}</i>`:''}<b>${esc(p.a)} <em>(${v41Won(p.won)}원)</em></b><span>(${Math.round(p.eq).toLocaleString()} eq GRP, ${r3})</span><i class="go">자세히 보기 →</i></button>`}).join('');
 v41Pts=pts;v41Geo={L,T,PW,PH};const src=d.source||{};
 return `<section class="glass section v41-card-wrap"><div class="v41-head"><div><h2>${v41Year}년 누적 경쟁사 TV 노출량 · R3+ <small>${esc(v41Cat)}</small></h2><p>카드를 누르면 지상파·케이블 세부 운영 내역을 볼 수 있어요</p>${ALL?`<div class="v41-chips" role="group" aria-label="품목 카드 펼치기"><span class="hint">${V41_TAP}품목을 누르면 그 품목 카드가 펼쳐져요</span>${Object.keys(v41All).filter(c=>pts.some(p=>p.cat===c)).map(c=>{const n=pts.filter(p=>p.cat===c).length,on=v41Focus===c;return `<button type="button" class="chipc${on?' on':''}" data-v41-focus="${esc(c)}" aria-pressed="${on}" style="--c:${v41CatCol(c)}"><i></i>${esc(c)}<em>${n}</em>${on?'<b aria-hidden="true">✕</b>':''}</button>`}).join('')}<span class="melg"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">${v41Ping(11,11,'#14284d',9)}<circle cx="11" cy="11" r="4" fill="#14284d"/></svg>코웨이</span></div>`:''}</div>
  <div class="v39-years v41-years">${d.years.map(y=>`<button type="button" class="y${y===v41Year?' on':''}" data-v41-year="${y}">${y}</button>`).join('')}</div></div>
  <div class="v41-plot${ALL?' all':''}${ALL&&v41Focus?' focus':''}" style="height:${H}px"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}${ALL?'<line class="v41-hovln" x1="0" y1="0" x2="0" y2="0" stroke="#b9c3ca" stroke-width="1.2" visibility="hidden"/>':''}</svg>${html}${ALL?'<button type="button" class="v41-card all v41-hov" hidden></button>':''}</div>
  ${ALL?`<p class="footnote v41-note">전체: 품목별 점을 한 그래프에 모았어요(같은 품목은 같은 색, 코웨이는 퍼지는 불빛) · 점에 마우스를 올리면 카드가 보이고, 누르면 세부 내역이 열려요 · ${v41Year}년 ${rep?`SM C&C 먼슬리 리포트(1~${Math.max(...rep.months)}월) 기준`:'아리아나 원본 기준'} · 품목을 고르면 품목별 설명과 함께 볼 수 있어요</p>`:rep?`<p class="footnote v41-note">${v41Year}년은 SM C&C 먼슬리 리포트(1~${Math.max(...rep.months)}월) 기준과 같게 맞췄어요 · 광고비: 코웨이는 실집행 금액(지상파 CM지정·연계 포함 총액, 홍보팀 정책성 예산 포함), 경쟁사는 리포트 표기 금액 · Eq GRP·R3+: 닐슨, 타깃 F30-45 수도권, PR·SP·TJ·YG(시보 제외)${(v41Cat==='정수기')?' · 정수기는 리포트의 일반·얼음을 합친 값(광고비·Eq GRP는 합계, R3+는 정수기 전체로 다시 산출한 아리아나 도달률)':''}</p>`:`<p class="footnote v41-note">광고비: 아리아나 TV(지상파·케이블&종편) 모니터링 광고비에 SM C&C 실집행 추정 요율(설정 &gt; 광고비 보정)을 적용 · Eq GRP: 15초 환산 GRP, 타깃 ${esc(src.target||'')}(${esc(d.reach_target||'')}) · 자료 ${esc((src.months||[]).filter(m=>m.startsWith(String(v41Year))).slice(0,1)[0]||'')}~${esc((src.months||[]).filter(m=>m.startsWith(String(v41Year))).slice(-1)[0]||'')} · 포함=O·경쟁사=O 광고주 · ${hasR?'R3+: 아리아나 도달 분석':'R3+: 자료 준비 중'}${v41Year<2026?' · 이 해는 먼슬리 리포트가 없어 아리아나 원본 기준':''}</p>`}</section>`}
function v41Draw(){if(!v41D){$('#content').innerHTML=`<section class="glass section">${empty('도달률 자료가 없어요.','아리아나 자료(data/arianna)를 넣으면 보여요.')}</section>`;return}v41Controls(true);$('#content').innerHTML=v41View()}
// 팝업: 지상파·케이블 세부 운영 내역
function v41Bar(parts,total,cols){if(!total)return '<i class="v41-bar0"></i>';return `<i class="v41-bar">${parts.map(([k,v],i)=>`<b style="width:${v/total*100}%;background:${cols[i%cols.length]}" title="${esc(k)} ${Math.round(v/total*100)}%"></b>`).join('')}</i>`}
function v41Detail(adv){const per=v41Per,rows=v41Pick(per).filter(r=>r.adv===adv),rep=v41Rep();
 const repMs=rep?[...new Set(rep.rows.filter(x=>x.brand===adv).map(x=>v41M(v41Year,x.m)))]:[],ms=[...new Set([...v41Months(),...repMs])].sort();
 const terr=rows.filter(r=>r.media==='지상파'),cab=rows.filter(r=>r.media!=='지상파'),Z={inv:0,net:0,ins:0,grp:0,eq:0,adj:0},T=v41Sum(terr).all||Z,C=v41Sum(cab).all||Z;
 const pct=(v,t)=>t?Math.round(v/t*100)+'%':'-',num=v=>v==null||v===''?'-':Math.round(v).toLocaleString(),f1=v=>v==null?'-':(+v).toFixed(1).replace(/\.0$/,''),cprp=x=>x.eq?num(x.inv/x.eq):'-',ar=x=>x.ins?(x.grp/x.ins).toFixed(1):'-';
 // ① 지상파 / 케이블&종편 요약(먼슬리 리포트 표와 같은 모양)
 const RR=v41RepRows(adv,per),bub=rep?Object.fromEntries(Object.entries(rep.bubbles).filter(([k])=>k.split('|')[1]===adv).map(([k,v])=>[k.split('|')[0],v])):{};
 let sumHtml='',headAct=null,headInv=null,headEq=null,headR3=null;
 const MED=['지상파','케이블&종편','Total'],cols=`<tr><th>매체</th><th>모니터링 금액 (천원)</th><th>실집행금액 (천원)</th><th>횟수</th><th>GRP</th><th>Eq GRP</th><th>모니터링 CPRP (천원)</th><th>실집행 CPRP (천원)</th><th>R1+ (%)</th><th>R3+ (%)</th><th>A.F</th></tr>`;
 const rowH=(x,tot)=>`<tr class="${tot?'tot':''}"><th>${esc(x.media)}</th><td>${num(x.inv)}</td><td>${num(x.act)}</td><td>${num(x.ins)}</td><td>${num(x.grp)}</td><td>${num(x.eq)}</td><td>${num(x.cprp)}</td><td>${num(x.acprp)}</td><td>${f1(x.r1)}</td><td>${f1(x.r3)}</td><td>${f1(x.af)}</td></tr>`;
 if(RR){const secs=[...new Set(RR.map(x=>x.sec))],multi=secs.length>1,blocks=[];const all={};
  secs.forEach(sec=>{const by={};RR.filter(x=>x.sec===sec).forEach(x=>{const o=by[x.media]||(by[x.media]={media:x.media,inv:0,act:0,ins:0,grp:0,eq:0,r1:null,r3:null,af:null,n:0});['inv','act','ins','grp','eq'].forEach(k=>o[k]+=x[k]||0);o.n++;if(per!=='ytd'){o.r1=x.r1;o.r3=x.r3;o.af=x.af;o.rc=x.cprp;o.ra=x.acprp}});
   MED.forEach(m=>{const o=by[m];if(!o)return;o.cprp=o.rc!=null?o.rc:o.eq?o.inv/o.eq:null;o.acprp=o.ra!=null?o.ra:o.eq?o.act/o.eq:null;if(per==='ytd'&&m==='Total'&&bub[sec])o.r3=bub[sec].r3;
    if(m==='Total'){['inv','act','ins','grp','eq'].forEach(k=>all[k]=(all[k]||0)+o[k])}});
   blocks.push([sec,MED.filter(m=>by[m]).map(m=>by[m])])});
  const lab=s=>s.replace(v41Cat,'').trim()||s;
  sumHtml=`<div class="v41-tw"><table class="v41-t v41-st"><thead>${multi?cols.replace('<tr><th>매체</th>','<tr><th>구분</th><th>매체</th>'):cols}</thead><tbody>${blocks.map(([sec,ls])=>ls.map((x,i)=>(multi?rowH(x,x.media==='Total').replace('<tr class="'+(x.media==='Total'?'tot':'')+'">','<tr class="'+(x.media==='Total'?'tot':'')+'">'+(i===0?`<th rowspan="${ls.length}" class="sec">${esc(lab(sec))}</th>`:'')):rowH(x,x.media==='Total'))).join('')).join('')}
   ${multi?(()=>{const o={media:'합계',...all};o.cprp=o.eq?o.inv/o.eq:null;o.acprp=o.eq?o.act/o.eq:null;const rr=per==='ytd'?v41Reach(adv,'ytd'):null;o.r3=rr&&rr.r3!=null?rr.r3:null;return rowH(o,true).replace('<tr class="tot"><th>합계</th>','<tr class="tot all"><th colspan="2">합계</th>')})():''}</tbody></table></div>`;
  const tot=multi?all:blocks[0][1].find(x=>x.media==='Total')||{};headAct=tot.act;headInv=tot.inv;headEq=tot.eq;
  headR3=per==='ytd'?(multi?(v41Reach(adv,'ytd')||{}).r3:(bub[secs[0]]||{}).r3):(multi?null:(blocks[0][1].find(x=>x.media==='Total')||{}).r3)}
 else if(rows.length){const mk=(m,x)=>({media:m,inv:x.inv,act:null,ins:x.ins,grp:x.grp,eq:x.eq,cprp:x.eq?x.inv/x.eq:null,acprp:null,r1:null,r3:null,af:null}),A={inv:T.inv+C.inv,ins:T.ins+C.ins,grp:T.grp+C.grp,eq:T.eq+C.eq};
  const r=v41Reach(adv,per),tt=mk('Total',A);if(r){tt.r1=r.r1;tt.r3=r.r3}
  sumHtml=`<div class="v41-tw"><table class="v41-t v41-st"><thead>${cols}</thead><tbody>${terr.length?rowH(mk('지상파',T)):''}${cab.length?rowH(mk('케이블&종편',C)):''}${rowH(tt,true)}</tbody></table></div><p class="v41-sub">이 광고주·기간은 먼슬리 리포트 표가 없어 아리아나(닐슨) 원본으로 보여요.</p>`;
  headInv=A.inv;headEq=A.eq;headR3=r&&r.r3}
 // ② 지상파 세부(채널·시급·광고유형·초수) — 모니터링 광고비 기준
 const dimDef=[['ch','채널별',x=>x,['KBS2','MBC','SBS']],['tb','시급별',x=>x,['SS','SA','A','B','C','PS']],['type','광고유형별',x=>V41_TYPE[x]||x,['PR','SP','TJ','YG']],['sec','초수별',x=>x+'"',null]];
 const dims=dimDef.map(([k,n,f,ord])=>{const s=v41Sum(terr,k);let keys=Object.keys(s).filter(z=>s[z].inv||s[z].ins);keys.sort((a,b)=>ord?((ord.indexOf(a)+99)%99)-((ord.indexOf(b)+99)%99)||s[b].inv-s[a].inv:+a-+b);return {k,n,f,s,keys}});
 const COL=['#4c66b2','#7fc4e4','#9fd6c8','#c3c8cd','#8a97ab','#6ea7a3','#b7a6d6','#e3b98c','#9bb6d8','#d3dbe1'];
 const head=dims.map(d=>`<th colspan="${d.keys.length||1}">${d.n}</th>`).join(''),sub=dims.map(d=>d.keys.length?d.keys.map(z=>`<th>${esc(d.f(z))}</th>`).join(''):'<th>-</th>').join('');
 const nc=dims.reduce((t,d)=>t+(d.keys.length||1),0),cw=`<colgroup><col class="c0"><col class="c1">${'<col>'.repeat(nc)}</colgroup>`;
 const line=(nm,tot,fn)=>`<tr><th>${nm}</th><td class="t">${tot}</td>${dims.map(d=>d.keys.length?d.keys.map(z=>`<td>${fn(d.s[z])}</td>`).join(''):'<td>-</td>').join('')}</tr>`;
 const terrHtml=terr.length?`<div class="v41-tw"><table class="v41-t v41-tt">${cw}<thead><tr><th rowspan="2">구분</th><th rowspan="2">합계</th>${head}</tr><tr>${sub}</tr></thead><tbody>
  ${line('모니터링 광고비 (천원)',num(T.inv),x=>pct(x.inv,T.inv))}${line('Eq GRP',num(T.eq),x=>pct(x.eq,T.eq))}${line('횟수',num(T.ins),x=>pct(x.ins,T.ins))}${line('A.R',ar(T),x=>ar(x))}${line('모니터링 CPRP (천원)',cprp(T),x=>cprp(x))}</tbody></table></div>
  <div class="v41-charts">${dims.map(d=>`<div class="v41-ch"><b>${d.n}</b><div class="r"><span>광고비</span>${v41Bar(d.keys.map(z=>[d.f(z),d.s[z].inv]),T.inv,COL)}</div><div class="r"><span>Eq GRP</span>${v41Bar(d.keys.map(z=>[d.f(z),d.s[z].eq]),T.eq,COL)}</div><div class="lg">${d.keys.map((z,i)=>`<em><i style="background:${COL[i%COL.length]}"></i>${esc(d.f(z))}</em>`).join('')}</div></div>`).join('')}</div>`:`<p class="v41-none">${v41Pick(v41Per).some(r=>r.adv===adv)?'이 기간 지상파 집행이 없어요.':'이 달 아리아나(닐슨) 세부 자료가 아직 없어요. 위 요약표는 먼슬리 리포트 기준이에요.'}</p>`;
 // ③ 케이블 MPP — 모니터링 광고비 기준만, 표 아래 MPP·채널 그래프
 const ms2=v41Sum(cab,'mpp');let mk=Object.keys(ms2).sort((a,b)=>ms2[b].inv-ms2[a].inv);const top=mk.filter(z=>ms2[z].inv/C.inv>=.01).slice(0,10),rest=mk.filter(z=>!top.includes(z));
 if(rest.length){const o={inv:0,net:0,ins:0,grp:0,eq:0,adj:0};rest.forEach(z=>{for(const k in o)o[k]+=ms2[z][k]});ms2['기타']=o;top.push('기타')}
 const mmax=Math.max(1,...top.map(z=>ms2[z].inv));
 const cabHtml=cab.length?`<div class="v41-tw"><table class="v41-t v41-ct"><colgroup><col class="c0"><col><col><col><col><col><col></colgroup><thead><tr><th>MPP</th><th>모니터링 광고비 (천원)</th><th>집행 비중</th><th>횟수</th><th>Eq GRP</th><th>Eq GRP 비중</th><th>모니터링 CPRP (천원)</th></tr></thead><tbody>
  ${top.map(z=>{const x=ms2[z];return `<tr><th>${esc(z||'(미분류)')}</th><td>${num(x.inv)}</td><td>${pct(x.inv,C.inv)}</td><td>${num(x.ins)}</td><td>${num(x.eq)}</td><td>${pct(x.eq,C.eq)}</td><td>${cprp(x)}</td></tr>`}).join('')}</tbody>
  <tfoot><tr><th>Total</th><td>${num(C.inv)}</td><td>100%</td><td>${num(C.ins)}</td><td>${num(C.eq)}</td><td>100%</td><td>${cprp(C)}</td></tr></tfoot></table></div>
  <div class="v41-ch v41-mppc"><b>MPP별 광고비</b><div class="v41-hbars">${top.map(z=>`<div class="hb"><span title="${esc(z)}">${esc(z||'(미분류)')}</span><i><b style="width:${mmax?ms2[z].inv/mmax*100:0}%"></b></i><em>${v41Won(ms2[z].inv)}</em></div>`).join('')}</div></div>`:`<p class="v41-none">${v41Pick(v41Per).some(r=>r.adv===adv)?'이 기간 케이블·종편 집행이 없어요.':'이 달 아리아나(닐슨) 세부 자료가 아직 없어요.'}</p>`;
 const me=adv==='코웨이',hd=[];if(headAct!=null)hd.push(`${me?'집행금액':'실집행 추정'} ${v41Won(headAct)}원`);if(headInv!=null&&!(me&&headAct!=null))hd.push(`모니터링 ${v41Won(headInv)}원`);  // 코웨이는 실집행이 있으면 모니터링 금액을 꺼내지 않음 (11-06 20:15)hd.push(`Eq GRP ${num(headEq!=null?headEq:T.eq+C.eq)}`);hd.push(`R3+ ${headR3!=null?Math.round(headR3)+'%':'-'}`);
 return `<div class="v41-pop"><div class="v41-ph"><div><span class="v41-tag">${esc(v41Cat)}</span><h2>${esc(adv)} · TV 세부 운영 내역</h2><p>${per==='ytd'?v41Year+'년 누적':per.replace('-','년 ')+'월'} · ${hd.join(' · ')}</p></div>
  <select class="chip v41-per" data-v41-per>${[['ytd',v41Year+'년 누적'],...ms.slice().reverse().map(m=>[m,m.slice(2,4)+'.'+m.slice(5)])].map(([v,l])=>`<option value="${v}" ${v===per?'selected':''}>${l}</option>`).join('')}</select></div>
  <div id="v41-donut-slot"></div>
  <h3>지상파 · 케이블&종편 집행 요약</h3>${sumHtml||'<p class="v41-none">이 기간 집행이 없어요.</p>'}
  <h3>지상파TV 세부 운영 내역</h3>${terrHtml}<h3>케이블TV 세부 운영 내역</h3>${cabHtml}
  <p class="footnote">집행 요약: ${rep?'SM C&C 먼슬리 리포트 경쟁사 TV set Performance 표 기준 — 코웨이 실집행금액은 실집행(지상파 CM지정·연계 포함 총액, 홍보팀 정책성 예산 포함), 경쟁사 실집행금액은 보너스율 반영 추정 · 누적의 R1+·A.F는 월별 값을 더할 수 없어 비워 두고 R3+는 누적 도달률':'아리아나(닐슨) 원본'} · 세부 운영 내역: 아리아나(닐슨) 모니터링 광고비·GRP·Eq GRP, 타깃 ${esc((v41D.source||{}).target||'')} · A.R = GRP ÷ 횟수 · CPRP = 모니터링 광고비 ÷ Eq GRP · 광고유형: PR 일반프로, SP 스팟, TJ 특집/재방</p></div>`}
function v41Open(adv){const dl=$('#detail');dl.className='v41-dialog';$('#detail-body').innerHTML=v41Detail(adv);v41Cur=adv;if(!dl.open)dl.showModal();v41DnMount(adv,v41Per)}
var v41Cur='';
var v41BaseRender=render;
render=async function(...a){try{v41Order()}catch(e){}if(route!=='reach'){v41Controls(false);return v41BaseRender.apply(this,a)}
 if(typeof v38Hist!=='undefined'){const pop=v38Hist.pop;v38Hist.pop=false;if(typeof v12Pop!=='undefined')v12Pop=true;v38Sync(pop||!v38Hist.ready);v38Hist.ready=true}
 ['v37Controls','v32Controls','v38Controls','v39Controls'].forEach(f=>{try{if(typeof window[f]==='function')window[f](false)}catch(e){}});try{v38Tip&&v38Tip(null)}catch(e){}
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='reach'));$('#page-title').textContent=V41_TITLE;$('#subtitle').textContent='';
 if(v41D&&v41D._cat===v41Cat&&Date.now()-v41D._t<6e5){v41Draw();if(typeof v38Sync==='function')v38Sync(true);return}  // 다시 들어올 때는 받아 둔 자료로 바로 그림(이전 화면이 잠깐 남아 보이지 않게)
 $('#content').innerHTML='<div class="loading glass">TV 통합 분석 자료를 불러오는 중이에요.</div>';
 try{await v41Load();if(route!=='reach')return;if(v41D){v41D._cat=v41Cat;v41D._t=Date.now()}}catch(e){$('#content').innerHTML=`<section class="glass section">${empty('도달률 자료를 불러오지 못했어요.',e.message)}</section>`;return}v41Draw();if(typeof v38Sync==='function')v38Sync(true)};
document.addEventListener('click',async e=>{if(route!=='reach')return;const y=e.target.closest&&e.target.closest('[data-v41-year]');if(y){v41Year=+y.dataset.v41Year;v41Per='ytd';v41Draw();if(typeof v38Sync==='function')v38Sync(false);return}
 const c=e.target.closest&&e.target.closest('.v41-card[data-v41-adv]');if(c){v41Per='ytd';const ct=c.dataset.v41Cat;if(ct&&v41All[ct]){v41AllBack={d:v41D};v41Cat=ct;v41D=v41All[ct]}v41Open(c.dataset.v41Adv)}});
document.addEventListener('change',async e=>{if(e.target.id==='v41-cat'){e.stopPropagation();v41Cat=e.target.value;v41Year=null;v41Per='ytd';try{await v41Load();v41Draw();if(typeof v38Sync==='function')v38Sync(false)}catch(err){toast('불러오지 못했어요: '+err.message)}return}
 const p=e.target.closest&&e.target.closest('[data-v41-per]');if(p){v41Per=p.value;const dl=$('#detail');$('#detail-body').innerHTML=v41Detail(v41Cur);v41DnMount(v41Cur,v41Per)}},true);
window.addEventListener('resize',()=>{if(route==='reach'&&v41D)v41Draw()});
// 주소(#/reach?cat=)
if(typeof V38_ROUTES!=='undefined'&&!V38_ROUTES.includes('reach'))V38_ROUTES.push('reach');
if(typeof v38HashOf==='function'){var v41BaseHash=v38HashOf;v38HashOf=function(any){if(route!=='reach')return v41BaseHash(any);if(!any&&/news=/.test(location.hash))return null;const q=new URLSearchParams();if(v41Cat)q.set('cat',v41Cat);if(v41Year)q.set('y',v41Year);const s=q.toString();return '#/reach'+(s?'?'+s:'')}}
function v41FromHash(){const h=decodeURI(location.hash||'');if(!h.startsWith('#/reach'))return false;const q=new URLSearchParams(h.split('?')[1]||'');route='reach';if(q.get('cat')&&q.get('cat')!==v41Cat){v41Cat=q.get('cat');v41D=null}if(q.get('y'))v41Year=+q.get('y');return true}
if(typeof v38ApplyHash==='function'){var v41BaseApply=v38ApplyHash;v38ApplyHash=function(){return v41FromHash()||v41BaseApply()}}
if(v41FromHash()&&typeof listing!=='undefined'&&listing){render()}
// ---------- 팝업 맨 위: 지상파(왼쪽·파랑) · 케이블&종편(오른쪽·무채색) 3D 도넛 (11-06 14:33) ----------
// 모니터링 광고비 기준, 케이블은 상위 5개 채널 + 기타. 카드(양쪽 같은 행 높이)와 연결선, 마우스 올리면 그 조각 강조, 열 때·기간 바꿀 때 펼침 애니메이션
var v41DnLast=null,v41DnEtc=null;const V41_BL=['#2a4fa8','#4a6fcf','#8fb0f0'],V41_GR=['#56616c','#6d7883','#858f99','#9ca5ae','#b3bbc2','#c9cfd5'];
function v41Eok(k){const e=(k||0)/1e5;return e>=10?Math.round(e).toLocaleString()+'억':e>=.1?e.toFixed(1)+'억':Math.round((k||0)/10)+'만'}
function v41Shade(h,k){const n=parseInt(h.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(c*k)));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`}
// 11-06 20:25 먼슬리 리포트에 그달 '지상파 채널별·케이블 MPP별 세부 표'가 있으면 그 금액을 그대로 씀(코웨이 실집행, 경쟁사 모니터링)
function v41DnRep(adv,per){const r=v41Rep();if(!r||!r.detail||!r.detail.length)return null;const me=adv==='코웨이',key=me?'act':'mon';
 // 누적이면 1~N월 표를 모두 더함. 그 기간 집행한 달(셋 퍼포먼스 표 기준)마다 세부 표가 다 있어야 금액으로 씀
 const inP=x=>per==='ytd'||v41M(v41Year,x.m)===per;
 const need=r.rows.filter(x=>x.brand===adv&&x.media!=='Total'&&inP(x)&&((me?x.act:x.inv)||0)>0);if(!need.length)return null;
 const det=r.detail.filter(x=>x.brand===adv&&inP(x)),res={t:[],c:[]},pctG={t:false,c:false};
 for(const [med,g] of [['지상파','t'],['케이블&종편','c']]){const nd=need.filter(x=>x.media===med);if(!nd.length)continue;
  const has=(x,f)=>det.some(d=>d.m===x.m&&d.sec===x.sec&&d.media===med&&(d[f]||0)>0),src=det.filter(d=>d.media===med&&nd.some(x=>x.m===d.m&&x.sec===d.sec));const o={};
  if(nd.every(x=>has(x,key)))src.forEach(d=>{if(d[key])o[d.name]=(o[d.name]||0)+d[key]});
  else if(nd.every(x=>has(x,'mon'))){const tot=nd.reduce((t,x)=>t+(me?x.act:x.inv),0);src.forEach(d=>{if(d.mon)o[d.name]=(o[d.name]||0)+d.mon});const sm=Object.values(o).reduce((a,b)=>a+b,0)||1;for(const k in o)o[k]=o[k]/sm*tot;pctG[g]=true}  // 코웨이 지상파 채널별 실집행 표가 없는 달이 끼면 합계만 금액, 채널은 모니터링 비중
  else return null;
  res[g]=Object.entries(o).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1])}
 const t=res.t,c0=res.c;let c=c0.filter(([n])=>n!=='기타'),etc=[];const raw=c0.filter(([n])=>n==='기타');if(c.length>5){etc=c.slice(5);c=c.slice(0,5)}etc=etc.concat(raw.map(([,v])=>['기타(표의 기타)',v]));const rest=etc.reduce((x,[,v])=>x+v,0);if(rest>0)c=c.concat([['기타',rest]]);
 const ms=[...new Set(need.map(x=>x.m))].sort((a,b)=>a-b);
 return {t,c,etc,basis:me?'act':'monrep',detail:true,pctG,months:ms}}
function v41DnData(adv,per){const dr=v41DnRep(adv,per);if(dr)return dr;const rows=v41Pick(per).filter(r=>r.adv===adv);const by=(f,key)=>{const o={};rows.filter(f).forEach(r=>{const k=r[key]||'(미분류)';o[k]=(o[k]||0)+r.inv});return Object.entries(o).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1])};
 const t=by(r=>r.media==='지상파','ch');let c=by(r=>r.media!=='지상파','mpp');const raw=c.filter(([n])=>n==='기타'||n==='(미분류)');c=c.filter(([n])=>n!=='기타'&&n!=='(미분류)');let etc=[];  // 원래 이름이 '기타'인 MPP도 기타 묶음에 넣고 항상 맨 끝
 if(c.length>5){etc=c.slice(5);c=c.slice(0,5)}{const all=t.reduce((x,[,v])=>x+v,0)+c.reduce((x,[,v])=>x+v,0)+etc.reduce((x,[,v])=>x+v,0)+raw.reduce((x,[,v])=>x+v,0),tiny=c.filter(([,v])=>v/all<.015);if(tiny.length&&c.length>1){c=c.filter(z=>!tiny.includes(z));etc=tiny.concat(etc)}}etc=etc.concat(raw.map(([n,v])=>[n==='기타'?'기타(분류 없음)':n,v]));const rest=etc.reduce((s,[,v])=>s+v,0);if(rest>0)c=c.concat([['기타',rest]]);
 // 11-06 20:19 리포트가 있으면 금액은 지상파·케이블&종편 합계(코웨이 실집행, 경쟁사 모니터링)만 쓰고, 방송사·MPP는 금액을 나누지 않고 모니터링 비중(%)만 표시
 // 경쟁사는 먼슬리 리포트 모니터링 금액으로 합계를 맞춤(팝업 위 숫자·PDF와 같게). 리포트가 없는 기간은 아리아나 원본 그대로
 const RR=v41RepRows(adv,per),me=adv==='코웨이',fk=me?'act':'inv';let basis='mon';
 if(RR){const act=m=>RR.filter(x=>x.media===m).reduce((s,x)=>s+(x[fk]||0),0),aT=act('지상파'),aC=act('케이블&종편');
  const fit=(L,a,nm)=>{const sm=L.reduce((x,[,v])=>x+v,0);return a>0?(sm>0?L.map(([n,v])=>[n,v*a/sm]):[[nm,a]]):[]};
  if(aT+aC>0){const sC=c.reduce((x,[,v])=>x+v,0),kC=sC>0&&aC>0?aC/sC:0;const t2=fit(t,aT,'지상파'),c2=aC>0?(sC>0?c.map(([n,v])=>[n,v*kC]):[['케이블&종편',aC]]):[];etc=aC>0&&sC>0?etc.map(([n,v])=>[n,v*kC]):[];return {t:t2,c:c2,etc,basis:me?'act':'monrep',pctOnly:true}}}
 return {t,c,etc,basis}}
function v41DnSvg(D,T,W){const tT=D.t.reduce((s,[,v])=>s+v,0),tC=D.c.reduce((s,[,v])=>s+v,0),tot=tT+tC;if(!tot)return '';
 const R=148,K=.56,r=R*.5,DEP=32,ROT=13,TAU=Math.PI*2,GAP=(tT&&tC)?10:0,BW=168,BH=42,PITCH=50,top0=34;
 const n=Math.max(D.t.length,D.c.length),cy=top0+18+R*.9,H=Math.max(top0+n*PITCH+4,cy+R*K+DEP+92),cx=W/2,rc=cy+DEP/2,cs=Math.cos(ROT*Math.PI/180),sn=Math.sin(ROT*Math.PI/180);
 const rot=([x,y])=>[cx+(x-cx)*cs-(y-rc)*sn,rc+(x-cx)*sn+(y-rc)*cs],P=(a,rr,ox,dz)=>[cx+(ox||0)+Math.cos(a)*rr,cy+Math.sin(a)*rr*K+(dz||0)];
 const fT=tT/tot,S=[];let a=Math.PI-fT*Math.PI;const sep=GAP?.018:0;  // 두 덩어리 사이 각도 틈도 조금
 const tn=D.t.length;D.t.map((x,i)=>[x,i]).reverse().forEach(([[nm,v],i],j)=>{const sp=v/tot*TAU*T;S.push({k:'t'+i,n:nm,v,g:'t',col:V41_BL[Math.min(i,2)],ox:-GAP,a0:a+(j===0?sep:0),a1:a+sp-(j===tn-1?sep:0)});a+=sp});  // 지상파는 큰 채널이 위쪽에 오게(카드 순서와 맞춰 선이 덜 엇갈리게)
 a=-(1-fT)*Math.PI;D.c.forEach(([nm,v],i)=>{const sp=v/tot*TAU*T;S.push({k:'c'+i,n:nm,v,g:'c',col:nm==='기타'?'#d4d9de':V41_GR[Math.min(i,5)],ox:GAP,a0:a+(i===0?sep:0),a1:a+sp-(i===D.c.length-1?sep:0)});a+=sp});
 if(!(tT&&tC)){  // 한 덩어리뿐: 큰 순서대로 오른쪽(위→아래, 시계 방향)부터 채우고 나머지는 왼쪽(위→아래, 반시계 방향) — 카드 순서와 조각 순서를 맞춤 (11-06 15:04)
  const G=S.splice(0);let acc=0,ra=-Math.PI/2,la=-Math.PI/2;if(G.length===1){const z=G[0],sp=z.a1-z.a0;z.ox=0;z.side=1;z.a0=-sp/2;z.a1=sp/2;S.push(z);G.length=0}  // 조각이 하나뿐(100%)이면 카드 쪽(오른쪽 가운데)을 중심으로
  G.forEach(z=>{const sp=z.a1-z.a0;z.ox=0;if(acc<.5||z===G[0]){z.side=1;z.a0=ra;z.a1=ra+sp;ra+=sp;acc+=z.v/tot}else{z.side=-1;z.a1=la;z.a0=la-sp;la-=sp}S.push(z)})}
 S.forEach(s=>{if(s.a1<s.a0)s.a1=s.a0});
 const arc=(s,rr,b0,b1,dz,rev)=>{const st=rev?b1:b0,en=rev?b0:b1,mid=(b0+b1)/2,[x0,y0]=P(st,rr,s.ox,dz),[xm,ym]=P(mid,rr,s.ox,dz),[x1,y1]=P(en,rr,s.ox,dz),sw=rev?0:1,ry=(rr*K).toFixed(1);  // 두 번에 나눠 그림(한 바퀴 전체도 그려지게)
  return [`${x0.toFixed(1)},${y0.toFixed(1)}`,`A${rr},${ry} 0 0 ${sw} ${xm.toFixed(1)},${ym.toFixed(1)} A${rr},${ry} 0 0 ${sw} ${x1.toFixed(1)},${y1.toFixed(1)}`]};
 const clips=(b0,b1,lo,hi)=>{const o=[];for(const k of [-1,0,1,2]){const x=Math.max(b0,lo+k*TAU),y=Math.min(b1,hi+k*TAU);if(y>x+1e-6)o.push([x,y])}return o};
 const wallD=(s,rr,c)=>{const [m,aa]=arc(s,rr,c[0],c[1],0),[mb,ab]=arc(s,rr,c[0],c[1],DEP,true);return `M${m} ${aa} L${mb} ${ab} Z`};
 let back={t:'',c:''},walls='',tops='',caps='',bcap={t:'',c:''};
 S.forEach(s=>{if(s.a1-s.a0<1e-4)return;clips(s.a0,s.a1,Math.PI,TAU).forEach(c=>{const d=wallD(s,r,c);back[s.g]+=`<g class="sl" data-v41-k="${s.k}"><path d="${d}" fill="${v41Shade(s.col,.58)}" stroke="${v41Shade(s.col,.58)}" stroke-width=".8" stroke-linejoin="round"/></g>`});
  const fw=clips(s.a0,s.a1,0,Math.PI).map(c=>wallD(s,R,c));s.fw=fw;fw.forEach(d=>walls+=`<g class="sl" data-v41-k="${s.k}"><path d="${d}" fill="${v41Shade(s.col,.8)}"/><path d="${d}" fill="url(#v41wd)"/></g>`);
  const [m,aa]=arc(s,R,s.a0,s.a1,0),[mi,ai]=arc(s,r,s.a0,s.a1,0,true);s.td=`M${m} ${aa} L${mi} ${ai} Z`;tops+=`<g class="sl" data-v41-k="${s.k}"><path d="${s.td}" fill="${s.col}" stroke="${s.col}" stroke-width=".6" stroke-linejoin="round"/><path d="${s.td}" fill="url(#v41hl)"/></g>`});
 // 두 덩어리 사이 잘린 단면
 const cap=(s,ang,start)=>{const vis=start?Math.cos(ang)<0:Math.cos(ang)>0;if(!vis)return '';const p=[P(ang,r,s.ox),P(ang,R,s.ox),P(ang,R,s.ox,DEP),P(ang,r,s.ox,DEP)];return `<g class="sl" data-v41-k="${s.k}"><path d="M${p.map(q=>q.map(z=>z.toFixed(1)).join(',')).join(' L')} Z" fill="${v41Shade(s.col,.68)}"/></g>`};
 const gT=S.filter(s=>s.g==='t'),gC=S.filter(s=>s.g==='c');const addCap=(s,ang,start)=>{const h=cap(s,ang,start);if(!h)return;if(Math.sin(ang)<0)bcap[s.g]+=h;else caps+=h};if(!(tT&&tC)){if(T<1){const Rs=S.filter(z=>z.side>0),Ls=S.filter(z=>z.side<0);if(Rs.length)addCap(Rs.at(-1),Rs.at(-1).a1,false);if(Ls.length)addCap(Ls.at(-1),Ls.at(-1).a0,true)}}else if(GAP||T<1){if(gT.length){addCap(gT[0],gT[0].a0,true);addCap(gT.at(-1),gT.at(-1).a1,false)}if(gC.length){addCap(gC[0],gC[0].a0,true);addCap(gC.at(-1),gC.at(-1).a1,false)}}
 // 뒤쪽 이음매 단면은 자기 덩어리 안쪽 벽 바로 위, 다른 덩어리 안쪽 벽보다는 아래에 그림 — 다른 덩어리(예: 맨 위 SBS) 안쪽 벽을 덮어 이상해 보이던 문제 (11-06 15:50)
 const bOrd=bcap.t&&!bcap.c?['t','c']:bcap.c&&!bcap.t?['c','t']:['t','c'],backH=bOrd.map(g=>back[g]+bcap[g]).join('');
 // 카드 + 연결선 (다 펼쳐진 뒤에만)
 let lab='';if(T>=1){
  // 카드 열: 두 덩어리면 지상파 왼쪽·케이블 오른쪽, 한 덩어리뿐이면 조각 위치(왼쪽 반/오른쪽 반)로 나눔. 열마다 광고비 순, 기타는 맨 아래 (11-06 15:04)
  const ordr=a=>[...a].sort((p,q)=>(p.n==='기타')-(q.n==='기타')||q.v-p.v),cols=[];
  if(gT.length&&gC.length){cols.push([-1,ordr(gT),'지상파',tT,'#2a4fa8'],[1,ordr(gC),'케이블&종편',tC,'#56616c'])}
  else{const G=gT.length?gT:gC,nm=gT.length?'지상파':'케이블&종편',tc=gT.length?'#2a4fa8':'#56616c',mid=z=>(z.a0+z.a1)/2,Lh=G.filter(z=>z.side<0),Rh=G.filter(z=>z.side>0);
   cols.push([-1,ordr(Lh),gT.length?nm:'',tT+tC,tc],[1,ordr(Rh),gT.length?'':nm,tT+tC,tc])}
  const rim=(s,f)=>{const m=s.a0+(s.a1-s.a0)*f,fr=Math.sin(m)>0;return {A:rot(P(m,R,s.ox,fr?DEP*.5:0)),E:rot(P(m,R+16,s.ox,fr?DEP*.5+Math.sin(m)*12:-2))}};
  const inDn=(x,y)=>{const u=(x-cx)*cs+(y-rc)*sn,v=-(x-cx)*sn+(y-rc)*cs,e=dv=>(u/(R+GAP+4))**2+((v-dv)/(R*K+4))**2<1;return e(-DEP/2)||e(DEP/2)||(Math.abs(u)<R+GAP&&Math.abs(v)<DEP/2)};
  const dd=(p,q,r)=>{const dx=q[0]-p[0],dy=q[1]-p[1],l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((r[0]-p[0])*dx+(r[1]-p[1])*dy)/l));return Math.hypot(p[0]+t*dx-r[0],p[1]+t*dy-r[1])};
  const oo=(a,b,c)=>{const v=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);return Math.abs(v)<1e-6?0:Math.sign(v)};
  const segD=(a,b,c,d)=>(oo(a,b,c)*oo(a,b,d)<0&&oo(c,d,a)*oo(c,d,b)<0)?0:Math.min(dd(a,b,c),dd(a,b,d),dd(c,d,a),dd(c,d,b));
  let bot=0;for(let t=0;t<=Math.PI;t+=.05)for(const ox of [-GAP,GAP])bot=Math.max(bot,rot(P(t,R,ox,DEP))[1]);
  const MIN=10,GAPL=12,ALLSEG=[];  // 두 열의 선도 서로 닿지 않게 함께 검사
  cols.forEach(([side,ord,tl,tv,tc])=>{if(!ord.length)return;const colx=side<0?BW:W-BW,bx0=side<0?0:W-BW;
   let ext=0;ord.forEach(s=>{for(let f=0;f<=1;f+=.1){const {E}=rim(s,f);ext=Math.max(ext,Math.abs(E[0]-cx))}});const X0=cx+side*(ext+10),lim=Math.abs(colx-cx)-8,maxK=Math.max(0,Math.floor((lim-Math.abs(X0-cx))/GAPL));
   const ys=ord.map((s,i)=>top0+i*PITCH+BH/2);
   // 선: 조각 테두리 → 바깥으로 조금 → (필요하면 아래로) → 자기 전용 세로 통로 → 카드 높이 → 카드. 여러 순서로 시도해 선끼리 가장 멀리 떨어지는 배치를 고름
   const run=seq=>{const segs=[...ALLSEG],used=new Set(),out=new Array(ord.length);let total=0;
    for(const i of seq){const s=ord[i],y=ys[i];let best=null,bs=1e12;
     for(const f of [.5,.35,.65,.2,.8,.1,.9,.03,.97]){const {A,E}=rim(s,f);const back=Math.sin(s.a0+(s.a1-s.a0)*f)<0,drops=[0,12,24,36,48];if(back)drops.push(-12,-24,-36,-48);else for(const z of [0,12,24,36,48])drops.push(Math.max(0,Math.round(bot+12+z-E[1])));
      for(const d of new Set(drops))for(let k=0;k<=Math.max(maxK,ord.length-1);k++){const ku=used.has(k)||k>maxK?3000:0;const x=X0+side*k*GAPL,Dp=[E[0],E[1]+d],B1=[x,Dp[1]],B2=[x,y],C=[colx,y];
       const pts=d?[A,E,Dp,B1,B2,C]:[A,E,B1,B2,C],sg=[];for(let z=1;z<pts.length;z++)if(Math.hypot(pts[z][0]-pts[z-1][0],pts[z][1]-pts[z-1][1])>.5)sg.push([pts[z-1],pts[z]]);
       let pen=ku+Math.abs(f-.5)*60+k*.5+Math.abs(d)*.2;for(const [p1,p2] of sg)for(const [p3,p4] of segs){const g=segD(p1,p2,p3,p4);if(g<MIN)pen+=1000+(MIN-g)*50}
       if(pen>=bs)continue;sg.slice(1).forEach(([p1,p2])=>{for(let t=.1;t<1;t+=.1){if(inDn(p1[0]+(p2[0]-p1[0])*t,p1[1]+(p2[1]-p1[1])*t))pen+=60}});
       if(pen<bs){bs=pen;best={s,A,y,k,sg,pts}}}}
     used.add(best.k);segs.push(...best.sg);out[i]=best;total+=bs}
    return {out,total}};
   const idx=ord.map((_,i)=>i),cand=[idx,[...idx].reverse(),[...idx].sort((a,b)=>rim(ord[a],.5).A[1]-rim(ord[b],.5).A[1]),[...idx].sort((a,b)=>rim(ord[b],.5).A[1]-rim(ord[a],.5).A[1]),[...idx].sort((a,b)=>Math.abs(rim(ord[a],.5).A[0]-cx)-Math.abs(rim(ord[b],.5).A[0]-cx)),[...idx].sort((a,b)=>Math.abs(rim(ord[b],.5).A[0]-cx)-Math.abs(rim(ord[a],.5).A[0]-cx))];
   let bestRun=null;for(const sq of cand){const r=run(sq);if(!bestRun||r.total<bestRun.total)bestRun=r;if(r.total<1000)break}const L=bestRun.out;L.forEach(q=>ALLSEG.push(...q.sg));
   if(tl)lab+=`<text x="${bx0}" y="${top0-12}" font-size="14.5" font-weight="900" fill="${tc}">${tl} <tspan fill="#102b45">${v41Eok(tv)}</tspan> <tspan font-size="12" font-weight="700" fill="#8a96a3">${Math.round(tv/tot*100)}%</tspan></text>`;
  L.forEach(q=>{const s=q.s,y=q.y,st=s.g==='t'?'#8fa0d4':'#b3bcc4',f=v=>v.toFixed(1);q.ax=q.A[0];q.ay=q.A[1];
   lab+=`<g class="cd${s.n==='기타'&&(D.etc||[]).length?' etc':''}" data-v41-k="${s.k}"><path class="ln" d="M${q.pts.map(p=>f(p[0])+','+f(p[1])).join(' L')}" fill="none" stroke="${st}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="${q.ax.toFixed(1)}" cy="${q.ay.toFixed(1)}" r="2.6" fill="${st}"/>
    <rect class="bx" x="${bx0+.5}" y="${y-BH/2}" width="${BW-1}" height="${BH}" rx="10" fill="#fff" stroke="${s.g==='t'?'#cdd7ef':'#dfe4e8'}"/><rect x="${bx0+11}" y="${y-5}" width="10" height="10" rx="2.5" fill="${s.col}"/>
    <text x="${bx0+29}" y="${y-3}" font-size="12.5" font-weight="800" fill="#34414d">${esc(s.n)}</text><text x="${bx0+29}" y="${y+13}" font-size="11.5" font-weight="700" fill="#7d8a96">${D.pctOnly||(D.pctG&&D.pctG[s.g])?`모니터링 비중 ${Math.round(s.v/((s.g==='t'?tT:tC)||1)*100)}%`:`${v41Eok(s.v)} · ${Math.round(s.v/tot*100)}%`}</text>${s.n==='기타'&&(D.etc||[]).length?`<text x="${bx0+BW-12}" y="${D.pctOnly||(D.pctG&&D.pctG[s.g])?y-3:y+4}" text-anchor="end" font-size="10.5" font-weight="800" fill="#1a8cc2">${D.etc.length}개 보기 ›</text>`:''}</g>`})})}
 if(T>=1)v41DnEtc={list:D.etc||[],tot,pct:!!(D.pctOnly||(D.pctG&&D.pctG.c)),gt:tC};if(T>=1)v41DnLast=S.map(s=>({k:s.k,col:s.col,fw:s.fw,td:s.td,m:(s.a0+s.a1)/2}));const hov='';
 const defs=`<defs><linearGradient id="v41hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".55" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="v41wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#0c2236" stop-opacity=".18"/></linearGradient><filter id="v41gl" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0c2236" flood-opacity=".22"/></filter><radialGradient id="v41sh"><stop offset="0" stop-color="#0c2236" stop-opacity=".14"/><stop offset="1" stop-color="#0c2236" stop-opacity="0"/></radialGradient></defs>`;
 return `<svg class="v41-dn${T>=1?' done':''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-cx="${cx}" data-rc="${rc}">${defs}<g class="dn" transform="rotate(${ROT} ${cx} ${rc})"><ellipse cx="${cx}" cy="${cy+DEP+14}" rx="${R*1.2}" ry="${R*K*.8}" fill="url(#v41sh)" opacity="${Math.min(1,T*1.5).toFixed(2)}"/>${backH}${caps}${walls}${tops}<g class="hlov"></g></g>${lab}${hov}</svg>`}
function v41DnMount(adv,per){const box=document.getElementById('v41-donut-slot');if(!box)return;const D=v41DnData(adv,per);if(!D.t.length&&!D.c.length){box.innerHTML='';return}
 const W=Math.max(860,Math.min(1040,(box.clientWidth||1000)));const only=!D.t.length?'케이블 Only':!D.c.length?'지상파 Only':'';const act=D.basis==='act';box.innerHTML=`<h3>채널별 집행금액 구성${act?'':'<span class="v41-badge" title="모니터링 광고비 기준">모니터링</span>'}</h3>${only?`<p class="v41-only">${only}</p>`:''}<div class="v41-dnw"></div><p class="v41-sub">${D.detail?`금액: SM C&C 먼슬리 리포트 ${per==='ytd'?(D.months.length>1?D.months[0]+'~'+D.months[D.months.length-1]+'월':D.months[0]+'월')+' 세부 운영 내역 표 합계':per.slice(5)*1+'월 세부 운영 내역 표'}(${act?'코웨이 실집행':'경쟁사 모니터링 광고비'}) · 지상파 채널 금액은 표의 금액×채널 비중${D.pctG&&(D.pctG.t||D.pctG.c)?` · ${D.pctG.t?'지상파는':'케이블&종편은'} 채널별 실집행 표가 없는 달이 있어 모니터링 비중만 표시`:''}`:act?'금액: SM C&C 먼슬리 리포트 실집행금액(지상파·케이블&종편 합계) · 방송사·MPP는 금액을 나누지 않고 아리아나(닐슨) 모니터링 비중만 표시':D.basis==='monrep'?'금액: SM C&C 먼슬리 리포트 모니터링 금액(지상파·케이블&종편 합계) · 방송사·MPP는 아리아나(닐슨) 모니터링 비중만 표시':'아리아나(닐슨) 모니터링 광고비 기준'} · 지상파는 방송사, 케이블&종편은 MPP 기준(상위 5개와 기타) · 카드나 조각에 마우스를 올리면 강조돼요</p>`;
 const host=box.querySelector('.v41-dnw'),id=(box._a=(box._a||0)+1),t0=performance.now(),DUR=1000,ease=x=>1-Math.pow(1-x,3);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){host.innerHTML=v41DnSvg(D,1,W);return}
 const fr=now=>{if(box._a!==id)return;const x=Math.min(1,(now-t0)/DUR);host.innerHTML=v41DnSvg(D,x<1?ease(x):1,W);if(x<1)requestAnimationFrame(fr)};requestAnimationFrame(fr)}
// 강조: 같은 조각·카드만 진하게, 조각은 바깥으로 살짝
function v41DnHot(svg,k){if(!svg)return;svg.classList.toggle('hot',!!k);svg.querySelectorAll('[data-v41-k]').forEach(e=>e.classList.toggle('on',e.dataset.v41K===k))}  // 색으로만 강조(도형은 그대로) (11-06 14:57)
document.addEventListener('mouseover',e=>{const g=e.target.closest&&e.target.closest('svg.v41-dn.done [data-v41-k]');const svg=e.target.closest&&e.target.closest('svg.v41-dn.done');if(!svg)return;v41DnHot(svg,g?g.dataset.v41K:null)});
document.addEventListener('mouseout',e=>{const svg=e.target.closest&&e.target.closest('svg.v41-dn.done');if(svg&&!(e.relatedTarget&&svg.contains(e.relatedTarget)))v41DnHot(svg,null)});

// 기타 채널 목록 (카드·조각 누르면)
document.addEventListener('click',e=>{const old=document.querySelector('.v41-etcpop');const g=e.target.closest&&e.target.closest('svg.v41-dn.done [data-v41-k]');
 if(old&&!(e.target.closest&&e.target.closest('.v41-etcpop'))){old.remove();if(!g)return}
 if(!g)return;const k=g.dataset.v41K,J=(v41DnLast||[]).find(z=>z.k===k);const card=document.querySelector(`svg.v41-dn .cd[data-v41-k="${k}"]`);if(!card||!card.classList.contains('etc')||!v41DnEtc)return;
 const box=document.getElementById('v41-donut-slot'),rb=card.querySelector('.bx').getBoundingClientRect(),rp=box.getBoundingClientRect();const L=v41DnEtc.list,t=v41DnEtc.tot,sum=L.reduce((s,[,v])=>s+v,0);
 const pop=document.createElement('div');pop.className='v41-etcpop';const P=v41DnEtc.pct,gg=v41DnEtc.gt||1;pop.innerHTML=P?`<b>기타 ${L.length}개 MPP · 모니터링 비중 ${Math.round(sum/gg*100)}%</b><div class="ls">${L.map(([n,v])=>`<div><span>${esc(n)}</span><em></em><i>${(v/gg*100).toFixed(v/gg>=.01?0:1)}%</i></div>`).join('')}</div>`:`<b>기타 ${L.length}개 채널 · ${v41Eok(sum)}</b><div class="ls">${L.map(([n,v])=>`<div><span>${esc(n)}</span><em>${v41Eok(v)}</em><i>${(v/t*100).toFixed(v/t>=.01?0:1)}%</i></div>`).join('')}</div>`;
 box.style.position='relative';box.appendChild(pop);const pw=pop.offsetWidth,ph=pop.offsetHeight;let x=rb.left-rp.left-pw-10;if(x<0)x=Math.min(rp.width-pw,rb.right-rp.left+10);pop.style.left=x+'px';pop.style.top=Math.max(0,Math.min(rb.top-rp.top-ph/2+rb.height/2,box.offsetHeight-ph))+'px'});

// (11-06 16:50부터 팝업 기본값은 누적 — 아래 함수는 남겨 둠)
function v41Latest(adv){const rep=v41Rep(),a=v41D.R.filter(r=>r.y===v41Year&&r.adv===adv).map(r=>v41M(r.y,r.m)),b=rep?rep.rows.filter(x=>x.brand===adv).map(x=>v41M(v41Year,x.m)):[];const all=[...a,...b].sort();return all.length?all.at(-1):'ytd'}

// TV 통합 분석 '전체' (11-06 17:27): 모든 품목을 한 그래프에 — 품목별 색, 카드 위 품목 캡슐, 코웨이 강조, 기본값
var v41All={},v41AllBack=null;
var V41_CATCOL={'정수기':'#2f86d1','비데':'#8b6cd6','공기청정기':'#1fa39a','매트리스':'#e3893a','안마의자':'#d4577d','전기레인지':'#c8a21f','음식물처리기':'#5f9b3a'};
function v41CatCol(c){return V41_CATCOL[c]||'#7d8a96'}
async function v41LoadAll(cats){const req=++v41Req;const out={};
 await Promise.all(cats.map(async c=>{const d=v32Static()?await v41Get('c-'+encodeURIComponent(c.label).replace(/%/g,'_')+'.json'):await api('/api/reach/rows?category='+encodeURIComponent(c.label));
  const ci=Object.fromEntries(d.cols.map((k,i)=>[k,i]));d.R=d.rows.map(r=>Object.fromEntries(d.cols.map(k=>[k,r[ci[k]]])));d.years=[...new Set(d.R.map(r=>r.y))].sort((a,b)=>b-a);out[c.label]=d}));
 if(req!==v41Req)return null;v41All={};cats.forEach(c=>{if(out[c.label])v41All[c.label]=out[c.label]});
 const years=[...new Set(Object.values(v41All).flatMap(d=>d.years))].sort((a,b)=>b-a);if(!v41Year||!years.includes(v41Year))v41Year=years[0];
 v41D={all:true,years,R:[],rows:[],cols:[],reach:{},source:{},report:null};return v41D}
(()=>{const dl=document.getElementById('detail');if(dl)dl.addEventListener('close',()=>{if(v41AllBack){v41Cat='전체';v41D=v41AllBack.d;v41AllBack=null}})})();

// 전체 보기 — 점에 마우스를 올리면 카드 한 장(고정 카드와 안 겹치게), 범례 칩(하나만)으로 그 품목 카드만 펼치기 (11-06 17:40)
var v41Focus='',v41Pts=[],v41Geo=null,v41HovI=-1,v41Touch=false;
var V41_TAP='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.5V9a1.5 1.5 0 0 1 3 0v2"/><path d="M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3l-1.6-2.8a1.5 1.5 0 0 1 2.6-1.5L9 15.5V11"/></svg>';
function v41CardHtml(p){const me=p.a==='코웨이',r3=p.r&&p.r.r3!=null?`R3+${Math.round(p.r.r3)}%`:'R3+ 준비 중';return `<i class="cap" style="background:${v41CatCol(p.cat)}">${esc(p.cat)}</i><b>${esc(p.a)} <em>(${v41Won(p.won)}원)</em></b><span>(${Math.round(p.eq).toLocaleString()} eq GRP, ${r3})</span><i class="go">자세히 보기 →</i>`}
function v41HovHide(){const plot=document.querySelector('#content .v41-plot.all');v41HovI=-1;if(!plot)return;const h=plot.querySelector('.v41-hov'),ln=plot.querySelector('.v41-hovln');if(h)h.hidden=true;if(ln)ln.setAttribute('visibility','hidden');plot.classList.remove('hovering');plot.querySelectorAll('.v41-dot.hot,.v41-dot.same,.v41-card.hot').forEach(e=>e.classList.remove('hot','same'))}
function v41HovShow(i){const plot=document.querySelector('#content .v41-plot.all'),p=v41Pts[i];if(!plot||!p||!v41Geo)return;v41HovHide();v41HovI=i;
 plot.classList.add('hovering');plot.querySelectorAll('.v41-dot').forEach(e=>{if(e.dataset.v41Cat===p.cat)e.classList.add('same')});const dot=plot.querySelector(`.v41-dot[data-v41-i="${i}"]`);if(dot)dot.classList.add('hot');
 const fixed=plot.querySelector(`.v41-card:not(.v41-hov)[data-v41-i="${i}"]`);if(fixed){fixed.classList.add('hot');return}  // 이미 카드가 있으면 그 카드만 강조
 const h=plot.querySelector('.v41-hov');h.innerHTML=v41CardHtml(p);h.className='v41-card all v41-hov'+(p.a==='코웨이'?' me':'');h.dataset.v41Adv=p.a;h.dataset.v41Cat=p.cat;h.dataset.v41I=i;h.style.width='156px';h.hidden=false;
 const cw=h.offsetWidth,ch=h.offsetHeight,G=v41Geo,rects=[...plot.querySelectorAll('.v41-card:not(.v41-hov)')].map(c=>({x:c.offsetLeft,y:c.offsetTop,w:c.offsetWidth,h:c.offsetHeight}));
 const ov=c=>rects.some(r=>!(c.x+c.w+6<r.x||c.x>r.x+r.w+6||c.y+c.h+6<r.y||c.y>r.y+r.h+6));let best=null,bd=1e9;
 for(const rd of [14,30,52,80,115,155,200,260,330])for(let k=0;k<16;k++){const an=k*Math.PI/8,cs=Math.cos(an),sn=Math.sin(an),qx=p.px+cs*rd,qy=p.py+sn*rd,c={x:qx-(cs<-.35?cw:cs>.35?0:cw/2),y:qy-(sn<-.35?ch:sn>.35?0:ch/2),w:cw,h:ch};
  if(c.x<G.L+4||c.x+cw>G.L+G.PW-2||c.y<G.T+2||c.y+ch>G.T+G.PH-4)continue;if(ov(c))continue;
  const hid=v41Pts.filter(q=>q!==p&&q.px>c.x-8&&q.px<c.x+cw+8&&q.py>c.y-8&&q.py<c.y+ch+8),me=hid.some(q=>q.a==='코웨이');  // 다른 점(특히 코웨이)을 덮지 않게
  const sc=rd+hid.length*140+(me?2000:0)+(c.x<p.px&&c.x+cw>p.px&&c.y<p.py&&c.y+ch>p.py?999:0);if(sc<bd){bd=sc;best=c}}
 if(!best)best={x:Math.min(G.L+G.PW-cw-2,Math.max(G.L+4,p.px+14)),y:Math.max(G.T+2,p.py-ch-14),w:cw,h:ch};
 h.style.left=best.x+'px';h.style.top=best.y+'px';
 const nx=Math.max(best.x,Math.min(p.px,best.x+cw)),ny=Math.max(best.y,Math.min(p.py,best.y+ch)),ln=plot.querySelector('.v41-hovln');
 if(ln&&Math.hypot(nx-p.px,ny-p.py)>14){ln.setAttribute('x1',p.px);ln.setAttribute('y1',p.py);ln.setAttribute('x2',nx);ln.setAttribute('y2',ny);ln.setAttribute('visibility','visible')}}
document.addEventListener('pointerdown',e=>{v41Touch=e.pointerType==='touch'},true);
document.addEventListener('mouseover',e=>{if(route!=='reach'||v41Touch)return;const d=e.target.closest&&e.target.closest('.v41-plot.all .v41-dot');if(d){const i=+d.dataset.v41I;if(i!==v41HovI)v41HovShow(i);return}
 if(e.target.closest&&e.target.closest('.v41-plot.all .v41-hov'))return;if(v41HovI>=0&&!(e.target.closest&&e.target.closest('.v41-plot.all .v41-card')))v41HovHide()});
document.addEventListener('click',e=>{if(route!=='reach')return;
 const f=e.target.closest&&e.target.closest('[data-v41-focus]');if(f){v41Focus=v41Focus===f.dataset.v41Focus?'':f.dataset.v41Focus;v41HovI=-1;v41Draw();return}
 const d=e.target.closest&&e.target.closest('.v41-plot.all .v41-dot');if(!d)return;const i=+d.dataset.v41I,p=v41Pts[i];if(!p)return;
 if(v41Touch&&v41HovI!==i){v41HovShow(i);return}  // 휴대폰: 첫 탭은 카드, 두 번째 탭(또는 카드 탭)에 세부 내역
 v41Per='ytd';if(v41All[p.cat]){v41AllBack={d:v41D};v41Cat=p.cat;v41D=v41All[p.cat]}v41Open(p.a)});

// 11-06 19:17 품목별 분포 영역은 사용자 요청으로 뺌
// 11-06 19:21 코웨이 점: 레이더에 잡힌 불빛처럼 — 투명한 링이 가운데서 바깥으로 퍼지며 희미해지는 것을 반복(링 2개가 엇갈려 끊김 없이)
function v41Ping(x,y,col,R){R=R||32;const r0=R>20?9:4,h=R>20?17:7;  // 19:26 테두리 없이: 옅은 큰 원(배경)은 그대로 두고, 같은 색 면이 가운데서 바깥으로 퍼지며 희미해짐
 return `<circle class="v41-halo" cx="${x}" cy="${y}" r="${h}" fill="${col}" fill-opacity=".2" pointer-events="none"/><circle class="v41-ping" cx="${x}" cy="${y}" r="${h}" fill="${col}" fill-opacity=".22" pointer-events="none"><animate attributeName="r" values="${r0};${R}" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines=".25 .6 .45 1"/><animate attributeName="fill-opacity" values=".5;0" dur="2.6s" repeatCount="indefinite"/></circle>`}

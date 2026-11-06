/* v41 — 2026-11-06 도달률 비교
   품목 안 광고주별 TV 광고비 · 15초 환산 노출량(Eq GRP) · 유효도달률(R3+) 버블 차트.
   자료: 아리아나(닐슨) TV 집행 — 먼슬리 리포트 Raw_04 집계(data/arianna). 카드를 누르면 지상파·케이블 세부 운영 내역. */
var V41_TITLE='도달률 비교',v41Meta=null,v41Cat='',v41Year=null,v41D=null,v41Req=0,v41Per='ytd';
var V41_TYPE={PR:'일반프로',SP:'스팟',TJ:'특집/재방',YG:'예고'};
function v41Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="reach"]'))return;const b=document.createElement('button');b.className='nav';b.dataset.route='reach';b.textContent=V41_TITLE;
 const after=nav.querySelector('[data-route="heatmap"]')||nav.querySelector('[data-route="monthly"]');if(after)after.after(b);else nav.appendChild(b)}
v41Nav();document.addEventListener('DOMContentLoaded',v41Nav);setTimeout(v41Nav,1500);
async function v41Get(path){if(v32Static()){const r=await fetch('data/reach/'+path,{cache:'no-cache'});if(!r.ok)throw new Error('자료 없음');return r.json()}return api('/api/reach/'+path)}
async function v41Load(){if(!v41Meta)v41Meta=v32Static()?await v41Get('meta.json'):await api('/api/reach/meta');
 const cats=v41Meta.categories||[];if(!cats.length)return null;if(!v41Cat||!cats.find(c=>c.label===v41Cat))v41Cat=(cats.find(c=>c.label==='정수기')||cats[0]).label;
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
 box.innerHTML=`<label>품목<select id="v41-cat" class="chip">${(v41Meta.categories||[]).map(c=>`<option value="${esc(c.label)}" ${c.label===v41Cat?'selected':''}>${esc(c.name||c.label)}</option>`).join('')}</select></label>`}
function v41View(){const d=v41D,rows=v41Pick('ytd'),by=v41Sum(rows,'adv'),ms=v41Months();
 const advs=Object.keys(by).filter(a=>by[a].inv>0||by[a].eq>0).sort((a,b)=>(b==='코웨이')-(a==='코웨이')||by[b].adj-by[a].adj);
 const pts=advs.map(a=>({a,eq:by[a].eq,won:by[a].adj,inv:by[a].inv,ins:by[a].ins,r:v41Reach(a,'ytd')}));const hasR=pts.some(p=>p.r&&p.r.r3!=null);
 const host=$('#content'),W=Math.max(900,(host.clientWidth||1200)-60),H=Math.max(460,Math.min(640,innerHeight-260)),L=62,R=40,T=26,B=46,PW=W-L-R,PH=H-T-B;
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
 const cards=[],cw=178,ch=40,ov=(a,b,pad)=>!(a.x+a.w+pad<b.x||a.x>b.x+b.w+pad||a.y+a.h+pad<b.y||a.y>b.y+b.h+pad);
 const near=(c,x,y)=>[Math.max(c.x,Math.min(x,c.x+c.w)),Math.max(c.y,Math.min(y,c.y+c.h))],rd2=(c,x,y)=>{const [nx,ny]=near(c,x,y);return Math.hypot(nx-x,ny-y)};
 const segPt=(x1,y1,x2,y2,px,py)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l));return Math.hypot(x1+t*dx-px,y1+t*dy-py)};
 const segX=(a,b,c,d)=>{const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)};
 const segRect=(a,b,c)=>{if(b[0]>=c.x&&b[0]<=c.x+c.w&&b[1]>=c.y&&b[1]<=c.y+c.h)return false;const E=[[[c.x,c.y],[c.x+c.w,c.y]],[[c.x+c.w,c.y],[c.x+c.w,c.y+c.h]],[[c.x,c.y+c.h],[c.x+c.w,c.y+c.h]],[[c.x,c.y],[c.x,c.y+c.h]]];return E.some(([u,v])=>segX(a,b,u,v))};
 const ANG=Array.from({length:24},(_,k)=>k*15*Math.PI/180),RAD=[16,34,58,86,120,160,210,270,340];
 // 카드 자리: 다른 카드·점과 안 겹치고, 선이 다른 점·카드·선을 지나지 않고, 카드가 자기 점에 가장 가깝게 — 몰린 곳은 멀리 빼서 선으로 (11-06 10:24)
 [...pts].sort((a,b)=>(b.a==='코웨이')-(a.a==='코웨이')||b.eq-a.eq).forEach(p=>{let best=null,bs=1e12;
  for(const rd of RAD)for(const an of ANG){const cs=Math.cos(an),sn=Math.sin(an),qx=p.px+cs*rd,qy=p.py+sn*rd;
   const c={x:qx-(cs<-.35?cw:cs>.35?0:cw/2),y:qy-(sn<-.35?ch:sn>.35?0:ch/2),w:cw,h:ch};
   if(c.x<L+4||c.x+cw>L+PW-2||c.y<T+2||c.y+ch>T+PH-4)continue;
   const [nx,ny]=near(c,p.px,p.py),own=Math.hypot(nx-p.px,ny-p.py),A=[p.px,p.py],B=[nx,ny];let sc=own*.35;
   cards.forEach(o=>{if(ov(c,o,6))sc+=5000;if(own>12&&segRect(A,B,o))sc+=900;if(o.ln&&own>12&&segX(A,B,o.ln[0],o.ln[1]))sc+=400});
   pts.forEach(q=>{if(q===p)return;if(q.px>c.x-12&&q.px<c.x+cw+12&&q.py>c.y-12&&q.py<c.y+ch+12)sc+=3000;if(own>12&&segPt(A[0],A[1],B[0],B[1],q.px,q.py)<14)sc+=1500;if(rd2(c,q.px,q.py)<own+14)sc+=1200});
   if(sc<bs){bs=sc;best=c;best.ln=[A,B]}}
  if(!best)best={x:Math.min(L+PW-cw-2,Math.max(L+4,p.px+14)),y:Math.max(T+2,p.py-ch-14),w:cw,h:ch};best.p=p;cards.push(best)});
 // 연결선(점 → 카드의 가장 가까운 테두리)
 cards.forEach(c=>{const p=c.p,nx=Math.max(c.x,Math.min(p.px,c.x+c.w)),ny=Math.max(c.y,Math.min(p.py,c.y+c.h)),dd=Math.hypot(nx-p.px,ny-p.py);
  if(dd>14)g+=`<line x1="${p.px}" y1="${p.py}" x2="${nx}" y2="${ny}" stroke="${p.a==='코웨이'?'#8fa0d4':'#b9c3ca'}" stroke-width="1.2"/>`});
 pts.forEach(p=>{const me=p.a==='코웨이';g+=`<circle cx="${p.px}" cy="${p.py}" r="${me?11:8}" fill="${me?'#4c66b2':'#a3acb4'}" fill-opacity="${me?1:.9}" stroke="#fff" stroke-width="2"/>`});
 const html=cards.map(c=>{const p=c.p,me=p.a==='코웨이',r3=p.r&&p.r.r3!=null?`R3+${Math.round(p.r.r3)}%`:'R3+ 준비 중';
  return `<button type="button" class="v41-card${me?' me':''}" data-v41-adv="${esc(p.a)}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px"><b>${esc(p.a)} <em>(${v41Won(p.won)}원)</em></b><span>(${Math.round(p.eq).toLocaleString()} eq GRP, ${r3})</span><i class="go">자세히 보기 →</i></button>`}).join('');
 const src=d.source||{};
 return `<section class="glass section v41-card-wrap"><div class="v41-head"><div><h2>${v41Year}년 누적 경쟁사 TV 노출량 · R3+ <small>${esc(v41Cat)}</small></h2><p>카드를 누르면 지상파·케이블 세부 운영 내역을 볼 수 있어요</p></div>
  <div class="v39-years v41-years">${d.years.map(y=>`<button type="button" class="y${y===v41Year?' on':''}" data-v41-year="${y}">${y}</button>`).join('')}</div></div>
  <div class="v41-plot" style="height:${H}px"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>${html}</div>
  <p class="footnote v41-note">광고비: 아리아나 TV(지상파·케이블&종편) 모니터링 광고비에 SM C&C 실집행 추정 요율(설정 &gt; 광고비 보정)을 적용 · Eq GRP: 15초 환산 GRP, 타깃 ${esc(src.target||'')}(${esc(d.reach_target||'')}) · 자료 ${esc((src.months||[]).filter(m=>m.startsWith(String(v41Year))).slice(0,1)[0]||'')}~${esc((src.months||[]).filter(m=>m.startsWith(String(v41Year))).slice(-1)[0]||'')} · 포함=O·경쟁사=O 광고주 · ${hasR?'R3+: 아리아나 도달 분석':'R3+: 자료 준비 중'}</p></section>`}
function v41Draw(){if(!v41D){$('#content').innerHTML=`<section class="glass section">${empty('도달률 자료가 없어요.','아리아나 자료(data/arianna)를 넣으면 보여요.')}</section>`;return}v41Controls(true);$('#content').innerHTML=v41View()}
// 팝업: 지상파·케이블 세부 운영 내역
function v41Bar(parts,total,cols){if(!total)return '<i class="v41-bar0"></i>';return `<i class="v41-bar">${parts.map(([k,v],i)=>`<b style="width:${v/total*100}%;background:${cols[i%cols.length]}" title="${esc(k)} ${Math.round(v/total*100)}%"></b>`).join('')}</i>`}
function v41Detail(adv){const per=v41Per,rows=v41Pick(per).filter(r=>r.adv===adv),ms=v41Months();
 const terr=rows.filter(r=>r.media==='지상파'),cab=rows.filter(r=>r.media!=='지상파'),T=v41Sum(terr).all||{inv:0,net:0,ins:0,grp:0,eq:0,adj:0},C=v41Sum(cab).all||{inv:0,net:0,ins:0,grp:0,eq:0,adj:0};
 const pct=(v,t)=>t?Math.round(v/t*100)+'%':'-',num=v=>Math.round(v||0).toLocaleString(),cprp=x=>x.eq?num(x.inv/x.eq):'-',ar=x=>x.ins?(x.grp/x.ins).toFixed(1):'-';
 const dimDef=[['ch','채널별',x=>x,['KBS2','MBC','SBS']],['tb','시급별',x=>x,['SS','SA','A','B','C','PS']],['type','광고유형별',x=>V41_TYPE[x]||x,['PR','SP','TJ','YG']],['sec','초수별',x=>x+'"',null]];
 const dims=dimDef.map(([k,n,f,ord])=>{const s=v41Sum(terr,k);let keys=Object.keys(s).filter(z=>s[z].inv||s[z].ins);keys.sort((a,b)=>ord?((ord.indexOf(a)+99)%99)-((ord.indexOf(b)+99)%99)||s[b].inv-s[a].inv:+a-+b);return {k,n,f,s,keys}});
 const COL=['#4c66b2','#7fc4e4','#9fd6c8','#c3c8cd','#8a97ab','#6ea7a3'];
 const head=dims.map(d=>`<th colspan="${d.keys.length||1}">${d.n}</th>`).join(''),sub=dims.map(d=>d.keys.length?d.keys.map(z=>`<th>${esc(d.f(z))}</th>`).join(''):'<th>-</th>').join('');
 const line=(nm,tot,fn)=>`<tr><th>${nm}</th><td class="t">${tot}</td>${dims.map(d=>d.keys.length?d.keys.map(z=>`<td>${fn(d.s[z])}</td>`).join(''):'<td>-</td>').join('')}</tr>`;
 const terrHtml=terr.length?`<div class="v41-tw"><table class="v41-t"><thead><tr><th rowspan="2">구분</th><th rowspan="2">합계</th>${head}</tr><tr>${sub}</tr></thead><tbody>
  ${line('광고비(실집행 추정)',v41Won(T.adj),x=>pct(x.adj,T.adj))}${line('모니터링 광고비 (천원)',num(T.inv),x=>pct(x.inv,T.inv))}${line('Eq GRP',num(T.eq),x=>pct(x.eq,T.eq))}${line('횟수',num(T.ins),x=>pct(x.ins,T.ins))}${line('A.R',ar(T),x=>ar(x))}${line('모니터링 CPRP (천원)',cprp(T),x=>cprp(x))}</tbody></table></div>
  <div class="v41-charts">${dims.map(d=>`<div class="v41-ch"><b>${d.n}</b><div class="r"><span>광고비</span>${v41Bar(d.keys.map(z=>[d.f(z),d.s[z].inv]),T.inv,COL)}</div><div class="r"><span>Eq GRP</span>${v41Bar(d.keys.map(z=>[d.f(z),d.s[z].eq]),T.eq,COL)}</div><div class="lg">${d.keys.map((z,i)=>`<em><i style="background:${COL[i%COL.length]}"></i>${esc(d.f(z))}</em>`).join('')}</div></div>`).join('')}</div>`:'<p class="v41-none">이 기간 지상파 집행이 없어요.</p>';
 const ms2=v41Sum(cab,'mpp');let mk=Object.keys(ms2).sort((a,b)=>ms2[b].inv-ms2[a].inv);const top=mk.filter(z=>ms2[z].inv/C.inv>=.01).slice(0,10),rest=mk.filter(z=>!top.includes(z));
 if(rest.length){const o={inv:0,net:0,ins:0,grp:0,eq:0,adj:0};rest.forEach(z=>{for(const k in o)o[k]+=ms2[z][k]});ms2['기타']=o;top.push('기타')}
 const cabHtml=cab.length?`<div class="v41-tw"><table class="v41-t v41-ct"><thead><tr><th>MPP</th><th>모니터링 광고비 (천원)</th><th>광고비(실집행 추정)</th><th>닐슨 NET (천원)</th><th>집행 비중</th><th>Eq GRP</th><th>모니터링 CPRP (천원)</th><th class="g">광고비 · Eq GRP 비중</th></tr></thead><tbody>
  ${top.map(z=>{const x=ms2[z];return `<tr><th>${esc(z||'(미분류)')}</th><td>${num(x.inv)}</td><td>${v41Won(x.adj)}</td><td>${num(x.net)}</td><td>${pct(x.inv,C.inv)}</td><td>${num(x.eq)}</td><td>${cprp(x)}</td><td class="g"><i class="v41-hb"><b style="width:${C.inv?x.inv/C.inv*100:0}%"></b></i><i class="v41-hb e"><b style="width:${C.eq?x.eq/C.eq*100:0}%"></b></i></td></tr>`}).join('')}</tbody>
  <tfoot><tr><th>Total</th><td>${num(C.inv)}</td><td>${v41Won(C.adj)}</td><td>${num(C.net)}</td><td>100%</td><td>${num(C.eq)}</td><td>${cprp(C)}</td><td class="g"><span class="v41-lg2"><i></i>광고비 <i class="e"></i>Eq GRP</span></td></tr></tfoot></table></div>`:'<p class="v41-none">이 기간 케이블·종편 집행이 없어요.</p>';
 const r=v41Reach(adv,per);
 return `<div class="v41-pop"><div class="v41-ph"><div><span class="v41-tag">${esc(v41Cat)}</span><h2>${esc(adv)} · TV 세부 운영 내역</h2><p>${per==='ytd'?v41Year+'년 누적':per.replace('-','년 ')+'월'} · 광고비(실집행 추정) ${v41Won(T.adj+C.adj)}원 · Eq GRP ${num(T.eq+C.eq)} · R3+ ${r&&r.r3!=null?Math.round(r.r3)+'%':'준비 중'}</p></div>
  <select class="chip v41-per" data-v41-per>${[['ytd',v41Year+'년 누적'],...ms.slice().reverse().map(m=>[m,m.slice(2,4)+'.'+m.slice(5)])].map(([v,l])=>`<option value="${v}" ${v===per?'selected':''}>${l}</option>`).join('')}</select></div>
  <h3>지상파TV 세부 운영 내역</h3>${terrHtml}<h3>케이블TV 세부 운영 내역</h3>${cabHtml}
  <p class="footnote">모니터링 광고비·NET·GRP·Eq GRP는 아리아나(닐슨) 자료, 타깃 ${esc((v41D.source||{}).target||'')} · 광고비(실집행 추정)는 설정의 SM C&C 요율 적용 · A.R = GRP ÷ 횟수 · CPRP = 모니터링 광고비 ÷ Eq GRP · 광고유형: PR 일반프로, SP 스팟, TJ 특집/재방</p></div>`}
function v41Open(adv){const dl=$('#detail');dl.className='v41-dialog';$('#detail-body').innerHTML=v41Detail(adv);v41Cur=adv;if(!dl.open)dl.showModal()}
var v41Cur='';
var v41BaseRender=render;
render=async function(...a){if(route!=='reach'){v41Controls(false);return v41BaseRender.apply(this,a)}
 if(typeof v38Hist!=='undefined'){const pop=v38Hist.pop;v38Hist.pop=false;if(typeof v12Pop!=='undefined')v12Pop=true;v38Sync(pop||!v38Hist.ready);v38Hist.ready=true}
 ['v37Controls','v32Controls','v38Controls','v39Controls'].forEach(f=>{try{if(typeof window[f]==='function')window[f](false)}catch(e){}});try{v38Tip&&v38Tip(null)}catch(e){}
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='reach'));$('#page-title').textContent=V41_TITLE;$('#subtitle').textContent='';
 if(!v41D)$('#content').innerHTML=`<section class="glass section">${empty('도달률 자료를 불러오는 중이에요.')}</section>`;
 try{await v41Load();if(route!=='reach')return}catch(e){$('#content').innerHTML=`<section class="glass section">${empty('도달률 자료를 불러오지 못했어요.',e.message)}</section>`;return}v41Draw();if(typeof v38Sync==='function')v38Sync(true)};
document.addEventListener('click',async e=>{if(route!=='reach')return;const y=e.target.closest&&e.target.closest('[data-v41-year]');if(y){v41Year=+y.dataset.v41Year;v41Per='ytd';v41Draw();if(typeof v38Sync==='function')v38Sync(false);return}
 const c=e.target.closest&&e.target.closest('.v41-card[data-v41-adv]');if(c){v41Per='ytd';v41Open(c.dataset.v41Adv)}});
document.addEventListener('change',async e=>{if(e.target.id==='v41-cat'){e.stopPropagation();v41Cat=e.target.value;v41Year=null;v41Per='ytd';try{await v41Load();v41Draw();if(typeof v38Sync==='function')v38Sync(false)}catch(err){toast('불러오지 못했어요: '+err.message)}return}
 const p=e.target.closest&&e.target.closest('[data-v41-per]');if(p){v41Per=p.value;const dl=$('#detail');$('#detail-body').innerHTML=v41Detail(v41Cur)}},true);
window.addEventListener('resize',()=>{if(route==='reach'&&v41D)v41Draw()});
// 주소(#/reach?cat=)
if(typeof V38_ROUTES!=='undefined'&&!V38_ROUTES.includes('reach'))V38_ROUTES.push('reach');
if(typeof v38HashOf==='function'){var v41BaseHash=v38HashOf;v38HashOf=function(any){if(route!=='reach')return v41BaseHash(any);if(!any&&/news=/.test(location.hash))return null;const q=new URLSearchParams();if(v41Cat)q.set('cat',v41Cat);if(v41Year)q.set('y',v41Year);const s=q.toString();return '#/reach'+(s?'?'+s:'')}}
function v41FromHash(){const h=decodeURI(location.hash||'');if(!h.startsWith('#/reach'))return false;const q=new URLSearchParams(h.split('?')[1]||'');route='reach';if(q.get('cat')&&q.get('cat')!==v41Cat){v41Cat=q.get('cat');v41D=null}if(q.get('y'))v41Year=+q.get('y');return true}
if(typeof v38ApplyHash==='function'){var v41BaseApply=v38ApplyHash;v38ApplyHash=function(){return v41FromHash()||v41BaseApply()}}
if(v41FromHash()&&typeof listing!=='undefined'&&listing){render()}

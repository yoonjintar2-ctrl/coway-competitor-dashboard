/* v38 — 2026-11-05 월별 통합 분석(test) · 설정 > 디지털 자료 규칙
   광고주(또는 세부 품목)를 고르면 최근 25개월(화면엔 12개월, 좌우 버튼으로 이동)을 월 단위로:
   캠페인 캡슐·관련 기사(같은 띠, 높이 고정) → 네이버 쿼리(올해·전년) → 매체별 광고비 막대(전년 막대·경쟁사 평균 영역) → 표 → 유튜브·인스타그램 게시물. */
var V38_TITLE='월별 통합 분석',v38Opt=null,v38Adv='',v38Cat='',v38D=null,v38Req=0;
var V38_CATS=[['tv','TV','#3b4450',[['tv_terr','지상파'],['tv_cable','종편·케이블']]],['dg','디지털','#6c7681',[['dg_video','동영상'],['dg_pc','PC'],['dg_mo','MO']]],['radio','라디오','#99a3ac',[['radio','라디오']]],['print','인쇄','#c3cad0',[['news','신문'],['mag','잡지']]]];
var V38_G='#08a34f';
function v38Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="monthly"]'))return;
 const b=document.createElement('button');b.className='nav';b.dataset.route='monthly';b.innerHTML=`${V38_TITLE}<span class="v38-test">test</span>`;
 const after=nav.querySelector('[data-route="news"]')||nav.querySelector('[data-route="daily"]');if(after)after.after(b);else nav.appendChild(b)}
v38Nav();document.addEventListener('DOMContentLoaded',v38Nav);
function v38Money(v){if(!v)return '–';if(v>=1e8){const x=v/1e8;return (x>=100?Math.round(x):x.toFixed(1).replace(/\.0$/,''))+'억'}return Math.round(v/1e4)+'만'}
function v38K(v){if(v==null)return '';if(v>=1e6)return [(v/1e6).toFixed(1).replace(/\.0$/,''),'m'];if(v>=1e4)return [String(Math.round(v/1e3)),'k'];if(v>=1e3)return [(v/1e3).toFixed(1),'k'];return [String(Math.round(v)),'']}
function v38Smooth(p){if(p.length<2)return p.length?`M${p[0][0]},${p[0][1]}`:'';let d=`M${p[0][0]},${p[0][1]}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,t=.18;d+=` C${b[0]+(c[0]-a[0])*t},${b[1]+(c[1]-a[1])*t} ${c[0]-(e[0]-b[0])*t},${c[1]-(e[1]-b[1])*t} ${c[0]},${c[1]}`}return d}
function v38Days(m){return new Date(+m.slice(0,4),+m.slice(5,7),0).getDate()}
async function v38Load(){if(!v38Opt){v38Opt=(await api('/api/monthly/options')).options||[];if(!v38Adv&&v38Opt.length)v38Adv=(v38Opt.find(o=>o.advertiser!=='코웨이')||v38Opt[0]).advertiser}
 const o=v38Opt.find(x=>x.advertiser===v38Adv);if(o&&v38Cat&&!o.categories.includes(v38Cat))v38Cat='';
 const req=++v38Req;let d;
 if(o&&o.files){d=await api('/api/monthly-file/'+encodeURIComponent(o.files[v38Cat||'']||''))}
 else d=await api('/api/monthly?advertiser='+encodeURIComponent(v38Adv)+'&category='+encodeURIComponent(v38Cat));
 if(req!==v38Req)return null;v38D=d;return d}
function v38Controls(show){let box=document.querySelector('main>header .v38-ctrl');if(!show){if(box)box.remove();return}
 const head=document.querySelector('main>header');if(!head)return;if(!box){box=document.createElement('div');box.className='v32-ctrl v38-ctrl';head.appendChild(box)}
 const o=(v38Opt||[]).find(x=>x.advertiser===v38Adv);
 box.innerHTML=`<label>광고주<select id="v38-adv" class="chip">${(v38Opt||[]).map(x=>`<option value="${esc(x.advertiser)}" ${x.advertiser===v38Adv?'selected':''}>${esc(x.advertiser)}</option>`).join('')}</select></label><label>세부 품목<select id="v38-cat" class="chip"><option value="">전체 품목${o?' ('+esc(o.categories.join(' · '))+')':''}</option>${(o?o.categories:[]).map(c=>`<option value="${esc(c)}" ${c===v38Cat?'selected':''}>${esc(c)}</option>`).join('')}</select></label>`}
function v38Sum(s){return Object.values(s||{}).reduce((a,b)=>a+(b||0),0)}
function v38Cv(s){return Object.fromEntries(V38_CATS.map(([k,,,subs])=>[k,subs.reduce((a,[sk])=>a+(s[sk]||0),0)]))}
var V38_TG=14;
function v38View(d){
 const M=d.months,N=M.length,CUR=d.current,VIEW=Math.min(12,N),VIS0=N-VIEW;
 const host=$('#content');const VW=Math.max(900,(host.clientWidth||1200)-88),GUT=60,TW=72,slot=(VW-GUT-TW)/VIEW,CW=N*slot+TW,PW=N*slot,bw=slot*.6,ybw=bw*.86;
 const X=i=>slot*i+slot/2,BX=i=>X(i)+6,YX=i=>X(i)-bw*.2;
 const S=M.map(m=>d.spend[m]||{}),CV=S.map(v38Cv),TOT=S.map(v38Sum),YOY=M.map((m,i)=>i>=12?TOT[i-12]:null),AVG=M.map(m=>d.avg[m]||0);
 const Q=M.map(m=>d.query[m]),QY=M.map((m,i)=>i>=12?Q[i-12]:null),QD=M.map(m=>d.query_days[m]||0);
 const t0=new Date(M[0]+'-01'),t1=new Date(+CUR.slice(0,4),+CUR.slice(5,7),1),xd=s=>Math.max(0,Math.min(PW,(new Date(s)-t0)/(t1-t0)*PW)),md=s=>s.slice(5).replace('-','.');
 const ctx=document.createElement('canvas').getContext('2d');
 // 캠페인 캡슐 + 기사(점·글자)를 같은 띠에 — 높이는 5줄로 고정, 자리가 없으면 그달 '+N'
 const LANES=4,CH=25,CG=5,CT=8,lanes=Array(LANES).fill(-1e9);const fit=(x0,x1)=>{const k=lanes.findIndex(e=>e<x0-10);if(k<0)return -1;lanes[k]=x1;return k};
 ctx.font='700 13px Pretendard, "Noto Sans KR", sans-serif';
 const camps=[],over={};for(const c of d.camps){const nm=c.name.replace(new RegExp('^'+d.advertiser.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*'),'').replace(/^·\s*/,'')||c.name;const txt=`${nm} · ${md(c.s)}–${md(c.e)}`;const x0=xd(c.s),x1=Math.max(xd(c.e),x0+ctx.measureText(txt).width+CH+16);const k=fit(x0,x1);if(k<0){const m=c.s.slice(0,7);over[m]=(over[m]||0)+1;continue}camps.push({...c,txt,x0,x1,k})}
 ctx.font='500 12px Pretendard, "Noto Sans KR", sans-serif';
 const news=[];for(const n of [...d.news].sort((a,b)=>a.d.localeCompare(b.d))){const txt=`${md(n.d)} ${n.t}${n.n>1?` 외 ${n.n-1}건`:''}`;let x0=xd(n.d),x1=x0+16+Math.min(260,ctx.measureText(txt).width);if(x1>PW-6){x0-=x1-(PW-6);x1=PW-6}const k=fit(x0,x1);if(k<0){const m=n.d.slice(0,7);over[m]=(over[m]||0)+1;continue}news.push({...n,txt,x0,x1,k})}
 const BAND=LANES*(CH+CG),LINE_TOP=CT+BAND+18,LINE_H=150,BAR_TOP=LINE_TOP+LINE_H+4,BAR_H=270,BASE=BAR_TOP+BAR_H;
 const RAW=Math.max(1e7,Math.max(...TOT,...AVG,...YOY.map(v=>v||0))*1.1),YST=[5e9,2e9,1e9,5e8,2e8,1e8,5e7,2e7,1e7].find(k=>RAW/k>=3)||1e7,mx=RAW,sy=v=>BASE-v/mx*BAR_H;
 const top=(x,w,y)=>`M${x},${BASE} V${y} H${x+w} V${BASE} Z`;
 let s=`<defs><linearGradient id="v38-avg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aa3b8" stop-opacity=".17"/><stop offset="1" stop-color="#8aa3b8" stop-opacity=".07"/></linearGradient>
  <linearGradient id="v38-yoy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3bcc4" stop-opacity=".36"/><stop offset="1" stop-color="#d9dfe3" stop-opacity=".26"/></linearGradient>
  <pattern id="v38-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="#25a4dc" stroke-width="2" stroke-opacity=".14"/></pattern>
  <filter id="v38-soft" x="-20%" y="-60%" width="140%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#14405a" flood-opacity=".09"/></filter>
  ${camps.map((c,i)=>`<clipPath id="v38-cl${i}"><circle cx="${c.x0+CH/2}" cy="${CT+c.k*(CH+CG)+CH/2}" r="${CH/2-3}"/></clipPath>`).join('')}
  ${M.map((m,i)=>TOT[i]?`<clipPath id="v38-bar${i}"><path d="${top(BX(i)-bw/2,bw,sy(TOT[i]))}"/></clipPath>`:'').join('')}</defs>`;
 const ci=M.indexOf(CUR);if(ci>=0)s+=`<rect x="${slot*ci+4}" y="${LINE_TOP-8}" width="${slot-8}" height="${BASE-LINE_TOP+8}" rx="14" fill="url(#v38-hatch)"/>`;
 // 캠페인
 camps.forEach((c,i)=>{const y=CT+c.k*(CH+CG),w=c.x1-c.x0;
  s+=`<g class="v38-camp" data-v38-camp="${esc(c.id)}"><line class="gd" x1="${c.x0+.5}" x2="${c.x0+.5}" y1="${y+CH/2}" y2="${BASE}" stroke="#3b4450"/><g filter="url(#v38-soft)"><rect class="cap" x="${c.x0}" y="${y}" width="${w}" height="${CH}" rx="${CH/2}" fill="rgba(255,255,255,.94)" stroke="rgba(59,68,80,.16)"/></g>
  <circle cx="${c.x0+CH/2}" cy="${y+CH/2}" r="${CH/2-2.5}" fill="#dbe7ee"/>${c.thumb?`<image href="${esc(safeUrl(c.thumb))}" x="${c.x0+3}" y="${y+3}" width="${CH-6}" height="${CH-6}" preserveAspectRatio="xMidYMid slice" clip-path="url(#v38-cl${i})"/>`:''}
  <text x="${c.x0+CH+5}" y="${y+CH/2+4.5}" font-size="13" font-weight="700" fill="#2b3540">${esc(c.txt.replace(/ · \d\d\.\d\d–\d\d\.\d\d$/,''))} <tspan font-weight="500" fill="#5c6873">· ${md(c.s)}–${md(c.e)}</tspan></text></g>`});
 // 기사(점·글자, x축 연결선)
 news.forEach(n=>{const y=CT+n.k*(CH+CG)+CH/2,t=n.txt.length>40?n.txt.slice(0,39)+'…':n.txt;s+=`<g class="v38-news" data-v38-news="${esc(n.u)}"><line class="gd" x1="${n.x0+5}" x2="${n.x0+5}" y1="${y+4}" y2="${BASE}" stroke="#8d98a3"/><circle cx="${n.x0+5}" cy="${y}" r="3.2" fill="#8d98a3"/><text x="${n.x0+14}" y="${y+4}" font-size="12" fill="#5f6b77"><tspan font-weight="700" fill="#8d98a3">${esc(t.slice(0,5))}</tspan>${esc(t.slice(5))}</text><title>${esc(n.p?n.p+' · ':'')}${esc(n.t)}</title></g>`});
 Object.entries(over).forEach(([m,n])=>{const i=M.indexOf(m);if(i<0)return;s+=`<text x="${X(i)}" y="${CT+BAND-2}" text-anchor="middle" font-size="11" font-weight="700" fill="#8a96a3">+${n}</text>`});
 // 네이버 쿼리(올해 + 전년 같은 달)
 const qv=[...Q.slice(0,-1),...QY.slice(0,-1)].filter(v=>v!=null);let CAP=null;const QP=M.map(()=>null);
 if(qv.length){const lo=Math.min(...qv)*.85,hi=Math.max(...qv,...Q.filter(v=>v!=null)),qt=LINE_TOP+24,qh=LINE_H-44,qy=v=>qt+qh-(v-lo)/((hi-lo)||1)*qh;
  const seg=(vals,keep)=>{const parts=[];vals.forEach((v,i)=>{if(v==null||!keep(i))return;const l=parts.at(-1);const p=[X(i),qy(v),v,i];if(l&&l.at(-1)[3]===i-1)l.push(p);else parts.push([p])});return parts};
  const yp=seg(QY,i=>i<N-1);s+=`<path d="${yp.map(v38Smooth).join(' ')}" fill="none" stroke="${V38_G}" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>`;
  const fy=yp.flat().find(p=>p[3]>=VIS0+5);if(fy)s+=`<text x="${fy[0]}" y="${fy[1]+22}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${V38_G}" fill-opacity=".6">전년 같은 달</text>`;
  const cp=seg(Q,()=>true),fl=cp.flat(),lp=fl.at(-1),pp=fl.at(-2),fade=lp&&pp&&(M[lp[3]]===CUR||QD[lp[3]]<v38Days(M[lp[3]]));if(fade)s+=`<defs><linearGradient id="v38-qf" gradientUnits="userSpaceOnUse" x1="${pp[0]}" x2="${lp[0]}" y1="0" y2="0"><stop offset="0" stop-color="${V38_G}"/><stop offset="1" stop-color="${V38_G}" stop-opacity=".28"/></linearGradient></defs>`;s+=`<path d="${cp.map(v38Smooth).join(' ')}" fill="none" stroke="${fade?'url(#v38-qf)':V38_G}" stroke-width="6.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  cp.flat().forEach(([px,py,v,i])=>{const part=M[i]===CUR||QD[i]<v38Days(M[i]);const [n,u]=v38K(v);s+=`<g class="v38-q" data-v38-i="${i}"><circle cx="${px}" cy="${py}" r="20" fill="#fff" stroke="${V38_G}" stroke-width="6.8"${part?' stroke-opacity=".32"':''}/><text x="${px}" y="${py+4.2}" text-anchor="middle" fill="${V38_G}"${part?' fill-opacity=".55"':''}><tspan font-size="${n.length>=3?11.5:12.5}" font-weight="900">${n}</tspan><tspan font-size="9.5" font-weight="500" dx=".5">${u}</tspan></text></g>`});
  fl.forEach(p=>QP[p[3]]=p[1]);CAP=fl.find(p=>p[3]>=VIS0)||null}
 // 경쟁사 평균(영역)
 const ap=M.map((m,i)=>[X(i),sy(AVG[i])]);if(AVG.some(v=>v)){const ext=[[0,ap[0][1]],...ap,[PW,ap.at(-1)[1]]];s+=`<path d="${v38Smooth(ext)} L${PW},${BASE} L0,${BASE} Z" fill="url(#v38-avg)"/>`}
 // 전년 막대(회색 한 톤) + 올해 막대 위 모서리와 잇는 옅은 선
 M.forEach((m,i)=>{const yv=YOY[i];if(!yv)return;const x=YX(i)-ybw/2,y=sy(yv);s+=`<path d="${top(x,ybw,y)}" fill="url(#v38-yoy)"/>`;
  if(TOT[i]){const bx=BX(i)-bw/2,by=sy(TOT[i]);s+=`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="#3b4450" stroke-opacity=".14" stroke-width=".8"/><line x1="${x+ybw}" y1="${y}" x2="${bx+bw}" y2="${by}" stroke="#3b4450" stroke-opacity=".14" stroke-width=".8"/>`}});
 // 올해 막대(대분류만, 사이 간격)
 M.forEach((m,i)=>{if(!TOT[i])return;let run=0;const op=m===CUR?.38:.8;let g=`<g clip-path="url(#v38-bar${i})">`;
  V38_CATS.forEach(([k,,c])=>{const v=CV[i][k];if(!v)return;const y0=sy(run),y1=sy(run+v);run+=v;const last=Math.abs(run-TOT[i])<1;g+=`<rect x="${BX(i)-bw/2}" y="${y1}" width="${bw}" height="${Math.max(.8,y0-y1-(last?0:2.5))}" fill="${c}" fill-opacity="${op}"/>`});
  s+=g+`</g><text x="${BX(i)}" y="${sy(TOT[i])-10}" text-anchor="middle" font-size="15" font-weight="600" fill="#8a96a3">${v38Money(TOT[i])}</text>`});
 // 마우스 올림용 칸
 M.forEach((m,i)=>{s+=`<rect class="v38-hit" data-v38-i="${i}" x="${slot*i}" y="${BAR_TOP-10}" width="${slot}" height="${BAR_H+10}" fill="transparent"/>`});
 s+=`<line x1="0" x2="${PW}" y1="${BASE}" y2="${BASE}" stroke="#0f2a43" stroke-opacity=".08"/>`;
 M.forEach((m,i)=>{const cur=m===CUR;s+=`<text x="${X(i)}" y="${BASE+22}" text-anchor="middle" font-size="14" font-weight="${cur?800:600}" fill="${cur?'#1a8cc2':'#5d6a76'}">${m.slice(2,4)}.${m.slice(5)}</text>`+(cur?`<rect x="${X(i)-32}" y="${BASE+30}" width="64" height="18" rx="9" fill="#e3f3fb"/><text x="${X(i)}" y="${BASE+43}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1a8cc2">수집 중 · ${d.current_day}일</text>`:'')});
 const H=BASE+56;
 // 고정 Y축(10억 단위)·이름 캡슐
 let yl='';for(let v=0;v<=mx+1;v+=YST){const y=sy(v);yl+=`<text x="${GUT-12}" y="${y+4}" text-anchor="end" font-size="11.5" fill="#a3b0ba">${v?(+(v/1e8).toFixed(1))+'억':'0'}</text>`}
 let cap='';if(CAP){const x1=GUT+slot/2-29,tw=Math.min(86,x1-4),x0=x1-tw;cap=`<g id="v38-cap" data-y="${CAP[1]}" style="transition:transform .28s ease"><rect x="${x0}" y="${CAP[1]-12}" width="${tw}" height="24" rx="12" fill="${V38_G}"/><text x="${x0+tw/2}" y="${CAP[1]+4.3}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff">네이버 쿼리</text></g>`}
 // 표(대분류) + 게시물(유튜브·인스타 세로)
 const vis=(arr)=>arr.slice(VIS0).reduce((a,b)=>a+(b||0),0);let names='',t='';
 V38_CATS.forEach(([k,n,c])=>{if(!CV.some(z=>z[k]))return;names+=`<tr><td class="h"><i style="background:${c}"></i>${n}</td></tr>`;t+=`<tr>${CV.map((z,i)=>`<td class="${z[k]?'':'z'}${M[i]===CUR?' cur':''}">${v38Money(z[k])}</td>`).join('')}<td class="tot"><b>${v38Money(vis(CV.map(z=>z[k])))}</b></td></tr>`});
 names+=`<tr class="sum"><td class="h">합계</td></tr><tr class="post"><td class="h">게시물</td></tr>`;
 t+=`<tr class="sum">${TOT.map((v,i)=>`<td class="${M[i]===CUR?'cur':''}">${v38Money(v)}</td>`).join('')}<td class="tot">${v38Money(vis(TOT))}</td></tr>`;
 t+=`<tr class="post">${M.map((m,i)=>{const y=(d.yt[m]||[]).length,g=(d.ig[m]||[]).length;return `<td class="${m===CUR?'cur':''}"><span class="v38-pill yt${y?'':' zero'}" data-v38-post="yt:${m}"><i>▶</i>${y}</span><span class="v38-pill ig${g?'':' zero'}" data-v38-post="ig:${m}"><i>◎</i>${g}</span></td>`}).join('')}<td class="tot"></td></tr>`;
 const chev=dir=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${dir<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
 return {html:`<div class="v38-box" style="--gut:${GUT}px"><div class="v38-scroller" id="v38-scroller"><div class="v38-snap">${M.map(()=>`<i style="width:${slot}px"></i>`).join('')}</div><svg class="v38-chart" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" style="width:${CW}px;height:${H}px">${s}</svg>
   <table class="mt v38-t" style="width:${CW}px"><colgroup>${M.map(()=>`<col style="width:${slot}px">`).join('')}<col style="width:${TW}px"></colgroup>${t}</table></div>
   <i class="v38-edge l" style="left:${GUT}px"></i><i class="v38-edge r"></i>
   <svg class="v38-ygut" width="${GUT}" height="${BASE-BAR_TOP+30}" viewBox="0 ${BAR_TOP-20} ${GUT} ${BASE-BAR_TOP+30}" style="top:${BAR_TOP-20}px;width:${GUT}px;height:${BASE-BAR_TOP+30}px">${yl}</svg>
   <svg class="v38-lgut" width="${GUT+slot}" height="${LINE_TOP+LINE_H}" style="width:${GUT+slot}px;height:${LINE_TOP+LINE_H}px">${cap}</svg>
   <table class="mt v38-names" style="top:${H+V38_TG}px">${names}</table>
   <button type="button" class="v38-fbtn" data-v38-scroll="-1" style="top:${BAR_TOP+BAR_H/2-21}px;left:-24px" aria-label="이전 달">${chev(-1)}</button><button type="button" class="v38-fbtn" data-v38-scroll="1" style="top:${BAR_TOP+BAR_H/2-21}px;right:-24px" aria-label="다음 달">${chev(1)}</button></div>`,
  CW,VW,GUT,slot,QP,scrollTo:CW-(VW-GUT),M,S,CV,TOT,YOY,AVG,Q,QY,BX,bw,sy,VIS0}}
function v38Draw(){const d=v38D;if(!d)return;v38Controls(true);
 const has=d.months.some(m=>v38Sum(d.spend[m]));
 const head='';
 if(!has&&!d.camps.length){$('#content').innerHTML=`${head}<section class="glass section">${empty('이 광고주·품목은 최근 2년 광고비 자료가 없어요.')}</section>`;return}
 const v=v38View(d);window.__v38=v;const M=d.months,VIS=M.slice(v.VIS0),T=v.TOT.slice(v.VIS0),pk=T.indexOf(Math.max(...T)),Qv=v.Q.slice(v.VIS0,-1).filter(x=>x!=null);
 $('#content').innerHTML=`<section class="glass section v38-card">${v.html}
  <div class="v38-legend">${V38_CATS.slice(0,3).map(([,n,c])=>`<span><i class="sw" style="background:${c};opacity:.85"></i>${n}</span>`).join('')}<span><i class="ln" style="background:${V38_G}"></i>네이버 쿼리</span></div>
  <p class="v38-note">${v38Note(d)}</p></section>`;
 const sc=document.getElementById('v38-scroller');if(sc){sc.scrollLeft=v.scrollTo;v38Btns()}}
function v38Note(d){const st=v32Static(),dm=d.digital_months||[];
 return `${st?'TV·라디오·인쇄는 매체 집행 자료, 디지털(동영상·PC·MO)은 디지털 집행 자료':`TV·라디오·인쇄는 아덱스, 디지털(동영상·PC·MO)은 ${esc(d.digital_source||'디지털 자료')}(설정 &gt; 디지털 자료 규칙의 포함 기준)`} · 막대 뒤 회색은 전년 같은 달, 옅은 영역은 ${d.avg_basis==='경쟁사 전체'?'경쟁사 전체':'같은 품목 경쟁사'} 평균(그달 광고비가 있는 경쟁사끼리) · 네이버 쿼리는 ${d.keywords.length?esc(d.keywords.join('·'))+' ':''}추정 검색수 월 합계(옅은 표식은 자료가 덜 찬 달) · 자료가 없는 달은 비워 둬요(추정하지 않음)${dm.length?` · 디지털 자료 ${dm[0].replace('-','.')}~${dm.at(-1).replace('-','.')}`:''}`}
function v38Btns(){const sc=document.getElementById('v38-scroller');if(!sc)return;const box=sc.closest('.v38-box'),v=window.__v38;if(box){box.classList.toggle('sl',sc.scrollLeft>2);box.classList.toggle('sr',sc.scrollLeft<sc.scrollWidth-sc.clientWidth-2)}
 const g=document.getElementById('v38-cap');if(g&&v){const k=Math.max(0,Math.round(sc.scrollLeft/v.slot));let y=null;for(let i=k;i<v.QP.length&&y==null;i++)y=v.QP[i];if(y!=null)g.style.transform=`translateY(${y-+g.dataset.y}px)`}
document.querySelectorAll('[data-v38-scroll]').forEach(b=>{const dir=+b.dataset.v38Scroll;b.classList.toggle('off',dir<0?sc.scrollLeft<=2:sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2)})}
var v38BaseRender=render;
render=async function(...a){
 if(route!=='monthly'){v38Controls(false);v38Tip(null);return v38BaseRender.apply(this,a)}
 if(typeof v37Controls==='function')v37Controls(false);if(typeof v32Controls==='function')v32Controls(false);
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='monthly'));
 $('#page-title').innerHTML=`${V38_TITLE}<span class="v38-test big">test</span>`;$('#subtitle').textContent='';
 if(!v38D)$('#content').innerHTML=`<section class="glass section">${empty('월별 자료를 불러오는 중이에요.')}</section>`;
 try{const d=await v38Load();if(!d||route!=='monthly')return}catch(e){$('#content').innerHTML=`<section class="glass section">${empty('월별 자료를 불러오지 못했어요.',e.message)}</section>`;return}
 v38Draw()};
window.addEventListener('change',async e=>{if(e.target.id==='v38-adv'||e.target.id==='v38-cat'){e.stopPropagation();if(e.target.id==='v38-adv'){v38Adv=e.target.value;v38Cat=''}else v38Cat=e.target.value;
 $('#content').querySelector('.v38-card')?.classList.add('loading');try{await v38Load();v38Draw()}catch(err){toast('불러오지 못했어요: '+err.message)}}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-v38-scroll]');if(b){const sc=document.getElementById('v38-scroller'),v=window.__v38;if(sc&&v){sc.scrollBy({left:+b.dataset.v38Scroll*v.slot,behavior:'smooth'});setTimeout(v38Btns,450)}return}
 const n=e.target.closest('[data-v38-news]');if(n){window.open(n.dataset.v38News,'_blank','noopener');return}
 const c=e.target.closest('[data-v38-camp]');if(c&&typeof activeId!=='undefined'){activeId=c.dataset.v38Camp;route='analysis';if(typeof v37Blank!=='undefined')v37Blank=false;render();window.scrollTo({top:0})}});
// 마우스오버: 막대(세부 매체) · 게시물 목록
function v38Tip(html,x,y){let t=document.getElementById('v38-tip');if(!html){if(t)t.hidden=true;return}if(!t){t=document.createElement('div');t.id='v38-tip';document.body.appendChild(t)}t.innerHTML=html;t.hidden=false;
 const w=t.offsetWidth,h=t.offsetHeight;let L=x+18,T=y-h/2;if(L+w>innerWidth-10)L=x-w-18;T=Math.max(10,Math.min(innerHeight-h-10,T));t.style.left=L+'px';t.style.top=T+'px'}
document.addEventListener('mousemove',e=>{if(route!=='monthly'){return}const v=window.__v38,d=v38D;if(!v||!d)return;
 const hit=e.target.closest&&e.target.closest('.v38-hit');if(hit){const i=+hit.dataset.v38I,m=d.months[i],s=v.S[i];if(!v.TOT[i]&&!v.YOY[i])return v38Tip(null);
  const rows=V38_CATS.filter(([k])=>v.CV[i][k]).map(([k,n,c,subs])=>`<div class="r"><span><i style="background:${c}"></i><b>${n}</b></span><b>${v38Money(v.CV[i][k])}</b></div>${subs.length>1?`<div class="s">${subs.filter(([sk])=>s[sk]).map(([sk,sn])=>`<span>${sn} ${v38Money(s[sk])}</span>`).join('')}</div>`:''}`).join('');
  const y=v.YOY[i];return v38Tip(`<b class="h">${m.slice(2,4)}.${m.slice(5)} · ${v38Money(v.TOT[i])}${m===d.current?' (수집 중)':''}</b>${rows||'<div class="s">광고비 없음</div>'}<div class="f"><span>전년 같은 달 ${v38Money(y||0)}${y&&v.TOT[i]?` (${v.TOT[i]>=y?'+':''}${Math.round((v.TOT[i]/y-1)*100)}%)`:''}</span><span>경쟁사 평균 ${v38Money(v.AVG[i])}</span></div>`,e.clientX,e.clientY)}
 const p=e.target.closest&&e.target.closest('[data-v38-post]');if(p){const [k,m]=p.dataset.v38Post.split(':'),list=(k==='yt'?d.yt:d.ig)[m]||[];if(!list.length)return v38Tip(null);
  return v38Tip(`<b class="h">${m.slice(2,4)}.${m.slice(5)} · ${k==='yt'?'유튜브':'인스타그램'} ${list.length}건</b>${list.slice(0,6).map(z=>`<div class="r p"><em>${z.d.slice(5).replace('-','.')}</em><span>${esc((z.t||'').slice(0,40))}</span></div>`).join('')}${list.length>6?`<div class="s">외 ${list.length-6}건</div>`:''}`,e.clientX,e.clientY)}
 const q=e.target.closest&&e.target.closest('.v38-q');if(q){const i=+q.dataset.v38I,m=d.months[i],v1=v.Q[i],v0=v.QY[i];return v38Tip(`<b class="h">${m.slice(2,4)}.${m.slice(5)} · 네이버 쿼리 ${Math.round(v1).toLocaleString()}회</b><div class="s">전년 같은 달 ${v0!=null?Math.round(v0).toLocaleString()+'회':'자료 없음'}${v0?` (${v1>=v0?'+':''}${Math.round((v1/v0-1)*100)}%)`:''} · 자료 ${d.query_days[m]||0}일/${v38Days(m)}일</div>`,e.clientX,e.clientY)}
 const c=e.target.closest&&e.target.closest('[data-v38-camp]');if(c){const x=d.camps.find(z=>z.id===c.dataset.v38Camp);if(x)return v38Tip(`<b class="h">${esc(x.name)}</b><div class="s">${x.s.replace(/-/g,'.')} ~ ${x.e.replace(/-/g,'.')} · ${v38Money(x.amount)}${x.category?' · '+esc(x.category):''}</div><div class="s">누르면 캠페인 분석으로 이동</div>`,e.clientX,e.clientY)}
 v38Tip(null)},{passive:true});
document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='v38-scroller')v38Btns()},true);

// ---------- 설정 > 디지털 자료 규칙 ----------
if(typeof v7Tabs!=='undefined')v7Tabs.push(['digitalrules','디지털 자료 규칙']);
var v38Rules=null,v38RaStatus=null,v38RaFilter='';
function v38RulesView(){const R=v38Rules||{},st=v38RaStatus||{},ro=v32Static();
 const tbl=(cols,rows,lim=400)=>`<div class="v38-tw"><table class="v32-rn"><thead><tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,lim).map(r=>`<tr>${cols.map(c=>`<td>${esc(String(r[c[0]]??''))}</td>`).join('')}</tr>`).join('')}</tbody></table>${rows.length>lim?`<small>앞 ${lim}줄만 보여요(전체 ${rows.length}줄)</small>`:''}</div>`;
 const f=v38RaFilter.trim(),idx=(R.index||[]).filter(x=>!f||[x.advertiser,x.brand,x.industry_s,x.category,x.display].some(v=>String(v||'').includes(f)));
 const paste=k=>ro?'':`<details class="v38-paste"><summary>엑셀에서 붙여넣어 바꾸기</summary><p>엑셀에서 머리글 없이 같은 열 순서로 복사해 붙여넣으면 이 표를 통째로 바꿔요.</p><textarea data-v38-paste="${k}" rows="5"></textarea><button type="button" class="primary" data-v38-save="${k}">저장</button></details>`;
 return `<section class="glass section">${header('디지털 자료 연결',`디지털 광고비는 디지털 자료 '데이터 통합'(PC배너·모바일배너·동영상) 엑셀을 월 단위로 써요. 같은 달 자료가 다시 들어오면 그 달을 통째로 바꿔요. 아이디·비밀번호는 대시보드가 다루지 않아요.`)}
  <div class="v38-st"><span>저장된 달 <b>${(st.months||[]).length}개월</b>${(st.months||[]).length?` (${st.months[0]} ~ ${st.months.at(-1)})`:''}</span><span>최근 받은 파일 <b>${esc((st.files||[])[0]?.name||'없음')}</b></span>${ro?'':'<a class="primary" href="/ra-bridge.html" target="_blank" rel="noopener">디지털 자료 연결 페이지 열기</a>'}</div>
  ${(st.unknown||[]).length?`<h4>확인 필요 · 규칙(index)에 없는 경쟁사 브랜드 (최근 3개월 광고비 순)</h4>${tbl([['advertiser','광고주'],['brand','브랜드'],['industry_s','업종(소)'],['amount_k','광고비']],st.unknown.map(u=>({...u,amount_k:v38Money(u.amount)})),30)}<p class="v38-help">이름이 바뀐 브랜드('(구)…' 등)나 새 브랜드예요. 아래 index 표에 넣어 포함 여부를 정하면 월별 통합 분석에 반영돼요. 정하기 전에는 빼고 보여요(추정하지 않음).</p>`:''}</section>
 <section class="glass section">${header('광고주명 맵핑 · 주요 경쟁 여부',`디지털 자료 광고주명 → 닐슨(아덱스) 광고주명 → 보고서 표기명. 경쟁 여부 O인 광고주만 받아요. 기본값: ${esc(R.meta?.source||'')}`)}${tbl([['ra_name','디지털 자료 광고주명'],['nielsen','닐슨 광고주명'],['display','주요 경쟁(표기)'],['competitor','여부'],['note','참고']],R.advertisers||[])}${paste('advertisers')}</section>
 <section class="glass section">${header('업종(소) → 품목','디지털 자료 업종(소)를 대시보드 품목으로 묶는 기준이에요.')}${tbl([['industry_s','업종(소)'],['category','품목'],['note','참고']],R.industry_map||[])}${paste('industry_map')}</section>
 <section class="glass section">${header('index · 경쟁사 선별 규칙','업종(소)+브랜드 마다 포함 여부·품목(업종수정)·광고주명 수정·주요 경쟁을 정해요. 포함=O 인 브랜드만 디지털 광고비에 들어가요(품목이 없는 브랜드 광고는 \'브랜드\').')}
  <input type="search" id="v38-ra-filter" class="v38-filter" placeholder="광고주·브랜드·업종으로 찾기" value="${esc(v38RaFilter)}">${tbl([['industry_m','업종(중)'],['industry_s','업종(소)'],['advertiser','광고주'],['brand','브랜드'],['include','포함'],['category','업종수정(품목)'],['display','광고주명 수정'],['competitor','주요경쟁']],idx,300)}${paste('index')}</section>
 <section class="glass section">${header('매체 구분','유튜브·메타로 따로 보는 매체예요(나머지는 기타).')}${tbl([['media','매체'],['group','구분']],(R.media_groups||[]).filter(m=>m.group!=='기타'))}</section>`}
if(typeof v7Draw==='function'){var v38BaseDraw=v7Draw;v7Draw=function(){if(v7Tab!=='digitalrules')return v38BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}<div class="v38-rules">${v38Rules?v38RulesView():empty('규칙을 불러오는 중이에요.')}</div></div>`;
 if(!v38Rules)Promise.all([api('/api/ra/rules'),api('/api/ra/status')]).then(([r,s])=>{v38Rules=r;v38RaStatus=s;if(v7Tab==='digitalrules'&&route==='settings')v7Draw()}).catch(e=>{const el=document.querySelector('.v38-rules');if(el)el.innerHTML=empty('디지털 자료 규칙을 불러오지 못했어요.',e.message)})}}
document.addEventListener('input',e=>{if(e.target.id==='v38-ra-filter'){v38RaFilter=e.target.value;clearTimeout(window.__v38f);window.__v38f=setTimeout(()=>{const p=e.target.selectionStart;v7Draw();const i=document.getElementById('v38-ra-filter');if(i){i.focus();i.setSelectionRange(p,p)}},250)}});
var V38_COLS={advertisers:['ra_name','nielsen','display','competitor','note'],industry_map:['industry_s','category','note'],index:['industry_m','industry_s','advertiser','brand','include','category','display','competitor']};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-v38-save]');if(!b)return;const k=b.dataset.v38Save,ta=document.querySelector(`[data-v38-paste="${k}"]`);const lines=(ta.value||'').split(/\r?\n/).filter(l=>l.trim());
 if(!lines.length)return toast('붙여넣은 내용이 없어요.');const cols=V38_COLS[k];const rows=lines.map(l=>{const c=l.split('\t');const o={};cols.forEach((n,i)=>o[n]=(c[i]||'').trim());if(k==='advertisers')o.primary=true;return o});
 if(!confirm(`${rows.length}줄로 이 표를 바꿀까요?`))return;try{await api('/api/ra/rules',{kind:k,rows});v38Rules=null;v7Draw();toast('저장했어요. 월별 통합 분석에 바로 반영돼요.')}catch(err){toast('저장하지 못했어요: '+err.message)}});

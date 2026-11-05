/* v39 — 2026-11-05 연간 히트맵
   품목·광고주를 고르면 1월 1일~12월 31일을 하루 한 칸(주 단위 열, 월요일이 맨 뒤)으로 쌓은 입체 히트맵.
   색 = 네이버 검색수 순위(그래프마다 그해 기준: 하위는 무채색·투명 → 연노랑 → 노랑 → 주황 → 빨강), 높이 = 그날 광고비(위·아래 같은 기준).
   위 = 선택 광고주, 아래 = 같은 품목 경쟁사 평균(선택 광고주 제외). 오늘 강조, 아직 오지 않은 날은 평평한 회색.
   필터를 바꾸면 막대가 평평한 상태에서 올라오며 색이 입혀짐. 이미지(PNG)·엑셀 원본 내려받기, 연도 이동. */
var V39_TITLE='연간 히트맵',v39Cat='정수기',v39Adv='코웨이',v39Year=null,v39D=null,v39Cache={},v39Req=0,v39Anim=0,v39Idx=null,v39Last=null;
function v39Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="heatmap"]'))return;
 const b=document.createElement('button');b.className='nav';b.dataset.route='heatmap';b.textContent=V39_TITLE;
 const after=nav.querySelector('[data-route="monthly"]');if(after)after.after(b);else nav.appendChild(b)}
v39Nav();document.addEventListener('DOMContentLoaded',v39Nav);setTimeout(v39Nav,0);

// ---------- 주소(#/heatmap?adv=&cat=&y=) ----------
if(typeof V38_ROUTES!=='undefined'&&!V38_ROUTES.includes('heatmap'))V38_ROUTES.push('heatmap');
if(typeof v38HashOf==='function'){var v39BaseHash=v38HashOf;v38HashOf=function(any){if(route!=='heatmap')return v39BaseHash(any);if(!any&&/news=/.test(location.hash))return null;
 const q=new URLSearchParams();q.set('adv',v39Adv||'');if(v39Cat)q.set('cat',v39Cat);if(v39Year)q.set('y',v39Year);return '#/heatmap?'+q.toString()}}
function v39FromHash(){const h=decodeURI(location.hash||'');if(!h.startsWith('#/heatmap'))return false;const q=new URLSearchParams(h.split('?')[1]||'');
 route='heatmap';if(q.has('adv'))v39Adv=q.get('adv');if(q.has('cat'))v39Cat=q.get('cat');if(q.get('y'))v39Year=+q.get('y');return true}
if(typeof v38ApplyHash==='function'){var v39BaseApply=v38ApplyHash;v38ApplyHash=function(){return v39FromHash()||v39BaseApply()}}

// ---------- 자료 ----------
function v39St(){return typeof v32Static==='function'&&v32Static()}
async function v39Opts(){if(typeof v38Opt!=='undefined'&&v38Opt)return v38Opt;const o=(await api('/api/monthly/options')).options||[];try{v38Opt=o}catch(e){}return o}
async function v39Load(){const key=(v39Cat||'')+'|'+(v39Year||'');if(v39Cache[key])return v39Cache[key];let d;
 if(v39St()){if(!v39Idx)v39Idx=await fetch('data/heatmap/index.json',{cache:'no-cache'}).then(r=>r.json());const y=v39Year||v39Idx.current;const f=(v39Idx.files[y]||{})[v39Cat||''];if(!f)throw new Error('이 품목·연도 자료가 없어요.');d=await fetch('data/heatmap/'+f).then(r=>r.json())}
 else d=await api('/api/heatmap?'+new URLSearchParams({category:v39Cat||'',year:v39Year||''}));
 v39Cache[(v39Cat||'')+'|'+d.year]=v39Cache[key]=d;return d}

// ---------- 색·모양 ----------
const V39_BG=[244,247,250];const V39_ORDER=['정수기','매트리스','공기청정기','안마의자','비데','음식물처리기','전기레인지'];
// [백분위, 색상(h), 채도, 밝기, 불투명도] — 하위 약 30%는 무채색·투명, 중간(노랑) 넓게
const V39_PS=[[0,40,4,72,.16],[.3,44,28,70,.4],[.5,48,88,61,1],[.78,30,88,57,1],[1,6,76,53,1]];
function v39Hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return [f(0),f(8),f(4)].map(x=>x*255)}
function v39ColP(p,f=1){p=Math.max(0,Math.min(1,p));let i=0;while(i<V39_PS.length-2&&p>V39_PS[i+1][0])i++;const A=V39_PS[i],B=V39_PS[i+1],u=(p-A[0])/(B[0]-A[0]);const [h,s,l,al]=[1,2,3,4].map(j=>A[j]+(B[j]-A[j])*u);
 return v39Hsl(h,s,l*(.55+.45*f)).map((x,k)=>Math.round(x*al+V39_BG[k]*(1-al)*(.8+.2*f)))}
const V39_FLAT=[[227,233,238],[211,220,227],[200,210,218]];  // 윗면·앞면·옆면(평평한 회색)
const V39_V={CW:27,DX:10,DY:-21,pad:3.4,h0:3,hk:46,OX:62};
function v39Rgb(c){return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`}
function v39Mix(a,b,p){return [a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p,a[2]+(b[2]-a[2])*p]}

function v39Model(d){
 const Y=d.year,today=d.today,days=[];for(let t=new Date(Date.UTC(Y,0,1));t.getUTCFullYear()===Y;t.setUTCDate(t.getUTCDate()+1))days.push(t.toISOString().slice(0,10));
 const A=d.advertisers||{};let me;
 if(v39Adv)me=A[v39Adv]||null;else{me={q:{},s:{}};for(const v of Object.values(A)){for(const [k,x] of Object.entries(v.q))me.q[k]=(me.q[k]||0)+x;for(const [k,x] of Object.entries(v.s))me.s[k]=(me.s[k]||0)+x}}
 const smax=me?Math.max(1,...days.filter(x=>x<=today).map(x=>me.s[x]||0)):1;
 const ev=((d.events||{})[v39Adv||'']||[]).filter(e=>e.d>=days[0]&&e.d<=today);
 return {Y,today,days,me,n:Object.keys(A).length,smax,ev}}

function v39Short(t,n){t=String(t||'').replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1)+'…':t}
const V39_EVT={camp:['캠페인','#25a4dc'],creative:['신규 소재','#f08a3c'],news:['기사','#7d8a96']};
const V39_EVM={camp:'#9fc3d6',creative:'#dcb89a',news:'#b3bbc2'};  // 풍선 점: 옅은 색(히트맵이 주인공)
function v39Build(m){
 const {CW,DX,DY,pad,h0,hk,OX}=V39_V,cw=CW-pad,dx=DX*.86,dy=DY*.86;
 const wd=x=>(new Date(x+'T00:00:00').getDay()+6)%7,wd0=wd(m.days[0]),col=i=>Math.floor((i+wd0)/7),NCOL=col(m.days.length-1)+1;
 const H=Math.max(400,Math.min(780,(window.innerHeight||900)-372)),OY=H-52,W=OX+NCOL*CW+7*DX+44;
 const Hh=v=>h0+Math.sqrt(Math.min(1,(v||0)/m.smax))*hk;
 let s=`<defs><linearGradient id="v39bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient><filter id="v39sh" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><filter id="v39glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3"/></filter><filter id="v39bs" x="-20%" y="-40%" width="140%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#14405a" flood-opacity=".14"/></filter></defs>`,stick='';
 const cells=[];const WK=['월','화','수','목','금','토','일'],src=m.me;
 const sorted=m.days.filter(x=>x<=m.today).map(x=>src.q[x]).filter(v=>v!=null).sort((a,b)=>a-b);
 const pct=v=>{let a=0,b=sorted.length;while(a<b){const k=(a+b)>>1;if(sorted[k]<v)a=k+1;else b=k}return sorted.length>1?a/(sorted.length-1):.5};
 const P=(i,r)=>[OX+col(i)*CW+(6-r)*DX,OY+(6-r)*DY];
 {const a=[OX-4,OY+8],b=[OX+NCOL*CW-pad+4,OY+8],c=[b[0]+7*DX,OY+8+7*DY],e=[a[0]+7*DX,OY+8+7*DY];
  s+=`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#v39bg)"/><path d="M${a} L${b} L${c} L${e} Z" fill="rgba(20,60,90,.12)" filter="url(#v39sh)"/><path d="M${a} L${b} L${c} L${e} Z" fill="rgba(255,255,255,.82)" stroke="rgba(200,216,228,.9)"/>`}
 // 이슈 풍선 자리(막대 윗면 가운데에서 위로 선)
 const zoneTop=6,zoneBot=OY+7*DY-hk-30,lanes=Math.max(2,Math.min(8,Math.floor((zoneBot-zoneTop)/34))),LH=(zoneBot-zoneTop-26)/Math.max(1,lanes-1);
 const used=Array.from({length:lanes},()=>[]);let evs='';const evcells=[];
 const byDay={};m.ev.forEach((e,k)=>{(byDay[e.d]=byDay[e.d]||[]).push(k)});
 m.ev.forEach((e,k)=>{const i=m.days.indexOf(e.d);if(i<0)return;const [x,y]=P(i,wd(e.d));const h=Hh(src.s[e.d]||0),ax=x+cw/2+dx/2,ay=y+dy/2-h;
  const [lab,color]=V39_EVT[e.type]||['이슈','#7d8a96'];const txt=v39Short((v39Adv?'':(e.adv||'')+' ')+(e.title||''),v39Adv?13:15),w=Math.min(210,26+lab.length*10.5+txt.length*11.2+14);
  let bx=ax-w/2;bx=Math.max(4,Math.min(W-w-4,bx));let lane=-1,best=1e9;for(let L=0;L<lanes;L++){if(!used[L].every(([a,b])=>bx+w<a-6||bx>b+6))continue;const sc=used[L].length*10+Math.abs(L-((k*3)%lanes));if(sc<best){best=sc;lane=L}}if(lane<0)return;used[lane].push([bx,bx+w]);
  const by=zoneTop+lane*LH,ly=by+26,len=Math.max(4,ay-ly);
  evcells.push({k,i});
  const mc=V39_EVM[e.type]||'#b3bbc2',ex=4.2,ey=1.9;
  evs+=`<g class="v39-ev" data-v39-ev="${k}" style="transition-delay:${(.15+ax/W*.9).toFixed(2)}s"><line class="v39-evl" x1="${ax}" x2="${ax}" y1="${ly}" y2="${ay-ey}" stroke="#8a96a0" stroke-opacity=".28" stroke-width="1.1" style="stroke-dasharray:${len};stroke-dashoffset:${len};transition-delay:${(.15+ax/W*.9).toFixed(2)}s"/><ellipse cx="${ax}" cy="${ay+.6}" rx="${ex+.8}" ry="${ey+.5}" fill="rgba(40,60,80,.18)"/><ellipse cx="${ax}" cy="${ay}" rx="${ex}" ry="${ey}" fill="#fff" stroke="rgba(120,135,148,.55)" stroke-width=".8"/><ellipse cx="${ax}" cy="${ay-.5}" rx="${ex*.45}" ry="${ey*.4}" fill="${mc}"/>
   <g class="v39-bal"><rect x="${bx}" y="${by}" width="${w}" height="26" rx="13" fill="rgba(255,255,255,.78)" stroke="rgba(200,212,222,.8)" stroke-width=".8"/><circle cx="${bx+13}" cy="${by+13}" r="3.6" fill="${mc}"/><text x="${bx+22}" y="${by+17.2}" font-size="10.5" font-weight="700" fill="#9aa5ae">${lab}</text><text x="${bx+26+lab.length*10}" y="${by+17.2}" font-size="11" font-weight="600" fill="#6b7782">${esc(txt)}</text></g></g>`});
 const order=m.days.map((x,i)=>({x,i,r:wd(x)})).sort((a,b)=>(a.r-b.r)||(a.i-b.i));
 for(const o of order){const [x,y]=P(o.i,o.r),q=src.q[o.x],sp=src.s[o.x]||0,fut=o.x>m.today,live=!fut&&q!=null;
  const c={band:0,d:o.x,x,y,live,q,sp,h:live?Hh(sp):1.5,top:live?v39ColP(pct(q)):V39_FLAT[0],front:live?v39ColP(pct(q),.8):V39_FLAT[1],side:live?v39ColP(pct(q),.64):V39_FLAT[2]};
  c.idx=cells.length;cells.push(c);s+=`<g class="v39-c" data-i="${c.idx}"><path/><path/><path/></g>`}
 WK.forEach((t,r)=>{const yy=OY+(6-r)*DY;stick+=`<text x="54" y="${yy-3}" text-anchor="end" font-size="10" font-weight="700" fill="#8a9aa6">${t}</text>`;
  s+=`<text x="${OX+NCOL*CW+(6-r)*DX+8}" y="${yy-3}" font-size="10" font-weight="700" fill="#8a9aa6">${t}</text>`});
 const label=v39Adv||`${v39Cat||'전체'} 업종 전체`,kw=v39Adv?((v39D.keywords||{})[v39Adv]||[]).join('·')||'검색 키워드 없음':`${m.n}개사 합계`;
 stick+=`<text x="10" y="${OY+7*DY-hk*.62-6}" font-size="14" font-weight="900" fill="#102b45">${esc(label)}<tspan dx="8" font-size="11" font-weight="500" fill="#7d8f9b">${esc(kw)}</tspan></text>`;
 for(let mm=1;mm<=12;mm++){const d1=`${m.Y}-${String(mm).padStart(2,'0')}-01`,i=m.days.indexOf(d1),x=OX+col(i)*CW;
  s+=`<line x1="${x}" x2="${x}" y1="${OY+12}" y2="${OY+20}" stroke="#b9c8d3"/><text x="${x+2}" y="${OY+34}" font-size="13" font-weight="800" fill="${d1>m.today?'#a7b5c0':'#4a6273'}">${mm}월</text>`}
 s+=`<g id="v39-today"></g><g class="v39-evs">${evs}</g>`;
 return {svg:s,stick,cells,W,H,cw,dx,dy,OY}}
function v39Paint(el,c,p){const h=1.5+(c.h-1.5)*p,{x,y}=c,{cw,dx,dy}=v39Last;const ps=el.children;
 const mix=k=>v39Rgb(c.live?v39Mix(V39_FLAT[k],[c.top,c.front,c.side][k],p):V39_FLAT[k]);
 ps[0].setAttribute('d',`M${x},${y} L${x+cw},${y} L${x+cw},${y-h} L${x},${y-h} Z`);ps[0].setAttribute('fill',mix(1));
 ps[1].setAttribute('d',`M${x+cw},${y} L${x+cw+dx},${y+dy} L${x+cw+dx},${y+dy-h} L${x+cw},${y-h} Z`);ps[1].setAttribute('fill',mix(2));
 ps[2].setAttribute('d',`M${x},${y-h} L${x+cw},${y-h} L${x+cw+dx},${y+dy-h} L${x+dx},${y+dy-h} Z`);ps[2].setAttribute('fill',mix(0));ps[2].setAttribute('stroke','rgba(255,255,255,.55)');ps[2].setAttribute('stroke-width','.7')}
function v39Today(){const b=v39Last;if(!b)return '';const c=b.cells.find(z=>z.d===v39Last.today);if(!c)return '';const h=c.h,{x,y}=c,{cw,dx,dy}=b;
 return `<path d="M${x},${y} L${x+cw},${y} L${x+cw},${y-h} L${x},${y-h} Z" fill="#1d8fc4"/><path d="M${x+cw},${y} L${x+cw+dx},${y+dy} L${x+cw+dx},${y+dy-h} L${x+cw},${y-h} Z" fill="#177aa8"/><path d="M${x},${y-h} L${x+cw},${y-h} L${x+cw+dx},${y+dy-h} L${x+dx},${y+dy-h} Z" fill="#25a4dc" stroke="rgba(255,255,255,.6)" stroke-width=".7"/>`}

// ---------- 화면 ----------
const V39_IMG='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-4.5-4.5L6 21"/></svg>';
const V39_XLS='<svg width="18" height="18" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="3.5" fill="#1f7a45" stroke="none"/><path d="M8 8l3 4-3 4M16 8l-3 4 3 4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
function v39Controls(show){let box=document.querySelector('main>header .v39-ctrl'),yb=document.querySelector('main>header .v39-years');const head=document.querySelector('main>header');
 if(!show){if(box)box.remove();if(yb)yb.remove();if(head)head.classList.remove('v39-head');return}
 if(!head)return;head.classList.add('v39-head');
 if(!box){box=document.createElement('div');box.className='v32-ctrl v39-ctrl';head.appendChild(box)}
 const opts=(typeof v38Opt!=='undefined'&&v38Opt)||[];const o=v39Adv?opts.find(x=>x.advertiser===v39Adv):{categories:[...new Set(opts.flatMap(x=>x.categories))].sort((a,b)=>(V39_ORDER.indexOf(a)<0?99:V39_ORDER.indexOf(a))-(V39_ORDER.indexOf(b)<0?99:V39_ORDER.indexOf(b)))};
 box.innerHTML=`<label>세부 품목<select id="v39-cat" class="chip"><option value="">전체</option>${(o?o.categories:[]).filter(c=>c!=='브랜드').map(c=>`<option value="${esc(c)}" ${c===v39Cat?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>광고주<select id="v39-adv" class="chip"><option value="" ${v39Adv?'':'selected'}>전체 (업종)</option>${opts.map(x=>`<option value="${esc(x.advertiser)}" ${x.advertiser===v39Adv?'selected':''}>${esc(x.advertiser)}</option>`).join('')}</select></label>`;
 if(!yb){yb=document.createElement('div');yb.className='v39-years';head.appendChild(yb)}
 const ys=(v39D&&v39D.years)||[],y=v39D?v39D.year:v39Year,i=ys.indexOf(y);
 yb.innerHTML=`<button type="button" class="yb" data-v39-y="${ys[i-1]||''}" ${i>0?'':'disabled'} aria-label="이전 해">‹</button>${ys.slice(Math.max(0,i-1),i+1).map(v=>`<button type="button" class="y ${v===y?'on':''}" data-v39-y="${v}">${v}</button>`).join('')}${i<ys.length-1?`<button type="button" class="y" data-v39-y="${ys[i+1]}">${ys[i+1]}</button>`:''}<button type="button" class="yb" data-v39-y="${ys[i+1]||''}" ${i<ys.length-1?'':'disabled'} aria-label="다음 해">›</button>`;
 if(typeof v38PlaceCtrl==='function')v38PlaceCtrl()}
function v39Legend(){const g=[0,.15,.3,.4,.5,.6,.7,.78,.88,1].map(p=>v39Rgb(v39ColP(p))).join(',');const c=v39ColP(.8),c2=v39ColP(.8,.64),c3=v39ColP(.8,.8);
 const bars=[5,11,19].map((h,i)=>{const x=6+i*20,y=26;return `<path d="M${x},${y} L${x+11},${y} L${x+11},${y-h} L${x},${y-h} Z" fill="${v39Rgb(c3)}"/><path d="M${x+11},${y} L${x+15},${y-5} L${x+15},${y-5-h} L${x+11},${y-h} Z" fill="${v39Rgb(c2)}"/><path d="M${x},${y-h} L${x+11},${y-h} L${x+15},${y-5-h} L${x+4},${y-5-h} Z" fill="${v39Rgb(c)}"/>`}).join('');
 return `<div class="v39-legend"><span>검색 적음 <i class="grad" style="background:linear-gradient(90deg,${g})"></i> 검색 많음</span><span><svg width="64" height="30">${bars}</svg> 광고비 많을수록 높게</span><span><svg width="22" height="16"><path d="M3,13 L14,13 L18,8 L7,8 Z" fill="#dfe6ec" stroke="#cbd5dd" stroke-width=".8"/></svg> 아직 오지 않은 날</span></div>`}
function v39View(){const d=v39D,m=v39Model(d);
 if(!m.me)return `<section class="glass section">${empty(`${v39Adv} · ${v39Cat||'전체'} ${d.year}년 자료가 없어요.`,'다른 품목이나 연도를 골라 보세요.')}</section>`;
 const b=v39Build(m);v39Last={...b,today:m.today,m};
 return `<section class="glass section v39-card"><div class="v39-ch"><div><h2>${esc(v39Adv||((v39Cat||'전체')+' 업종 전체'))} — ${d.year}년</h2><p>칸 = 하루 · 색 = 네이버 검색수 순위(그해 기준) · 높이 = 그날 광고비 · 풍선 = 캠페인 시작·신규 소재·주요 기사(누르면 자세히)</p>${v39Legend()}</div>
  <div class="v39-icons"><button type="button" class="v39-ic" data-v39-png title="이미지로 저장(1월~12월 전체)" aria-label="이미지로 저장">${V39_IMG}</button><button type="button" class="v39-ic" data-v39-xls title="엑셀 원본 내려받기" aria-label="엑셀 원본 내려받기">${V39_XLS}</button></div></div>
  <div class="v39-vp"><div class="v39-sc" id="v39-sc"><svg id="v39-svg" width="${b.W}" height="${b.H}" viewBox="0 0 ${b.W} ${b.H}">${b.svg}</svg></div>
  <svg class="v39-stick" width="330" height="${b.H}"><defs><linearGradient id="v39eg" x1="0" x2="1"><stop offset="0" stop-color="#f6f9fb" stop-opacity=".98"/><stop offset=".7" stop-color="#f6f9fb" stop-opacity=".92"/><stop offset="1" stop-color="#f6f9fb" stop-opacity="0"/></linearGradient></defs><rect width="70" height="${b.H}" fill="url(#v39eg)"/>${b.stick}</svg>
  <button type="button" class="v39-arr l" data-v39-scroll="-1" aria-label="이전">‹</button><button type="button" class="v39-arr r" data-v39-scroll="1" aria-label="다음">›</button><div class="v39-tip" id="v39-tip" hidden></div></div>
  <p class="footnote">${esc(d.note||'')}${v39Adv?'':' · 업종 전체는 같은 품목 경쟁사(인덱스 경쟁사=O)와 코웨이의 합계'} · 좌우로 넘겨 1월~12월</p></section>`}
function v39Animate(full){const b=v39Last;if(!b)return;const els=[...document.querySelectorAll('#v39-svg .v39-c')];const id=++v39Anim;const N=b.cells.length;
 const ncol=Math.max(...b.cells.map(c=>c.x));const t0=performance.now(),D0=650,DUR=750;
 const ease=t=>1-Math.pow(1-t,3);
 const frame=now=>{if(id!==v39Anim)return;let done=true;for(let k=0;k<N;k++){const c=b.cells[k];const delay=(c.x/ncol)*D0+(c.band?120:0);let p=full?1:Math.max(0,Math.min(1,(now-t0-delay)/DUR));if(p<1)done=false;v39Paint(els[k],c,ease(p))}
  if(!done)requestAnimationFrame(frame);else{const t=document.getElementById('v39-today');if(t)t.innerHTML=v39Today()}};
 const sv=document.getElementById('v39-svg');if(sv){sv.classList.remove('v39-on');if(full)sv.classList.add('v39-on','v39-now');else setTimeout(()=>{if(id===v39Anim)sv.classList.add('v39-on')},D0*.6)}
 if(full){frame(performance.now()+1e6)}else{b.cells.forEach((c,k)=>v39Paint(els[k],c,0));requestAnimationFrame(frame)}}
function v39Scroll0(){const sc=document.getElementById('v39-sc'),b=v39Last;if(!sc||!b)return;const c=b.cells.find(z=>z.band===0&&z.d===b.today);
 sc.scrollLeft=c?Math.max(0,c.x-sc.clientWidth*.72):(b.m.Y<new Date().getFullYear()?0:sc.scrollWidth);v39Arrows()}
function v39Arrows(){const sc=document.getElementById('v39-sc');if(!sc)return;document.querySelectorAll('[data-v39-scroll]').forEach(btn=>{const dir=+btn.dataset.v39Scroll;btn.classList.toggle('off',dir<0?sc.scrollLeft<=2:sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2)})}
function v39Draw(anim){$('#page-title').textContent=V39_TITLE;$('#subtitle').textContent='';v39Controls(true);$('#content').innerHTML=v39View();v39Scroll0();v39Animate(!anim);
 const sc=document.getElementById('v39-sc');if(sc)sc.addEventListener('scroll',()=>{v39Arrows();const t=document.getElementById('v39-tip');if(t)t.hidden=true},{passive:true})}

var v39BaseRender=render;
render=async function(...a){
 if(route!=='heatmap'){v39Controls(false);return v39BaseRender.apply(this,a)}
 if(typeof v38Hist!=='undefined'){const pop=v38Hist.pop;v38Hist.pop=false;if(typeof v12Pop!=='undefined')v12Pop=true;v38Sync(pop||!v38Hist.ready);v38Hist.ready=true}
 ['v38Controls','v37Controls','v32Controls'].forEach(f=>{try{window[f]&&window[f](false)}catch(e){}});try{v38Tip&&v38Tip(null)}catch(e){}
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='heatmap'));
 try{document.documentElement.dataset.ndRoute='heatmap'}catch(e){}
 $('#page-title').textContent=V39_TITLE;$('#subtitle').textContent='';
 if(!v39D)$('#content').innerHTML=`<section class="glass section">${empty('연간 히트맵을 그리는 중이에요.')}</section>`;
 const req=++v39Req;
 try{const o=await v39Opts();if(v39Adv&&!o.some(x=>x.advertiser===v39Adv)&&o.length)v39Adv=o[0].advertiser;const d=await v39Load();if(req!==v39Req||route!=='heatmap')return;v39D=d;v39Year=d.year}
 catch(e){$('#content').innerHTML=`<section class="glass section">${empty('연간 히트맵을 불러오지 못했어요.',e.message)}</section>`;return}
 v39Draw(true);if(typeof v38Sync==='function')v38Sync(true)};

async function v39Change(){$('#content').querySelector('.v39-card')?.classList.add('loading');const req=++v39Req;
 try{const d=await v39Load();if(req!==v39Req)return;v39D=d;v39Year=d.year;v39Draw(true);if(typeof v38Sync==='function')v38Sync(false)}catch(e){toast('불러오지 못했어요: '+e.message)}}
window.addEventListener('change',e=>{const id=e.target&&e.target.id;if(id!=='v39-adv'&&id!=='v39-cat')return;e.stopPropagation();
 if(id==='v39-adv'){v39Adv=e.target.value;const o=v39Adv&&((typeof v38Opt!=='undefined'&&v38Opt)||[]).find(x=>x.advertiser===v39Adv);if(o&&v39Cat&&!o.categories.includes(v39Cat))v39Cat=''}else v39Cat=e.target.value;v39Change()},true);
document.addEventListener('click',e=>{
 const y=e.target.closest&&e.target.closest('[data-v39-y]');if(y){e.preventDefault();if(!y.dataset.v39Y||y.disabled)return;v39Year=+y.dataset.v39Y;v39Change();return}
 const s=e.target.closest&&e.target.closest('[data-v39-scroll]');if(s){const sc=document.getElementById('v39-sc');if(sc){sc.scrollBy({left:+s.dataset.v39Scroll*V39_V.CW*8,behavior:'smooth'});setTimeout(v39Arrows,450)}return}
 if(e.target.closest&&e.target.closest('[data-v39-png]')){v39Png();return}
 if(e.target.closest&&e.target.closest('[data-v39-xls]')){v39XlsDown();return}});

// 마우스를 올리면 그날 값
document.addEventListener('pointermove',e=>{if(route!=='heatmap'||!v39Last)return;const tip=document.getElementById('v39-tip');if(!tip)return;const g=e.target.closest&&e.target.closest('#v39-svg .v39-c');
 if(!g){tip.hidden=true;return}const c=v39Last.cells[+g.dataset.i];if(!c||c.d>v39Last.today){tip.hidden=true;return}
 const m=v39Last.m,fm=v=>v?v38Money(v):'집행 없음',n=v=>v==null?'자료 없음':Math.round(v).toLocaleString()+'회',wk='일월화수목금토'[new Date(c.d+'T00:00:00').getDay()];
 const evs=m.ev.filter(z=>z.d===c.d);
 tip.innerHTML=`<b>${c.d.replaceAll('-','.')} (${wk})</b><div class="r"><span>네이버 검색</span><i>${n(m.me.q[c.d])}</i></div><div class="r"><span>광고비</span><i>${fm(m.me.s[c.d])}</i></div>${evs.map(z=>`<div class="e"><em style="color:${(V39_EVT[z.type]||[])[1]}">${(V39_EVT[z.type]||['이슈'])[0]}</em>${esc(v39Short((v39Adv?'':(z.adv||'')+' ')+z.title,22))}</div>`).join('')}`;
 tip.hidden=false;const vp=tip.parentElement.getBoundingClientRect();let x=e.clientX-vp.left+16,yy=e.clientY-vp.top-tip.offsetHeight-12;if(x+tip.offsetWidth>vp.width-8)x=e.clientX-vp.left-tip.offsetWidth-16;if(yy<0)yy=e.clientY-vp.top+18;tip.style.left=x+'px';tip.style.top=yy+'px'},{passive:true});

// 이미지(PNG): 1월~12월 전체, 왼쪽 이름표·요일 포함
async function v39Png(){const svg=document.getElementById('v39-svg'),st=document.querySelector('.v39-stick');if(!svg||!v39Last)return;v39Animate(true);
 const b=v39Last,head=58,W=b.W,H=b.H+head+14;const title=`${v39Adv||((v39Cat||'전체')+' 업종 전체')} — ${v39D.year}년 연간 히트맵`;
 const stick=[...st.querySelectorAll('text')].map(t=>t.outerHTML).join('');
 const xml=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif"><rect width="${W}" height="${H}" fill="#f6f9fb"/><text x="12" y="34" font-size="20" font-weight="900" fill="#102b45">${esc(title)}</text><text x="12" y="54" font-size="12" fill="#6b7c88">칸 = 하루 · 색 = 네이버 검색수 순위(그해 기준) · 높이 = 그날 광고비 · 코웨이 경쟁사 분석 플랫폼</text><g transform="translate(0,${head})">${svg.innerHTML}${stick}</g></svg>`;
 const img=new Image();img.onload=()=>{const k=2,cv=document.createElement('canvas');cv.width=W*k;cv.height=H*k;const ctx=cv.getContext('2d');ctx.scale(k,k);ctx.drawImage(img,0,0);
  cv.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=`${v39Adv||'업종전체'}_${v39Cat||'전체'}_${v39D.year}_연간히트맵.png`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600)},'image/png')};
 img.onerror=()=>toast('이미지를 만들지 못했어요.');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml)}
// 엑셀: 날짜별 원본
function v39XlsDown(){if(!v39Last||typeof v38Xlsx!=='function')return;const m=v39Last.m,adv=v39Adv||((v39Cat||'전체')+' 업종 전체'),cat=v39Cat||'전체';
 const rows=[[`${adv} · ${cat} · ${m.Y}년 날짜별 네이버 검색수·광고비 (광고비 단위 원)`],[],['날짜','요일','검색수','광고비','그날 이슈']];
 for(const d of m.days){if(d>m.today)break;const wk='일월화수목금토'[new Date(d+'T00:00:00').getDay()];const iss=m.ev.filter(z=>z.d===d).map(z=>`[${(V39_EVT[z.type]||['이슈'])[0]}] ${v39Adv?'':(z.adv||'')+' '}${z.title}`).join(' / ');
  rows.push([d,wk,m.me.q[d]==null?'':Math.round(m.me.q[d]),Math.round(m.me.s[d]||0),iss])}
 const blob=v38Xlsx(rows,'연간 히트맵');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${adv}_${cat}_${m.Y}_연간히트맵.xlsx`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600)}

// 처음 열 때 주소가 #/heatmap 이면
if(v39FromHash()&&typeof listing!=='undefined'&&listing){render()}

// 풍선 누르면 자세히
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('[data-v39-ev]');if(!g||!v39Last)return;const z=v39Last.m.ev[+g.dataset.v39Ev];if(!z)return;
 const [lab,color]=V39_EVT[z.type]||['이슈','#7d8a96'],dl=$('#detail');dl.className='v39-evdialog';const d=z.d.replaceAll('-','.');
 let body='';
 if(z.type==='camp')body=`${z.thumb?`<img class="v39-evimg" src="${esc(safeUrl(z.thumb))}" alt="" onerror="this.remove()">`:''}<h2>${esc(z.title)}</h2><p class="v39-evmeta">${esc(z.adv)} · ${d} 시작${z.e?` ~ ${z.e.replaceAll('-','.')}`:''} · 광고비 ${v38Money(z.amount)}</p>${z.id?`<button type="button" class="primary" data-campaign="${esc(z.id)}">캠페인 분석 보기</button>`:''}`;
 else if(z.type==='creative')body=`<h2>${esc(z.title)}</h2><p class="v39-evmeta">${esc(z.adv)}${z.product?` · ${esc(z.product)}`:''} · ${d} TV 첫 방송${z.scene?` · ${esc(z.scene)}`:''}</p><p class="v39-evmeta">이 소재 TV 광고비(아덱스 원금액 누적) ${v38Money(z.amount)}</p>${z.id?`<button type="button" class="primary" data-campaign="${esc(z.id)}">이 소재가 든 캠페인 보기</button>`:''}`;
 else body=`${z.thumb?`<img class="v39-evimg" src="${esc(safeUrl(z.thumb))}" alt="" onerror="this.remove()">`:''}<h2>${esc(z.title)}</h2><p class="v39-evmeta">${esc(z.adv)} · ${esc(z.publisher||'')} · ${d}${z.n>1?` · 같은 소식 ${z.n}건`:''}</p>${z.summary?`<p class="v39-evsum">${esc(z.summary)}…</p>`:''}${z.url?`<a class="primary" href="${esc(safeUrl(z.url))}" target="_blank" rel="noopener">원문 보기 ↗</a>`:''}`;
 $('#detail-body').innerHTML=`<div class="v39-ev-pop"><span class="v39-evtag" style="background:${color}">${lab}</span>${body}</div>`;if(!dl.open)dl.showModal()});

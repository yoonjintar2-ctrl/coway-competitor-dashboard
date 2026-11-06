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
const V39_PS=[[0,52,62,87,1],[.3,50,78,77,1],[.5,47,90,62,1],[.78,37,90,56,1],[1,22,86,52,1]];  // 위쪽도 빨강 대신 진한 주황까지만(11-05 19:53)  // 낮은 쪽은 노랑이 점점 연해져 연노랑으로(녹색·회색 안 씀)
const V39_NQ=[[214,220,226],[194,202,209],[181,190,198]];  // 검색 자료가 없는 날(광고비만): 윗면·앞면·옆면
function v39Hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return [f(0),f(8),f(4)].map(x=>x*255)}
function v39ColP(p,f=1){p=Math.max(0,Math.min(1,p));let i=0;while(i<V39_PS.length-2&&p>V39_PS[i+1][0])i++;const A=V39_PS[i],B=V39_PS[i+1],u=(p-A[0])/(B[0]-A[0]);const [h,s,l,al]=[1,2,3,4].map(j=>A[j]+(B[j]-A[j])*u);
 return v39Hsl(h,s,l*(.55+.45*f)).map((x,k)=>Math.round(x*al+V39_BG[k]*(1-al)*(.8+.2*f)))}
const V39_FLAT=[[227,233,238],[211,220,227],[200,210,218]];  // 윗면·앞면·옆면(평평한 회색)
const V39_V={CW:27,DX:9,DY:-18,pad:3.4,h0:3,hk:46,OX:64,ML:46,MR:46,T:18};  // 경사 조금 더 눕힘 · 팔레트 여백·두께
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
 // 카메라: v39K 0 = 비스듬한 3D, 1 = 위에서 내려다본 2D(스크롤에 따라, 11-06 13:25)
 const cam=Math.max(0,Math.min(1,v39K||0)),ce=cam*cam*(3-2*cam),{CW,pad,OX,ML,MR}=V39_V,DX=V39_V.DX*(1-ce),DY=V39_V.DY+(-CW-V39_V.DY)*ce,T=V39_V.T*(1-ce),h0=V39_V.h0*(1-ce),hk=V39_V.hk*(1-ce),cw=CW-pad,dx=DX*.86,dy=DY*.86;
 const wd=x=>(new Date(x+'T00:00:00').getDay()+6)%7,wd0=wd(m.days[0]),col=i=>Math.floor((i+wd0)/7),NCOL=col(m.days.length-1)+1;
 const H=v39H||Math.max(400,Math.min(780,(window.innerHeight||900)-330)),OY=H-V39_V.T-14,W=OX+NCOL*CW+MR+8*V39_V.DX+20;
 const Hh=v=>h0+Math.sqrt(Math.min(1,(v||0)/m.smax))*hk;
 const F=(u,t)=>[OX+u+t*DX,OY+t*DY];  // 팔레트 윗면 좌표(u: 가로 px, t: 줄 깊이)
 const lie=(u,t,k=.936/Math.abs(DY))=>`matrix(1,0,${(-DX*k).toFixed(3)},${(-DY*k).toFixed(3)},${F(u,t)})`;  // 바닥에 누운 글자
 let s=`<defs><filter id="v39sh" x="-5%" y="-40%" width="110%" height="180%"><feGaussianBlur stdDeviation="10"/></filter><linearGradient id="v39pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f7"/><stop offset="1" stop-color="#dfe7ee"/></linearGradient><linearGradient id="v39hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`,stick='';
 const cells=[],src=m.me,WK=['월','화','수','목','금','토','일'];
 const sorted=m.days.filter(x=>x<=m.today).map(x=>src.q[x]).filter(v=>v!=null).sort((a,b)=>a-b);
 const pct=v=>{let a=0,b=sorted.length;while(a<b){const k=(a+b)>>1;if(sorted[k]<v)a=k+1;else b=k}return sorted.length>1?a/(sorted.length-1):.5};
 // 팔레트(입체): 윗면·앞면(x축)·오른쪽 옆면, 테두리 없음
 const u0=-ML,u1=NCOL*CW-pad+MR,t0=-.55,t1=7.25,A=F(u0,t0),B=F(u1,t0),C=F(u1,t1),D=F(u0,t1);
 s+=`<path d="M${A[0]-6},${A[1]+T+10} L${B[0]+10},${B[1]+T+10} L${C[0]+16},${C[1]+T+4} L${D[0]},${D[1]+T}Z" fill="rgba(20,60,90,.16)" filter="url(#v39sh)"/>`;
 s+=`<path d="M${A} L${B} L${C} L${D}Z" fill="#f7fafc"/><path d="M${A} L${B} L${B[0]},${B[1]+T} L${A[0]},${A[1]+T}Z" fill="url(#v39pf)"/><path d="M${B} L${C} L${C[0]},${C[1]+T} L${B[0]},${B[1]+T}Z" fill="#d6e0e8"/>`;
 // 월: 앞면에 구분선 + 달 가운데 글자
 const mstart=mm=>col(m.days.indexOf(`${m.Y}-${String(mm).padStart(2,'0')}-01`))*CW;
 for(let mm=1;mm<=12;mm++){const ua=mstart(mm),ub=mm<12?mstart(mm+1):NCOL*CW-pad,[xa,ya]=F(ua,t0),[xm]=F((ua+ub)/2,t0),fut=`${m.Y}-${String(mm).padStart(2,'0')}-01`>m.today;
  if(mm>1)s+=`<line x1="${xa}" x2="${xa}" y1="${ya+4}" y2="${ya+T-4}" stroke="#b5c3ce" stroke-width="1"/>`;
  s+=`<text x="${xm}" y="${ya+T/2+4.2+ce*9}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${fut?'#a9b6c0':'#566b7b'}">${mm}월</text>`}
 // 요일: 팔레트 양쪽 여백에 누운 글자
 WK.forEach((t,r)=>{const tt=r+.2;s+=`<text transform="${lie(-20,tt)}" text-anchor="end" font-size="10.5" font-weight="800" fill="#8d9aa5">${t}</text><text transform="${lie(NCOL*CW-pad+16,tt)}" font-size="10.5" font-weight="800" fill="#8d9aa5">${t}</text>`});
 // 이슈: 풍선 자리
 const zoneTop=4,zoneBot=OY+7*DY-hk-26,lanes=Math.max(1,Math.min(3,Math.floor((zoneBot-zoneTop)/34))),LH=Math.min(40,(zoneBot-zoneTop-26)/Math.max(1,lanes-1));  // 풍선은 3줄까지 (11-06 14:13)
 const used=Array.from({length:lanes},()=>[]);let bal='';const pins={};
 const cellXY=(i,r)=>{const [x,y]=F(col(i)*CW,r);return [x,y]};  // 월요일이 앞(가까운 쪽), 일요일이 맨 뒤(위)
 m.ev.forEach((e,k)=>{const i=m.days.indexOf(e.d);if(i<0)return;const r=wd(e.d),[x,y]=cellXY(i,r),live=src.q[e.d]!=null||(src.s[e.d]||0)>0,h=live?Hh(src.s[e.d]||0):0,ax=x+cw/2+dx/2,ay=y+dy/2-h;
  const [lab]=V39_EVT[e.type]||['이슈'];const txt=v39Short((v39Adv?'':(e.adv||'')+' ')+(e.title||''),v39Adv?13:15),w=Math.min(210,26+lab.length*10.5+txt.length*11.2+14);
  // 자리: 3줄 안에서 막대 바로 위가 막히면 옆으로 비켜 두고 선을 살짝 꺾어 잇기 (11-06 14:13)
  let bx=0,lane=-1,best=1e9;for(const off of [0,-1,1,-2,2,-3,3,-4,4,-5,5,-6,6])for(let L=0;L<lanes;L++){const x=Math.max(4,Math.min(W-w-4,ax-w/2+off*w*.42));if(!used[L].every(([a,b])=>x+w<a-6||x>b+6))continue;const sc=Math.abs(off)*14+used[L].length*6+Math.abs(L-((k*3)%lanes))*2;if(sc<best){best=sc;lane=L;bx=x}}if(lane<0)return;used[lane].push([bx,bx+w]);
  const by=zoneTop+lane*LH,ly=by+26,mc=V39_EVM[e.type]||'#b3bbc2',dl=(.15+ax/W*.9).toFixed(2),tx=Math.max(bx+14,Math.min(bx+w-14,ax)),ky=Math.min(ay-6,ly+Math.min(22,Math.max(8,(ay-ly)*.25)));
  const lp=tx===ax?`M${ax},${ay} L${ax},${ly}`:`M${ax},${ay} L${ax},${ky} L${tx},${ly}`,len=Math.max(4,(ay-ky)+Math.hypot(tx-ax,ky-ly));
  // 선·닿는 점은 그 막대 바로 뒤에 그려서 앞 막대에 가려지게
  (pins[e.d]=pins[e.d]||[]).push(`<g class="v39-evp" data-v39-ev="${k}" style="transition-delay:${dl}s"><path class="v39-evl" d="${lp}" fill="none" stroke="#8a96a0" stroke-opacity=".3" stroke-width="1.1" stroke-linejoin="round" style="stroke-dasharray:${len};stroke-dashoffset:${len};transition-delay:${dl}s"/><circle r="4.2" transform="matrix(1,0,${(DX*.05).toFixed(3)},${(DY*.05).toFixed(3)},${ax},${ay})" fill="#8a96a0" fill-opacity=".3"/></g>`);
  bal+=`<g class="v39-ev" data-v39-ev="${k}" style="transition-delay:${dl}s"><rect x="${bx}" y="${by}" width="${w}" height="26" rx="13" fill="rgba(255,255,255,.8)" stroke="rgba(200,212,222,.8)" stroke-width=".8"/><circle cx="${bx+13}" cy="${by+13}" r="3.6" fill="${mc}"/><text x="${bx+22}" y="${by+17.2}" font-size="10.5" font-weight="700" fill="#9aa5ae">${lab}</text><text x="${bx+26+lab.length*10}" y="${by+17.2}" font-size="11" font-weight="600" fill="#6b7782">${esc(txt)}</text></g>`});
 const order=m.days.map((x,i)=>({x,i,r:wd(x)})).sort((a,b)=>(b.r-a.r)||(a.i-b.i));
 for(const o of order){const [x,y]=cellXY(o.i,o.r),q=src.q[o.x],sp=src.s[o.x]||0,fut=o.x>m.today,live=!fut&&(q!=null||sp>0),hq=q!=null,p=hq?pct(q):0;
  const c={d:o.x,x,y,col:col(o.i),r:o.r,live,q,sp,h:live?Hh(sp):0,top:!live?V39_FLAT[0]:hq?v39ColP(p,1.07):V39_NQ[0],front:!live?V39_FLAT[0]:hq?v39ColP(p,.82):V39_NQ[1],side:!live?V39_FLAT[0]:hq?v39ColP(p,.66):V39_NQ[2]};
  c.idx=cells.length;cells.push(c);s+=live?`<g class="v39-c" data-i="${c.idx}"><path/><path/><path/><path class="hl" fill="url(#v39hl)"/></g>`:`<g class="v39-c flat" data-i="${c.idx}"><path d="M${x},${y} L${x+cw},${y} L${x+cw+dx},${y+dy} L${x+dx},${y+dy}Z" fill="${o.x===m.today?'#25a4dc':'#e3e9ee'}"/></g>`;
  if(pins[o.x])s+=pins[o.x].join('')}
 const label=v39Adv||`${v39Cat||'전체'} 업종 전체`,kw=v39Adv?((v39D.keywords||{})[v39Adv]||[]).join('·')||'검색 키워드 없음':`${m.n}개사 합계`;
 // 이름·키워드는 그래프를 가리지 않게 카드 제목 아래로(2026-11-05)
 s+=`<g id="v39-today"></g><g class="v39-evs">${bal}</g>`;
 return {svg:s,stick,cells,W,H,cw,dx,dy,OY,label,kw}}
function v39Paint(el,c,p){if(!c.live)return;const h=c.h*p,{x,y}=c,{cw,dx,dy}=v39Last;const ps=el.children;
 const mix=k=>v39Rgb(v39Mix(V39_FLAT[0],[c.top,c.front,c.side][k],p));
 ps[0].setAttribute('d',`M${x},${y} L${x+cw},${y} L${x+cw},${y-h} L${x},${y-h} Z`);ps[0].setAttribute('fill',mix(1));
 ps[1].setAttribute('d',`M${x+cw},${y} L${x+cw+dx},${y+dy} L${x+cw+dx},${y+dy-h} L${x+cw},${y-h} Z`);ps[1].setAttribute('fill',mix(2));
 ps[2].setAttribute('d',`M${x},${y-h} L${x+cw},${y-h} L${x+cw+dx},${y+dy-h} L${x+dx},${y+dy-h} Z`);ps[2].setAttribute('fill',mix(0));
 ps[3].setAttribute('d',`M${x},${y} L${x+cw},${y} L${x+cw},${y-h} L${x},${y-h} Z`);ps[3].setAttribute('opacity',p)}
function v39Today(){const b=v39Last;if(!b)return '';const c=b.cells.find(z=>z.d===v39Last.today);if(!c||!c.live)return '';const h=c.h,{x,y}=c,{cw,dx,dy}=b;
 return `<path d="M${x},${y} L${x+cw},${y} L${x+cw},${y-h} L${x},${y-h} Z" fill="#1d8fc4"/><path d="M${x+cw},${y} L${x+cw+dx},${y+dy} L${x+cw+dx},${y+dy-h} L${x+cw},${y-h} Z" fill="#177aa8"/><path d="M${x},${y-h} L${x+cw},${y-h} L${x+cw+dx},${y+dy-h} L${x+dx},${y+dy-h} Z" fill="#25a4dc"/>`}

// ---------- 화면 ----------
const V39_IMG='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-4.5-4.5L6 21"/></svg>';
const V39_XLS='<svg width="18" height="18" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="3.5" fill="#1f7a45" stroke="none"/><path d="M8 8l3 4-3 4M16 8l-3 4 3 4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
function v39Controls(show){if(!show)v39Lock(false);let box=document.querySelector('main>header .v39-ctrl');
 if(!show){if(box)box.remove();return}
 const head=document.querySelector('main>header');if(!head)return;
 if(!box){box=document.createElement('div');box.className='v32-ctrl v39-ctrl';head.appendChild(box)}
 const opts=(typeof v38Opt!=='undefined'&&v38Opt)||[];const o=v39Adv?opts.find(x=>x.advertiser===v39Adv):{categories:[...new Set(opts.flatMap(x=>x.categories))].sort((a,b)=>(V39_ORDER.indexOf(a)<0?99:V39_ORDER.indexOf(a))-(V39_ORDER.indexOf(b)<0?99:V39_ORDER.indexOf(b)))};
 box.innerHTML=`<label>세부 품목<select id="v39-cat" class="chip"><option value="">전체</option>${(o?o.categories:[]).filter(c=>c!=='브랜드').map(c=>`<option value="${esc(c)}" ${c===v39Cat?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>광고주<select id="v39-adv" class="chip"><option value="" ${v39Adv?'':'selected'}>전체 (업종)</option>${opts.map(x=>`<option value="${esc(x.advertiser)}" ${x.advertiser===v39Adv?'selected':''}>${esc(x.advertiser)}</option>`).join('')}</select></label>`;
 if(typeof v38PlaceCtrl==='function')v38PlaceCtrl()}
function v39Years(){const ys=(v39D&&v39D.years)||[],y=v39D?v39D.year:v39Year,i=ys.indexOf(y);
 return `<div class="v39-years"><button type="button" class="yb" data-v39-y="${ys[i-1]||''}" ${i>0?'':'disabled'} aria-label="이전 해">‹</button>${ys.map(v=>`<button type="button" class="y ${v===y?'on':''}" data-v39-y="${v}">${v}</button>`).join('')}<button type="button" class="yb" data-v39-y="${ys[i+1]||''}" ${i<ys.length-1?'':'disabled'} aria-label="다음 해">›</button></div>`}
function v39Legend(){const g=[0,.15,.3,.4,.5,.6,.7,.78,.88,1].map(p=>v39Rgb(v39ColP(p))).join(',');const c=v39ColP(.8),c2=v39ColP(.8,.64),c3=v39ColP(.8,.8);
 const bars=[5,11,19].map((h,i)=>{const x=6+i*20,y=26;return `<path d="M${x},${y} L${x+11},${y} L${x+11},${y-h} L${x},${y-h} Z" fill="${v39Rgb(c3)}"/><path d="M${x+11},${y} L${x+15},${y-5} L${x+15},${y-5-h} L${x+11},${y-h} Z" fill="${v39Rgb(c2)}"/><path d="M${x},${y-h} L${x+11},${y-h} L${x+15},${y-5-h} L${x+4},${y-5-h} Z" fill="${v39Rgb(c)}"/>`}).join('');
 return `<div class="v39-legend"><span>검색 적음 <i class="grad" style="background:linear-gradient(90deg,${g})"></i> 검색 많음</span><span><svg width="64" height="30">${bars}</svg> 광고비 많을수록 높게</span>${v39Last&&v39Last.cells.some(c=>c.live&&c.q==null)?`<span><svg width="22" height="18"><path d="M3,15 L14,15 L14,8 L3,8Z" fill="rgb(194,202,209)"/><path d="M3,8 L14,8 L18,4 L7,4Z" fill="rgb(214,220,226)"/></svg> 검색 자료 없는 날(광고비만)</span>`:''}</div>`}
function v39View(){const d=v39D,m=v39Model(d);
 if(!m.me)return `<section class="glass section">${empty(`${v39Adv} · ${v39Cat||'전체'} ${d.year}년 자료가 없어요.`,'다른 품목이나 연도를 골라 보세요.')}</section>`;
 const b=v39Build(m);v39Last={...b,today:m.today,m};
 return `<div class="v39-track"><section class="glass section v39-card"><div class="v39-ch"><div><h2>${esc(v39Adv||((v39Cat||'전체')+' 업종 전체'))} — ${d.year}년</h2><p class="v39-kw">${v39Adv?'검색 키워드 · ':''}${esc(b.kw)}<button type="button" class="v39-kwbtn" data-v39-kwopen>${v39Adv?'키워드 보기·수정 요청':'광고주별 키워드'}</button></p></div>
  <div class="v39-icons">${v39Years()}<button type="button" class="v39-ic" data-v39-png title="이미지로 저장(1월~12월 전체)" aria-label="이미지로 저장">${V39_IMG}</button><button type="button" class="v39-ic" data-v39-xls title="엑셀 원본 내려받기" aria-label="엑셀 원본 내려받기">${V39_XLS}</button><button type="button" class="v39-ic" data-v39-full title="${v39IsFull()?'전체 화면 끝내기(Esc)':'전체 화면으로 보기'}" aria-label="전체 화면">${v39IsFull()?V39_SHRINK:V39_GROW}</button></div></div>
  <div class="v39-vp"><div class="v39-sc" id="v39-sc"><svg id="v39-svg" width="${b.W}" height="${b.H}" viewBox="0 0 ${b.W} ${b.H}">${b.svg}</svg></div>
  <svg class="v39-stick" width="360" height="${b.H}">${b.stick}</svg>
  <button type="button" class="v39-arr l" data-v39-scroll="-1" aria-label="이전">‹</button><button type="button" class="v39-arr r" data-v39-scroll="1" aria-label="다음">›</button><div class="v39-tip" id="v39-tip" hidden></div></div>
  <div class="v39-below one">${v39Legend()}<span class="fn" title="${esc((d.note||'')+(v39Adv?'':' · 업종 전체는 같은 품목 경쟁사(인덱스 경쟁사=O)와 코웨이의 합계'))}">칸=하루 · 색=검색수 순위 · 높이=광고비 · 풍선=캠페인·신규 소재·기사 · 마우스 휠로 3D↔위에서 본 2D · ${esc(d.note||'')}</span></div></section></div>`}
function v39Animate(full){const b=v39Last;if(!b)return;v39Hot(null);const els=[...document.querySelectorAll('#v39-svg>.v39-c')];const id=++v39Anim;const N=b.cells.length;
 const ncol=Math.max(...b.cells.map(c=>c.x));const t0=performance.now(),D0=650,DUR=750;
 const ease=t=>1-Math.pow(1-t,3);
 const frame=now=>{if(id!==v39Anim)return;let done=true;for(let k=0;k<N;k++){const c=b.cells[k];const delay=(c.x/ncol)*D0;let p=full?1:Math.max(0,Math.min(1,(now-t0-delay)/DUR));if(p<1)done=false;v39Paint(els[k],c,ease(p))}
  if(!done)requestAnimationFrame(frame);else{const t=document.getElementById('v39-today');if(t)t.innerHTML=v39Today()}};
 const sv=document.getElementById('v39-svg');if(sv){sv.classList.remove('v39-on');if(full)sv.classList.add('v39-on','v39-now');else setTimeout(()=>{if(id===v39Anim)sv.classList.add('v39-on')},D0*.6);setTimeout(()=>{if(id===v39Anim)sv.classList.add('v39-ready')},full?0:D0*.6+1900)}
 if(full){frame(performance.now()+1e6)}else{b.cells.forEach((c,k)=>v39Paint(els[k],c,0));requestAnimationFrame(frame)}}
function v39Scroll0(){const sc=document.getElementById('v39-sc'),b=v39Last;if(!sc||!b)return;const c=b.cells.find(z=>z.d===b.today);
 sc.scrollLeft=c?Math.max(0,c.x-sc.clientWidth*.72):(b.m.Y<new Date().getFullYear()?0:sc.scrollWidth);v39Arrows()}
function v39Arrows(){const sc=document.getElementById('v39-sc');if(!sc)return;document.querySelectorAll('[data-v39-scroll]').forEach(btn=>{const dir=+btn.dataset.v39Scroll;btn.classList.toggle('off',dir<0?sc.scrollLeft<=2:sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2)})}
function v39Draw(anim){v39HotCol=null;$('#page-title').textContent=V39_TITLE;$('#subtitle').textContent='';v39Controls(true);v39K=0;v39Lock(!v39IsFull());$('#content').innerHTML=v39View();{const H=v39FitH();if(H&&v39Last&&Math.abs(H-v39Last.H)>3){v39H=H;$('#content').innerHTML=v39View()}}v39Scroll0();v39Animate(!anim);
 const sc=document.getElementById('v39-sc');if(sc)sc.addEventListener('scroll',()=>{v39Arrows();v39Hot(null)},{passive:true})}

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

// 막대 위에 정확히 올렸을 때만: 그 주(열) 막대 7개를 키우고 나머지는 흐리게 + 그 주 합계(크게)·요일별(작게)
var v39HotCol=null,v39HotT=0,v39HotDay=null;
function v39Hot(col){const sv=document.getElementById('v39-svg');if(!sv||!v39Last){v39HotCol=null;return}if(col===v39HotCol)return;v39HotCol=col;v39HotDay=null;let ov=document.getElementById('v39-hot');
 if(col==null){sv.classList.remove('v39-col');if(ov)ov.remove();const t=document.getElementById('v39-tip');if(t)t.hidden=true;return}
 if(!ov){ov=document.createElementNS('http://www.w3.org/2000/svg','g');ov.id='v39-hot';sv.insertBefore(ov,sv.querySelector('.v39-evs'))}
 ov.classList.remove('on');ov.textContent='';const els=sv.querySelectorAll(':scope>.v39-c');
 v39Last.cells.forEach((c,k)=>{if(c.col===col&&c.d<=v39Last.today){const n=els[k].cloneNode(true);n.classList.add('hot');ov.appendChild(n)}});
 const ti=v39Last.cells.findIndex(c=>c.col===col&&c.d===v39Last.today);if(ti>=0){const t=document.getElementById('v39-today');if(t&&t.firstChild){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','v39-c hot');g.dataset.i=ti;g.innerHTML=t.innerHTML;ov.appendChild(g)}}
 sv.classList.add('v39-col');ov.getBoundingClientRect();ov.classList.add('on')}
function v39WeekTip(c){const tip=document.getElementById('v39-tip');if(!tip||!v39Last)return;const m=v39Last.m;
 const fm=v=>v?v38Money(v):'-',n=v=>v==null?'-':Math.round(v).toLocaleString(),WK='일월화수목금토',dd=x=>x.slice(5).replace('-','.');
 const wk=v39Last.cells.filter(z=>z.col===c.col).sort((a,b)=>a.d<b.d?-1:1),d0=wk[0].d,d1=wk[wk.length-1].d,past=wk.filter(z=>z.d<=v39Last.today);
 const sq=past.reduce((a,z)=>a+(m.me.q[z.d]||0),0),hasq=past.some(z=>m.me.q[z.d]!=null),ss=past.reduce((a,z)=>a+(m.me.s[z.d]||0),0);
 const evs=m.ev.filter(z=>z.d>=d0&&z.d<=d1);
 tip.className='v39-tip wk';
 tip.innerHTML=`<div class="h">${dd(d0)} ~ ${dd(d1)} 한 주</div><div class="big"><div><span>네이버 검색</span><b>${hasq?n(sq):'-'}</b></div><div><span>광고비</span><b>${fm(ss)}</b></div></div>
  <div class="mini">${wk.map(z=>{const fut=z.d>v39Last.today;return `<div class="${z.d===c.d?'on':''}${fut?' fut':''}"><i>${WK[new Date(z.d+'T00:00:00').getDay()]}</i><span>${fut?'':n(m.me.q[z.d])}</span><span>${fut?'':fm(m.me.s[z.d])}</span></div>`}).join('')}</div>
  ${evs.map(z=>`<div class="e"><em style="color:${(V39_EVT[z.type]||[])[1]}">${(V39_EVT[z.type]||['이슈'])[0]}</em>${esc(v39Short((v39Adv?'':(z.adv||'')+' ')+z.title,18))}</div>`).join('')}`}
function v39TipPlace(){const tip=document.getElementById('v39-tip'),ov=document.getElementById('v39-hot');if(!tip||!ov)return;tip.hidden=false;
 const vp=tip.parentElement.getBoundingClientRect(),r=ov.getBoundingClientRect(),grow=r.height*.32,w=tip.offsetWidth,h=tip.offsetHeight;
 let x=r.right-vp.left+14;if(x+w>vp.width-6)x=r.left-vp.left-w-14;x=Math.max(4,x);
 let y=r.top-grow-vp.top;y=Math.max(4,Math.min(vp.height-h-4,y));tip.style.left=x+'px';tip.style.top=y+'px'}
document.addEventListener('pointermove',e=>{if(route!=='heatmap'||!v39Last)return;const tip=document.getElementById('v39-tip');if(!tip)return;
 const g=e.target.closest&&e.target.closest('#v39-svg .v39-c[data-i]');const c=g&&v39Last.cells[+g.dataset.i];
 if(!c||!c.live||c.d>v39Last.today){if(v39HotCol!=null&&!v39HotT)v39HotT=setTimeout(()=>{v39HotT=0;v39Hot(null)},90);return}
 clearTimeout(v39HotT);v39HotT=0;const newCol=c.col!==v39HotCol;v39Hot(c.col);if(newCol||c.d!==v39HotDay){v39HotDay=c.d;v39WeekTip(c);if(newCol)v39TipPlace()}},{passive:true});
document.addEventListener('pointerleave',()=>{if(v39HotCol!=null)v39Hot(null)});
window.addEventListener('blur',()=>{if(v39HotCol!=null)v39Hot(null)});

// 이미지(PNG): 1월~12월 전체, 왼쪽 이름표·요일 포함
async function v39Png(){const svg=document.getElementById('v39-svg'),st=document.querySelector('.v39-stick');if(!svg||!v39Last)return;v39Animate(true);v39Hot(null);
 const b=v39Last,head=58,W=b.W,H=b.H+head+14;const title=`${v39Adv||((v39Cat||'전체')+' 업종 전체')} — ${v39D.year}년 연간 히트맵`+(v39Adv&&b.kw?` · ${b.kw}`:'');
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
const V39_MED={terrestrial:'지상파',general:'종편',cable:'케이블',radio:'라디오',print:'인쇄',digital_video:'디지털 동영상',digital_banner:'디지털 배너'};
function v39MediaBars(media){const e=Object.entries(media||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);const t=e.reduce((a,[,v])=>a+v,0);if(!t)return '';
 return `<div class="v39-med">${e.map(([k,v])=>`<div class="r"><span>${V39_MED[k]||k}</span><i><b style="width:${Math.max(3,v/t*100).toFixed(1)}%"></b></i><em>${v38Money(v)}</em></div>`).join('')}</div>`}
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('#v39-svg [data-v39-ev]');if(!g||!v39Last)return;v39Hot(null);const z=v39Last.m.ev[+g.dataset.v39Ev];if(!z)return;
 const [lab,color]=V39_EVT[z.type]||['이슈','#7d8a96'],dl=$('#detail');dl.className='v39-evdialog';const d=z.d.replaceAll('-','.'),dd=x=>String(x||'').replaceAll('-','.');
 const img=u=>u?`<img class="v39-evimg" src="${esc(safeUrl(u))}" alt="" onerror="this.remove()">`:'';
 let body='';
 const goCamp=(t)=>z.id?`<div class="v39-go"><p>${t}</p><button type="button" class="primary" data-campaign="${esc(z.id)}">캠페인 분석에서 자세히 보기 →</button></div>`:'';
 if(z.type==='camp'){const cres=(z.cres||[]),med=Object.entries(z.media||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]),mt=med.reduce((a,[,v])=>a+v,0);
  body=`<h2>${esc(z.title)}</h2>
  <div class="v39-kv"><span>광고주</span><b>${esc(z.adv)}</b><span>기간</span><b>${d} ~ ${dd(z.e)}${z.ongoing?' · 진행 중':''}</b><span>광고비</span><b>${v38Money(z.amount)}</b>${(z.products||[]).length?`<span>상품</span><b>${z.products.map(esc).join(', ')}</b>`:''}</div>
  ${cres.length?`<div class="v39-sub">쓰인 소재 ${z.ncre||cres.length}개${(z.ncre||0)>cres.length?` <small>· 광고비 많은 ${cres.length}개</small>`:''}</div><div class="v39-cres">${cres.map(x=>`<div class="c">${x.thumb?`<img src="${esc(safeUrl(x.thumb))}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'noimg',textContent:'${esc(x.kind)}'}))">`:`<i class="noimg">${esc(x.kind)}</i>`}<b>${esc(x.copy||'(카피 없음)')}</b><small>${esc(x.kind)}${x.sec?` · ${x.sec}초`:''}</small></div>`).join('')}</div>`:''}
  ${med.length?`<div class="v39-sub">집행 매체</div><div class="v39-chips">${med.map(([k,v])=>`<span class="m">${V39_MED[k]||k} <em>${Math.round(v/mt*100)}%</em></span>`).join('')}</div>${(z.chans||[]).length?`<div class="v39-chips ch">${z.chans.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`:''}`:''}
  ${goCamp('소재별 집행·채널·기간별 광고비는 캠페인 분석에서 볼 수 있어요.')}`}
 else if(z.type==='creative'){const vs=z.video&&typeof v32Vid==='function'?v32Vid(z.video,z.video_web):null,still=z.storyboard||z.thumb;
  const fb=still?`this.outerHTML='<img class=&quot;v39-evimg${z.storyboard?' sb':''}&quot; src=&quot;${esc(safeUrl(still))}&quot; alt=&quot;&quot;>'`:`this.remove()`;
  body=`${vs?`<video class="v39-evvid" src="${esc(vs)}" ${z.thumb?`poster="${esc(safeUrl(z.thumb))}"`:''} controls autoplay muted playsinline onerror="${fb}"></video>${z.storyboard?`<details class="v39-sbd"><summary>스토리보드 보기</summary><img class="v39-evimg sb" src="${esc(safeUrl(z.storyboard))}" alt="" onerror="this.parentElement.remove()"></details>`:''}`:(z.storyboard?`<img class="v39-evimg sb" src="${esc(safeUrl(z.storyboard))}" alt="" onerror="this.remove()">`:img(z.thumb))}<h2>${esc(z.title)}</h2>
  <div class="v39-kv"><span>광고주</span><b>${esc(z.adv)}</b>${z.product?`<span>상품</span><b>${esc(z.product)}</b>`:''}${z.scene?`<span>장면</span><b>${esc(z.scene)}</b>`:''}<span>TV 방송</span><b>${d} 첫 방송 ~ ${dd(z.e)}</b>${z.spots?`<span>집행</span><b>${Number(z.spots).toLocaleString()}회 · 채널 ${z.channels||0}곳</b>`:''}<span>TV 광고비</span><b>${v38Money(z.amount)} <small>(아덱스 원금액)</small></b></div>
  ${goCamp('이 소재가 든 캠페인의 매체·기간·다른 소재는 캠페인 분석에서 볼 수 있어요.')}`}
 else body=`${img(z.thumb)}<h2>${esc(z.title)}</h2><div class="v39-kv"><span>광고주</span><b>${esc(z.adv)}</b><span>매체</span><b>${esc(z.publisher||'')}</b><span>날짜</span><b>${d}</b>${z.n>1?`<span>같은 소식</span><b>${z.n}건</b>`:''}</div>${z.summary?`<p class="v39-evsum">${esc(z.summary)}…</p>`:''}${z.url?`<a class="primary" href="${esc(safeUrl(z.url))}" target="_blank" rel="noopener">원문 보기 ↗</a>`:''}`;
 $('#detail-body').innerHTML=`<div class="v39-ev-pop"><span class="v39-evtag" style="background:${color}">${lab}</span>${body}</div>`;if(!dl.open)dl.showModal()});

// ---------- 네이버 쿼리 키워드: 보기(누구나) · 수정 요청(비밀번호, 다음 업데이트 때 반영) — 2026-11-05 ----------
var v39KwPw=null;
function v39KwStatus(k){const n=v=>{const x=String(v==null?'':v).replace(/,/g,'').trim();return /^\d+$/.test(x)?+x:null},p=n(k.monthly_pc),m=n(k.monthly_mo);
 const vol=p!=null&&m!=null?`월 ${(p+m).toLocaleString()}회`:(k.monthly_pc||k.monthly_mo)?`월 PC ${esc(k.monthly_pc||'-')} · 모바일 ${esc(k.monthly_mo||'-')}`:'';
 if(k.status==='ok')return [vol,k.first?`${k.first.slice(2,7).replace('-','.')}~ 추정`:''].filter(Boolean).join(' · ');
 if(k.status==='skipped')return `추정 불가${vol?' · '+vol:''}`;if(k.status==='pending')return '다음 업데이트 때 추정';return vol||esc(k.status||'')}
v38KwOpen=async function(adv,cat){const dialog=$('#detail');dialog.className='v38-kwdialog';const st=v32Static();
 const shell=inner=>{$('#detail-body').innerHTML=`<div class="v38-kw v39-kwq"><h2>네이버 쿼리 키워드 · ${esc(adv)}</h2>${inner}</div>`;if(!dialog.open)dialog.showModal()};
 let d;
 if(st){const hm=(typeof v39D!=='undefined'&&v39D)||{};const info=(hm.kwinfo||{})[adv]||((hm.keywords||{})[adv]||[]).map(k=>({keyword:k}))
   .concat(!(hm.kwinfo||{})[adv]&&!(hm.keywords||{})[adv]&&typeof v38D!=='undefined'&&v38D&&v38D.advertiser===adv?(v38D.keywords||[]).map(k=>({keyword:k})):[]);
  d={keywords:info.map(k=>Object.assign({label:k.label||''},k)),requests:[],categories:[]}}
 else{shell('<p class="v38-help">불러오는 중이에요…</p>');try{d=await api('/api/keywords?advertiser='+encodeURIComponent(adv))}catch(e){shell(empty('키워드를 불러오지 못했어요.',e.message));return}}
 const draw=()=>{const lab=x=>{const c=(d.categories||[]).find(c=>c.code===x.category);return (c&&c.label)||x.label||x.category||''};const by={};
  d.keywords.forEach(k=>(by[lab(k)]=by[lab(k)]||[]).push(k));const pend=d.requests||[];const want=(c,k)=>pend.find(r=>r.category===c&&r.keyword===k);
  const groups=Object.entries(by).sort((a,b)=>(a[0]===cat||(d.categories||[]).some(c=>c.code===cat&&c.label===a[0]))?-1:0).map(([l,list])=>`<div class="v38-kwgrp">${l?`<b>${esc(l)}</b>`:''}${list.map(k=>{const r=want(k.category,k.keyword);
   return `<span class="v38-kwchip${r&&r.action==='remove'?' rm':''}">${esc(k.keyword)}<em>${r&&r.action==='remove'?'빼기 요청됨':v39KwStatus(k)}</em>${st?'':r?`<button type="button" class="t" data-v39-kwreq="cancel|${esc(k.category)}|${esc(k.keyword)}" title="요청 취소">취소</button>`:`<button type="button" data-v39-kwreq="remove|${esc(k.category)}|${esc(k.keyword)}" title="빼기 요청" aria-label="${esc(k.keyword)} 빼기 요청">−</button>`}</span>`}).join('')}</div>`).join('')||'<p class="v38-help">아직 키워드가 없어요.</p>';
  const adds=pend.filter(r=>r.action==='add');
  const pendBox=pend.length?`<div class="v39-kwpend"><b>다음 업데이트 때 반영</b>${pend.map(r=>`<span class="${r.action}">${r.action==='add'?'+':'−'} ${esc(r.keyword)} <small>${esc(r.label||'')}</small>${st?'':`<button type="button" data-v39-kwreq="cancel|${esc(r.category)}|${esc(r.keyword)}">취소</button>`}</span>`).join('')}</div>`:'';
  const pw=v39KwPw?`<p class="v39-kwok">비밀번호 확인됨 · 이 창을 닫으면 다시 물어봐요</p>`:`<input type="password" name="pw" placeholder="비밀번호" autocomplete="current-password" class="v39-kwpw">`;
  shell(`<p class="v38-help">검색수(쿼리)는 아래 키워드들의 네이버 추정 검색수를 더한 값이에요.${st?' 키워드 수정 요청은 PC 대시보드에서만 할 수 있어요.':' 키워드를 바꾸려면 수정 요청을 남기세요. 비밀번호를 확인한 뒤 저장되고, <b>다음 업데이트 때 반영</b>돼요(추가한 키워드는 그때 약 2년치를 추정).'}</p>${groups}${pendBox}
   ${st?'':`<form class="v38-kwadd v39-kwform" data-v39-kwform><select name="cat">${(d.categories||[]).map(c=>`<option value="${esc(c.code)}" ${c.code===cat||c.label===cat?'selected':''}>${esc(c.label)}</option>`).join('')}</select><input name="kw" placeholder="추가할 키워드 (예: ${esc(adv)}정수기)" maxlength="40">${pw}<button type="submit" class="primary">추가 요청</button></form>`}`)};
 draw();window.__v39kw={adv,cat,set:x=>{d=x;draw()}}};
async function v39KwReq(action,category,keyword){const k=window.__v39kw;if(!k)return;const f=document.querySelector('[data-v39-kwform]');const pw=v39KwPw||(f&&f.pw&&f.pw.value);
 if(!pw){toast('비밀번호를 먼저 입력하세요.');f&&f.pw&&f.pw.focus();return}
 try{const r=await api('/api/keywords',{category,advertiser:k.adv,keyword,action,password:pw});v39KwPw=pw;k.set(r);
  toast(action==='cancel'?'요청을 취소했어요.':'수정 요청을 저장했어요. 다음 업데이트 때 반영돼요.')}
 catch(e){if(/비밀번호/.test(e.message||'')){v39KwPw=null;k.set&&window.__v39kw&&toast('비밀번호가 맞지 않아요.');const g=document.querySelector('[data-v39-kwform] [name=pw]');if(g){g.value='';g.focus()}}else toast('저장하지 못했어요: '+e.message)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v39-kwreq]');if(!b)return;e.preventDefault();e.stopPropagation();const [a,c,kw]=b.dataset.v39Kwreq.split('|');v39KwReq(a,c,kw)},true);
document.addEventListener('submit',e=>{const f=e.target.closest&&e.target.closest('[data-v39-kwform]');if(!f)return;e.preventDefault();e.stopPropagation();const kw=f.kw.value.trim();if(!kw){toast('추가할 키워드를 입력하세요.');f.kw.focus();return}v39KwReq('add',f.cat.value,kw)},true);
document.addEventListener('close',e=>{if(e.target&&e.target.id==='detail')v39KwPw=null},true);
// 히트맵 제목 아래 단추: 광고주면 그 광고주 키워드, 업종 전체면 광고주별 목록
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v39-kwopen]');if(!b||!v39D)return;e.preventDefault();
 if(v39Adv)return v38KwOpen(v39Adv,v39Cat||'');
 const info=v39D.kwinfo||{},kw=v39D.keywords||{},advs=Object.keys(v39D.advertisers||{}).sort((a,b)=>a==='코웨이'?-1:b==='코웨이'?1:a.localeCompare(b,'ko'));const dialog=$('#detail');dialog.className='v38-kwdialog';
 $('#detail-body').innerHTML=`<div class="v38-kw v39-kwq"><h2>네이버 쿼리 키워드 · ${esc(v39Cat||'전체')} 광고주별</h2><p class="v38-help">업종 전체 검색수는 아래 광고주들 키워드의 추정 검색수 합계예요. 광고주 이름을 누르면 그 광고주 키워드를 보고 수정 요청할 수 있어요.</p>
  ${advs.map(a=>{const L=info[a]||(kw[a]||[]).map(k=>({keyword:k}));return `<div class="v38-kwgrp"><b><button type="button" class="v39-kwadv" data-v39-kwadv="${esc(a)}">${esc(a)} ›</button></b>${L.length?L.map(k=>`<span class="v38-kwchip">${esc(k.keyword)}<em>${v39KwStatus(k)}</em></span>`).join(''):'<span class="v39-kwnone">키워드 없음 · 광고비만 표시</span>'}</div>`}).join('')}</div>`;
 if(!dialog.open)dialog.showModal()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v39-kwadv]');if(!b)return;e.preventDefault();v38KwOpen(b.dataset.v39Kwadv,v39Cat||'')});

// 전체 화면 보기 (11-06 10:15) — 엑셀 단추 오른쪽
var V39_GROW='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>';
var V39_SHRINK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>';
function v39IsFull(){return !!document.fullscreenElement||document.body.classList.contains('v39-max')}
function v39FullCls(){document.body.classList.toggle('v39-full',v39IsFull())}
function v39Max(on){document.body.classList.toggle('v39-max',on);v39FullCls();if(route==='heatmap'&&v39D)try{v39Draw(false)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v39-full]');if(!b)return;e.preventDefault();
 if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return}if(document.body.classList.contains('v39-max')){v39Max(false);return}
 const c=document.getElementById('content');if(c&&c.requestFullscreen)c.requestFullscreen().catch(()=>v39Max(true));else v39Max(true)});  // 브라우저가 막으면 화면 꽉 채우기로
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('v39-max')&&!document.querySelector('dialog[open]'))v39Max(false)});
document.addEventListener('fullscreenchange',()=>{v39FullCls();if(route!=='heatmap'||!v39D)return;try{v39Draw(false)}catch(e){}});

// ---------- 마우스 휠로 카메라 각도: 아래로 굴리면 위에서 본 2D, 위로 굴리면 3D · 페이지 자체는 스크롤 없이 화면에 맞춤 (11-06 14:13) ----------
var v39K=0,v39KRaf=0,v39H=null;
function v39Recam(){const sv=document.getElementById('v39-svg');if(!sv||!v39Last||route!=='heatmap')return;v39Hot(null);++v39Anim;
 const m=v39Last.m,b=v39Build(m);v39Last={...b,today:m.today,m};sv.setAttribute('width',b.W);sv.setAttribute('height',b.H);sv.setAttribute('viewBox',`0 0 ${b.W} ${b.H}`);sv.innerHTML=b.svg;
 const st=document.querySelector('.v39-stick');if(st)st.setAttribute('height',b.H);
 const els=[...sv.querySelectorAll(':scope>.v39-c')];b.cells.forEach((c,k)=>v39Paint(els[k],c,1));const t=document.getElementById('v39-today');if(t)t.innerHTML=v39Today();
 sv.classList.add('v39-on','v39-ready')}
function v39Lock(on){document.documentElement.classList.toggle('v39-lock',!!on)}
function v39Track(){}
function v39FitH(){if(route!=='heatmap'||v39IsFull())return null;const sv=document.getElementById('v39-svg'),card=document.querySelector('#content .v39-card');if(!sv||!card)return null;
 const below=card.querySelector('.v39-below'),foot=document.querySelector('main>footer');const top=sv.getBoundingClientRect().top+window.scrollY;
 const need=(below?below.offsetHeight+10:30)+parseFloat(getComputedStyle(card).paddingBottom||0)+(foot?foot.offsetHeight+14:20)+18;
 return Math.max(300,Math.floor(innerHeight-top-need))}
function v39Fit(){const H=v39FitH();if(H&&v39Last&&Math.abs(H-v39Last.H)>3){v39H=H;v39Recam();v39Scroll0()}}
document.addEventListener('wheel',e=>{if(route!=='heatmap'||!v39Last)return;if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 if(e.target.closest&&e.target.closest('dialog,.v39-tip,select,.v39-ev-pop,[data-v39-pop]'))return;const dl=document.querySelector('dialog[open]');if(dl)return;
 e.preventDefault();v39K=Math.max(0,Math.min(1,v39K+e.deltaY/(e.deltaMode===1?12:700)));if(!v39KRaf)v39KRaf=requestAnimationFrame(()=>{v39KRaf=0;v39Recam()})},{passive:false});
window.addEventListener('resize',()=>{if(route==='heatmap'&&v39Last){v39H=null;setTimeout(v39Fit,60)}});

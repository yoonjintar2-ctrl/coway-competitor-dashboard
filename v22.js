/* v22 — 2026-11-03: 로딩은 Media Dashboard 구성(아이소메트릭 장면+가운데 카드)을 코웨이 색으로. 그래프 색은 기존 유지.
   팔레트: 잉크 #24262a · 회색 단계 #383c40 / #5c6165 / #7c8085 / #a4a8ac / #c3c6c9 · 강조 #96635e(로즈 브라운) · #6f8a76(세이지) */
var V22={ink:'#24262a',g1:'#2b2e31',g2:'#383c40',g3:'#4d5257',g4:'#5c6165',g5:'#7c8085',g6:'#a4a8ac',g7:'#c3c6c9',acc:'#96635e',sage:'#6f8a76'};
// (그래프 색은 코웨이 기존 톤 유지 — 2026-11-03 원복)
// 4) 로딩: 아이소메트릭 무채색 장면 + 가운데 반투명 카드
function v22Iso(x,y,z){const s=14;return [(x-y)*0.866*s,(x+y)*0.5*s-z*s]}
function v22Box(x,y,w,d,h,cls,delay){const P=(a,b,c)=>v22Iso(a,b,c).map(v=>v.toFixed(1)).join(',');
 const top=[P(x,y,h),P(x+w,y,h),P(x+w,y+d,h),P(x,y+d,h)].join(' '),left=[P(x,y+d,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x,y+d,h)].join(' '),right=[P(x+w,y,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x+w,y,h)].join(' ');
 const [bx,by]=v22Iso(x+w,y+d,0);return `<g class="${cls}" style="transform-origin:${bx.toFixed(1)}px ${by.toFixed(1)}px;animation-delay:${delay}s"><polygon class="l" points="${left}"/><polygon class="r" points="${right}"/><polygon class="t" points="${top}"/></g>`}
function v22Scene(){
 const plate=[v22Iso(0,0,0),v22Iso(30,0,0),v22Iso(30,22,0),v22Iso(0,22,0)].map(p=>p.join(',')).join(' ');
 let grid='';for(let i=1;i<30;i+=2){const a=v22Iso(i,0,0),b=v22Iso(i,22,0);grid+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}for(let j=1;j<22;j+=2){const a=v22Iso(0,j,0),b=v22Iso(30,j,0);grid+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}
 const hs=[3,5,4,7,6,9,8,11,7,5,4,3];let bars='';hs.forEach((h,i)=>{bars+=v22Box(2+i*1.6,2,1.1,1.1,h*0.55,'v22-bar',i*0.08)});
 let lows='';[5,4,6,3].forEach((h,i)=>{lows+=v22Box(4+i*2.2,15,1.6,4.5,h*0.25,'v22-bar soft',0.4+i*0.1)});
 let hm='';for(let r=0;r<5;r++)for(let c=0;c<7;c++){const p=[v22Iso(20+c*1.2,13+r*1.2,0),v22Iso(20.9+c*1.2,13+r*1.2,0),v22Iso(20.9+c*1.2,13.9+r*1.2,0),v22Iso(20+c*1.2,13.9+r*1.2,0)].map(q=>q.join(',')).join(' ');hm+=`<polygon class="v22-hm" style="animation-delay:${((r*7+c)%9)*0.12}s" points="${p}"/>`}
 const line=[[2,1,7],[6,1,8.5],[10,1,8],[14,1,11],[18,1,12],[22,1,16]].map(([x,y,z])=>v22Iso(x,y,z).map(v=>v.toFixed(1)).join(',')).join(' ');
 const ring=v22Iso(23,6,0);
 return `<svg class="v22-scene" viewBox="-320 -190 740 580" aria-hidden="true"><polygon class="v22-plate" points="${plate}"/><g class="v22-grid">${grid}</g>${hm}${lows}${bars}<polyline class="v22-line" points="${line}"/><ellipse class="v22-ring" cx="${ring[0]}" cy="${ring[1]}" rx="46" ry="26"/><ellipse class="v22-ring2" cx="${ring[0]}" cy="${ring[1]}" rx="46" ry="26"/></svg>`;
}
function v17Loader(node){if(node.dataset.v22)return;node.dataset.v22='1';node.dataset.v17='1';const text=node.textContent.trim();node.classList.add('v22-loading');
 node.innerHTML=`${v22Scene()}<div class="v22-card"><span>COWAY COMPETITIVE INTELLIGENCE</span><b>데이터 집계 중<i></i><i></i><i></i></b><p>${esc(text||'자료를 집계하고 있습니다.')}</p><em><u></u></em></div>`}
document.querySelectorAll('#content .loading').forEach(n=>{delete n.dataset.v17;v17Loader(n)});
v17IsNew=function(c){return c.review_status!=="evergreen"&&c.review_status!=="yt_candidate"&&v3Day(listing.period.end)-v3Day(c.first_seen)<=60};

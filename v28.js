/* v28 — 2026-11-03: YouTube 선공개 캡슐은 광고비 확인 전까지 진행 중(우측 벽까지 열림), 트리맵은 대분류를 가로 띠로 쌓고 중분류를 나란히 배치 */
(function(){const base=v18Open;v18Open=function(c){return c.review_status==='yt_candidate'?true:base(c)};v17Open=v18Open})();
// 트리맵: 대분류(TV·인쇄…) = 위아래 띠, 중분류(지상파·케이블&종편…) = 띠 안에서 좌우로 나란히, 매체 = squarify
function v28Bands(items,x,y,w,h){
 // 띠 높이는 금액의 제곱근 비례(작은 대분류도 글자가 들어갈 높이 확보), 최소 30%
 const list=items.filter(i=>i.amount>0).slice().sort((a,b)=>b.amount-a.amount);if(!list.length)return [];
 const wt=list.map(i=>Math.sqrt(i.amount)),sum=wt.reduce((s,v)=>s+v,0),MIN=list.length>1?30:0;let hs=wt.map(v=>v/sum*h);
 const lack=hs.reduce((s,v)=>s+Math.max(0,MIN-v),0);if(lack>0){const room=hs.reduce((s,v)=>s+(v>MIN?v-MIN:0),0);hs=hs.map(v=>v<MIN?MIN:MIN+(v-MIN)*(1-lack/room))}
 let cy=y;return list.map((r,i)=>{const o={...r,x,y:cy,w,h:hs[i]};cy+=hs[i];return o});
}
function v28Cols(items,x,y,w,h){
 // 중분류는 좌우로 나란히. 띠 안에서 8% 미만인 작은 중분류는 맨 오른쪽 한 칸에 위아래로 쌓음
 const list=items.filter(i=>i.amount>0).slice().sort((a,b)=>(a.name==='지상파'?-1:b.name==='지상파'?1:0)||b.amount-a.amount);const total=list.reduce((s,i)=>s+i.amount,0);if(!total)return [];
 let big=list.filter(i=>i.amount/total>=.08),small=list.filter(i=>i.amount/total<.08);if(!big.length||small.length<2){big=list;small=[]}
 const st=small.reduce((s,i)=>s+i.amount,0),sw=small.length?Math.max(st/total*w,16):0,bt=big.reduce((s,i)=>s+i.amount,0);
 let cx=x;const out=big.map(r=>{const cw=r.amount/bt*(w-sw);const o={...r,x:cx,y,w:cw,h};cx+=cw;return o});
 const sq2=small.map(i=>Math.sqrt(i.amount)),ss=sq2.reduce((s,v)=>s+v,0);let cy=y;for(const [k,r] of small.entries()){const rh=sq2[k]/ss*h;out.push({...r,x:cx,y:cy,w:sw,h:rh});cy+=rh}
 return out;
}
var v28BaseTree=treeMap;
treeMap=function(rows){
 const _p=partition;
 partition=(items,x,y,w,h)=>items.length&&items[0].groups?v28Bands(items,x,y,w,h):items.length&&items[0].children?v28Cols(items,x,y,w,h):v8Squarify(items,x,y,w,h);
 // v8 래퍼가 partition을 squarify로 바꾸므로 그 안에서도 이 분기를 쓰도록 v8Squarify를 잠시 감쌈
 const sq=v8Squarify;v8Squarify=(items,x,y,w,h)=>items.length&&items[0].groups?v28Bands(items,x,y,w,h):items.length&&items[0].children?v28Cols(items,x,y,w,h):sq(items,x,y,w,h);
 try{return v28BaseTree(rows).replace('class="treemap v4-treemap"','class="treemap v4-treemap v28-bands"')}finally{partition=_p;v8Squarify=sq}
};
// 경쟁사 광고비 비교: 브랜드 고유색이 비슷해(파랑·빨강 계열) 구분이 어려움 → 이 그래프에서만 서로 다른 색 계열로 표시
var V28_ANNUAL_COLORS=['#1f8fd6','#f08a24','#2fa36b','#8b5cc9','#e0485f','#c9a227','#4b5d73'],v28AnnualMap={};
function v28WithAnnualColors(fn){const saved={};for(const [n,c] of Object.entries(v28AnnualMap)){saved[n]=v3BrandPalette[n];v3BrandPalette[n]=c}
 try{return fn()}finally{for(const [n,c] of Object.entries(saved)){if(c===undefined)delete v3BrandPalette[n];else v3BrandPalette[n]=c}}}
var v28BaseAnnual=annualPanel;
annualPanel=function(d){
 const tot=new Map();for(const r of d.annual||[])tot.set(r.advertiser,(tot.get(r.advertiser)||0)+r.amount);
 const sel=d.campaign.advertiser,names=[sel,...[...tot.keys()].filter(a=>a!==sel).sort((p,q)=>tot.get(q)-tot.get(p))];
 v28AnnualMap={};let k=1;names.forEach(n=>{v28AnnualMap[n]=n==='코웨이'?V28_ANNUAL_COLORS[0]:V28_ANNUAL_COLORS[1+((k++-1)%(V28_ANNUAL_COLORS.length-1))]});  // 코웨이는 항상 파랑
 return v28WithAnnualColors(()=>v28BaseAnnual(d));
};
var v28BaseAnnualCard=v12AnnualCard;v12AnnualCard=function(i,ev){return v28WithAnnualColors(()=>v28BaseAnnualCard(i,ev))};
// 설정 > '외부 연결' 탭: 네이버 데이터랩 API 키(주차별 쿼리 추이 전체 브랜드·데일리 갱신용). 키 값은 화면·응답에 다시 표시하지 않음
v7Tabs.push(['api','외부 연결']);
function v28ApiCard(){return `<section class="glass section v28-naver">${header('네이버 데이터랩 API','주차별 쿼리 추이를 품목 내 전체 브랜드로 수집하고 매일 갱신합니다. 네이버 개발자센터 애플리케이션(데이터랩 검색어 트렌드 사용)의 Client ID/Secret을 입력하세요.')}<p class="v28-state" id="v28-naver-state">연결 상태 확인 중…</p><form id="v28-naver-form" class="category-form" autocomplete="off"><label>Client ID<input name="client_id" required autocomplete="off"></label><label>Client Secret<input name="client_secret" type="password" required autocomplete="new-password"></label><button type="submit">저장</button></form><p class="footnote">저장한 값은 이 PC에만 암호화되어 보관되며 화면에 다시 표시하지 않습니다. 키가 없으면 기존 브라우저 검증본(품목별 5개 브랜드)을 그대로 보여줍니다. 수집 키워드: 품목별 아덱스 관측 광고주 전체(72개), 묶음마다 같은 기준 키워드를 넣어 품목 안에서 서로 비교할 수 있게 보정합니다.</p></section>`}
var v28BaseDraw=v7Draw;
v7Draw=function(){
 if(v7Tab!=='api')return v28BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}${v28ApiCard()}</div>`;
 if(listing?.static){document.getElementById('v28-naver-state').textContent='읽기 전용 사이트 · 키 입력은 PC의 로컬 대시보드에서만 할 수 있습니다.';document.getElementById('v28-naver-form').remove();return}
 (async()=>{const el=document.getElementById('v28-naver-state');try{const r=await api('/api/activity?'+new URLSearchParams({category:listing.categories[0]?.code||'',start:listing.period.end,end:listing.period.end}));el.textContent=r.settings?.naver_configured?'연결됨 · 매일 수집 때 전체 브랜드 검색 추이를 갱신합니다.':'연결 대기 · 키를 입력하면 다음 수집부터 전체 브랜드로 갱신합니다.';el.classList.toggle('on',!!r.settings?.naver_configured)}catch(e){el.textContent='연결 상태를 확인하지 못했습니다.'}})();
};
document.addEventListener('submit',async e=>{if(e.target.id!=='v28-naver-form')return;e.preventDefault();e.stopImmediatePropagation();const f=e.target;try{await api('/api/naver-credentials',Object.fromEntries(new FormData(f)));f.reset();toast('저장했습니다. 다음 수집부터 전체 브랜드 검색 추이를 갱신합니다.');const el=document.getElementById('v28-naver-state');if(el){el.textContent='연결됨 · 매일 수집 때 전체 브랜드 검색 추이를 갱신합니다.';el.classList.add('on')}}catch(err){toast(err.message)}},true);

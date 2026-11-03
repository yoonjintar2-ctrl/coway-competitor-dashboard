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

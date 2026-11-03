/* v8 — 2026-11-03 Claude 3차: 타임라인 고정 머리글·광고비순 정렬·직사각형 막대·팝업 동작, 범례/설명/소액 단추 제거, 트리맵 정렬, 주차 그래프 여백. */
showSmall=true;
// 광고주 드롭다운에 품목 수 표시
var v8BaseFilters=updateFilters;
updateFilters=function(){v8BaseFilters();const counts=new Map();for(const r of listing.advertisers){if(!counts.has(r.advertiser))counts.set(r.advertiser,new Set());counts.get(r.advertiser).add(r.category)}for(const o of document.querySelectorAll('#advertiser-filter option')){const n=counts.get(o.value)?.size;if(n&&!o.dataset.v8){o.textContent=`${o.value} · ${n}품목`;o.dataset.v8='1'}}};
// 광고주 정렬: 품목별 최근 12개월 광고비 많은 순
placeBrandFlights=function(rows,left,right){
 const by=new Map();for(const c of rows){if(!by.has(c.advertiser))by.set(c.advertiser,[]);by.get(c.advertiser).push(c)}
 const cat=rows[0]?.category,spend=new Map();for(const c of listing.campaigns){if(c.category===cat)spend.set(c.advertiser,(spend.get(c.advertiser)||0)+c.adjusted_amount)}
 const groups=[...by].map(([name,items])=>({name,items:items.sort((a,b)=>a.first_seen.localeCompare(b.first_seen)||a.id.localeCompare(b.id))})).sort((a,b)=>(spend.get(b.name)||0)-(spend.get(a.name)||0)||a.name.localeCompare(b.name));
 const items=[];let base=0;
 for(const g of groups){const local=[];for(const c of g.items){if(c._left+c._span<left||c._left>right)continue;const begin=Math.max(left,c._left),finish=Math.max(Math.min(right,c._left+c._span),begin+(c._labelDays||6));let lane=0;while(local[lane]!==undefined&&begin<=local[lane]+1)lane++;local[lane]=finish;items.push({c,lane:base+lane})}base+=local.length}
 return {items,count:base};
};
// 범례·설명·소액 단추 제거
var v8BaseTimeline=timeline;
timeline=function(){let h=v8BaseTimeline();h=h.replace(/<div class="gantt-intro">[\s\S]*?<\/div><div class="gantt-legend unified-legend">[\s\S]*?<\/div><div class="gantt-controls">/,'<div class="gantt-controls">');return h};
// 화면 높이에 맞춘 스크롤 상자 → 머리글(날짜)과 왼쪽 열 고정, 오른쪽 여백 없이 꽉 차게
var v8BaseMount=mountTimeline;
mountTimeline=function(){const el=$('#gantt-scroll');if(el){const top=el.getBoundingClientRect().top+window.scrollY;el.style.maxHeight=Math.max(360,innerHeight-Math.min(top,170)-24)+'px'}v8BaseMount();if(el){el.scrollLeft=v6Saved&&v6Saved.left&&v6Saved._used?el.scrollLeft:el.scrollWidth-el.clientWidth}};
// 팝업: 막대 위에서만 열고, 막대·팝업 밖으로 나가면 닫음
var v8Hide=null,v8Switch=null;
function v8Box(){return $('#campaign-hover')}
function v8Close(){clearTimeout(v8Switch);const b=v8Box();if(b)b.hidden=true;v3HoverId=''}
document.addEventListener('pointerover',e=>{
 const bar=e.target.closest('[data-gantt]'),box=e.target.closest('#campaign-hover');
 if(!bar&&!box)return;e.stopImmediatePropagation();clearTimeout(v8Hide);
 if(box){clearTimeout(v8Switch);return}
 const b=v8Box();if(!b||b.hidden||!v3HoverId||v3HoverId===bar.dataset.gantt){clearTimeout(v8Switch);if(v3HoverId!==bar.dataset.gantt)v5Show(bar.dataset.gantt,bar);return}
 clearTimeout(v8Switch);v8Switch=setTimeout(()=>v5Show(bar.dataset.gantt,bar),240);
},true);
document.addEventListener('pointerout',e=>{
 const from=e.target.closest('[data-gantt],#campaign-hover');if(!from)return;e.stopImmediatePropagation();
 const to=e.relatedTarget&&e.relatedTarget.closest?e.relatedTarget.closest('[data-gantt],#campaign-hover'):null;
 if(to)return;clearTimeout(v8Switch);clearTimeout(v8Hide);v8Hide=setTimeout(v8Close,160);
},true);
// 트리맵: squarified 배치(행이 가지런히) + 작은 대분류(전체의 6% 미만)는 아래 줄에 작은 네모로
function v8Squarify(items,x,y,w,h){
 const out=[];let rest=items.filter(i=>i.amount>0).slice().sort((a,b)=>b.amount-a.amount);const total=rest.reduce((s,i)=>s+i.amount,0);if(!total)return out;
 const scale=(w*h)/total;let X=x,Y=y,W=w,H=h;
 const worst=(row,side)=>{const s=row.reduce((a,r)=>a+r.amount*scale,0);let m=0;for(const r of row){const a=r.amount*scale;m=Math.max(m,Math.max(side*side*a/(s*s),(s*s)/(side*side*a)))}return m};
 while(rest.length){const side=Math.min(W,H);let row=[rest[0]],i=1;while(i<rest.length&&worst([...row,rest[i]],side)<=worst(row,side)){row.push(rest[i]);i++}rest=rest.slice(i);const s=row.reduce((a,r)=>a+r.amount*scale,0);
  if(W>=H){const cw=s/H;let cy=Y;for(const r of row){const rh=r.amount*scale/cw;out.push({...r,x:X,y:cy,w:cw,h:rh});cy+=rh}X+=cw;W-=cw}else{const rh=s/W;let cx=X;for(const r of row){const cw=r.amount*scale/rh;out.push({...r,x:cx,y:Y,w:cw,h:rh});cx+=cw}Y+=rh;H-=rh}}
 return out;
}
var v8BaseTree=treeMap;
treeMap=function(rows){
 const valid=rows.filter(r=>r.amount>0);const total=valid.reduce((a,r)=>a+r.amount,0);if(!total)return v8BaseTree(rows);
 const byParent=new Map();for(const r of valid)byParent.set(r.parent,(byParent.get(r.parent)||0)+r.amount);
 const small=[...byParent].filter(([p,v])=>v/total<.06).map(([p])=>p),big=valid.filter(r=>!small.includes(r.parent));
 const _p=partition;partition=(items,x,y,w,h)=>v8Squarify(items,x,y,w,h);let html;try{html=v8BaseTree(big.length?big:valid)}finally{partition=_p}
 if(big.length&&small.length){const pal={'TV':'#219dd6','디지털':'#27b0aa','인쇄':'#9b8ac7','라디오':'#d5ab67'};
  const strip=`<div class="v8-small">${small.map(p=>{const v=byParent.get(p),c=pal[p]||'#7f9aab';const kids=valid.filter(r=>r.parent===p).sort((a,b)=>b.amount-a.amount);return `<div class="v8-small-item" style="--c:${c}" tabindex="0" data-tree-tip="${esc(p+' 전체 · '+kids.map(k=>k.group+(k.sub?' '+k.sub:'')+' '+k.name).slice(0,4).join(', '))}|${number(v)}|${v4PctLabel(v4Pct(v,total))}"><i></i><b>${esc(p)}</b><span>${v4Money(v)}원 · ${v4PctLabel(v4Pct(v,total))}</span></div>`}).join('')}</div>`;
  html=html.replace('<div class="legend">',strip+'<div class="legend">')}
 return html;
};

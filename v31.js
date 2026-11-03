/* v31 — 2026-11-03 19:05: '최근 60일 새로 시작한 캠페인' → '최근 시작한 캠페인' + 오른쪽 작은 글씨 '60일 기준'. */
(function(){if(typeof v17Recent!=='function')return;const base=v17Recent;
 v17Recent=function(...a){return String(base.apply(this,a))
  .replace(/<b>최근 (?:60일|2개월) 새로 시작한 캠페인<\/b>/,'<b>최근 시작한 캠페인</b>')
  .replace(/(<div class="v17-recent-head"><b>[^<]*<\/b>)<small>/,'$1<small><span class="v31-basis">60일 기준</span> · ')}})();
// 첫 화면이 모든 스크립트가 올라오기 전에 그려진 경우(v3.js 의 load() 가 먼저 끝남) 최신 화면으로 한 번 다시 그림
try{if(typeof render==='function'&&typeof listing!=='undefined'&&listing&&listing.campaigns&&document.querySelector('#content')?.children.length)render()}catch(e){}
// 19:15 — 캠페인 분석: '주차별 매체 광고비'와 '주차별 쿼리 추이' 하단 높이를 그래프 높이로 맞춤.
// 글꼴이 늦게 로드되거나 쿼리 그래프(성별 전환 등)가 바뀌어 높이가 달라질 때마다 다시 맞춤.
(function(){let ro=null,t=0;
 function fit(){for(let i=0;i<4;i++){try{const two=document.querySelector('.v5-two'),a=two&&two.querySelector('.v12-weekly-panel'),b=two&&two.querySelector('.v12-trend-panel');if(!a||!b||Math.abs(a.offsetHeight-b.offsetHeight)<3)return;v12FitWeekly()}catch(e){return}}}
 function later(){clearTimeout(t);t=setTimeout(fit,60)}
 function watch(){const two=document.querySelector('.v5-two'),b=two&&two.querySelector('.v12-trend-panel');if(!b||b.__v31)return;b.__v31=1;
  if(!ro&&window.ResizeObserver)ro=new ResizeObserver(later);if(ro){ro.observe(b);if(!two.__v31){two.__v31=1;ro.observe(two)}}later()}
 // 타임라인: 기간 맨 앞에서 시작하는 캡슐이 왼쪽 광고주 칸 경계에 닿지 않게 8px 띄움(끝 위치는 그대로)
 const GAP=8;
 function inset(){for(const c of document.querySelectorAll('#gantt-scroll .gantt-bar')){const l=c.style.left||'',w=c.style.width||'',key=l+'|'+w;if(c.dataset.v31i===key)continue;
  const ml=/^calc\(var\(--day\)\s*\*\s*([\d.]+)\)$/.exec(l),mw=/^calc\(var\(--day\)\s*\*\s*([\d.]+)\)$/.exec(w);if(!ml||!mw){c.dataset.v31i=key;continue}
  const L=+ml[1],W=+mw[1];if(L>12){c.dataset.v31i=key;continue}
  c.style.left=`max(${GAP}px, calc(var(--day) * ${L}))`;c.style.width=`calc(var(--day) * ${L+W} - max(${GAP}px, calc(var(--day) * ${L})))`;c.dataset.v31i=c.style.left+'|'+c.style.width}}
 let q=false;function tick(){if(q)return;q=true;requestAnimationFrame(()=>{q=false;watch();inset()})}
 new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);tick();
})();

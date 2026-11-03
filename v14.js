/* v14 — 2026-11-03: 타임라인 막대·캠페인명 클릭 → 바로 분석, 경쟁사 광고비 영역형 표식 제거, 쿼리 추이 미수집 안내 문구 */
document.addEventListener('click',async e=>{
 const bar=e.target.closest('#gantt-scroll [data-gantt]');if(!bar||route!=='timeline')return;
 e.preventDefault();e.stopImmediatePropagation();
 const el=$('#gantt-scroll');try{v6Saved={left:el?el.scrollLeft:0,top:window.scrollY,restore:false}}catch(_){}
 const box=$('#campaign-hover');if(box)box.hidden=true;
 activeId=bar.dataset.gantt;route='analysis';await render();window.scrollTo({top:0,behavior:'instant'});
},true);
var v14BaseAnnual=annualPanel;
annualPanel=function(d){return v14BaseAnnual(d).replace(/<circle class="v12-annual-pt"[^>]*\/>/g,'')};
var v14BaseTrend=v5TrendPanel;
v5TrendPanel=function(d){
 const h=v14BaseTrend(d);
 return h.replace('이 광고주의 주간 검색 추이 연결을 확인 중입니다.',`${esc(d.campaign.advertiser)}의 네이버 검색 추이는 아직 수집되지 않았습니다. (네이버 데이터랩은 한 번에 5개 키워드까지만 비교할 수 있어, 품목별 상위 5개 브랜드만 먼저 수집된 상태입니다.)`);
};

/* v18 — 2026-11-03: 집행 중·신규 캠페인 캡슐은 타임라인 오른쪽 끝까지 평평하게 열림, 세로 스크롤 제거(페이지 스크롤만), 마우스 드래그로 좌우 이동 */
function v18Open(c){
 if(c.review_status==='yt_candidate'||c.review_status==='evergreen')return false;
 const latest=v3Day(c.latest_source_day||listing.period.end);
 return !!c.ongoing_observed||latest-v3Day(c.last_seen)<=14||v17IsNew(c);
}
v17Open=v18Open;
var v18BasePlace=placeBrandFlights;
placeBrandFlights=function(rows,left,right){
 const {days}=v17Range();for(const c of rows)if(v18Open(c))c._span=Math.max(c._span||1,days+V17_EXTRA-(c._left||0));
 return v18BasePlace(rows,left,Math.max(right,days+V17_EXTRA));
};
var v18BaseMount=mountTimeline;
mountTimeline=function(){v18BaseMount();const el=$('#gantt-scroll');if(el){el.style.maxHeight='none'}};
// 드래그로 좌우 이동(캡슐 클릭은 그대로)
(function(){let down=null,moved=false;
 document.addEventListener('pointerdown',e=>{const el=e.target.closest('#gantt-scroll');if(!el||e.button!==0)return;down={x:e.clientX,left:el.scrollLeft,el};moved=false});
 document.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>4){moved=true;down.el.classList.add('v18-drag');down.el.scrollLeft=down.left-dx}});
 document.addEventListener('pointerup',()=>{if(down)down.el.classList.remove('v18-drag');setTimeout(()=>{moved=false},0);down=null});
 document.addEventListener('click',e=>{if(moved&&e.target.closest('#gantt-scroll')){e.preventDefault();e.stopImmediatePropagation()}},true);
})();

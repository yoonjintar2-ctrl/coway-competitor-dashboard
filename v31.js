/* v31 — 2026-11-03 19:05: '최근 60일 새로 시작한 캠페인' → '최근 시작한 캠페인' + 오른쪽 작은 글씨 '60일 기준'. */
(function(){if(typeof v17Recent!=='function')return;const base=v17Recent;
 v17Recent=function(...a){return String(base.apply(this,a))
  .replace(/<b>최근 (?:60일|2개월) 새로 시작한 캠페인<\/b>/,'<b>최근 시작한 캠페인</b>')
  .replace(/(<div class="v17-recent-head"><b>[^<]*<\/b>)<small>/,'$1<small><span class="v31-basis">60일 기준</span> · ')}})();
// 첫 화면이 모든 스크립트가 올라오기 전에 그려진 경우(v3.js 의 load() 가 먼저 끝남) 최신 화면으로 한 번 다시 그림
try{if(typeof render==='function'&&typeof listing!=='undefined'&&listing&&listing.campaigns&&document.querySelector('#content')?.children.length)render()}catch(e){}

/* 부팅 게이트 (11-06 15:34): v2~v41 스크립트가 차례로 덮어쓰는 구조라, 스크립트를 다 읽기 전에 자료가 먼저 도착하면
   옛 버전 화면(타임라인·로딩)이 잠깐 그려졌다가 바뀜. 모든 스크립트가 실행된 뒤(DOMContentLoaded)에만 요청을 내보냄. */
(function(){if(document.readyState!=='loading')return;const real=window.fetch.bind(window);let open=false,go;const ready=new Promise(r=>go=r);
 window.fetch=function(...a){return open?real(...a):ready.then(()=>real(...a))};
 document.addEventListener('DOMContentLoaded',()=>{open=true;go()},{once:true})})();
/* 로딩 그림: 마지막으로 정한 물방울 LOADING(v24) 하나만 씀. 예전 v17·v19·v22·v23 로딩이 차례로 잠깐씩 보이던 문제 정리 (11-06 15:34) */
function v17Loader(node){if(node.dataset.v24)return;node.dataset.v24='1';['v23','v22','v17'].forEach(k=>node.dataset[k]='1');node.classList.remove('v22-loading','v23-loading');node.classList.add('v24-loading');
 const id='v24'+Math.random().toString(36).slice(2,7);
 const drop='M100 6 C100 6 74 38 74 58 A26 26 0 0 0 126 58 C126 38 100 6 100 6 Z';
 const txt=`<text x="100" y="128" text-anchor="middle" class="v24-word">LOADING</text>`;
 node.innerHTML=`<svg class="v24-svg" viewBox="0 0 200 140" aria-label="LOADING"><defs><clipPath id="${id}"><path d="${drop}"/>${txt}</clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fbde9"/><stop offset="1" stop-color="#1479b4"/></linearGradient></defs><g class="v24-base"><path d="${drop}"/>${txt}</g><g clip-path="url(#${id})"><g class="v24-water"><path fill="url(#${id}g)" d="M-200 0 Q-187 -5 -175 0 T-150 0 T-125 0 T-100 0 T-75 0 T-50 0 T-25 0 T0 0 T25 0 T50 0 T75 0 T100 0 T125 0 T150 0 T175 0 T200 0 T225 0 T250 0 T275 0 T300 0 V200 H-200 Z"/></g></g></svg>`;
}
new MutationObserver(()=>{document.querySelectorAll('#content .loading').forEach(v17Loader)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('#content .loading').forEach(v17Loader));

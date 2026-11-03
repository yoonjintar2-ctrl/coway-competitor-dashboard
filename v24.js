/* v24 — 2026-11-03: 로딩 = 테두리·빛 없는 물방울 + 굵은 LOADING 글자, 아래(글자)부터 물이 차올라 물방울까지 이어서 채워짐 */
function v17Loader(node){if(node.dataset.v24)return;node.dataset.v24='1';['v23','v22','v17'].forEach(k=>node.dataset[k]='1');node.classList.remove('v22-loading','v23-loading');node.classList.add('v24-loading');
 const id='v24'+Math.random().toString(36).slice(2,7);
 const drop='M100 6 C100 6 74 38 74 58 A26 26 0 0 0 126 58 C126 38 100 6 100 6 Z';
 const txt=`<text x="100" y="128" text-anchor="middle" class="v24-word">LOADING</text>`;
 node.innerHTML=`<svg class="v24-svg" viewBox="0 0 200 140" aria-label="LOADING"><defs><clipPath id="${id}"><path d="${drop}"/>${txt}</clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fbde9"/><stop offset="1" stop-color="#1479b4"/></linearGradient></defs><g class="v24-base"><path d="${drop}"/>${txt}</g><g clip-path="url(#${id})"><g class="v24-water"><path fill="url(#${id}g)" d="M-200 0 Q-187 -5 -175 0 T-150 0 T-125 0 T-100 0 T-75 0 T-50 0 T-25 0 T0 0 T25 0 T50 0 T75 0 T100 0 T125 0 T150 0 T175 0 T200 0 T225 0 T250 0 T275 0 T300 0 V200 H-200 Z"/></g></g></svg>`;
}
document.querySelectorAll('#content .loading').forEach(n=>{['v24','v23','v22','v17'].forEach(k=>delete n.dataset[k]);v17Loader(n)});

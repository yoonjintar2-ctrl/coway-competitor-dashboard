/* v23 — 2026-11-03: 로딩은 빈 배경 위 물방울이 차오르는 모양 + 글자가 차례로 나타나는 문구. 신규 캠페인 문구 '최근 60일'. */
function v17Loader(node){if(node.dataset.v23)return;node.dataset.v23='1';node.dataset.v22='1';node.dataset.v17='1';const text=(node.querySelector('.v22-card p,p')?.textContent||node.textContent).trim()||'자료를 집계하고 있습니다.';node.classList.remove('v22-loading');node.classList.add('v23-loading');
 const id='v23c'+Math.random().toString(36).slice(2,7);
 const drop='M40 4 C40 4 12 38 12 60 A28 28 0 0 0 68 60 C68 38 40 4 40 4 Z';
 node.innerHTML=`<svg class="v23-drop" viewBox="0 0 80 96" aria-hidden="true"><defs><clipPath id="${id}"><path d="${drop}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc3ec"/><stop offset="1" stop-color="#1479b4"/></linearGradient></defs><path class="v23-shell" d="${drop}"/><g clip-path="url(#${id})"><g class="v23-fill"><path class="v23-wave" fill="url(#${id}g)" d="M-80 0 Q-60 -6 -40 0 T0 0 T40 0 T80 0 T120 0 T160 0 V120 H-80 Z"/><path class="v23-wave2" d="M-80 2 Q-60 -4 -40 2 T0 2 T40 2 T80 2 T120 2 T160 2 V120 H-80 Z"/></g></g><path class="v23-shine" d="M26 54 C26 46 31 38 35 33"/></svg><p class="v23-text">${[...text].map((ch,i)=>`<span style="animation-delay:${(i*0.045).toFixed(3)}s">${ch===' '?'&nbsp;':esc(ch)}</span>`).join('')}</p>`;
}
document.querySelectorAll('#content .loading').forEach(n=>{delete n.dataset.v22;delete n.dataset.v17;v17Loader(n)});
var v23BaseRecent=v17Recent;
v17Recent=function(){return v23BaseRecent().replace('최근 2개월 새로 시작한 캠페인','최근 60일 새로 시작한 캠페인')};

/* v10: 아덱스 인쇄 소재 원본 이미지(로컬 저장본) 갤러리 */
var v10Prints={};
var v10BaseMaterial=materialCarousel;
materialCarousel=function(d){
 const radio=r=>(r.media||[]).length&&r.media.every(k=>k==='radio');
 const ordered=[...d.creatives].sort((a,b)=>radio(a)-radio(b));
 ordered.forEach(r=>{if(r.print_images?.length)v10Prints[r.creative_id]={title:(r.product||'')+(r.copyline?' · '+r.copyline:''),images:r.print_images}});
 const parts=v10BaseMaterial(d).split('</article>');
 return parts.map((p,i)=>{const r=ordered[i];if(i>=ordered.length||!r?.print_images?.length)return p;
  return p+`<button class="v10-print-open" data-print-creative="${esc(r.creative_id)}">▤ 인쇄 원본 ${r.print_images.length}건 보기</button>`}).join('</article>');
};
function v10OpenPrints(id){
 const g=v10Prints[id];if(!g)return;
 const dialog=$('#detail');dialog.className='story-dialog v10-print-dialog';
 const byImg=new Map();g.images.forEach(x=>{const k=x.src;if(!byImg.has(k))byImg.set(k,x)});
 $('#detail-body').innerHTML=`<h2>인쇄 소재 원본<small>${esc(g.title)}</small></h2><p class="footnote">출처 아덱스 인쇄조건별노출 소재 이미지 · 로컬 저장본 · 광고주·상품·매체·일자가 일치하는 집행 건만 표시</p><div class="v10-print-grid">${[...byImg.values()].map(x=>`<figure><a href="${esc(safeUrl(x.src))}" target="_blank" rel="noopener"><img src="${esc(safeUrl(x.src))}" alt="${esc(x.vehicle+' '+x.day)}" loading="lazy"></a><figcaption>${esc(x.day)} · ${esc(x.vehicle)}</figcaption></figure>`).join('')}</div>`;
 dialog.showModal();
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-print-creative]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();v10OpenPrints(el.dataset.printCreative)},true);

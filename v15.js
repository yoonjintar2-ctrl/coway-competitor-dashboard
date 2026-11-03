/* v15 — 2026-11-03: 타임라인 A안(캡슐 카드형). 캡슐 안에 대표 이미지·캠페인명·금액, 글자는 캡슐 밖으로 넘치지 않게 말줄임, 광고주 흰 카드 + 올해 누적 게이지 */
v6LaneH=54;
var v15BaseTimeline=timeline;
timeline=function(){
 let h=v15BaseTimeline();
 h=h.replace(/<button class="gantt-bar v5-flight([^"]*)" data-gantt="([^"]+)"([^>]*)>([\s\S]*?)<span class="gantt-bar-content v5-label"><strong>([\s\S]*?)<\/strong>/g,(a,cls,id,attrs,pre,strong)=>{
  const c=listing.campaigns.find(x=>x.id===id);if(!c)return a;
  const inner=strong.replace(new RegExp('^'+esc(c.advertiser).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*'),'');
  const thumb=c.thumbnail?`<img class="v15-thumb" src="${esc(safeUrl(c.thumbnail))}" alt="" loading="lazy">`:`<i class="v15-thumb v15-noimg">${esc((c.advertiser||'').slice(0,1))}</i>`;
  return `<button class="gantt-bar v5-flight v15-cap${cls}" data-gantt="${id}"${attrs}>${pre}<span class="gantt-bar-content v5-label">${thumb}<span class="v15-text"><strong>${inner}</strong>`;
 });
 h=h.replace(/(<span class="v15-text"><strong>[\s\S]*?<\/strong>)(<small>[\s\S]*?<\/small>)/g,'$1$2</span>');
 return h;
};
var v15BasePlace=placeBrandFlights;
placeBrandFlights=function(rows,left,right){
 const el=$('#gantt-scroll');const px=parseFloat(el?.style.getPropertyValue('--day'))||12;
 for(const c of rows)c._labelDays=Math.max(1,56/px);   // 글자는 캡슐 안에서 말줄임 → 겹침 판단은 기간(최소 56px)만
 return v15BasePlace(rows,left,right);
};
var v15BaseLayout=layoutVisibleFlights;
layoutVisibleFlights=function(){
 v15BaseLayout();
 const el=$('#gantt-scroll');if(!el)return;
 for(const b of el.querySelectorAll('.v15-cap:not([hidden])')){
  const lab=b.querySelector('.v5-label');if(!lab)continue;const off=parseFloat(lab.style.left)||0;const w=b.offsetWidth-off;
  lab.style.width=Math.max(0,w)+'px';b.classList.toggle('v15-tight',w<150);b.classList.toggle('v15-tiny',w<70);
 }
 // 광고주 카드: 올해 누적 게이지(품목 안 최대 대비)
 for(const row of el.querySelectorAll('.gantt-row')){
  const items=[...row.querySelectorAll('.v6-adv')];const cat=listing.campaigns.find(c=>c.id===row.querySelector('[data-gantt]')?.dataset.gantt)?.category;if(!cat)continue;
  const ytd=listing.advertiser_ytd||{};const vals=items.map(x=>ytd[cat+'|'+(x.querySelector('span')?.firstChild?.textContent||'').trim()]||0);const max=Math.max(1,...vals);
  items.forEach((x,i)=>{let g=x.querySelector('.v15-gauge');if(!g){g=document.createElement('i');g.className='v15-gauge';x.querySelector('span')?.appendChild(g)}g.style.setProperty('--g',(vals[i]/max*100).toFixed(1)+'%')});
 }
};

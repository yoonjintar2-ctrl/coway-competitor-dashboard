/* v37 — 2026-11-04 15:20 (16:00 같은 날은 시간만 · 기타 맨 아래 · 16:30 같은 소식 묶기)
   1) 왼쪽 메뉴 '뉴스 클리핑': 코웨이·경쟁 광고주 뉴스를 발행 시각 순으로. 날짜·시간(왼쪽, 가운데 정렬) · 품목·광고주 캡슐 위에 제목(굵게)·요약(얇게 한 줄) · 오른쪽 같은 크기 이미지.
      기사를 누르면 팝업, 목록·팝업 모두 공유 버튼(원문 링크를 클립보드에 복사).
   2) 캠페인 분석: 타임라인을 거치지 않고 메뉴로 들어오면 비워 두고 '타임라인에서 분석하실 캠페인을 선택하세요'. */

// ---------- 2) 캠페인 분석 빈 화면 ----------
var v37Blank=false;
window.addEventListener('click',e=>{const nav=e.target.closest&&e.target.closest('.sidebar [data-route]');if(nav){v37Blank=nav.dataset.route==='analysis';return}
 if(e.target.closest&&e.target.closest('[data-campaign],[data-gantt],[data-v32-card]'))v37Blank=false},true);
window.addEventListener('change',e=>{if(e.target&&e.target.id==='campaign-switch')v37Blank=false},true);

// ---------- 1) 뉴스 클리핑 ----------
var V37_TITLE='뉴스 클리핑',v37Data=null,v37Cat='',v37Adv='';
function v37Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="news"]'))return;
 const b=document.createElement('button');b.className='nav';b.dataset.route='news';b.textContent=V37_TITLE;
 const after=nav.querySelector('[data-route="daily"]');if(after)after.after(b);else nav.appendChild(b)}
v37Nav();document.addEventListener('DOMContentLoaded',v37Nav);
var V37_WEEK='일월화수목금토';
function v37When(s){const d=new Date(s);if(isNaN(d))return {date:'',time:''};const k=new Date(d.getTime()+9*3600e3);
 const p=n=>String(n).padStart(2,'0');return {date:`${p(k.getUTCMonth()+1)}.${p(k.getUTCDate())} (${V37_WEEK[k.getUTCDay()]})`,time:`${p(k.getUTCHours())}:${p(k.getUTCMinutes())}`,day:`${k.getUTCFullYear()}-${p(k.getUTCMonth()+1)}-${p(k.getUTCDate())}`}}
function v37Color(a){try{return (typeof v28AnnualMap!=='undefined'&&v28AnnualMap[a])||signatureColor(a)}catch(e){return '#25a4dc'}}
var V37_SHARE='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/></svg>';
function v37Items(){return (v37Data&&v37Data.items||[]).filter(x=>(!v37Cat||x.category_label===v37Cat)&&(!v37Adv||x.advertiser===v37Adv))}
function v37Row(x,k,list){const w=v37When(x.published_at),same=k>0&&v37When(list[k-1].published_at).day===w.day;  // 윗 행과 같은 날이면 시간만
 return `<div class="v37-row${same?' same-day':''}" role="button" tabindex="0" data-v37-news="${esc(x.id)}">
  <div class="v37-when">${same?'':`<b>${esc(w.date)}</b>`}<span>${esc(w.time)}</span></div>
  <div class="v37-main"><div class="v37-tags"><span class="v37-chip">${esc(x.category_label)}</span><span class="v37-chip adv" style="--c:${v37Color(x.advertiser)}">${esc(x.advertiser)}</span><em>${esc(x.publisher||'')}</em>${(x.related||[]).length?`<span class="v37-more" title="같은 소식을 다룬 기사 ${x.related.length+1}건 · 누르면 모두 보기">외 ${x.related.length}곳</span>`:''}</div>
   <div class="v37-title">${esc(x.title)}</div><div class="v37-sum">${esc(x.summary||'')}</div></div>
  <button type="button" class="v37-share" data-v37-share="${esc(x.id)}" title="원문 링크 복사" aria-label="원문 링크 복사">${V37_SHARE}</button>
  <div class="v37-thumb">${x.image?`<img src="${esc(safeUrl(x.image))}" alt="" loading="lazy" onerror="this.remove()">`:''}</div></div>`}
function v37Controls(show){let box=document.querySelector('main>header .v37-ctrl');if(!show){if(box)box.remove();return}
 const head=document.querySelector('main>header');if(!head)return;if(!box){box=document.createElement('div');box.className='v32-ctrl v37-ctrl';head.appendChild(box)}
 const cats=['',...(v37Data.categories||[])],advs=['',...(v37Data.advertisers||[])];
 box.innerHTML=`<label>품목<select id="v37-cat" class="chip">${cats.map(c=>`<option value="${esc(c)}" ${c===v37Cat?'selected':''}>${c?esc(c):'전체 품목'}</option>`).join('')}</select></label><label>광고주<select id="v37-adv" class="chip">${advs.map(a=>`<option value="${esc(a)}" ${a===v37Adv?'selected':''}>${a?esc(a):'코웨이 + 경쟁사'}</option>`).join('')}</select></label>`}
function v37Draw(){const items=v37Items();$('#subtitle').textContent='';v37Controls(true);
 const up=v37Data.updated_at?v37When(v37Data.updated_at):null;
 $('#content').innerHTML=`<p class="v32-note v37-note">코웨이와 경쟁 광고주 뉴스를 발행 시각 순으로 보여 줘요(최근 ${v37Data.days}일 · 소식 ${items.length}건${v37Data.articles&&v37Data.articles>(v37Data.items||[]).length&&!v37Cat&&!v37Adv?` · 기사 ${v37Data.articles}건`:''}). 기사를 누르면 크게 보고, 공유 버튼으로 원문 링크를 복사해요.${up?` · ${up.date} ${up.time} 업데이트${v32Static()?'':` · PC 대시보드가 켜져 있으면 ${v37Data.interval_minutes}분마다 새 기사를 모아요`}`:''}</p>
  <section class="glass section v37-list">${items.length?items.map((x,k,l)=>v37Row(x,k,l)).join(''):empty('조건에 맞는 뉴스가 없어요.',v37Data.items.length?'품목·광고주 선택을 바꿔 보세요.':'아직 모은 뉴스가 없어요. PC 대시보드가 켜져 있으면 곧 채워져요.')}</section>
  <p class="footnote">네이버 뉴스 검색에서 제목에 광고주(브랜드) 이름이 들어간 기사만 모아요 · 같은 소식을 여러 매체가 쓴 기사는 한 줄로 묶어요(같은 광고주·48시간 이내·제목이나 첫 문장이 비슷한 기사, 맨 위는 가장 최근 기사) · 요약은 기사 원문의 대표 설명(AI 요약 아님) · 품목은 제목·요약의 품목 단어로 정해요(품목 단어가 없는 브랜드 소식은 '기타').</p>`}
var v37BaseRender=render;
render=async function(...a){
 if(route==='analysis'&&v37Blank){v37Controls(false);if(typeof v32Controls==='function')v32Controls(false);
  document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='analysis'));
  $('#page-title').textContent='캠페인 분석';$('#subtitle').textContent='';
  $('#content').innerHTML=`<section class="glass section v37-blank"><div><b>타임라인에서 분석하실 캠페인을 선택하세요</b><p>캠페인 타임라인에서 막대나 캠페인 이름을 누르면 이곳에 분석이 열려요.</p><button type="button" class="primary" data-v37-go="timeline">캠페인 타임라인으로</button></div></section>`;return}
 if(route!=='news'){v37Controls(false);return v37BaseRender.apply(this,a)}
 if(typeof v32Controls==='function')v32Controls(false);
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='news'));
 $('#page-title').textContent=V37_TITLE;$('#subtitle').textContent='';
 if(!v37Data)$('#content').innerHTML=`<section class="glass section">${empty('뉴스를 불러오는 중이에요.')}</section>`;
 try{v37Data=await api('/api/news-clips')}catch(e){$('#content').innerHTML=`<section class="glass section">${empty('뉴스를 불러오지 못했어요.',e.message)}</section>`;return}
 if(route!=='news')return;v37Draw()};
document.addEventListener('click',e=>{const g=e.target.closest('[data-v37-go]');if(!g)return;const nav=document.querySelector(`.sidebar [data-route="${g.dataset.v37Go}"]`);if(nav)nav.click()});
window.addEventListener('change',e=>{if(e.target.id==='v37-cat'){e.stopPropagation();v37Cat=e.target.value;v37Draw()}if(e.target.id==='v37-adv'){e.stopPropagation();v37Adv=e.target.value;v37Draw()}},true);
// 공유(원문 링크 복사) — 같은 소식으로 묶인 기사도 각각 복사 가능
function v37Find(id){for(const i of (v37Data&&v37Data.items||[])){if(i.id===id)return i;const r=(i.related||[]).find(z=>z.id===id);if(r)return r}return null}
async function v37Copy(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();return ok}}
window.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-v37-share]');if(!b)return;e.preventDefault();e.stopPropagation();
 const x=v37Find(b.dataset.v37Share);if(!x)return;
 const ok=await v37Copy(`${x.title}\n${x.url}`);toast(ok?'원문 링크를 복사했어요.':'복사하지 못했어요. 팝업의 원문 주소를 직접 복사해 주세요.');b.classList.add('done');setTimeout(()=>b.classList.remove('done'),1200)},true);
// 기사 팝업
function v37Open(x){if(!x)return;const w=v37When(x.published_at),dialog=$('#detail');dialog.className='v37-dialog';
 $('#detail-body').innerHTML=`<div class="v37-pop">${x.image?`<img class="v37-pop-img" src="${esc(safeUrl(x.image))}" alt="">`:''}
  <div class="v37-pop-body"><div class="v37-tags"><span class="v37-chip">${esc(x.category_label)}</span><span class="v37-chip adv" style="--c:${v37Color(x.advertiser)}">${esc(x.advertiser)}</span><em>${esc(x.publisher||'')} · ${esc(w.date)} ${esc(w.time)}</em></div>
  <h2>${esc(x.title)}</h2><p class="v37-pop-sum">${esc(x.summary||'원문 요약을 가져오지 못했어요.')}</p>
  <div class="v37-pop-actions"><a class="primary" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">원문 보기 ↗</a><button type="button" class="v37-share wide" data-v37-share="${esc(x.id)}">${V37_SHARE}<span>원문 링크 복사</span></button></div>
  ${(x.related||[]).length?`<div class="v37-rel"><b>같은 소식을 다룬 기사 ${x.related.length+1}건</b>${[{id:x.id,title:x.title,publisher:x.publisher,published_at:x.published_at,url:x.url,main:true},...x.related].map(r=>{const t=v37When(r.published_at);return `<div class="v37-rel-row${r.main?' main':''}"><span class="v37-rel-when">${esc(t.date)} ${esc(t.time)}</span><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener"><em>${esc(r.publisher||'')}</em>${esc(r.title)}</a><button type="button" class="v37-share" data-v37-share="${esc(r.id)}" title="원문 링크 복사" aria-label="원문 링크 복사">${V37_SHARE}</button></div>`}).join('')}</div>`:''}
  <p class="footnote">요약은 기사 원문의 대표 설명이에요. 자세한 내용은 원문에서 확인해 주세요.</p></div></div>`;
 if(!dialog.open)dialog.showModal()}
document.addEventListener('click',e=>{const r=e.target.closest('[data-v37-news]');if(!r||e.target.closest('[data-v37-share]'))return;v37Open((v37Data&&v37Data.items||[]).find(i=>i.id===r.dataset.v37News))});
document.addEventListener('keydown',e=>{const r=e.target.closest&&e.target.closest('[data-v37-news]');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();r.click()}});

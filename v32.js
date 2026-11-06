/* v32 — 2026-11-04
   1) 왼쪽 메뉴 '새로 업로드된 소재': 하루 동안 온에어된 소재를 '소재×길이' 카드로(그날 집행액 큰 순, 카드에는 금액 표시 안 함).
      매체는 TV·디지털·라디오·인쇄 큰 분류, 길이·AdCreative 메시지/스타일 표시, 원본 영상이 있으면 영상으로. 우측 위 날짜(최근 14일)·광고주 드롭다운.
   2) 설정 > '소재·추정 기준': YouTube 소재 최소 조회수(기본 10만)·선공개 예상 광고비 CPV(기본 30원).
   3) 캠페인 분석: 캠페인 이름·소재 제목 옆 연필 → 비밀번호 → 새 이름 → 다음 업데이트 때 반영(PC 서버에만 저장).
   4) 캠페인 분석: 소재 원본 영상 자동재생(음소거), 스토리보드 팝업에서 원본 크기 재생.
   공개 사이트: 최근 소재만 가벼운 사본을 올리고, 나머지 영상은 이 PC의 대시보드 서버에서 받아 재생(PC가 켜져 있을 때만). */
var v32Day=null,v32Data=null,v32Adv='';
var V32_TITLE='새로 업로드된 소재';
function v32Cfg(){return (typeof listing!=='undefined'&&listing&&listing.config)||{yt_min_views:100000,yt_cpv:30}}
function v32Num(n){return Number(n||0).toLocaleString('ko-KR')}
function v32SyncCpv(){try{const c=v32Cfg();if(c.yt_cpv)V28_CPV=Number(c.yt_cpv)}catch(e){}}
function v32ViewsLabel(n){n=Number(n||0);return n>=10000?(Math.round(n/1000)/10).toLocaleString('ko-KR')+'만':v32Num(n)}
const V32_WEEK='일월화수목금토';
function v32DayLabel(d){const t=new Date(d+'T00:00:00');return `${d.slice(5,7)}.${d.slice(8,10)} (${V32_WEEK[t.getDay()]})`}
function v32Static(){return typeof listing!=='undefined'&&listing&&listing.static}
// 영상 주소: PC 대시보드는 원본, 공개 사이트는 가벼운 사본 → 없으면 이 PC 서버(켜져 있을 때만)
function v32Vid(file,web){if(!file&&!web)return null;if(!v32Static())return file;if(web)return web;return String(file).replace(/^.*?\/assets\//,'http://127.0.0.1:8765/assets/')}
function v32VideoTag(src,poster,cls,auto){if(!src)return '';return `<video class="${cls||''}" src="${esc(src)}" ${poster?`poster="${esc(safeUrl(poster))}"`:''} muted loop playsinline preload="${auto?'auto':'none'}" ${auto?'autoplay':''} data-v32-video onerror="this.remove()"></video>`}

// 메뉴
function v32Nav(){const nav=document.querySelector('.sidebar nav');if(!nav)return;let b=nav.querySelector('[data-route="daily"]');
 if(!b){b=document.createElement('button');b.className='nav';b.dataset.route='daily';nav.appendChild(b)}b.textContent=V32_TITLE}
v32Nav();document.addEventListener('DOMContentLoaded',v32Nav);

// 머리글 오른쪽 위: 날짜·광고주 드롭다운
function v32Controls(show){let box=document.querySelector('main>header .v32-ctrl');
 if(!show){if(box)box.remove();return}
 const head=document.querySelector('main>header');if(!head)return;
 if(!box){box=document.createElement('div');box.className='v32-ctrl';head.appendChild(box)}
 const days=(v32Data.days||[]).map(d=>`<option value="${d.day}" ${d.day===v32Data.day?'selected':''}>${d.day===v32Data.yesterday?'어제 · ':''}${v32DayLabel(d.day)} · ${d.count}개</option>`).join('');
 const advs=['',...(v32Data.advertisers||[])];if(v32Adv&&!advs.includes(v32Adv))advs.push(v32Adv);
 box.innerHTML=`<label>날짜<select id="v32-day" class="chip">${days}</select></label><label>광고주<select id="v32-adv" class="chip">${advs.map(a=>`<option value="${esc(a)}" ${a===v32Adv?'selected':''}>${a?esc(a):'전체 광고주'}</option>`).join('')}</select></label>`}

function v32Card(x){
 const vsrc=v32Vid(x.video,x.video_web);
 const thumb=x.thumbnail?`<img src="${esc(safeUrl(x.thumbnail))}" alt="" loading="lazy">`:`<span class="v32-noimg">${(x.media||[]).includes('라디오')?'라디오 소재 · 이미지 없음':'원본 이미지 미확보'}</span>`;
 const meta=[x.length?x.length+'초':'',x.message_style||''].filter(Boolean);
 return `<button type="button" class="v32-card glass" data-v32-card="${esc(x.id)}"><div class="v32-thumb">${thumb}${vsrc?v32VideoTag(vsrc,x.thumbnail,'v32-cardvid',false):''}${x.type==='youtube'?'<em class="v32-tag yt">YouTube 조회수 '+v32ViewsLabel(x.youtube&&x.youtube.views)+'</em>':''}${vsrc?'<em class="v32-tag vid">영상</em>':''}</div>
  <div class="v32-body"><small>${esc(x.category_label||'')}${(x.media||[]).length?' · '+esc(x.media.join(' · ')):''}</small><b>${esc(x.advertiser)}</b><p>${esc(x.title||x.product||'')}</p>
  ${meta.length?`<span class="v32-meta">${meta.map(m=>`<i>${esc(m)}</i>`).join('')}</span>`:''}</div></button>`}

function v32Items(){return (v32Data.items||[]).filter(x=>!v32Adv||x.advertiser===v32Adv)}
function v32View(d){
 const late=d.day!==d.yesterday&&d.days&&d.days[0]&&!d.days[0].count?`<p class="v32-note">아덱스 자료는 보통 1~2일 늦게 들어와요. 어제(${v32DayLabel(d.yesterday)}) 자료가 아직 없어 자료가 있는 가장 최근 날을 보여 줘요.</p>`:'';
 const items=v32Items();
 if(!items.length)return `${late}<section class="glass section">${empty(v32DayLabel(d.day)+' 온에어 소재가 없어요.',v32Adv?'선택한 광고주의 소재가 이날 없어요.':'경쟁사 조건(설정 > 인덱스)에 맞는 소재가 없거나 아직 자료가 들어오지 않았어요.')}</section>`;
 return `${late}<div class="v32-grid">${items.map(v32Card).join('')}</div>
  <p class="footnote v32-foot">${v32DayLabel(d.day)} 온에어 · 그날 집행액(설정의 광고비 보정 반영) 큰 순 · 같은 소재라도 길이가 다르면 따로 표시 · 메시지/스타일은 AdCreative 표기 · YouTube 카드는 경쟁사 공식 채널에 그날 올라온 조회수 ${v32Num(d.config.yt_min_views)}회 이상 영상(아덱스 소재와 연결된 영상은 그 소재 카드에 포함) · 카드를 누르면 원본을 크게 봐요.</p>`}
function v32Draw(){$('#subtitle').textContent=`${v32DayLabel(v32Data.day)} 온에어 · 소재 ${v32Items().length}개${v32Adv?' · '+v32Adv:''}`;v32Controls(true);$('#content').innerHTML=v32View(v32Data);v32Watch()}

// 카드 영상: 화면에 보일 때만 재생
var v32IO=null;
function v32Watch(){if(!('IntersectionObserver' in window))return;if(v32IO)v32IO.disconnect();
 v32IO=new IntersectionObserver(es=>{for(const e of es){const v=e.target;if(e.isIntersecting){v.preload='auto';const p=v.play();if(p&&p.catch)p.catch(()=>{})}else v.pause()}},{rootMargin:'120px'});
 document.querySelectorAll('#content video[data-v32-video]').forEach(v=>v32IO.observe(v))}

var v32BaseRender=render;
render=async function(...a){
 v32SyncCpv();
 if(route!=='daily'){v32Controls(false);const r=await v32BaseRender.apply(this,a);if(route==='analysis'){v32Pen();v32AnalysisVideos()}return r}
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='daily'));
 $('#page-title').textContent=V32_TITLE;$('#subtitle').textContent='불러오는 중…';
 $('#content').innerHTML='<div class="loading glass v32-loading">소재를 모으는 중이에요.</div>';
 try{v32Data=await api('/api/daily-creatives'+(v32Day?'?day='+encodeURIComponent(v32Day):''))}
 catch(e){$('#content').innerHTML=`<section class="glass section">${empty('소재를 불러오지 못했어요.',e.message)}</section>`;$('#subtitle').textContent='';return}
 if(route!=='daily')return;
 v32Day=v32Data.day;v32Draw();
};
document.addEventListener('change',async e=>{
 if(e.target.id==='v32-day'){e.stopImmediatePropagation();v32Day=e.target.value;await render();return}
 if(e.target.id==='v32-adv'){e.stopImmediatePropagation();v32Adv=e.target.value;v32Draw()}},true);
document.addEventListener('click',async e=>{
 const card=e.target.closest('[data-v32-card]');if(card&&v32Data){e.preventDefault();v32Open(v32Data.items.find(x=>x.id===card.dataset.v32Card));return}
 const go=e.target.closest('#detail [data-campaign]');if(go){const dl=$('#detail');if(dl&&dl.open)dl.close()}
},true);

function v32Open(x){if(!x)return;const dialog=$('#detail');
 const vsrc=v32Vid(x.video,x.video_web);
 const media=vsrc?`<video class="v32-pop-video" src="${esc(vsrc)}" ${x.thumbnail?`poster="${esc(safeUrl(x.thumbnail))}"`:''} controls autoplay playsinline onerror="this.outerHTML='<div class=&quot;v32-pop-none&quot;>영상을 불러오지 못했어요. 공개 사이트에서는 이 PC의 대시보드가 켜져 있어야 지난 영상을 볼 수 있어요.</div>'"></video>`:'';
 const img=x.original?`<img class="v32-pop-img" src="${esc(safeUrl(x.original))}" alt="${esc(x.title)}">`:(!vsrc?`<div class="v32-pop-none">${(x.media||[]).includes('라디오')?'라디오 소재라 이미지가 없어요.':'원본 이미지를 아직 확보하지 못했어요.'}</div>`:'');
 const rows=[['품목',x.category_label],['상품',x.product],['매체',(x.media||[]).join(' · ')],['채널',(x.channels||[]).join(', ')],['길이',x.length?x.length+'초':''],
  ['메시지/스타일',x.message_style||''],['AdCreative 초수',x.basis_seconds||''],[x.estimated?'예상 광고비':'그날 집행액',x.amount?v4Money(x.amount)+'원'+(x.estimated?` (조회수 ${v32Num(x.youtube&&x.youtube.views)}회 × CPV ${v32Num(v32Data.config.yt_cpv)}원)`:(x.raw_amount&&x.raw_amount!==x.amount?` · 원본 ${v4Money(x.raw_amount)}원`:'')):''],
  ['캠페인',x.campaign_name||''],['이미지 출처',x.image_source||'']].filter(r=>r[1]);
 const links=[x.source_url?`<a href="${esc(safeUrl(x.source_url))}" target="_blank" rel="noopener">AdCreative 원본 ↗</a>`:'',x.youtube?`<a href="${esc(safeUrl(x.youtube.url))}" target="_blank" rel="noopener">YouTube에서 보기 ↗</a>`:'',x.campaign_id?`<button type="button" class="primary" data-campaign="${esc(x.campaign_id)}">캠페인 분석 보기</button>`:''].filter(Boolean).join('');
 $('#detail').className='v32-dialog';
 $('#detail-body').innerHTML=`<h2>${esc(x.advertiser)}<small>${esc(x.title||'')}</small></h2><div class="v32-pop"><div class="v32-pop-media">${media}${img}</div><div class="v32-pop-info"><dl>${rows.map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl><div class="v32-pop-links">${links}</div></div></div>`;
 if(!dialog.open)dialog.showModal()}
document.addEventListener('close',e=>{if(e.target&&e.target.id==='detail')e.target.querySelectorAll('video').forEach(v=>v.pause())},true);

// 캠페인 분석: 소재 원본 영상 자동재생 + 스토리보드 팝업에서 원본 크기 재생
function v32CreativeVideos(cid){const d=typeof detailData!=='undefined'?detailData:null;const r=d&&(d.creatives||[]).find(x=>x.creative_id===cid);return r&&r.videos||[]}
function v32AnalysisVideos(){
 document.querySelectorAll('#content .material-card [data-story-creative].material-thumb, #content .material-card .material-thumb[data-story-creative]').forEach(btn=>{
  if(btn.querySelector('video'))return;const vs=v32CreativeVideos(btn.dataset.storyCreative);if(!vs.length)return;
  const v=vs[0],src=v32Vid(v.file,v.web);if(!src)return;const img=btn.querySelector('img');
  btn.insertAdjacentHTML('afterbegin',v32VideoTag(src,img&&img.getAttribute('src'),'v32-matvid',true));btn.classList.add('v32-has-video')});
 v32Watch()}
function v32StoryVideo(cid,tries){const dl=$('#detail');const body=$('#detail-body');
 if(!dl||!dl.open||!body||!body.querySelector('h2')){if(tries>0)setTimeout(()=>v32StoryVideo(cid,tries-1),200);return}
 if(body.querySelector('.v32-story-video'))return;{
  const vs=v32CreativeVideos(cid);if(!vs.length)return;
  const tabs=vs.length>1?`<div class="v32-vtabs">${vs.map((v,i)=>`<button type="button" class="${i?'':'on'}" data-v32-vsrc="${esc(v32Vid(v.file,v.web))}">${v.seconds?Math.round(v.seconds)+'초':'편집본 '+(i+1)}</button>`).join('')}</div>`:'';
  const h=body.querySelector('h2');const html=`<div class="v32-story-video">${tabs}<video src="${esc(v32Vid(vs[0].file,vs[0].web))}" controls autoplay playsinline onerror="this.parentElement.innerHTML='<p class=&quot;footnote&quot;>영상을 불러오지 못했어요. 공개 사이트에서는 이 PC의 대시보드가 켜져 있어야 지난 영상을 볼 수 있어요.</p>'"></video></div>`;
  if(h)h.insertAdjacentHTML('afterend',html);else body.insertAdjacentHTML('afterbegin',html)}}
// 기존 스토리보드 단추는 클릭 전파를 막으므로, 누르는 순간(pointerdown)에 소재를 기억하고 팝업 내용이 바뀌면 영상을 붙임
var v32LastStory=null;
window.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-story-creative]');v32LastStory=t?t.dataset.storyCreative:v32LastStory},true);
window.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const t=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-story-creative]');if(t)v32LastStory=t.dataset.storyCreative}},true);
(function(){const hook=()=>{const body=document.getElementById('detail-body');if(!body)return setTimeout(hook,300);
 new MutationObserver(()=>{const dl=$('#detail');if(v32LastStory&&dl&&/story-dialog/.test(dl.className)&&!body.querySelector('.v32-story-video'))v32StoryVideo(v32LastStory,5)}).observe(body,{childList:true})};hook()})();
document.addEventListener('click',e=>{const b=e.target.closest('[data-v32-vsrc]');if(!b)return;e.preventDefault();const box=b.closest('.v32-story-video');box.querySelectorAll('[data-v32-vsrc]').forEach(x=>x.classList.toggle('on',x===b));const v=box.querySelector('video');v.src=b.dataset.v32Vsrc;v.play().catch(()=>{})});

// 설정 > 소재·추정 기준
if(typeof v7Tabs!=='undefined')v7Tabs.push(['criteria','소재·추정 기준']);
function v32Criteria(){const c=v32Cfg(),ro=v32Static();
 return `<section class="glass section v32-criteria">${header('소재·추정 기준','YouTube 영상을 소재로 볼 기준과 선공개 캠페인의 예상 광고비 역산 CPV를 정합니다. 바꾸면 타임라인·캠페인 분석·새로 업로드된 소재의 안내 문구도 함께 바뀌어요.')}
  <form id="v32-criteria-form" class="v32-form"><label>소재로 볼 최소 조회수<span><input name="yt_min_views" type="number" min="1000" max="100000000" step="1000" value="${Number(c.yt_min_views)}" ${ro?'disabled':''}>회</span><small>경쟁사 공식 YouTube 영상이 이 조회수 이상이면 '새로 업로드된 소재'의 소재와 'YouTube 선공개' 후보로 봐요. 기본 100,000회.</small></label>
  <label>예상 광고비 역산 CPV<span><input name="yt_cpv" type="number" min="1" max="1000" step="1" value="${Number(c.yt_cpv)}" ${ro?'disabled':''}>원</span><small>아덱스 광고비가 아직 없는 YouTube 선공개 캠페인의 예상 광고비 = 조회수 × CPV. 기본 30원.</small></label>
  <div><button class="primary" type="submit" ${ro?'disabled':''}>저장</button>${ro?'<small class="v32-ro">읽기 전용 사이트에서는 바꿀 수 없어요. PC 대시보드에서 바꿔 주세요.</small>':''}</div></form></section>
  <section class="glass section">${header('이름·제목 수정 요청','캠페인 분석 화면의 연필 버튼으로 요청한 캠페인 이름·소재 제목이에요. 다음 업데이트(수집) 때 반영돼요.')}<div id="v32-renames">${ro?empty('읽기 전용 사이트에서는 요청 목록을 볼 수 없어요.'):'불러오는 중…'}</div></section>`}
if(typeof v7Draw==='function'){var v32BaseDraw=v7Draw;v7Draw=function(){
 if(v7Tab!=='criteria')return v32BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}<div class="v32-criteria-wrap">${v32Criteria()}</div></div>`;
 if(v32Static())return;
 api('/api/campaign-renames').then(r=>{const el=document.getElementById('v32-renames');if(!el)return;const st={pending:'다음 업데이트 때 반영',applied:'반영 완료',superseded:'새 요청으로 대체'};
  const rows=[...(r.items||[]).map(x=>({...x,kind:'캠페인',old:x.old_name,neu:x.new_name})),...(r.creatives||[]).map(x=>({...x,kind:'소재',old:x.old_title,neu:x.new_title}))].sort((a,b)=>String(b.requested_at).localeCompare(String(a.requested_at)));
  el.innerHTML=rows.length?`<table class="v32-rn"><thead><tr><th>요청 시각</th><th>구분</th><th>기존</th><th>새 이름</th><th>상태</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc((x.requested_at||'').slice(0,16).replace('T',' '))}</td><td>${x.kind}</td><td>${esc(x.old||'')}</td><td><b>${esc(x.neu)}</b></td><td class="s-${esc(x.status)}">${esc(st[x.status]||x.status)}</td></tr>`).join('')}</tbody></table>`:empty('아직 요청이 없어요.')}).catch(e=>{const el=document.getElementById('v32-renames');if(el)el.textContent=e.message})}}
document.addEventListener('submit',async e=>{if(e.target.id!=='v32-criteria-form')return;e.preventDefault();e.stopImmediatePropagation();
 const f=Object.fromEntries(new FormData(e.target));
 try{await api('/api/settings',{yt_min_views:f.yt_min_views,yt_cpv:f.yt_cpv});toast('저장했어요. 안내 문구와 예상 광고비가 새 기준으로 바뀌어요.');if(typeof load==='function')await load();route='settings';v7Tab='criteria';await render()}
 catch(err){toast(err.message)}},true);

// 후보 캠페인 안내 문구의 '조회수 10만 회 이상'도 설정값으로
if(typeof v20CandidateView==='function'){var v32BaseCand=v20CandidateView;v20CandidateView=async function(c){const h=await v32BaseCand(c);return String(h).replace(/조회수 10만 회 이상/g,'조회수 '+v32Num(v32Cfg().yt_min_views)+'회 이상')}}

// 이름·제목 수정: 연필 → 비밀번호 → 새 이름 (캠페인 이름 / 소재 제목)
var V32_PEN='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
function v32Current(){const id=typeof activeId!=='undefined'?activeId:null;if(!id)return null;
 const fromList=(listing&&listing.campaigns||[]).find(c=>c.id===id);const d=(typeof detailData!=='undefined'&&detailData&&detailData.campaign&&detailData.campaign.id===id)?detailData.campaign:null;
 return {kind:'campaign',id,name:(d&&d.name)||(fromList&&fromList.name)||'',pending:(d&&d.rename_pending)||(fromList&&fromList.rename_pending)||null}}
function v32CreativeTarget(cid){const d=typeof detailData!=='undefined'?detailData:null;const r=d&&(d.creatives||[]).find(x=>x.creative_id===cid);
 return {kind:'creative',id:cid,campaign_id:typeof activeId!=='undefined'?activeId:'',name:r?(r.copyline||r.product||''):'',pending:r&&r.rename_pending||null}}
function v32Pen(){const h=document.querySelector('#content .v6-title h2, #content .analysis-heading h2');const cur=v32Current();
 if(h&&cur){if(!h.querySelector('.v32-pen')){h.classList.add('v32-name');h.insertAdjacentHTML('beforeend',`<button type="button" class="v32-pen" data-v32-pen="campaign" title="캠페인 이름 수정" aria-label="캠페인 이름 수정">${V32_PEN}</button>`)}
  const old=h.parentElement.querySelector(':scope>.v32-pending');if(old)old.remove();
  if(cur.pending)h.insertAdjacentHTML('afterend',`<p class="v32-pending">이름 수정 대기: <b>${esc(cur.pending.name)}</b> · 다음 업데이트 때 반영돼요</p>`)}
 // 소재 제목
 document.querySelectorAll('#content article.material-card').forEach(card=>{const t=card.querySelector('[data-story-creative]');const p=card.querySelector('.material-caption p');if(!t||!p)return;
  const cid=t.dataset.storyCreative;const tg=v32CreativeTarget(cid);
  if(!p.querySelector('.v32-pen')){p.classList.add('v32-name','v32-ctitle');p.insertAdjacentHTML('beforeend',`<button type="button" class="v32-pen sm" data-v32-pen="creative" data-v32-cid="${esc(cid)}" title="소재 제목 수정" aria-label="소재 제목 수정">${V32_PEN}</button>`)}
  const old=card.querySelector('.v32-pending');if(old)old.remove();
  if(tg.pending)p.insertAdjacentHTML('afterend',`<p class="v32-pending">제목 수정 대기: <b>${esc(tg.pending.name)}</b></p>`)})}
var v32Pw=null,v32Target=null;
function v32RenameDialog(step,msg){let dl=document.getElementById('v32-rename');if(!dl){dl=document.createElement('dialog');dl.id='v32-rename';dl.className='v32-rename';document.body.appendChild(dl)}
 const tg=v32Target;if(!tg)return;const what=tg.kind==='creative'?'소재 제목':'캠페인 이름';
 dl.innerHTML=step==='pw'?`<form method="dialog" data-v32-step="pw"><h3>${what} 수정</h3><p>수정하려면 비밀번호를 입력하세요.</p><input type="password" name="pw" autocomplete="current-password" required autofocus><p class="v32-err">${esc(msg||'')}</p><div class="v32-btns"><button type="button" data-v32-cancel>취소</button><button class="primary" type="submit">확인</button></div></form>`
 :`<form method="dialog" data-v32-step="name"><h3>${what} 수정</h3><p>새 ${tg.kind==='creative'?'제목':'이름'}을 입력하세요. 다음 업데이트 때 반영돼요.</p><input type="text" name="name" maxlength="${tg.kind==='creative'?80:60}" required value="${esc((tg.pending&&tg.pending.name)||String(tg.name).replace(/^,/,''))}"><p class="v32-err">${esc(msg||'')}</p><div class="v32-btns"><button type="button" data-v32-cancel>취소</button><button class="primary" type="submit">요청 저장</button></div></form>`;
 if(!dl.open)dl.showModal();const inp=dl.querySelector('input');if(inp){inp.focus();inp.select&&inp.select()}}
document.addEventListener('click',e=>{
 const pen=e.target.closest('.v32-pen');
 if(pen){e.preventDefault();e.stopPropagation();if(v32Static()){toast('읽기 전용 사이트에서는 바꿀 수 없어요. PC 대시보드에서 요청해 주세요.');return}
  v32Target=pen.dataset.v32Pen==='creative'?v32CreativeTarget(pen.dataset.v32Cid):v32Current();v32Pw=null;v32RenameDialog('pw');return}
 if(e.target.closest('[data-v32-cancel]')){const dl=document.getElementById('v32-rename');if(dl)dl.close();v32Pw=null}},true);
document.addEventListener('submit',async e=>{const f=e.target.closest('form[data-v32-step]');if(!f)return;e.preventDefault();e.stopImmediatePropagation();const tg=v32Target;if(!tg)return;
 if(f.dataset.v32Step==='pw'){const pw=f.pw.value;try{await api('/api/campaign-rename/verify',{password:pw});v32Pw=pw;v32RenameDialog('name')}catch(err){v32RenameDialog('pw',err.message||'비밀번호가 맞지 않아요.')}return}
 try{
  if(tg.kind==='creative'){
   const r=await api('/api/creative-rename',{creative_id:tg.id,campaign_id:tg.campaign_id,name:f.name.value,old_name:tg.name,password:v32Pw});
   const cr=(detailData&&detailData.creatives||[]).find(x=>x.creative_id===tg.id);if(cr)cr.rename_pending={name:r.name};
  }else{
   const r=await api('/api/campaign-rename',{campaign_id:tg.id,name:f.name.value,old_name:tg.name,password:v32Pw});
   const lc=(listing&&listing.campaigns||[]).find(c=>c.id===tg.id);if(lc)lc.rename_pending={name:r.name,requested_at:new Date().toISOString()};
   if(typeof detailData!=='undefined'&&detailData&&detailData.campaign&&detailData.campaign.id===tg.id)detailData.campaign.rename_pending={name:r.name};
  }
  v32Pw=null;document.getElementById('v32-rename').close();if(typeof v25Cache!=='undefined')v25Cache.clear();v32Pen();toast('수정 요청을 저장했어요. 다음 업데이트 때 반영돼요.')}
 catch(err){v32RenameDialog('name',err.message)}},true);

/* v32 — 2026-11-04
   1) 왼쪽 메뉴 '어제 업로드된 크리에이티브': 하루 동안 온에어된 소재를 카드로(하루 집행액 큰 순), 카드를 누르면 원본 크게, 우측 위 날짜 버튼으로 최대 7일 전까지.
   2) 설정 > '소재·추정 기준': YouTube 영상을 소재로 볼 최소 조회수(기본 10만) · 선공개 예상 광고비 CPV(기본 30원). 바꾸면 안내 문구도 같이 바뀜.
   3) 캠페인 분석: 캠페인 이름에 마우스를 올리면 연필 버튼 → 비밀번호 확인 → 새 이름 입력 → 다음 업데이트 때 반영(요청은 PC 서버에만 저장). */
var v32Day=null,v32Data=null;
function v32Cfg(){return (typeof listing!=='undefined'&&listing&&listing.config)||{yt_min_views:100000,yt_cpv:30}}
function v32Num(n){return Number(n||0).toLocaleString('ko-KR')}
function v32SyncCpv(){try{const c=v32Cfg();if(c.yt_cpv)V28_CPV=Number(c.yt_cpv)}catch(e){}}
function v32ViewsLabel(n){n=Number(n||0);return n>=10000&&n%10000===0?(n/10000).toLocaleString('ko-KR')+'만':v32Num(n)}
const V32_MEDIA={youtube:'YouTube',terrestrial:'지상파',general:'종편',cable:'케이블',radio:'라디오',print:'신문·잡지',digital_video:'디지털 영상',digital_banner:'디지털 배너'};
const V32_WEEK='일월화수목금토';
function v32DayLabel(d,short){const t=new Date(d+'T00:00:00');return `${d.slice(5,7)}.${d.slice(8,10)}${short?'':' ('+V32_WEEK[t.getDay()]+')'}`}

// 메뉴 추가
function v32Nav(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="daily"]'))return;
 const b=document.createElement('button');b.className='nav';b.dataset.route='daily';b.textContent='어제 업로드된 크리에이티브';nav.appendChild(b)}
v32Nav();document.addEventListener('DOMContentLoaded',v32Nav);

// 날짜 버튼(머리글 오른쪽 위)
function v32DaysBar(show){let bar=document.querySelector('main>header .v32-days');
 if(!show){if(bar)bar.remove();return}
 const head=document.querySelector('main>header');if(!head)return;
 if(!bar){bar=document.createElement('div');bar.className='v32-days';head.appendChild(bar)}
 bar.innerHTML=(v32Data.days||[]).map(d=>`<button type="button" class="v32-day${d.day===v32Data.day?' on':''}${d.count?'':' none'}" data-v32-day="${d.day}" title="${d.day} · 소재 ${d.count}개">${d.day===v32Data.yesterday?'어제':v32DayLabel(d.day,true)}<small>${d.count}</small></button>`).join('')}

function v32Card(x){
 const media=(x.media||[]).map(m=>V32_MEDIA[m]||m).join(' · ');
 const thumb=x.thumbnail?`<img src="${esc(safeUrl(x.thumbnail))}" alt="" loading="lazy">`:`<span class="v32-noimg">${(x.media||[]).includes('radio')?'라디오 소재 · 이미지 없음':'원본 이미지 미확보'}</span>`;
 return `<button type="button" class="v32-card glass" data-v32-card="${esc(x.id)}"><div class="v32-thumb">${thumb}${x.type==='youtube'?'<em class="v32-tag yt">YouTube 조회수 '+v32ViewsLabel(x.youtube&&x.youtube.views)+'</em>':''}</div>
  <div class="v32-body"><small>${esc(x.category_label||'')}${media?' · '+esc(media):''}</small><b>${esc(x.advertiser)}</b><p>${esc(x.title||x.product||'')}</p>
  <span class="v32-amt">${v4Money(x.amount)}원${x.estimated?` <i>예상 · 조회수×CPV ${v32Num(v32Data.config.yt_cpv)}원</i>`:''}</span></div></button>`}

function v32View(d){
 const late=d.day!==d.yesterday?`<p class="v32-note">아덱스 자료는 보통 1~2일 늦게 들어와요. 어제(${v32DayLabel(d.yesterday)}) 집행 자료가 아직 없어 자료가 있는 가장 최근 날을 보여 줘요.</p>`:'';
 if(!d.items.length)return `${late}<section class="glass section">${empty(v32DayLabel(d.day)+' 온에어 소재가 없어요.','경쟁사 조건(설정 > 인덱스)에 맞는 소재가 없거나 아직 자료가 들어오지 않았어요.')}</section>`;
 return `${late}<div class="v32-grid">${d.items.map(v32Card).join('')}</div>
  <p class="footnote v32-foot">${v32DayLabel(d.day)} 하루 집행액(설정의 광고비 보정 반영) 큰 순 · 경쟁사 조건은 설정 > 인덱스 기준 · YouTube 카드는 경쟁사 공식 채널에 그날 올라온 조회수 ${v32Num(d.config.yt_min_views)}회 이상 영상(아덱스 소재와 연결된 영상은 그 소재 카드에 포함) · 카드를 누르면 원본을 크게 봐요.</p>`}

var v32BaseRender=render;
render=async function(...a){
 v32SyncCpv();
 if(route!=='daily'){v32DaysBar(false);const r=await v32BaseRender.apply(this,a);if(route==='analysis')v32Pen();return r}
 document.querySelectorAll('.sidebar [data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='daily'));
 $('#page-title').textContent='어제 업로드된 크리에이티브';$('#subtitle').textContent='불러오는 중…';
 $('#content').innerHTML=`<section class="glass section v32-loading">${empty('소재를 모으는 중이에요.')}</section>`;
 try{v32Data=await api('/api/daily-creatives'+(v32Day?'?day='+encodeURIComponent(v32Day):''))}
 catch(e){$('#content').innerHTML=`<section class="glass section">${empty('소재를 불러오지 못했어요.',e.message)}</section>`;$('#subtitle').textContent='';return}
 if(route!=='daily')return;
 v32Day=v32Data.day;
 $('#subtitle').textContent=`${v32DayLabel(v32Data.day)} 온에어 · 소재 ${v32Data.items.length}개 · 하루 집행액 큰 순`;
 v32DaysBar(true);$('#content').innerHTML=v32View(v32Data);
};
document.addEventListener('click',async e=>{
 const day=e.target.closest('[data-v32-day]');if(day){e.preventDefault();v32Day=day.dataset.v32Day;await render();return}
 const card=e.target.closest('[data-v32-card]');if(card&&v32Data){e.preventDefault();v32Open(v32Data.items.find(x=>x.id===card.dataset.v32Card));return}
 const go=e.target.closest('#detail [data-campaign]');if(go){const dl=$('#detail');if(dl&&dl.open)dl.close()}
},true);

function v32Open(x){if(!x)return;const dialog=$('#detail');
 const img=x.original?`<img class="v32-pop-img" src="${esc(safeUrl(x.original))}" alt="${esc(x.title)}">`:`<div class="v32-pop-none">${(x.media||[]).includes('radio')?'라디오 소재라 이미지가 없어요.':'원본 이미지를 아직 확보하지 못했어요.'}</div>`;
 const rows=[['품목',x.category_label],['상품',x.product],['매체',(x.media||[]).map(m=>V32_MEDIA[m]||m).join(' · ')],['채널',(x.channels||[]).join(', ')],
  ['초수',(x.seconds||[]).length?x.seconds.join('·')+'초':''],[x.estimated?'예상 광고비':'하루 집행액',v4Money(x.amount)+'원'+(x.estimated?` (조회수 ${v32Num(x.youtube&&x.youtube.views)}회 × CPV ${v32Num(v32Data.config.yt_cpv)}원)`:(x.raw_amount&&x.raw_amount!==x.amount?` · 원본 ${v4Money(x.raw_amount)}원`:''))],
  ['캠페인',x.campaign_name||''],['이미지 출처',x.image_source||'']].filter(r=>r[1]);
 const links=[x.source_url?`<a href="${esc(safeUrl(x.source_url))}" target="_blank" rel="noopener">AdCreative 원본 ↗</a>`:'',x.youtube?`<a href="${esc(safeUrl(x.youtube.url))}" target="_blank" rel="noopener">YouTube에서 보기 ↗</a>`:'',x.campaign_id?`<button type="button" class="primary" data-campaign="${esc(x.campaign_id)}">캠페인 분석 보기</button>`:''].filter(Boolean).join('');
 $('#detail').className='v32-dialog';
 $('#detail-body').innerHTML=`<h2>${esc(x.advertiser)}<small>${esc(x.title||'')}</small></h2><div class="v32-pop">${img}<div class="v32-pop-info"><dl>${rows.map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl><div class="v32-pop-links">${links}</div></div></div>`;
 if(!dialog.open)dialog.showModal()}

// 설정 > 소재·추정 기준
if(typeof v7Tabs!=='undefined')v7Tabs.push(['criteria','소재·추정 기준']);
function v32Criteria(){const c=v32Cfg(),ro=typeof listing!=='undefined'&&listing&&listing.static;
 return `<section class="glass section v32-criteria">${header('소재·추정 기준','YouTube 영상을 소재로 볼 기준과 선공개 캠페인의 예상 광고비 역산 CPV를 정합니다. 바꾸면 타임라인·캠페인 분석·어제 업로드된 크리에이티브의 안내 문구도 함께 바뀌어요.')}
  <form id="v32-criteria-form" class="v32-form"><label>소재로 볼 최소 조회수<span><input name="yt_min_views" type="number" min="1000" max="100000000" step="1000" value="${Number(c.yt_min_views)}" ${ro?'disabled':''}>회</span><small>경쟁사 공식 YouTube 영상이 이 조회수 이상이면 '어제 업로드된 크리에이티브'의 소재와 'YouTube 선공개' 후보로 봐요. 기본 100,000회.</small></label>
  <label>예상 광고비 역산 CPV<span><input name="yt_cpv" type="number" min="1" max="1000" step="1" value="${Number(c.yt_cpv)}" ${ro?'disabled':''}>원</span><small>아덱스 광고비가 아직 없는 YouTube 선공개 캠페인의 예상 광고비 = 조회수 × CPV. 기본 30원.</small></label>
  <div><button class="primary" type="submit" ${ro?'disabled':''}>저장</button>${ro?'<small class="v32-ro">읽기 전용 사이트에서는 바꿀 수 없어요. PC 대시보드에서 바꿔 주세요.</small>':''}</div></form></section>
  <section class="glass section">${header('캠페인 이름 수정 요청','캠페인 분석 화면에서 이름 옆 연필 버튼으로 요청한 내용이에요. 다음 업데이트(수집) 때 반영돼요.')}<div id="v32-renames">${ro?empty('읽기 전용 사이트에서는 요청 목록을 볼 수 없어요.'):'불러오는 중…'}</div></section>`}
if(typeof v7Draw==='function'){var v32BaseDraw=v7Draw;v7Draw=function(){
 if(v7Tab!=='criteria')return v32BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}<div class="v32-criteria-wrap">${v32Criteria()}</div></div>`;
 if(listing&&listing.static)return;
 api('/api/campaign-renames').then(r=>{const el=document.getElementById('v32-renames');if(!el)return;const st={pending:'다음 업데이트 때 반영',applied:'반영 완료',superseded:'새 요청으로 대체'};
  el.innerHTML=r.items&&r.items.length?`<table class="v32-rn"><thead><tr><th>요청 시각</th><th>기존 이름</th><th>새 이름</th><th>상태</th></tr></thead><tbody>${r.items.map(x=>`<tr><td>${esc((x.requested_at||'').slice(0,16).replace('T',' '))}</td><td>${esc(x.old_name||'')}</td><td><b>${esc(x.new_name)}</b></td><td class="s-${esc(x.status)}">${esc(st[x.status]||x.status)}</td></tr>`).join('')}</tbody></table>`:empty('아직 요청이 없어요.')}).catch(e=>{const el=document.getElementById('v32-renames');if(el)el.textContent=e.message})}}
document.addEventListener('submit',async e=>{if(e.target.id!=='v32-criteria-form')return;e.preventDefault();e.stopImmediatePropagation();
 const f=Object.fromEntries(new FormData(e.target));
 try{await api('/api/settings',{yt_min_views:f.yt_min_views,yt_cpv:f.yt_cpv});toast('저장했어요. 안내 문구와 예상 광고비가 새 기준으로 바뀌어요.');if(typeof load==='function')await load();route='settings';v7Tab='criteria';await render()}
 catch(err){toast(err.message)}},true);

// 후보 캠페인 안내 문구의 '조회수 10만 회 이상'도 설정값으로
if(typeof v20CandidateView==='function'){var v32BaseCand=v20CandidateView;v20CandidateView=async function(c){const h=await v32BaseCand(c);return String(h).replace(/조회수 10만 회 이상/g,'조회수 '+v32Num(v32Cfg().yt_min_views)+'회 이상')}}

// 캠페인 이름 수정: 연필 → 비밀번호 → 새 이름
function v32Current(){const id=typeof activeId!=='undefined'?activeId:null;if(!id)return null;
 const fromList=(listing&&listing.campaigns||[]).find(c=>c.id===id);const d=(typeof detailData!=='undefined'&&detailData&&detailData.campaign&&detailData.campaign.id===id)?detailData.campaign:null;
 return {id,name:(d&&d.name)||(fromList&&fromList.name)||'',pending:(d&&d.rename_pending)||(fromList&&fromList.rename_pending)||null}}
function v32Pen(){const h=document.querySelector('#content .v6-title h2, #content .analysis-heading h2');const cur=v32Current();if(!h||!cur)return;
 if(!h.querySelector('.v32-pen')){h.classList.add('v32-name');h.insertAdjacentHTML('beforeend','<button type="button" class="v32-pen" title="캠페인 이름 수정" aria-label="캠페인 이름 수정"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg></button>')}
 const old=h.parentElement.querySelector('.v32-pending');if(old)old.remove();
 if(cur.pending)h.insertAdjacentHTML('afterend',`<p class="v32-pending">이름 수정 대기: <b>${esc(cur.pending.name)}</b> · 다음 업데이트 때 반영돼요</p>`)}
var v32Pw=null;
function v32RenameDialog(step,msg){let dl=document.getElementById('v32-rename');if(!dl){dl=document.createElement('dialog');dl.id='v32-rename';dl.className='v32-rename';document.body.appendChild(dl)}
 const cur=v32Current();if(!cur)return;
 dl.innerHTML=step==='pw'?`<form method="dialog" data-v32-step="pw"><h3>캠페인 이름 수정</h3><p>수정하려면 비밀번호를 입력하세요.</p><input type="password" name="pw" autocomplete="current-password" required autofocus><p class="v32-err">${esc(msg||'')}</p><div class="v32-btns"><button type="button" data-v32-cancel>취소</button><button class="primary" type="submit">확인</button></div></form>`
 :`<form method="dialog" data-v32-step="name"><h3>캠페인 이름 수정</h3><p>새 이름을 입력하세요. 다음 업데이트 때 반영돼요.</p><input type="text" name="name" maxlength="60" required value="${esc((cur.pending&&cur.pending.name)||cur.name)}"><p class="v32-err">${esc(msg||'')}</p><div class="v32-btns"><button type="button" data-v32-cancel>취소</button><button class="primary" type="submit">요청 저장</button></div></form>`;
 if(!dl.open)dl.showModal();const inp=dl.querySelector('input');if(inp){inp.focus();inp.select&&inp.select()}}
document.addEventListener('click',e=>{
 if(e.target.closest('.v32-pen')){e.preventDefault();e.stopPropagation();if(listing&&listing.static){toast('읽기 전용 사이트에서는 이름을 바꿀 수 없어요. PC 대시보드에서 요청해 주세요.');return}v32Pw=null;v32RenameDialog('pw');return}
 if(e.target.closest('[data-v32-cancel]')){const dl=document.getElementById('v32-rename');if(dl)dl.close();v32Pw=null}},true);
document.addEventListener('submit',async e=>{const f=e.target.closest('form[data-v32-step]');if(!f)return;e.preventDefault();e.stopImmediatePropagation();const cur=v32Current();if(!cur)return;
 if(f.dataset.v32Step==='pw'){const pw=f.pw.value;try{await api('/api/campaign-rename/verify',{password:pw});v32Pw=pw;v32RenameDialog('name')}catch(err){v32RenameDialog('pw',err.message||'비밀번호가 맞지 않아요.')}return}
 try{const r=await api('/api/campaign-rename',{campaign_id:cur.id,name:f.name.value,old_name:cur.name,password:v32Pw});v32Pw=null;document.getElementById('v32-rename').close();
  const lc=(listing&&listing.campaigns||[]).find(c=>c.id===cur.id);if(lc)lc.rename_pending={name:r.name,requested_at:new Date().toISOString()};
  if(typeof detailData!=='undefined'&&detailData&&detailData.campaign&&detailData.campaign.id===cur.id)detailData.campaign.rename_pending={name:r.name};
  if(typeof v25Cache!=='undefined')v25Cache.clear();v32Pen();toast('이름 수정 요청을 저장했어요. 다음 업데이트 때 반영돼요.')}
 catch(err){v32RenameDialog('name',err.message)}},true);

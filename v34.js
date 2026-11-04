/* v34 — 2026-11-04 12:40
   1) '신규 소재 모니터링': 최근 60일을 일자별 가로선으로 나눠 한 화면에 이어서(없는 날은 '없음'), 날짜 드롭다운은 그 날짜로 스크롤만.
   2) 캠페인 분석: 쿼리 추정 설명을 쉬운 말로, 길이별 소재 카드마다 그 길이의 YouTube 영상만, 머리 영역 오른쪽 스틸컷(60%부터 서서히),
      묶음 판단 근거·캠페인명 근거 단추 숨김(설정 > 캠페인 묶음 근거, PC 전용).
   3) 타임라인 팝업: 막대에 붙여(위, 자리가 없으면 아래) 커서를 따라 옆으로만 움직이고, 클릭을 막지 않음(마우스가 지나가면 흐려짐). */

// 1) 신규 소재 모니터링 ---------------------------------------------------------
V32_TITLE='신규 소재 모니터링';v32Nav();
function v34DaySection(d,items){
 const head=`<div class="v34-day-head"><b>${v32DayLabel(d)}</b>${d===v32Data.today?'<em>오늘</em>':d===v32Data.yesterday?'<em>어제</em>':''}<span>${items.length?items.length+'개':'없음'}</span></div>`;
 return `<section class="v34-day" id="v34-d-${d}" data-v34-day="${d}">${head}${items.length?`<div class="v32-grid v33-grid">${items.map(v32Card).join('')}</div>`:'<p class="v34-none">새로 올라온 소재가 없어요.</p>'}</section>`}
v32View=function(d){
 const items=v32Items(),by={};items.forEach(x=>(by[x.day]=by[x.day]||[]).push(x));
 return `<p class="v32-note v34-note">AdCreative에 새로 올라온 소재만 방송일 기준 일자별로 보여 줘요(최근 ${d.period_days||60}일). 날짜를 고르면 그 날로 이동해요.</p>
  ${(d.days||[]).map(x=>v34DaySection(x.day,by[x.day]||[])).join('')}
  <p class="footnote v32-foot">매체(채널)·길이·메시지/스타일은 AdCreative 표기 그대로 · 한 소재에 길이가 다른 영상이 있으면 따로 표시 · 아덱스 집행액·캠페인과는 연결하지 않음 · YouTube 카드는 경쟁사 공식 채널에 그날 올라온 조회수 ${v32Num(d.config.yt_min_views)}회 이상 영상(TV 소재와 따로) · 카드에 마우스를 올리면 영상이 재생돼요.</p>`};
v32Controls=function(show){let box=document.querySelector('main>header .v32-ctrl');
 if(!show){if(box)box.remove();return}
 const head=document.querySelector('main>header');if(!head)return;
 if(!box){box=document.createElement('div');box.className='v32-ctrl';head.appendChild(box)}
 const items=v32Items(),cnt={};items.forEach(x=>cnt[x.day]=(cnt[x.day]||0)+1);
 const days=(v32Data.days||[]).map(d=>`<option value="${d.day}">${d.day===v32Data.today?'오늘 · ':d.day===v32Data.yesterday?'어제 · ':''}${v32DayLabel(d.day)} · ${cnt[d.day]?cnt[d.day]+'개':'없음'}</option>`).join('');
 const advs=['',...(v32Data.advertisers||[])];if(v32Adv&&!advs.includes(v32Adv))advs.push(v32Adv);
 box.innerHTML=`<label>날짜로 이동<select id="v32-day" class="chip">${days}</select></label><label>광고주<select id="v32-adv" class="chip">${advs.map(a=>`<option value="${esc(a)}" ${a===v32Adv?'selected':''}>${a?esc(a):'전체 광고주'}</option>`).join('')}</select></label>`};
v32Draw=function(){$('#subtitle').textContent='';v32Controls(true);$('#content').innerHTML=v32View(v32Data);v32Watch();v34SyncDay()};
// 날짜 고르면 그 날짜로 스크롤만(다시 불러오지 않음)
window.addEventListener('change',e=>{if(e.target.id!=='v32-day')return;e.stopPropagation();
 const sec=document.getElementById('v34-d-'+e.target.value);if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'})},true);
// 스크롤하면 드롭다운이 지금 보이는 날짜를 따라감
function v34SyncDay(){const sel=document.getElementById('v32-day');if(!sel)return;
 const secs=[...document.querySelectorAll('.v34-day')];let cur=secs[0];for(const s of secs){if(s.getBoundingClientRect().top<160)cur=s;else break}
 if(cur&&sel.value!==cur.dataset.v34Day)sel.value=cur.dataset.v34Day}
window.addEventListener('scroll',()=>{if(route==='daily')requestAnimationFrame(v34SyncDay)},{passive:true});

// 2) 캠페인 분석 -----------------------------------------------------------------
// 쿼리 추정 설명: 쉬운 말로
var v34BaseTrend=v5TrendPanel;
v5TrendPanel=function(d){let h=v34BaseTrend(d);
 const st=(d.query_estimates&&d.query_estimates.keywords||[]).find(k=>k.keyword===v5TrendKey&&k.status==='ok');
 const ex=st&&st.monthly_pc&&st.monthly_mo?` 예를 들어 ‘${esc(st.keyword)}’는 최근 30일 동안 PC ${number(+st.monthly_pc)}건, 모바일 ${number(+st.monthly_mo)}건 검색됐고, 이 건수를 날짜별 검색 비율대로 나눴어요.`:'';
 h=h.replace(/<p class="footnote v28-formula">[\s\S]*?<\/p>/,`<p class="footnote v28-formula v34-easy"><b>이렇게 추정했어요</b> 네이버 검색광고에서 최근 30일 실제 검색 건수를 받고, 데이터랩에서 날짜별로 검색이 얼마나 많았는지(비율)를 받아, 30일 건수를 그 비율대로 날짜마다 나눴어요. 주별 값은 그 주 7일을 더한 값이에요.${ex}</p>`);
 h=h.replace(/<p class="footnote v28-skip">추정하지 않음\(빈칸\): ([\s\S]*?)<\/p>/,(m,list)=>`<p class="footnote v28-skip">추정하지 않은 키워드(빈칸): ${list.replace(/ — [^·<]*/g,'')} · 데이터랩 비율에 빈 날이 있으면 건수를 나눌 수 없어 비워 둬요.</p>`);
 return h};
// 길이별 소재 카드: 그 길이의 YouTube 영상만
function v34YtLen(t){const m=String(t||'').match(/(\d{1,3})\s*(?:s\b|sec|초|"|″|'|’)/i);const n=m?+m[1]:0;return n>=5&&n<=180?n:0}
var v34BaseExpand=v33Expand;
v33Expand=function(list){const out=v34BaseExpand(list);
 const parts={};out.forEach(r=>{if(r.v33Len)(parts[r.creative_id]=parts[r.creative_id]||[]).push(r)});
 for(const [cid,rs] of Object.entries(parts)){const vids=rs[0].youtube_videos||[];if(!vids.length)continue;
  const lens=vids.map(v=>v34YtLen(v.title)),anyLen=lens.some(Boolean);
  rs.forEach((r,i)=>{const mine=vids.filter((v,k)=>anyLen?(lens[k]?Math.abs(lens[k]-r.v33Len)<=1:i===0):i===0);
   r.youtube_videos=mine;r.youtube_status=mine.length?'matched':'not_found';
   r.youtube_views=mine.some(v=>v.view_count!=null)?mine.reduce((a,v)=>a+(v.view_count||0),0):null;r.youtube_urls=mine.map(v=>v.url)})}
 window.v34Parts=parts;return out};
// 여러 버전 팝업도 그 길이 카드의 영상만
var v34BaseYtRow2=v4YoutubeRow;
v4YoutubeRow=function(r){const h=v34BaseYtRow2(r);return r.v33Len?h.replace(/data-yt-multi="([^"]*)"/,`data-yt-multi="$1" data-v34-len="${r.v33Len}"`):h};
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-yt-multi][data-v34-len]');if(!b)return;e.preventDefault();e.stopPropagation();
 const cid=b.dataset.ytMulti,len=+b.dataset.v34Len,r=((window.v34Parts||{})[cid]||[]).find(x=>x.v33Len===len);if(!r||!detailData)return;
 const base=detailData.creatives;detailData.creatives=[r];try{v12OpenYt(cid)}finally{detailData.creatives=base}},true);
// 머리 영역: 오른쪽 스틸컷(왼쪽 60%는 그대로 투명, 나머지 40%는 서서히 보이게)
function v34Hero(){const box=document.querySelector('#content .analysis-heading');if(!box||!detailData||box.querySelector('.v34-hero'))return;
 const list=[...(detailData.creatives||[])].sort((a,b)=>(b.amount||0)-(a.amount||0));
 const pick=list.find(r=>r.still)||list.find(r=>r.thumbnail&&r.match_status!=='unmatched'&&!/youtube|ytimg/.test(r.thumbnail))||list.find(r=>r.thumbnail);
 const src=pick&&(pick.still||pick.thumbnail);if(!src)return;
 box.classList.add('v34-has-hero');box.insertAdjacentHTML('afterbegin',`<div class="v34-hero" aria-hidden="true" style="background-image:url('${esc(safeUrl(src))}')"></div>`)}
var v34BaseAV=v32AnalysisVideos;
v32AnalysisVideos=function(){v34BaseAV();v34Hero()};
// 설정 > 캠페인 묶음 근거 (PC 전용)
if(typeof v7Tabs!=='undefined'&&/^(127\.0\.0\.1|localhost)$/.test(location.hostname)&&location.port==='8765')v7Tabs.push(['grouping','캠페인 묶음 근거']);
if(typeof v7Draw==='function'){var v34BaseDraw=v7Draw;v7Draw=function(){
 if(v7Tab!=='grouping')return v34BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}<div><section class="glass section">${header('캠페인 묶음 근거','캠페인 분석 화면에서 숨긴 묶음 판단 근거와 캠페인명 근거를 모아 봐요. 이 PC의 대시보드에서만 보여요.')}<div class="v34-ev-tools"><input id="v34-ev-q" placeholder="광고주·캠페인 이름으로 찾기"></div><div id="v34-ev">불러오는 중…</div></section></div></div>`;
 if(v32Static()){$('#v34-ev').innerHTML=empty('읽기 전용 사이트에서는 볼 수 없어요.');return}
 api('/api/campaign-evidence').then(r=>{window.v34Ev=r.items||[];v34EvDraw()}).catch(e=>{$('#v34-ev').textContent=e.message})}}
var V34_SRC={official_campaign:'공식 자료',ad_material:'광고 자료',product_period:'제품·집행 시기',evergreen:'상시 캠페인'};
function v34EvDraw(){const el=document.getElementById('v34-ev');if(!el)return;const q=(document.getElementById('v34-ev-q')||{}).value||'';
 const rows=(window.v34Ev||[]).filter(x=>!q||(x.advertiser+' '+x.name+' '+x.category).includes(q));
 el.innerHTML=rows.length?`<table class="v32-rn v34-ev"><thead><tr><th>광고주 · 품목</th><th>캠페인</th><th>소재</th><th>묶음 판단 근거</th><th>캠페인명 근거</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.advertiser)}<small>${esc(x.category)}</small></td><td><b>${esc(x.name)}</b></td><td>${x.creatives}개</td><td>${esc(x.rationale)}</td><td>${esc(V34_SRC[x.name_source_type]||x.name_source_type||'')}${x.name_source_url?` · <a href="${esc(safeUrl(x.name_source_url))}" target="_blank" rel="noopener">열기 ↗</a>`:''}${x.name_reason&&x.name_reason!==x.rationale?`<small>${esc(x.name_reason)}</small>`:''}</td></tr>`).join('')}</tbody></table>`:empty('찾는 캠페인이 없어요.')}
document.addEventListener('input',e=>{if(e.target.id==='v34-ev-q')v34EvDraw()});

// 3) 타임라인 팝업: 막대에 붙고, 커서를 따라 옆으로만, 클릭은 그대로 통과 -------------
var v34Dock={bar:null,click:false};
window.addEventListener('pointerdown',e=>{v34Dock.click=!!(e.target.closest&&e.target.closest('[data-gantt^="ytc-"],[data-campaign^="ytc-"]'))},true);
var v34BaseShow=v5Show;
v5Show=function(id,target){v34BaseShow(id,target);const box=$('#campaign-hover');if(!box||!target)return;
 const inGantt=!!target.closest('#gantt-scroll');box.classList.toggle('v34-dock',inGantt&&!v34Dock.click);v34Dock.click=false;
 if(!inGantt)return;v34Dock.bar=target;
 if(box.classList.contains('v34-dock')&&!box.querySelector('.v34-hint'))box.insertAdjacentHTML('beforeend','<p class="v34-hint">막대를 누르면 캠페인 분석으로 이동해요</p>');v34Place()};
function v34Place(){const box=$('#campaign-hover'),bar=v34Dock.bar;if(!box||box.hidden||!bar||!box.classList.contains('v34-dock')||!document.body.contains(bar))return;
 const r=bar.getBoundingClientRect(),w=box.offsetWidth||320,h=box.offsetHeight||260,gap=10;
 const px=Math.min(Math.max((v5Pointer&&v5Pointer.x)||r.left+r.width/2,r.left),r.right);
 let below=false,y=r.top-h-gap;if(y<10){y=r.bottom+gap;below=true}if(y+h>innerHeight-8)y=Math.max(8,innerHeight-h-8);
 // 팝업 왼쪽 끝이 커서보다 조금 오른쪽(화면 오른쪽이면 반대편)
 let x=px+20;if(x+w>innerWidth-12)x=px-w-20;x=Math.max(12,x);
 box.style.left=x+'px';box.style.top=y+'px';box.style.setProperty('--v34-ax',Math.min(Math.max(px-x,18),w-18)+'px');
 box.classList.toggle('v34-below',below);box.classList.toggle('v34-left',x<px)}
document.addEventListener('pointermove',e=>{const box=$('#campaign-hover');if(!box||box.hidden||!box.classList.contains('v34-dock'))return;
 requestAnimationFrame(v34Place);
 const b=box.getBoundingClientRect();box.classList.toggle('v34-ghost',e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom)},{passive:true});
document.addEventListener('scroll',()=>requestAnimationFrame(v34Place),{passive:true,capture:true});

// 4) 디지털 광고비가 아덱스에 아직 안 들어온 기간: 공식 YouTube 조회수 × CPV 추정 ------------------
function v34Est(){const d=typeof detailData!=='undefined'?detailData:null;const e=d&&d.youtube_estimate;if(!e||!e.amount)return;
 const chips=document.querySelector('#content .v6-chips');if(chips&&!chips.querySelector('.v34-est'))chips.insertAdjacentHTML('beforeend','<span class="v6-chip v34-est" title="아덱스 디지털 광고비 미공개 기간의 YouTube는 조회수 × CPV로 추정">YouTube 추정 포함</span>');
 const label=[...document.querySelectorAll('#content *')].find(x=>x.children.length===0&&x.textContent.trim()==='보정 추정 광고비');
 const card=label&&label.parentElement;if(card&&!card.querySelector('.v34-est-note'))card.insertAdjacentHTML('beforeend',`<small class="v34-est-note">YouTube 추정 ${v4Money(e.amount)}원 포함 · 조회수 ${number(e.views)}회 × CPV ${number(e.cpv)}원</small>`);
 if(document.querySelector('#content .v34-yt-est'))return;
 const after=document.querySelector('#content .carousel-section');if(!after)return;
 const cut=e.digital_cutoff?e.digital_cutoff.replace(/-/g,'.'):'';
 after.insertAdjacentHTML('afterend',`<section class="glass section v34-yt-est">${header('YouTube 소재 · 광고비 추정',`아덱스 디지털 광고비가 ${cut}까지만 들어와 있어, 그 뒤에 올라온 공식 YouTube 영상은 조회수 × CPV ${number(e.cpv)}원으로 광고비를 추정했어요(설정 > 소재·추정 기준).`)}
  <div class="v34-yt-grid">${e.videos.map(v=>`<a class="v34-yt-card" href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener"><span class="v34-yt-thumb">${v.thumbnail?`<img src="${esc(safeUrl(v.thumbnail))}" alt="" loading="lazy">`:''}<em>추정</em></span><b>${esc(v.title||'')}</b><small>${esc((v.published_at||'').replace(/-/g,'.'))} 공개 · 조회수 ${number(v.view_count||0)}회${v.linked_creative?' · TV 소재와 같은 영상':''}</small><strong>예상 광고비 ${v4Money(v.estimate)}원</strong></a>`).join('')}</div></section>`)}
var v34BaseAV2=v32AnalysisVideos;
v32AnalysisVideos=function(){v34BaseAV2();v34Est()};

/* v33 — 2026-11-04 11:40
   1) 왼쪽 위 코웨이 로고 → 캠페인 타임라인.
   2) 새로 업로드된 소재: AdCreative 정보만(집행액·캠페인·YouTube 연결 없음), 같은 품목·광고주끼리 이어서, 카드 작게,
      영상은 마우스를 올린 카드만 재생, 카드·팝업에서 영상 다운로드.
   3) 캠페인 분석: 'TV소재 자세히보기' 팝업(영상 왼쪽·카피 오른쪽·스토리보드 아래·다운로드), 주요 소재는 길이(15초·30초…)별로 나눠 표시. */

// 1) 로고 → 타임라인
document.addEventListener('click',e=>{const b=e.target.closest('.sidebar .brand');if(!b)return;e.preventDefault();
 const nav=document.querySelector('.sidebar [data-route="timeline"]');if(nav)nav.click()},true);

// 공통: 영상 다운로드 이름
function v33FileName(parts,src){const ext=(String(src).match(/\.(mp4|mp3)(?:$|\?)/i)||[,'mp4'])[1];
 return parts.filter(Boolean).join('_').replace(/[\\/:*?"<>|\s]+/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'').slice(0,90)+'.'+ext}
function v33Download(src,name,label){if(!src)return '';const cross=/^https?:\/\/127\.0\.0\.1/.test(src)&&location.hostname!=='127.0.0.1';
 return `<a class="v33-dl" href="${esc(src)}" download="${esc(name)}" ${cross?'target="_blank" rel="noopener"':''} title="${cross?'이 PC의 대시보드에서 원본을 엽니다':'영상 파일 저장'}">⬇ ${esc(label||'영상 다운로드')}</a>`}

// 2) 새로 업로드된 소재 ---------------------------------------------------------
v32VideoTag=function(src,poster,cls,auto){if(!src)return '';return `<video class="${cls||''}" src="${esc(src)}" ${poster?`poster="${esc(safeUrl(poster))}"`:''} muted loop playsinline preload="${auto?'auto':(poster?'none':'metadata')}" ${auto?'autoplay':''} data-v32-video onerror="this.remove()"></video>`};
v32Card=function(x){
 const vsrc=v32Vid(x.video,x.video_web);
 const thumb=x.thumbnail?`<img src="${esc(safeUrl(x.thumbnail))}" alt="" loading="lazy">`:`<span class="v32-noimg">${(x.media||[]).includes('라디오')?'라디오 소재':'이미지 없음'}</span>`;
 const meta=[x.length?x.length+'초':'',x.message_style||''].filter(Boolean);
 const where=[x.category_label,(x.media||[]).join(' · '),x.type==='basis'?(x.channels||[])[0]:''].filter(Boolean).join(' · ');
 const dl=vsrc?v33Download(vsrc,v33FileName([x.advertiser,x.title,x.length?x.length+'초':''],vsrc),'저장'):'';
 return `<div class="v32-card v33-card glass" role="button" tabindex="0" data-v32-card="${esc(x.id)}"><div class="v32-thumb">${thumb}${vsrc?v32VideoTag(vsrc,x.thumbnail,'v32-cardvid',false):''}${x.type==='youtube'?'<em class="v32-tag yt">YouTube · '+v32ViewsLabel(x.youtube&&x.youtube.views)+'회</em>':''}${vsrc?'<em class="v32-tag vid">▶ 영상</em>':''}${dl?`<span class="v33-card-dl">${dl}</span>`:''}</div>
  <div class="v32-body"><small>${esc(where)}</small><b>${esc(x.advertiser)}</b><p>${esc(x.title||x.product||'')}</p>
  ${meta.length?`<span class="v32-meta">${meta.map(m=>`<i>${esc(m)}</i>`).join('')}</span>`:''}</div></div>`};
// 카드 순서는 서버에서 같은 품목·광고주끼리 이어지게 정렬
v32View=function(d){
 const items=v32Items();
 const late=d.day!==d.today&&d.day!==d.yesterday?`<p class="v32-note">AdCreative는 방송일보다 1~3일 늦게 등록되는 경우가 많아요. 자료가 있는 가장 최근 방송일(${v32DayLabel(d.day)})을 보여 줘요.</p>`:'';
 if(!items.length)return `${late}<section class="glass section">${empty(v32DayLabel(d.day)+' 방송일로 AdCreative에 새로 올라온 소재가 없어요.',v32Adv?'선택한 광고주의 소재가 이날 없어요.':'대상 품목·경쟁사 조건(설정 > 인덱스)에 맞는 소재가 없거나 아직 등록되지 않았어요.')}</section>`;
 const html=`<div class="v32-grid v33-grid">${items.map(v32Card).join('')}</div>`;
 return `${late}${html}<p class="footnote v32-foot">AdCreative 방송일 ${v32DayLabel(d.day)} 기준 새로 등록된 소재 · 매체(채널)·길이·메시지/스타일은 AdCreative 표기 그대로 · 한 소재에 길이가 다른 영상이 있으면 따로 표시 · 아덱스 집행액·캠페인과는 연결하지 않음 · YouTube 카드는 경쟁사 공식 채널에 그날 올라온 조회수 ${v32Num(d.config.yt_min_views)}회 이상 영상(TV 소재와 따로 표시) · 카드에 마우스를 올리면 영상이 재생돼요.</p>`};
v32Draw=function(){$('#subtitle').textContent=`AdCreative 방송일 ${v32DayLabel(v32Data.day)} · 소재 ${v32Items().length}개${v32Adv?' · '+v32Adv:''}`;v32Controls(true);
 const sel=document.getElementById('v32-day');if(sel)[...sel.options].forEach(o=>{if(o.value===v32Data.today)o.textContent='오늘 · '+o.textContent.replace(/^어제 · /,'')});
 $('#content').innerHTML=v32View(v32Data);v32Watch()};
// 영상: 새로 업로드된 소재 카드는 마우스를 올린 카드만 재생, 캠페인 분석 소재는 화면에 보일 때 재생
var v33BaseWatch=v32Watch;
v32Watch=function(){
 if(!('IntersectionObserver' in window))return;if(v32IO)v32IO.disconnect();
 v32IO=new IntersectionObserver(es=>{for(const e of es){const v=e.target;if(e.isIntersecting){v.preload='auto';const p=v.play();if(p&&p.catch)p.catch(()=>{})}else v.pause()}},{rootMargin:'120px'});
 document.querySelectorAll('#content video[data-v32-video]').forEach(v=>{if(!v.closest('.v33-card'))v32IO.observe(v)})};
document.addEventListener('pointerover',e=>{const card=e.target.closest&&e.target.closest('.v33-card');if(!card||card.contains(e.relatedTarget))return;
 const v=card.querySelector('video.v32-cardvid');if(v){card.classList.add('v33-playing');v.preload='auto';const p=v.play();if(p&&p.catch)p.catch(()=>{})}});
document.addEventListener('pointerout',e=>{const card=e.target.closest&&e.target.closest('.v33-card');if(!card||card.contains(e.relatedTarget))return;
 const v=card.querySelector('video.v32-cardvid');card.classList.remove('v33-playing');if(v){v.pause();try{v.currentTime=0}catch(_){}}});
// 카드 안 다운로드 단추는 팝업을 열지 않음
window.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.v33-card .v33-dl'))e.stopPropagation()},true);
document.addEventListener('keydown',e=>{const c=e.target.closest&&e.target.closest('.v33-card');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();c.click()}});
v32Open=function(x){if(!x)return;const dialog=$('#detail');
 const vsrc=v32Vid(x.video,x.video_web),asrc=x.audio?v32Vid(x.audio,null):null;
 const fail=`this.outerHTML='<div class=&quot;v32-pop-none&quot;>영상을 불러오지 못했어요. 공개 사이트에서는 이 PC의 대시보드가 켜져 있어야 지난 영상을 볼 수 있어요.</div>'`;
 const media=vsrc?`<video class="v32-pop-video" src="${esc(vsrc)}" ${x.thumbnail?`poster="${esc(safeUrl(x.thumbnail))}"`:''} controls autoplay playsinline onerror="${fail}"></video>`:asrc?`<audio src="${esc(asrc)}" controls autoplay></audio>`:'';
 const img=!vsrc&&x.original?`<img class="v32-pop-img" src="${esc(safeUrl(x.original))}" alt="${esc(x.title)}">`:(!vsrc&&!asrc?`<div class="v32-pop-none">${(x.media||[]).includes('라디오')?'라디오 소재라 이미지가 없어요.':'원본 이미지를 아직 확보하지 못했어요.'}</div>`:'');
 const yt=x.type==='youtube';
 const rows=yt?[['광고주',x.advertiser],['품목',x.category_label],['매체','공식 YouTube'],['조회수',x.youtube&&x.youtube.views!=null?v32Num(x.youtube.views)+'회':''],['길이',x.length?x.length+'초 (영상 제목 표기)':'']]
  :[['광고주',x.advertiser],['품목',x.category_label],['상품',x.product],['매체',x.media_detail||(x.media||[]).join(' · ')],['채널',(x.channels||[]).join(', ')],['길이',x.length?x.length+'초':''],
   ['AdCreative 초수',x.basis_seconds&&x.basis_seconds!==x.length+'초'?x.basis_seconds:''],['메시지/스타일',x.message_style||''],['모델',x.model||''],['방송일',x.air_day?x.air_day.replace(/-/g,'.'):'']];
 const dls=vsrc?v33Download(vsrc,v33FileName([x.advertiser,x.title,x.length?x.length+'초':''],x.video),'영상 다운로드'):(asrc?v33Download(asrc,v33FileName([x.advertiser,x.title],asrc),'음원 다운로드'):'');
 const links=[dls,x.source_url?`<a href="${esc(safeUrl(x.source_url))}" target="_blank" rel="noopener">AdCreative 원본 ↗</a>`:'',yt&&x.youtube?`<a href="${esc(safeUrl(x.youtube.url))}" target="_blank" rel="noopener">YouTube에서 보기 ↗</a>`:''].filter(Boolean).join('');
 dialog.className='v32-dialog';
 $('#detail-body').innerHTML=`<h2>${esc(x.advertiser)}<small>${esc(x.title||'')}</small></h2><div class="v32-pop"><div class="v32-pop-media">${media}${img}</div><div class="v32-pop-info"><dl>${rows.filter(r=>r[1]).map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl><div class="v32-pop-links">${links}</div>${vsrc&&v32Static()&&!x.video_web?'<p class="footnote">지난 영상은 이 PC의 대시보드가 켜져 있을 때만 재생·다운로드돼요.</p>':''}</div></div>`;
 if(!dialog.open)dialog.showModal()};

// 3) 캠페인 분석 -----------------------------------------------------------------
// 단추 이름
var v33BaseYtRow=v4YoutubeRow;
v4YoutubeRow=function(r){return v33BaseYtRow(r).replace('TV 스토리보드 확인하기','TV소재 자세히보기')};
// 주요 소재: 길이별로 나눔(TV 집행액을 길이별로, 그 밖의 매체 집행은 가장 큰 길이 카드에)
function v33Expand(list){const out=[];
 for(const r of list){const sp=r.length_split||[];if(sp.length<2){out.push(r);continue}
  const tv=(r.media_spend&&r.media_spend.tv)||0,other=Math.max(0,(r.amount||0)-tv);
  sp.forEach((s,i)=>{const ms=i===0?{...(r.media_spend||{}),tv:s.amount}:{tv:s.amount};
   out.push({...r,amount:s.amount+(i===0?other:0),media_spend:ms,durations:[s.seconds],duration_source:'아덱스 TV 집행 초수(길이별)',youtube_spend:i===0?r.youtube_spend:0,v33Len:s.seconds,v33Part:i})})}
 return out}
var v33BaseMaterial=materialCarousel;
materialCarousel=function(d){const list=v33Expand(d.creatives||[]);window.v33Lens={};
 list.forEach(r=>{if(r.v33Len)(window.v33Lens[r.creative_id]=window.v33Lens[r.creative_id]||[]).push(r.v33Len)});
 return v33BaseMaterial({...d,creatives:list})};
// 렌더 뒤: 같은 소재의 길이별 카드에 길이 표시(그 소재 카드가 나온 순서 = 길이 순서)
function v33MarkLengths(){const seen={};
 document.querySelectorAll('#content article.material-card').forEach(card=>{const t=card.querySelector('[data-story-creative]');if(!t)return;const cid=t.dataset.storyCreative;const lens=(window.v33Lens||{})[cid];if(!lens)return;
  const k=seen[cid]=(seen[cid]||0);seen[cid]++;const L=lens[k];if(!L)return;card.dataset.v33Len=L;
  const thumb=card.querySelector('.material-thumb');if(thumb&&!thumb.querySelector('.v33-len'))thumb.insertAdjacentHTML('beforeend',`<em class="v33-len">${L}초</em>`)})}
function v33VideoFor(cid,len){const seen=new Set();const vs=v32CreativeVideos(cid).filter(v=>{const k=Math.round(v.seconds||0);if(seen.has(k))return false;seen.add(k);return true});if(!vs.length)return [];if(!len)return vs;
 const near=vs.filter(v=>v.seconds&&Math.abs(v.seconds-len)<=2);return near}
v32AnalysisVideos=function(){
 v33MarkLengths();
 document.querySelectorAll('#content .material-card .material-thumb[data-story-creative]').forEach(btn=>{
  if(btn.querySelector('video'))return;const len=Number(btn.closest('article')&&btn.closest('article').dataset.v33Len||0);
  const vs=v33VideoFor(btn.dataset.storyCreative,len);if(!vs.length)return;
  const v=vs[0],src=v32Vid(v.file,v.web);if(!src)return;const img=btn.querySelector('img');
  btn.insertAdjacentHTML('afterbegin',v32VideoTag(src,img&&img.getAttribute('src'),'v32-matvid',true));btn.classList.add('v32-has-video')});
 v32Watch()};
// 'TV소재 자세히보기' 팝업: 영상(왼쪽) + 카피(오른쪽), 스토리보드는 아래, 영상 다운로드
v32StoryVideo=function(){};
v4OpenStory=function(el){
 const cid=el.dataset.storyCreative,r=v4Creative(cid),sb=el.dataset.storyboard||(r&&r.storyboard)||'';
 const art=el.closest&&el.closest('article.material-card');const len=Number(art&&art.dataset.v33Len||0);
 let vs=v33VideoFor(cid,len);const all=v32CreativeVideos(cid);if(!vs.length&&!len)vs=all;
 const name=(i,v)=>v33FileName([r&&r.product,r&&(r.copyline||'').replace(/^,+/,''),v.seconds?Math.round(v.seconds)+'초':'',vs.length>1?'편집본'+(i+1):''],v.file);
 const tabs=vs.length>1?`<div class="v32-vtabs">${vs.map((v,i)=>`<button type="button" class="${i?'':'on'}" data-v32-vsrc="${esc(v32Vid(v.file,v.web))}" data-v33-dl="${esc(name(i,v))}">${v.seconds?Math.round(v.seconds)+'초':'편집본 '+(i+1)}</button>`).join('')}</div>`:'';
 const first=vs[0],src=first?v32Vid(first.file,first.web):'';
 const video=first?`<div class="v33-story-video">${tabs}<video src="${esc(src)}" controls autoplay playsinline onerror="this.outerHTML='<p class=&quot;footnote&quot;>영상을 불러오지 못했어요. 공개 사이트에서는 이 PC의 대시보드가 켜져 있어야 지난 영상을 볼 수 있어요.</p>'"></video><div class="v33-story-actions">${v33Download(src,name(0,first),'영상 다운로드')}${len&&!all.some(v=>v.seconds&&Math.abs(v.seconds-len)<=2)?'':''}</div></div>`
  :`<div class="v33-story-video none">${len&&all.length?`<p class="footnote">${len}초 편 원본 영상은 아직 확보하지 못했어요(확보한 영상: ${all.map(v=>Math.round(v.seconds||0)+'초').join(', ')}).</p>`:'<p class="footnote">원본 영상을 아직 확보하지 못했어요.</p>'}</div>`;
 const dialog=$('#detail');dialog.className='story-dialog v4-story v33-story';
 $('#detail-body').innerHTML=`<h2>${esc(r?.product||'')}<small>${esc(r?.copyline||el.dataset.storyTitle||'')}${len?` · ${len}초`:''}</small></h2>
  <div class="v33-story-top">${video}<div class="v33-story-copy">${v4CopyBlock(r)}</div></div>
  ${sb?`<div class="v33-story-board"><h3>스토리보드</h3><img class="storyboard-modal-image" src="${esc(safeUrl(sb))}" alt="AdCreative 저장 스토리보드"></div>`:''}`;
 dialog.showModal();const box=$('#story-hover');if(box)box.hidden=true};
// 편집본 탭을 바꾸면 다운로드 단추도 그 영상으로
document.addEventListener('click',e=>{const b=e.target.closest('[data-v33-dl]');if(!b)return;const box=b.closest('.v33-story-video');const a=box&&box.querySelector('.v33-dl');if(a){a.href=b.dataset.v32Vsrc;a.download=b.dataset.v33Dl}});

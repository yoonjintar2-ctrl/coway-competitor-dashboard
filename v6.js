/* v6 — 2026-11-03 Claude 2차 요청: 광고주 열·행 구분, 막대 굵기, 무채색 매체 아이콘, 뒤로가기, 라디오 소재 우측, 스토리보드는 클릭으로만,
   제목 강조, 매체 구분 설정, 브랜드 채널 모니터. v5 다음에 로드. */
var v6Label=()=>innerWidth<=800?230:290;
/* ---------- 타임라인 ---------- */
var v6BaseTimeline=timeline;
timeline=function(){
 let h=v6BaseTimeline();
 // 금액 비례 막대 굵기 (품목 내 최대 대비, 7~18px)
 const max=new Map();for(const c of listing.campaigns){max.set(c.category,Math.max(max.get(c.category)||0,c.adjusted_amount))}
 h=h.replace(/<button class="gantt-bar v5-flight([^"]*)" data-gantt="([^"]+)"([^>]*)style="([^"]*)">/g,(a,cls,id,attrs,style)=>{const c=listing.campaigns.find(x=>x.id===id);if(!c)return a;const r=Math.sqrt(Math.max(0,c.adjusted_amount)/(max.get(c.category)||1));const t=Math.round(7+r*11);return `<button class="gantt-bar v5-flight${cls}" data-gantt="${id}" data-adv="${esc(c.advertiser)}"${attrs}style="${style};--thick:${t}px">`});
 h=h.replace(/<div class="gantt-category">/g,'<div class="gantt-category"><div class="v6-adv-col"></div>');
 h=h.replace('<div class="gantt-corner">품목</div>','<div class="gantt-corner v6-corner"><span>품목</span><span>광고주</span></div>');
 return h;
};
var v6LaneH=60;
mountTimeline=function(){
 const el=$('#gantt-scroll');if(!el)return;const label=v6Label(),px=Math.max(1,(el.clientWidth-label)/Number(el.dataset.visible));
 el.style.setProperty('--day',px+'px');el.style.setProperty('--canvas-width',(label+px*Number(el.dataset.days))+'px');el.style.setProperty('--label',label+'px');
 el.scrollLeft=v6Saved&&v6Saved.restore?v6Saved.left:el.scrollWidth-el.clientWidth;
 layoutVisibleFlights();
 if(!el.dataset.v6){el.dataset.v6='1';el.addEventListener('scroll',()=>{hideV3Hover();requestAnimationFrame(layoutVisibleFlights);v5FloatState()},{passive:true})}
 v5FloatState();v5FloatPos();
 if(v6Saved&&v6Saved.restore){window.scrollTo({top:v6Saved.top,behavior:'instant'});v6Saved.restore=false}
};
layoutVisibleFlights=function(){
 const el=$('#gantt-scroll');if(!el)return;const label=v6Label(),px=parseFloat(el.style.getPropertyValue('--day'))||12,left=el.scrollLeft/px,right=left+(el.clientWidth-label)/px;
 const origin=v3Day(listing.period.history_start||listing.period.start),from=v3ISO(origin+Math.floor(left)),to=v3ISO(Math.min(v3Day(listing.period.end),origin+Math.ceil(right)-1));$('#subtitle').textContent=dateLabel(from)+' — '+dateLabel(to)+' 표시 · 좌우 버튼으로 이동';
 for(const month of el.querySelectorAll('.gantt-month-track span')){const next=month.nextElementSibling,inside=el.scrollLeft>=month.offsetLeft&&el.scrollLeft<(next?.offsetLeft||Infinity);month.style.paddingLeft=(inside?el.scrollLeft-month.offsetLeft+9:9)+'px'}
 for(const row of el.querySelectorAll('.gantt-row')){
   const bars=[...row.querySelectorAll('[data-gantt]')],byId=new Map(bars.map(b=>[b.dataset.gantt,b])),rows=bars.map(b=>{const c=listing.campaigns.find(x=>x.id===b.dataset.gantt);const lab=b.querySelector('.v5-label');c._labelDays=((lab?.scrollWidth||120)+16)/px;return c});
   const placed=placeBrandFlights(rows,left,right);for(const b of bars)b.hidden=true;
   const blocks=new Map();
   for(const {c,lane} of placed.items){const b=byId.get(c.id);b.hidden=false;b.style.top=(12+lane*v6LaneH)+'px';const lab=b.querySelector('.v5-label');lab.style.left=Math.max(0,el.scrollLeft-b.offsetLeft)+'px';const k=c.advertiser,bl=blocks.get(k)||{from:lane,to:lane};bl.from=Math.min(bl.from,lane);bl.to=Math.max(bl.to,lane);blocks.set(k,bl)}
   const ordered=[...blocks].sort((a,b)=>a[1].from-b[1].from);
   const col=row.querySelector('.v6-adv-col');if(col)col.innerHTML=ordered.map(([name,bl],i)=>`<div class="v6-adv ${i%2?'odd':''}" style="top:${bl.from*v6LaneH+4}px;height:${(bl.to-bl.from+1)*v6LaneH}px;--brand:${brandColor(name)}"><span>${esc(name)}</span></div>`).join('');
   const track=row.querySelector('.gantt-track');let bands=track.querySelector('.v6-bands');if(!bands){bands=document.createElement('div');bands.className='v6-bands';track.prepend(bands)}
   bands.innerHTML=ordered.map(([name,bl],i)=>`<i class="${i%2?'odd':''}" style="top:${bl.from*v6LaneH+4}px;height:${(bl.to-bl.from+1)*v6LaneH}px"></i>`).join('');
   row.style.height=Math.max(78,placed.count*v6LaneH+24)+'px';const s=row.querySelector('.gantt-category small');if(s)s.textContent=placed.items.length+'개 캠페인';
 }
};
/* 뒤로가기: 타임라인 위치 기억 */
var v6Saved=null;
document.addEventListener('click',e=>{const card=e.target.closest('[data-campaign]');if(card&&route==='timeline'){const el=$('#gantt-scroll');v6Saved={left:el?el.scrollLeft:0,top:window.scrollY,restore:false}}},true);
document.addEventListener('click',async e=>{const b=e.target.closest('[data-v6-back]');if(!b)return;e.preventDefault();if(v6Saved)v6Saved.restore=true;route='timeline';await render()});
/* ---------- 캠페인 분석 ---------- */
var v6BaseMaterial=materialCarousel;
materialCarousel=function(d){const radio=r=>(r.media||[]).length&&r.media.every(k=>k==='radio');return v6BaseMaterial({...d,creatives:[...d.creatives].sort((a,b)=>radio(a)-radio(b))})};
var v6BaseDetail=detailView;
detailView=function(d){
 const c=d.campaign,cat=listing.categories.find(x=>x.code===c.category)?.label||'';let h=v6BaseDetail(d);
 const head=`<div class="v6-title" style="--brand:${signatureColor(c.advertiser)}"><button class="v6-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인</button><div class="v6-chips"><span class="v6-chip adv">${esc(c.advertiser)}</span><span class="v6-chip cat">${esc(cat)}</span>${c.review_status==='evergreen'?'<span class="v6-chip">상시 캠페인</span>':''}${c.ongoing?'<span class="v6-chip onair">ON AIR</span>':''}</div><h2>${esc(c.name)}</h2>`;
 h=h.replace(/<div class="analysis-heading"><div><span class="eyebrow">[\s\S]*?<\/span><h2>[\s\S]*?<\/h2>/,'<div class="analysis-heading v6-heading">'+head);
 return h;
};
/* ---------- 내비게이션: 브랜드 채널 · 설정 ---------- */
(function(){const nav=document.querySelector('.sidebar nav');if(!nav||nav.querySelector('[data-route="channels"]'))return;nav.insertAdjacentHTML('beforeend','<button class="nav" data-route="channels">브랜드 채널</button><button class="nav" data-route="settings">설정</button>')})();
var v6Media=null,v6MediaFilter='',v6Channels=null,v6Group=0;
var v6BaseRender=render;
render=async function(){
 if(route!=='settings'&&route!=='channels')return v6BaseRender();
 document.querySelectorAll('[data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route===route));
 $('#page-title').textContent=route==='settings'?'설정 · 매체 구분':'브랜드 채널 모니터';
 $('#content').innerHTML='<div class="loading glass">자료를 불러오고 있습니다.</div>';
 if(route==='settings'){v6Media=await api('/api/media-classes');$('#subtitle').textContent='TV 채널과 인쇄 매체의 구분을 관리합니다. 저장하면 광고비 집계·트리맵에 바로 반영됩니다.';$('#content').innerHTML=v6SettingsView()}
 else{v6Channels=v6Channels||await api('/api/watchlist');$('#subtitle').textContent='품목별 브랜드의 공식 YouTube·Instagram·TVCF를 한 곳에서 봅니다.';$('#content').innerHTML=v6ChannelsView()}
};
function v6SettingsView(){
 const rows=v6Media.rows.filter(r=>!v6MediaFilter||r.name.toLowerCase().includes(v6MediaFilter.toLowerCase())||r.media_class===v6MediaFilter),opts=c=>v6Media.classes.map(x=>`<option ${x===c?'selected':''}>${x}</option>`).join('');
 const counts=v6Media.classes.map(c=>`${c} ${v6Media.rows.filter(r=>r.media_class===c).length}`).join(' · ');
 return `<section class="glass section v6-settings">${header('매체 구분',`등록 ${v6Media.rows.length}개 · ${counts}`,`<button class="primary" id="v6-media-save">변경 사항 저장</button>`)}<div class="v6-tools"><input id="v6-media-filter" placeholder="매체명 검색 또는 구분(지상파·케이블·종편·라디오·신문·잡지)" value="${esc(v6MediaFilter)}"><form id="v6-media-add"><input name="name" placeholder="새 매체명 (아덱스 표기 그대로)" required maxlength="60"><select name="cls">${opts('케이블')}</select><button class="secondary">추가</button></form></div><div class="v6-media-grid">${rows.map(r=>`<div class="v6-media-row" data-media-name="${esc(r.name)}"><span>${esc(r.name)}</span><select data-media-class>${opts(r.media_class)}</select><button data-media-del title="삭제">×</button></div>`).join('')||empty('검색 결과가 없습니다.')}</div><p class="footnote">목록에 없는 방송 채널은 이름 규칙(-TV 지상파, -FM/-RD 라디오, JTBC·MBN·TV조선·채널A 종편, 그 외 케이블)으로 분류합니다. 인쇄 매체는 신문/잡지 구분이 트리맵 중분류로 표시됩니다.</p></section>${v6Media.unlisted.length?`<section class="glass section">${header('아덱스에서 관측됐지만 목록에 없는 매체',`${v6Media.unlisted.length}개 · 현재 규칙으로 분류 중 · 추가를 누르면 목록에 넣습니다`)}<div class="v6-media-grid">${v6Media.unlisted.map(u=>`<div class="v6-media-row unlisted"><span>${esc(u.name)}<small>${u.kind==='print'?'인쇄':'방송'} · ${v4Money(u.amount)}원</small></span><select data-unlisted-class>${opts(u.rule_class.startsWith('신문')?'신문':u.rule_class)}</select><button data-unlisted-add="${esc(u.name)}" title="목록에 추가">＋</button></div>`).join('')}</div></section>`:''}`;
}
function v6CollectMedia(){return [...document.querySelectorAll('.v6-media-row[data-media-name]')].map(r=>({name:r.dataset.mediaName,media_class:r.querySelector('select').value}))}
function v6ChannelsView(){
 const g=v6Channels.groups[v6Group]||v6Channels.groups[0];if(!g)return empty('브랜드 모니터링 목록이 없습니다.');
 return `<div class="v6-tabs">${v6Channels.groups.map((x,i)=>`<button data-channel-group="${i}" class="${i===v6Group?'active':''}">${esc(x.name)} <b>${x.brands.length}</b></button>`).join('')}</div><div class="v6-brand-grid">${g.brands.map(b=>`<article class="glass v6-brand" style="--brand:${signatureColor(b.advertiser)}"><header><div><strong>${esc(b.brand)}</strong><small>${esc(b.advertiser)}${b.spend_12m?` · 최근 12개월 관측 광고비 ${v4Money(b.spend_12m)}원`:''}</small></div><div class="v6-brand-links">${b.channel?`<a href="${esc(safeUrl(b.channel.url))}" target="_blank" rel="noopener">YouTube ↗</a>`:b.youtube?`<a href="https://www.youtube.com/${esc(b.youtube)}/videos" target="_blank" rel="noopener">YouTube ↗</a>`:''}${b.instagram?`<a href="${esc(safeUrl(b.instagram))}" target="_blank" rel="noopener">Instagram ↗</a>`:''}${(b.tvcf||[]).map((t,i)=>`<a href="${esc(safeUrl(t))}" target="_blank" rel="noopener">TVCF${b.tvcf.length>1?' '+(i+1):''} ↗</a>`).join('')}</div></header>${b.videos.length?`<div class="v6-video-rail">${b.videos.map(v=>`<a href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener" title="${esc(v.title)}"><span><img src="${esc(safeUrl(v.thumbnail))}" alt="" loading="lazy"><time>${dateLabel(v.published_at.slice(0,10))}</time>${v.match_status==='confirmed'?'<em>광고 소재</em>':''}</span><b>${esc(v.title)}</b>${v.view_count!=null?`<small>조회수 ${number(v.view_count)}회</small>`:''}</a>`).join('')}</div><p class="footnote">최근 12개월 업로드 ${b.video_count}개 중 최신 6개</p>`:`<p class="v6-empty">${b.youtube?'YouTube 영상 수집 대기 · 다음 YouTube 수집 때 채널을 등록합니다':'YouTube 채널 미지정 (원본 목록 기준)'}</p>`}</article>`).join('')}</div><p class="footnote">${esc(v6Channels.source||'')} · ${esc(v6Channels.note||'')}</p>`;
}
document.addEventListener('click',async e=>{
 const g=e.target.closest('[data-channel-group]');if(g){v6Group=Number(g.dataset.channelGroup);$('#content').innerHTML=v6ChannelsView();return}
 const del=e.target.closest('[data-media-del]');if(del){del.closest('.v6-media-row').remove();return}
 const add=e.target.closest('[data-unlisted-add]');if(add){const row=add.closest('.v6-media-row'),cls=row.querySelector('select').value;v6Media.rows=[...v6CollectMediaAll(),{name:add.dataset.unlistedAdd,media_class:cls}];v6Media.unlisted=v6Media.unlisted.filter(u=>u.name!==add.dataset.unlistedAdd);$('#content').innerHTML=v6SettingsView();toast(add.dataset.unlistedAdd+' 추가 · 저장을 눌러 반영하세요.');return}
 if(e.target.id==='v6-media-save'){try{v6Media=await api('/api/media-classes',{rows:v6CollectMediaAll()});$('#content').innerHTML=v6SettingsView();toast('매체 구분을 저장했습니다. 광고비 집계에 반영됩니다.')}catch(err){toast(err.message)}return}
});
function v6CollectMediaAll(){const shown=new Map(v6CollectMedia().map(r=>[r.name,r]));const visibleNames=new Set([...document.querySelectorAll('.v6-media-row[data-media-name]')].map(r=>r.dataset.mediaName));const removed=new Set(v6Media.rows.filter(r=>(!v6MediaFilter||r.name.toLowerCase().includes(v6MediaFilter.toLowerCase())||r.media_class===v6MediaFilter)&&!visibleNames.has(r.name)).map(r=>r.name));return v6Media.rows.filter(r=>!removed.has(r.name)).map(r=>shown.get(r.name)||r)}
document.addEventListener('change',e=>{if(e.target.matches('[data-media-class]')){const row=e.target.closest('.v6-media-row');const r=v6Media.rows.find(x=>x.name===row.dataset.mediaName);if(r)r.media_class=e.target.value}});
document.addEventListener('input',e=>{if(e.target.id==='v6-media-filter'){v6Media.rows=v6CollectMediaAll();v6MediaFilter=e.target.value;const pos=e.target.selectionStart;$('#content').innerHTML=v6SettingsView();const i=$('#v6-media-filter');i.focus();i.setSelectionRange(pos,pos)}});
document.addEventListener('submit',e=>{if(e.target.id==='v6-media-add'){e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim();if(!name)return;if(v6Media.rows.some(r=>r.name.replace(/\s/g,'').toUpperCase()===name.replace(/\s/g,'').toUpperCase())){toast('이미 등록된 매체입니다.');return}v6Media.rows=[...v6CollectMediaAll(),{name,media_class:f.get('cls')}];v6MediaFilter='';$('#content').innerHTML=v6SettingsView();toast(name+' 추가 · 저장을 눌러 반영하세요.')}});

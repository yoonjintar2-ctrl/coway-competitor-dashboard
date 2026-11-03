/* v4 — 2026-11-03 Claude 인계 수정. v3.js 다음에 로드되어 일부 화면 함수만 덮어씁니다.
   게시일 표시, 원본 카피, 소재별 집행 매체·공식 YouTube 업로드, 트리맵 비중, 월별 표 전치, 이미지 미확보 사유. */
const v4Money=n=>n==null?'—':Number(n)===0?'0':Math.abs(n)>=1e9?Math.round(n/1e8).toLocaleString('ko-KR')+'억':Math.abs(n)>=1e8?(n/1e8).toLocaleString('ko-KR',{maximumFractionDigits:1})+'억':(n/1e4).toLocaleString('ko-KR',{maximumFractionDigits:1})+'만';
const v4Icons={
 tv:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="13" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M9 2.5l3 2.5 3-2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 youtube:'<svg viewBox="0 0 28 20" aria-hidden="true"><rect x="0.5" y="0.5" width="27" height="19" rx="5" fill="#ff0033"/><path d="M11.2 5.6v8.8l7.4-4.4z" fill="#fff"/></svg>',
 radio:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="8" width="19" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15.5" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 12h4M6 16h4M5 8l12-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 print:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 digital:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 18h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
const v4MediaLabels={tv:'TV',youtube:'YouTube',digital_other:'기타 디지털',radio:'라디오',print:'신문·잡지'};
const v4Pct=(v,t)=>t?(v/t*100):0,v4PctLabel=p=>p>=10?p.toFixed(0)+'%':p>=0.1?p.toFixed(1)+'%':p>0?'0.1% 미만':'0%';
const v4Million=v=>(v/1e6).toLocaleString('ko-KR',{maximumFractionDigits:1,minimumFractionDigits:1});
function v4Creative(id){return detailData?.creatives?.find(c=>c.creative_id===id)}

/* 1. 브랜드 포스팅: 게시일 YYYY.MM.DD 강조, 조회수 값이 없으면 문구 자체 생략 */
brandPostsPanel=function(d){
 const info=d.brand_posts;if(!info)return '';let rows=[...info.posts];
 if(postSort==='views')rows.sort((a,b)=>(b.view_count??-1)-(a.view_count??-1)||b.relevance_score-a.relevance_score);
 if(postSort==='recent')rows.sort((a,b)=>b.posted_at.localeCompare(a.posted_at));
 const relation=p=>p.relation==='campaign_confirmed'?'캠페인 소재':p.relation==='product_related'?'제품 관련':'동기간 게시물';
 return `<section class="glass section brand-posts carousel-section">${header('캠페인 기간 브랜드 포스팅',`${dateLabel(info.start)} — ${dateLabel(info.end)} · ${rows.length}개 · 카드를 누르면 전체 포스팅`,`<select id="post-sort" aria-label="포스팅 정렬"><option value="relevance" ${postSort==='relevance'?'selected':''}>관련성순</option><option value="views" ${postSort==='views'?'selected':''}>조회수순</option><option value="recent" ${postSort==='recent'?'selected':''}>최신순</option></select>`)}<div class="brand-post-rail" id="brand-post-rail">${rows.map(p=>`<button class="compact-post v4-post" data-post="${esc(p.id)}"><span class="v4-post-media">${p.thumbnail?`<img src="${esc(safeUrl(p.thumbnail))}" alt="">`:'<span class="post-placeholder">Instagram</span>'}<time class="v4-post-date" datetime="${esc(p.posted_at.slice(0,10))}">${dateLabel(p.posted_at.slice(0,10))}</time></span><div><small class="v4-post-platform">${p.platform==='youtube'?v4Icons.youtube+'YouTube':'Instagram'} · ${relation(p)}</small><strong>${esc(p.platform==='instagram'&&p.summary?p.summary:p.title)}</strong>${p.view_count!=null?`<span>조회수 ${number(p.view_count)}회</span>`:''}</div></button>`).join('')}${!rows.length?empty('기간 내 게시일이 확인된 공식 포스팅이 없습니다.'):''}</div>${rows.length>1?'<button class="carousel-float prev" data-post-scroll="-1" aria-label="이전 포스팅">‹</button><button class="carousel-float next" data-post-scroll="1" aria-label="다음 포스팅">›</button>':''}<p class="footnote">공식 채널의 기간 내 게시물 · 게시일은 한국시간 기준 · 조회수는 확인 시점 누적값이며 확인된 경우에만 표시합니다.</p></section>`
};
showBrandPost=function(id){
 const p=detailData?.brand_posts?.posts.find(p=>p.id===id);if(!p)return;let embed='';
 if(p.platform==='youtube'){const v=new URL(p.url).searchParams.get('v');if(/^[\w-]{11}$/.test(v||''))embed=`<iframe class="post-embed youtube" src="https://www.youtube-nocookie.com/embed/${v}" title="${esc(p.title)}" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`}
 if(p.platform==='instagram'){const m=new URL(p.url).pathname.match(/^\/(?:p|reel)\/([\w-]+)\//);if(m)embed=`<iframe class="post-embed instagram" src="https://www.instagram.com/p/${m[1]}/embed/" title="Instagram 전체 포스팅" loading="lazy"></iframe>`}
 if(embed&&p.platform==='youtube'&&p.thumbnail)embed=`<div class="post-player" style="background-image:url('${esc(safeUrl(p.thumbnail))}')">${embed}</div>`;
 const dialog=$('#detail');dialog.className='post-dialog';
 const views=p.view_count!=null?`누적 조회수 ${number(p.view_count)}회${p.views_observed_at?' · '+esc(p.views_observed_at.slice(0,16).replace('T',' '))+' 관측':''} · `:'';
 $('#detail-body').innerHTML=`<div class="v4-post-head"><time class="v4-post-date static">${dateLabel(p.posted_at.slice(0,10))}</time><small>${p.platform==='youtube'?'YouTube':'Instagram'} 게시</small></div><h2>${esc(p.title)}</h2>${embed||(p.thumbnail?`<img class="post-full-image" src="${esc(safeUrl(p.thumbnail))}" alt="${esc(p.title)}">`:'')}${p.summary?`<p class="post-full-summary">${esc(p.summary)}</p>`:''}<p class="footnote">${views}원문 표시가 제한되면 아래 링크에서 확인하세요.</p><a class="primary post-original" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">공식 포스팅 원문 열기 ↗</a>`;dialog.showModal();
};

/* 2·5. 주요 소재: 이미지 사유, 집행 매체 아이콘, 공식 YouTube 업로드, 원본 카피 */
function v4ImagePlaceholder(r){
 const kind=r.image_status||'not_checked';
 const title={radio:'라디오 소재',no_visual:'원천 이미지 없음',unmatched:'정확한 매칭 미확정',source_failed:'원천 접근 실패',not_checked:'원본 이미지 미확보',pending:'원본 이미지 미확보'}[kind]||'원본 이미지 미확보';
 return `<span class="image-pending v4-pending ${esc(kind)}">${kind==='radio'?v4Icons.radio:''}<b>${title}</b><small>${esc(r.image_note||'')}</small></span>`;
}
function v4MediaBadges(r){
 const s=r.media_spend||{},order=['tv','youtube','digital_other','radio','print'];
 return `<span class="v4-media" aria-label="집행 매체">${order.filter(k=>s[k]>0).map(k=>{const icon=k==='tv'?v4Icons.tv:k==='youtube'?v4Icons.youtube:k==='radio'?v4Icons.radio:k==='print'?v4Icons.print:v4Icons.digital;const extra=k==='digital_other'&&r.digital_sites?.length?' ('+r.digital_sites.join('·')+')':'';return `<i class="v4-media-icon ${k}" tabindex="0" title="${esc(v4MediaLabels[k]+extra)} · ${number(s[k])}원" aria-label="${esc(v4MediaLabels[k]+extra)} ${number(s[k])}원">${icon}</i>`}).join('')}</span>`;
}
function v4YoutubeRow(r){
 const v=r.youtube_videos||[];
 if(r.youtube_status==='matched'){const main=v.find(x=>!x.shorts)||v[0],rest=v.length-1,views=v.some(x=>x.view_count!=null)?v.reduce((a,x)=>a+(x.view_count||0),0):null;
  return `<div class="v4-yt matched"><a href="${esc(safeUrl(main.url))}" target="_blank" rel="noopener" title="${esc(main.title)}">${v4Icons.youtube}<span>YouTube 공식 업로드</span>↗</a>${views!=null?`<small>누적 조회수 ${number(views)}회${v.length>1?` · ${v.length}개 버전 합계`:''}</small>`:''}${rest>0?`<details><summary>다른 버전 ${rest}개</summary>${v.filter(x=>x!==main).map(x=>`<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.title)}${x.view_count!=null?` · ${number(x.view_count)}회`:''} ↗</a>`).join('')}</details>`:''}</div>`}
 if(r.youtube_status==='not_found')return '<div class="v4-yt muted">공식 YouTube 채널에서 같은 소재 업로드 미확인</div>';
 if(r.youtube_status==='no_channel')return '<div class="v4-yt muted">공식 YouTube 채널 미등록 광고주</div>';
 return '';
}
materialCarousel=function(d){
 return `<section class="glass section carousel-section">${header('주요 소재','이미지에 마우스를 올리면 스토리보드와 원본 카피, 클릭하면 확대 팝업을 봅니다. 아이콘은 이 소재가 집행된 매체입니다.')}<div class="material-carousel" id="material-carousel">${d.creatives.map(r=>{const openable=r.storyboard||r.copy_versions?.length;return `<article class="material-card v4-material"><button class="material-thumb" ${openable?`data-story-creative="${esc(r.creative_id)}"`:''} ${r.storyboard?`data-storyboard="${esc(r.storyboard)}" data-story-title="${esc(r.copyline)}"`:''} ${openable?'':'tabindex="-1"'}>${r.thumbnail?`<img src="${esc(safeUrl(r.thumbnail))}" alt="${esc(r.copyline)}">`:v4ImagePlaceholder(r)}${r.storyboard?'<span class="story-hint">스토리보드·카피 ↗</span>':r.copy_versions?.length?'<span class="story-hint">원본 카피 ↗</span>':''}</button><div class="v4-spend-row"><strong>${v4Money(r.amount)}원</strong>${v4MediaBadges(r)}</div>${v4YoutubeRow(r)}<div class="material-caption"><h3>${esc(r.product)}</h3><p title="아덱스 소재 식별명">${esc(r.copyline)}</p><dl><dt>영상 길이</dt><dd title="${esc(r.duration_source||'원천 확인')}">${r.durations?.length?r.durations.join(' · ')+'초':'—'}</dd><dt>집행 기간</dt><dd>${dateLabel(r.first_seen)} — ${dateLabel(r.last_seen)}</dd></dl><small>YouTube 매체비 ${v4Money(r.youtube_spend)}원 · 공개 조회수와 별개</small></div></article>`}).join('')}</div>${d.creatives.length>1?'<button class="carousel-float prev" data-carousel="-1" aria-label="이전 소재">‹</button><button class="carousel-float next" data-carousel="1" aria-label="다음 소재">›</button>':''}</section>`
};
function v4CopyBlock(r,compact=false){
 if(!r?.copy_versions?.length)return compact?'':`<div class="v4-copy empty-copy">AdCreative 원본에서 확인된 광고 카피가 없습니다. 아덱스 소재명은 장면 식별명이라 카피로 쓰지 않습니다.</div>`;
 const versions=compact?r.copy_versions.slice(0,1):r.copy_versions;
 return `<div class="v4-copy${compact?' compact':''}">${compact?'':'<h3>원본 광고 카피·대사</h3>'}${versions.map(v=>`<div class="v4-copy-version">${v.version?`<span class="v4-copy-tag">${esc(v.version)} 버전</span>`:''}${(compact?v.lines.slice(0,4):v.lines).map(l=>`<p>${l.speaker?`<b>${esc(l.speaker)}</b>`:''}<span>${esc(l.text)}</span></p>`).join('')}${compact&&v.lines.length>4?'<p class="more">… 클릭해 전체 보기</p>':''}</div>`).join('')}${compact?'':`<p class="footnote">출처 AdCreative 소재 상세 원문${r.copy_source?` · <a href="${esc(safeUrl(r.copy_source))}" target="_blank" rel="noopener">원본 열기 ↗</a>`:''} · 표기·띄어쓰기는 원문 그대로입니다.</p>`}</div>`;
}
function v4OpenStory(el){
 const r=v4Creative(el.dataset.storyCreative),sb=el.dataset.storyboard;
 const dialog=$('#detail');dialog.className='story-dialog v4-story';
 $('#detail-body').innerHTML=`<h2>${esc(r?.product||'')}<small>${esc(r?.copyline||el.dataset.storyTitle||'')}</small></h2><div class="v4-story-grid ${sb?'':'copy-only'}">${sb?`<img class="storyboard-modal-image" src="${esc(safeUrl(sb))}" alt="AdCreative 저장 스토리보드">`:''}${v4CopyBlock(r)}</div>`;
 dialog.showModal();const box=$('#story-hover');if(box)box.hidden=true;
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-story-creative]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();v4OpenStory(el)},true);
document.addEventListener('pointerover',e=>{
 const el=e.target.closest('[data-story-creative]');if(!el)return;const r=v4Creative(el.dataset.storyCreative);if(!r)return;
 let box=$('#story-hover');if(!box){box=document.createElement('div');box.id='story-hover';document.body.appendChild(box)}
 const rect=el.getBoundingClientRect();box.innerHTML=`${el.dataset.storyboard?`<img src="${esc(safeUrl(el.dataset.storyboard))}" alt="저장한 스토리보드 미리보기">`:''}${v4CopyBlock(r,true)}`;box.classList.add('v4-hover');box.hidden=false;
 requestAnimationFrame(()=>{const h=box.offsetHeight||300;box.style.left=Math.max(12,Math.min(rect.left,innerWidth-430))+'px';box.style.top=Math.max(12,rect.bottom+8+h<innerHeight?rect.bottom+8:rect.top-h-8)+'px'});
});
document.addEventListener('pointerout',e=>{const el=e.target.closest('[data-story-creative]');if(el&&!el.contains(e.relatedTarget)){const box=$('#story-hover');if(box)box.hidden=true}});

/* 3. 트리맵: 금액·전체 대비 비중 우선, TV는 지상파 / 케이블&종편 구획, 작은 셀은 hover·focus 툴팁 */
const v4GroupTint={'지상파':'#1479b4','케이블&종편':'#3db2e4'};
treeMap=function(rows){
 const valid=rows.filter(r=>r.amount>0);if(!valid.length)return empty('집행 매체 관측이 없습니다.');
 const total=valid.reduce((a,r)=>a+r.amount,0),byParent=new Map();
 for(const r of valid){if(!byParent.has(r.parent))byParent.set(r.parent,new Map());const g=byParent.get(r.parent);if(!g.has(r.group))g.set(r.group,[]);g.get(r.group).push(r)}
 const tops=[...byParent].map(([name,groups])=>({name,groups:[...groups].map(([g,children])=>({name:g,children:children.sort((a,b)=>b.amount-a.amount),amount:children.reduce((a,r)=>a+r.amount,0)})).sort((a,b)=>b.amount-a.amount),amount:[...groups.values()].flat().reduce((a,r)=>a+r.amount,0)})).sort((a,b)=>b.amount-a.amount);
 const path=r=>[r.parent,r.parent==='TV'?r.group:(r.group!==r.parent?r.group:''),r.sub,r.name].filter(Boolean).join(' › ');
 const leafLabel=r=>{const share=v4Pct(r.amount,total);return share>=4?`<span><b>${v4PctLabel(share)}</b><em>${v4Money(r.amount)}원</em><small>${esc(r.sub?r.sub+' · '+r.name:r.name)}</small></span>`:share>=1.5?`<span><b>${v4PctLabel(share)}</b><small>${esc(r.name)}</small></span>`:''};
 const leaves=(children,tint)=>partition(children,0,0,100,100).map((r,i)=>`<div class="tree-leaf v4-leaf" tabindex="0" data-tree-tip="${esc(path(r))}|${number(r.amount)}|${v4PctLabel(v4Pct(r.amount,total))}" aria-label="${esc(path(r))} ${number(r.amount)}원 전체의 ${v4PctLabel(v4Pct(r.amount,total))}" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;background:${tint};--shade:${.05+(i%4)*.07}">${leafLabel(r)}</div>`).join('');
 const boxes=partition(tops,0,0,100,100);
 return `<div class="treemap v4-treemap">${boxes.map(b=>{const share=v4PctLabel(v4Pct(b.amount,total)),color=palette[b.name]||'#7f9aab';const inner=(b.name==='TV'||b.name==='인쇄')&&b.groups.length>1?`<div class="tree-children v4-groups">${partition(b.groups,0,0,100,100).map(g=>`<div class="v4-group" style="left:${g.x}%;top:${g.y}%;width:${g.w}%;height:${g.h}%"><strong class="v4-group-label">${esc(g.name)} <b>${v4PctLabel(v4Pct(g.amount,total))}</b> <em>${v4Money(g.amount)}원</em></strong><div class="v4-group-body">${leaves(g.children,v4GroupTint[g.name]||color)}</div></div>`).join('')}</div>`:`<div class="tree-children">${leaves(b.groups.flatMap(g=>g.children).sort((x,y)=>y.amount-x.amount),color)}</div>`;return `<div class="tree-parent v4-parent" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%;background:${color}"><strong>${esc(b.name)} <b>${share}</b> <em>${v4Money(b.amount)}원</em></strong>${inner}</div>`}).join('')}</div><div class="legend">${tops.map(r=>`<span><i class="dot" style="background:${palette[r.name]}"></i>${esc(r.name)} ${v4PctLabel(v4Pct(r.amount,total))} · ${v4Money(r.amount)}원</span>`).join('')}${tops.find(t=>t.name==='TV')?.groups.length>1?tops.find(t=>t.name==='TV').groups.map(g=>`<span><i class="dot" style="background:${v4GroupTint[g.name]}"></i>TV · ${esc(g.name)} ${v4PctLabel(v4Pct(g.amount,total))}</span>`).join(''):''}</div><p class="footnote">비중은 이 캠페인 전체 ${number(total)}원 대비 · ${adjusted()?'보정 추정액 기준':'관측 원본 금액 기준'} · 작은 칸은 마우스를 올리거나 Tab으로 이동하면 경로·금액·비중을 보여줍니다.</p><details class="tree-table"><summary>매체별 상세 금액</summary><table class="data-table"><thead><tr><th>대분류</th><th>중분류</th><th>구분</th><th>세부</th><th class="num">원</th><th class="num">비중</th></tr></thead><tbody>${[...valid].sort((a,b)=>b.amount-a.amount).map(r=>`<tr><td>${esc(r.parent)}</td><td>${esc(r.group)}</td><td>${esc(r.sub||'—')}</td><td>${esc(r.name)}</td><td class="num">${number(r.amount)}</td><td class="num">${v4PctLabel(v4Pct(r.amount,total))}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="4">합계</th><td class="num">${number(total)}</td><td class="num">100%</td></tr></tfoot></table></details>`;
};
function v4TreeTip(el){let tip=$('#tree-tip');if(!tip){tip=document.createElement('div');tip.id='tree-tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip)}const [p,amount,share]=el.dataset.treeTip.split('|');tip.innerHTML=`<small>${esc(p)}</small><strong>${esc(amount)}원</strong><span>전체의 ${esc(share)}</span>`;tip.hidden=false;const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.max(8,Math.min(r.left+r.width/2-w/2,innerWidth-w-8))+'px';tip.style.top=(r.top-h-8>8?r.top-h-8:r.bottom+8)+'px'}
function v4HideTip(){const t=$('#tree-tip');if(t)t.hidden=true}
document.addEventListener('pointerover',e=>{const el=e.target.closest('[data-tree-tip]');if(el)v4TreeTip(el)});
document.addEventListener('pointerout',e=>{const el=e.target.closest('[data-tree-tip]');if(el&&!el.contains(e.relatedTarget))v4HideTip()});
document.addEventListener('focusin',e=>{const el=e.target.closest('[data-tree-tip]');if(el)v4TreeTip(el);else v4HideTip()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')v4HideTip()});
window.addEventListener('scroll',v4HideTip,{passive:true});

/* 4. 최근 12개월 월별 광고비: 가로 = 월, 세로 = 매체 */
advertiserMonthlyPanel=function(d){
 const data=d.advertiser_monthly;if(!data)return '';const keys=data.buckets,months=data.rows,lastMonth=data.end.slice(0,7);
 const rowTotal=k=>months.reduce((s,r)=>s+r.media[k],0),rawTotal=k=>months.reduce((s,r)=>s+r.raw_media[k],0),grand=months.reduce((s,r)=>s+r.total,0);
 const cell=(v,raw)=>`<td title="원본 ${number(raw)}원 · 표시 ${number(v)}원">${v?v4Million(v):'—'}</td>`;
 return `<section class="glass section advertiser-monthly">${header(`${esc(d.campaign.advertiser)} · 최근 12개월 월별 매체 광고비`,`${data.start} — ${data.end} · ${esc(data.scope)} 합산 · 단위 백만원${adjusted()?' · 보정 추정액':''}`)}<div class="monthly-table-scroll"><table class="data-table monthly-spend-table v4-monthly"><thead><tr><th scope="col">매체</th>${months.map(r=>`<th scope="col">${r.month.slice(2).replace('-','.')}${r.month===lastMonth?'*':''}</th>`).join('')}<th scope="col" class="v4-total-col">12개월 합계</th></tr></thead><tbody>${keys.map(k=>`<tr><th scope="row">${buckets[k]}</th>${months.map(r=>cell(r.media[k],r.raw_media[k])).join('')}<td class="v4-total-col" title="원본 ${number(rawTotal(k))}원 · 표시 ${number(rowTotal(k))}원">${rowTotal(k)?v4Million(rowTotal(k)):'—'}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">월 합계</th>${months.map(r=>`<td title="${number(r.total)}원">${r.total?v4Million(r.total):'—'}</td>`).join('')}<td class="v4-total-col" title="${number(grand)}원">${v4Million(grand)}</td></tr></tfoot></table></div><p class="footnote">* 마지막 월은 선택 종료일(${dateLabel(data.end)})까지의 부분월입니다. —는 확보된 원본에서 집행액이 관측되지 않은 항목입니다. 최신 배너 일부 구간은 미확인 상태이며 합계는 확보 금액 기준입니다. 셀에 마우스를 올리면 원 단위 금액을 확인합니다.</p></section>`
};

/* v28 — 2026-11-03: YouTube 선공개 캡슐은 광고비 확인 전까지 진행 중(우측 벽까지 열림), 트리맵은 대분류를 가로 띠로 쌓고 중분류를 나란히 배치 */
(function(){const base=v18Open;v18Open=function(c){return c.review_status==='yt_candidate'?true:base(c)};v17Open=v18Open})();
// 트리맵: 대분류(TV·인쇄…) = 위아래 띠, 중분류(지상파·케이블&종편…) = 띠 안에서 좌우로 나란히, 매체 = squarify
function v28Bands(items,x,y,w,h){
 // 띠 높이는 금액의 제곱근 비례(작은 대분류도 글자가 들어갈 높이 확보), 최소 30%
 const list=items.filter(i=>i.amount>0).slice().sort((a,b)=>b.amount-a.amount);if(!list.length)return [];
 const wt=list.map(i=>Math.sqrt(i.amount)),sum=wt.reduce((s,v)=>s+v,0),MIN=list.length>1?30:0;let hs=wt.map(v=>v/sum*h);
 const lack=hs.reduce((s,v)=>s+Math.max(0,MIN-v),0);if(lack>0){const room=hs.reduce((s,v)=>s+(v>MIN?v-MIN:0),0);hs=hs.map(v=>v<MIN?MIN:MIN+(v-MIN)*(1-lack/room))}
 let cy=y;return list.map((r,i)=>{const o={...r,x,y:cy,w,h:hs[i]};cy+=hs[i];return o});
}
function v28Cols(items,x,y,w,h){
 // 중분류는 좌우로 나란히. 띠 안에서 8% 미만인 작은 중분류는 맨 오른쪽 한 칸에 위아래로 쌓음
 const list=items.filter(i=>i.amount>0).slice().sort((a,b)=>(a.name==='지상파'?-1:b.name==='지상파'?1:0)||b.amount-a.amount);const total=list.reduce((s,i)=>s+i.amount,0);if(!total)return [];
 let big=list.filter(i=>i.amount/total>=.08),small=list.filter(i=>i.amount/total<.08);if(!big.length||small.length<2){big=list;small=[]}
 const st=small.reduce((s,i)=>s+i.amount,0),sw=small.length?Math.max(st/total*w,16):0,bt=big.reduce((s,i)=>s+i.amount,0);
 let cx=x;const out=big.map(r=>{const cw=r.amount/bt*(w-sw);const o={...r,x:cx,y,w:cw,h};cx+=cw;return o});
 const sq2=small.map(i=>Math.sqrt(i.amount)),ss=sq2.reduce((s,v)=>s+v,0);let cy=y;for(const [k,r] of small.entries()){const rh=sq2[k]/ss*h;out.push({...r,x:cx,y:cy,w:sw,h:rh});cy+=rh}
 return out;
}
// v4 기본 트리맵(v8BaseTree)을 직접 사용: 모든 매체를 넘겨 비중이 캠페인 전체 대비가 되게 하고, 6% 미만 대분류는 띠 배치에서 빼고 아래 가로 띠로 표시
var v28Small=new Set();
function v28Route(items,x,y,w,h){return items.length&&items[0].groups?v28Bands(items.filter(i=>!v28Small.has(i.name)),x,y,w,h):items.length&&items[0].children?v28Cols(items,x,y,w,h):v8Squarify(items,x,y,w,h)}
treeMap=function(rows){
 const valid=rows.filter(r=>r.amount>0),total=valid.reduce((a,r)=>a+r.amount,0);if(!total)return v8BaseTree(rows);
 const byParent=new Map();for(const r of valid)byParent.set(r.parent,(byParent.get(r.parent)||0)+r.amount);
 const big=[...byParent].filter(([p,v])=>v/total>=.06);v28Small=new Set(big.length?[...byParent].filter(([p,v])=>v/total<.06).map(([p])=>p):[]);
 const _p=partition;partition=v28Route;let html;
 try{html=v8BaseTree(rows)}finally{partition=_p}
 html=html.replace('class="treemap v4-treemap"','class="treemap v4-treemap v28-bands"')
  // 중분류 칸 경계선: 왼쪽·위쪽에만 흰 선(바깥 끝선이 대분류 머리띠와 정확히 맞도록)
  .replace(/<div class="v4-group" style="left:([\d.e-]+)%;top:([\d.e-]+)%/g,(m,l,t)=>`<div class="v4-group${parseFloat(l)>0.01?' v28-gl':''}${parseFloat(t)>0.01?' v28-gt':''}" style="left:${l}%;top:${t}%`);
 if(v28Small.size){const pal={'TV':'#219dd6','디지털':'#27b0aa','인쇄':'#9b8ac7','라디오':'#d5ab67'};
  const strip=`<div class="v8-small">${[...v28Small].sort((a,b)=>byParent.get(b)-byParent.get(a)).map(p=>{const v=byParent.get(p),c=pal[p]||'#7f9aab';const kids=valid.filter(r=>r.parent===p).sort((a,b)=>b.amount-a.amount);return `<div class="v8-small-item" style="--c:${c}" tabindex="0" data-tree-tip="${esc(p+' 전체 · '+kids.map(k=>k.group+(k.sub?' '+k.sub:'')+' '+k.name).slice(0,4).join(', '))}|${number(v)}|${v4PctLabel(v4Pct(v,total))}"><i></i><b>${esc(p)}</b><span>${v4Money(v)}원 · ${v4PctLabel(v4Pct(v,total))}</span></div>`}).join('')}</div>`;
  html=html.replace('<div class="legend">',strip+'<div class="legend">')}
 return html;
};
// 경쟁사 광고비 비교: 브랜드 고유색이 비슷해(파랑·빨강 계열) 구분이 어려움 → 이 그래프에서만 서로 다른 색 계열로 표시
var V28_ANNUAL_COLORS=['#1f8fd6','#f08a24','#2fa36b','#8b5cc9','#e0485f','#c9a227','#4b5d73'],v28AnnualMap={};
function v28WithAnnualColors(fn){const saved={};for(const [n,c] of Object.entries(v28AnnualMap)){saved[n]=v3BrandPalette[n];v3BrandPalette[n]=c}
 try{return fn()}finally{for(const [n,c] of Object.entries(saved)){if(c===undefined)delete v3BrandPalette[n];else v3BrandPalette[n]=c}}}
var v28BaseAnnual=annualPanel;
annualPanel=function(d){
 const tot=new Map();for(const r of d.annual||[])tot.set(r.advertiser,(tot.get(r.advertiser)||0)+r.amount);
 const sel=d.campaign.advertiser,names=[sel,...[...tot.keys()].filter(a=>a!==sel).sort((p,q)=>tot.get(q)-tot.get(p))];
 v28AnnualMap={};let k=1;names.forEach(n=>{v28AnnualMap[n]=n==='코웨이'?V28_ANNUAL_COLORS[0]:V28_ANNUAL_COLORS[1+((k++-1)%(V28_ANNUAL_COLORS.length-1))]});  // 코웨이는 항상 파랑
 return v28WithAnnualColors(()=>v28BaseAnnual(d));
};
var v28BaseAnnualCard=v12AnnualCard;v12AnnualCard=function(i,ev){return v28WithAnnualColors(()=>v28BaseAnnualCard(i,ev))};
// 설정 > '외부 연결' 탭: 네이버 데이터랩 API 키(주차별 쿼리 추이 전체 브랜드·데일리 갱신용). 키 값은 화면·응답에 다시 표시하지 않음
v7Tabs.push(['api','외부 연결']);
function v28ApiCard(){return `<section class="glass section v28-naver">${header('네이버 쿼리 추정','keyword.jintar.co.kr 쿼리 추정기와 같은 방식·같은 키로 일별 추정 검색수를 매일 1회 증분 수집합니다. 키는 PC 서버 환경변수에서만 읽고 화면·코드·GitHub에는 넣지 않습니다.')}<div id="v28-q-state" class="v28-qgrid">상태 확인 중…</div><p class="footnote">환경변수: NAVER_HUB_CLIENT_ID · NAVER_HUB_CLIENT_SECRET · NAVER_SEARCHAD_LICENSE · NAVER_SEARCHAD_SECRET · NAVER_SEARCHAD_CUSTOMER. 호출은 순차(0.3초 간격), 429·5xx는 1→2→4→8초 재시도. 데이터랩 사용량은 기존 추정기와 월 한도를 함께 씁니다.</p></section>`}
var v28BaseDraw=v7Draw;
v7Draw=function(){
 if(v7Tab!=='api')return v28BaseDraw();
 $('#content').innerHTML=`<div class="v7-layout">${v7Menu()}${v28ApiCard()}</div>`;
 const el=document.getElementById('v28-q-state');
 if(listing?.static){el.textContent='읽기 전용 사이트 · 수집 상태는 PC의 로컬 대시보드에서 확인합니다.';return}
 (async()=>{try{const r=await api('/api/query-usage');const ok=Object.values(r.keys).every(Boolean);const t=r.calls.today,m=r.calls.month;
  el.innerHTML=`<div><span>키 연결</span><b class="${ok?'on':'off'}">${ok?'5개 모두 연결됨':'연결 대기'}</b><small>${Object.entries(r.keys).map(([k,v])=>(v?'✓ ':'✕ ')+esc(k)).join('<br>')}</small></div><div><span>오늘 호출 (${esc(r.calls.day)})</span><b>${number(t.datalab_hub||0)}회</b><small>데이터랩 · 검색광고 ${number(t.searchad||0)}회</small></div><div><span>이번 달 호출</span><b>${number(m.datalab_hub||0)}회</b><small>데이터랩 · 검색광고 ${number(m.searchad||0)}회</small></div>`}catch(e){el.textContent='상태를 확인하지 못했습니다(서버 재시작 필요할 수 있음).'}})();
};

// 트리맵 글자: 칸 안에 다 들어가지 않으면 줄여 보고(비중+이름 → 이름만), 그래도 잘리면 표시하지 않음
function v28Fits(span){if(span.scrollHeight>span.clientHeight+1||span.scrollWidth>span.clientWidth+1)return false;for(const n of span.children)if(n.scrollWidth>n.clientWidth+1)return false;return true}
function v28FitLabels(){for(const el of document.querySelectorAll('.v28-bands .v4-leaf:not([data-v28])')){const span=el.querySelector('span');if(!span)continue;el.dataset.v28='1';
 if(v28Fits(span))continue;const name=(el.dataset.treeTip||'').split('|')[0].split(' › ').pop(),share=(el.dataset.treeTip||'').split('|')[2]||'';
 span.className='v27-mini';span.innerHTML=`<small>${esc(name)}</small><em>${esc(share)}</em>`;if(v28Fits(span))continue;
 span.innerHTML=`<small>${esc(name)}</small>`;if(v28Fits(span))continue;span.remove()}
 // 중분류 이름표: 칸이 낮거나 좁으면 이름만, 그래도 잘리면 숨김(마우스 오버 툴팁은 유지)
 for(const g of document.querySelectorAll('.v28-bands .v4-group:not([data-v28])')){g.dataset.v28='1';const lab=g.querySelector('.v4-group-label');if(!lab)continue;
  if(g.clientHeight<24){lab.style.display='none';g.querySelector('.v4-group-body').style.top='0';continue}
  if(lab.scrollWidth<=lab.clientWidth+1)continue;lab.querySelector('em')?.remove();if(lab.scrollWidth<=lab.clientWidth+1)continue;lab.querySelector('b')?.remove();if(lab.scrollWidth<=lab.clientWidth+1)continue;lab.style.visibility='hidden'}}
new MutationObserver(()=>{if(document.querySelector('.v28-bands .v4-leaf:not([data-v28]),.v28-bands .v4-group:not([data-v28])'))requestAnimationFrame(()=>requestAnimationFrame(v28FitLabels))}).observe(document.getElementById('content')||document.body,{childList:true,subtree:true});
// YouTube 선공개(아덱스 광고비 확인 전) 캠페인: 조회수 × CPV 30원으로 역산한 예상 광고비 표기
var V28_CPV=30;
function v28Est(views){return v4Money((Number(String(views).replace(/,/g,''))||0)*V28_CPV)+'원'}
function v28EstText(h){return h
 .replace(/조회수 ([\d,]+)회 · 영상 (\d+)개 · 광고 모니터링 금액 미집계/g,(m,v,n)=>`예상 ${v28Est(v)} · 조회수 ${v}회 · CPV ${V28_CPV}원 추산`)
 .replace(/조회수 ([\d,]+)회 · 광고 모니터링 금액 미집계/g,(m,v)=>`예상 광고비 ${v28Est(v)} · CPV ${V28_CPV}원 추산`)
 .replace('빨간 테두리 = YouTube 선공개(광고 모니터링 금액 미집계)',`빨간 테두리 = YouTube 선공개(예상 광고비 = 조회수 × CPV ${V28_CPV}원)`)}
var v28BaseTimeline=timeline;timeline=function(){return v28EstText(v28BaseTimeline())};
var v28BaseRecent=v17Recent;v17Recent=function(){return v28EstText(v28BaseRecent())};
var v28BaseShow=v5Show;v5Show=function(id,t){v28BaseShow(id,t);if(!String(id).startsWith('ytc-'))return;const c=listing.campaigns.find(x=>x.id===id),box=$('#campaign-hover');if(!c||!box)return;
 for(const dt of box.querySelectorAll('dt')){const dd=dt.nextElementSibling;if(dd&&/광고 모니터링 금액 미집계|아덱스 광고비 확인 전/.test(dd.textContent))dd.textContent='YouTube'}
 const first=box.querySelector('dt');if(first&&!box.querySelector('.v28-est')){first.insertAdjacentHTML('beforebegin',`<dt class="v28-est">예상 광고비</dt><dd class="v28-est">${v28Est(c.youtube_views)} <small>CPV ${V28_CPV}원 추산 · 아덱스 반영 대기</small></dd>`)}};
var v28BaseCand=v20CandidateView;v20CandidateView=async function(c){const h=await v28BaseCand(c);
 return h.replace(/<div class="glass"><span>관측 광고비<\/span><strong>확인 전<\/strong><small>[^<]*<\/small><\/div>/,`<div class="glass"><span>예상 광고비</span><strong>${v28Est(c.youtube_views)}</strong><small>아덱스 디지털 광고비 반영 대기, 상기 데이터는 CPV ${V28_CPV}원으로 추산</small></div>`)};
// 네이버 추정 검색수(쿼리 추정기와 같은 방식): 주별 쿼리수(추정치). 성별 토글은 성별 지수 추이(성별마다 따로 정규화 → 건수 아님)
var v28QSeg='all',v28BaseTrend=v5TrendPanel;
function v28Weekly(rows,val){const m=new Map();for(const p of rows){const t=new Date(p.day+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);const w=t.toISOString().slice(0,10);const e=m.get(w)||{n:0,v:{}};e.n++;for(const [k,f] of Object.entries(val))e.v[k]=(e.v[k]||0)+f(p);m.set(w,e)}
 return [...m].sort((a,b)=>a[0].localeCompare(b[0])).filter(([w,e])=>e.n===7).map(([w,e])=>({day:w,...e.v,n:e.n}))}
function v28QueryTrends(d){
 const q=d.query_estimates;if(!q)return null;const keys=Object.keys(q.series||{});if(!keys.length)return null;
 const points=[],adv=d.campaign.advertiser;
 if(v28QSeg==='all'){for(const k of keys)for(const w of v28Weekly(q.series[k],{ratio:p=>p.total,pc:p=>p.pc,mo:p=>p.mo}))points.push({keyword:k,advertiser:adv,day:w.day,ratio:w.ratio,pc:w.pc,mo:w.mo});
  return {time_unit:'week',estimate:true,count_keywords:keys,points,definition:q.definition,source_url:'https://datalab.naver.com/',keyword_groups:{}}}
 for(const k of keys){const s=(q.segments?.[k]||{})[v28QSeg]||[];for(const w of v28Weekly(s,{ratio:p=>p.ratio/7}))points.push({keyword:k,advertiser:adv,day:w.day,ratio:w.ratio})}
 return {time_unit:'week',count_keywords:[],points,definition:`${v28QSeg==='m'?'남성':'여성'} 검색 지수(주 평균, ${v28QSeg==='m'?'남성':'여성'} 안에서 기간 최대=100). 성별마다 따로 정규화돼 남녀 크기 비교·건수 환산은 할 수 없고 추이만 참고합니다.`,source_url:'https://datalab.naver.com/',keyword_groups:{}};
}
v5TrendPanel=function(d){
 const g=v28QueryTrends(d);if(!g)return v28BaseTrend(d);
 v12TrendDaily=false;
 const hasSeg=Object.values(d.query_estimates.segments||{}).some(x=>x.m||x.f);
 let h=v28BaseTrend({...d,trends:g});
 const tg=`<div class="v28-unit">${hasSeg?[['all','전체'],['m','남성'],['f','여성']].map(([k,l])=>`<button data-v28-seg="${k}" class="${v28QSeg===k?'on':''}">${l}</button>`).join(''):''}<span class="v28-est-badge">${v28QSeg==='all'?'추정치':'지수 · 건수 아님'}</span></div>`;
 h=h.replace('<div class="v5-chips">',tg+'<div class="v5-chips">');
 if(v28QSeg!=='all')return h;
 const skipped=(d.query_estimates.keywords||[]).filter(k=>k.status!=='ok');
 const st=(d.query_estimates.keywords||[]).find(k=>k.keyword===v5TrendKey&&k.status==='ok');
 const ex=st&&st.sum_pc&&st.sum_mo?` · ${esc(st.keyword)}: PC 월 ${number(+st.monthly_pc)}건 ÷ 30일 지수 합 ${number(Math.round(st.sum_pc))} → 지수 1 = ${(st.monthly_pc/st.sum_pc).toFixed(1)}건, 모바일 월 ${number(+st.monthly_mo)}건 ÷ ${number(Math.round(st.sum_mo))} → 지수 1 = ${(st.monthly_mo/st.sum_mo).toFixed(1)}건 (기준 ${esc(st.anchor_start)}~${esc(st.anchor_end)})`:'';
 h=h.replace(/<p class="footnote">/,`<p class="footnote v28-formula">추정식 Q(d) = M<sub>pc</sub> × I<sub>pc</sub>(d) ÷ Σ최근30일 I<sub>pc</sub> + M<sub>mo</sub> × I<sub>mo</sub>(d) ÷ Σ최근30일 I<sub>mo</sub> — M: 검색광고 최근 30일 검색수(실제 건수), I: 데이터랩 일별 지수(같은 요청에서 받은 어제까지 30일 기준) · 주별 쿼리수는 7일이 모두 있는 주의 일별 추정 합${ex}</p><p class="footnote">`);
 if(skipped.length)h=h.replace('<p class="footnote">',`<p class="footnote v28-skip">추정하지 않음(빈칸): ${skipped.map(k=>esc(k.keyword)+' — '+esc(k.reason||'')).join(' · ')}</p><p class="footnote">`);
 return h;
};
document.addEventListener('click',e=>{
 const u=e.target.closest('[data-v28-seg]'),k=e.target.closest('.v12-trend-panel [data-trend-key]');if(!u&&!k)return;
 e.preventDefault();e.stopImmediatePropagation();if(u)v28QSeg=u.dataset.v28Seg;if(k)v5TrendKey=k.dataset.trendKey;
 const p=document.querySelector('.v12-trend-panel');if(p&&detailData)p.outerHTML=v5TrendPanel(detailData);
},true);
// YouTube 광고 소재 댓글 분석: 'YouTube 소재 확인하기' 아래 '댓글 분석' 버튼 → 자사(코웨이) 관련 댓글 + 인기 댓글 유형
var v28BaseYtRow=v4YoutubeRow;
v4YoutubeRow=function(r){let h=v28BaseYtRow(r);if(r.youtube_status!=='matched')return h;
 const btn=`<button class="v28-cmt-btn" data-v28-cmt="${esc(r.creative_id)}" data-v28-title="${esc(r.copyline||r.product||'')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>댓글 분석</span>›</button>`;
 const m=h.match(/<(a|button) class="v5-link yt"[\s\S]*?<\/\1>/);if(!m)return h.replace(/<\/div>$/,btn+'</div>');
 return h.replace(m[0],`<div class="v28-ytgroup">${m[0]}${btn}</div>`)};
function v28CmtCard(c,extra){return `<div class="v28-cmt-card"><p>${esc(c.text)}</p><div><span>👍 ${number(c.likes)}</span>${c.replies?`<span>답글 ${number(c.replies)}</span>`:''}<span>${esc(c.date)}</span>${(extra||c.types||[]).map(t=>`<em>${esc(t)}</em>`).join('')}</div></div>`}
function v28CmtBars(list,total){const mx=Math.max(1,...list.map(x=>x.count));return `<div class="v28-cmt-bars">${list.map(x=>`<div><span>${esc(x.type)}</span><i style="width:${x.count/mx*100}%"></i><b>${number(x.count)}건</b><small>좋아요 ${number(x.likes)}</small></div>`).join('')}</div>`}
function v28CmtView(a,title){
 const st={ok:'수집',disabled:'댓글 사용 중지',not_found:'영상 없음'};
 const vids=`<div class="v28-cmt-vids">${a.videos.map(v=>`<a href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener">${v5Icon.yt}<span>${esc((v.title||'').slice(0,46))}</span><small>${v.status?(st[v.status]||'수집 실패')+(v.status==='ok'?` ${number(v.comment_count||0)}개${v.total!=null?' / 전체 '+number(v.total)+'개':''}`:''):'미수집'}</small></a>`).join('')}</div>`;
 if(!a.comments)return `<h2>댓글 분석<small>${esc(title)}</small></h2>${vids}<p class="v28-cmt-empty">${a.videos.some(v=>v.status==='disabled')&&a.videos.every(v=>v.status&&v.status!=='ok')?'광고 영상의 댓글이 막혀 있어 분석할 댓글이 없습니다.':a.videos.some(v=>!v.status)?'아직 댓글을 받지 않았습니다.':'분석할 댓글이 없습니다.'}</p>${listing?.static?'':'<button class="v28-cmt-refresh" data-v28-cmt-fetch="1">댓글 받기</button>'}`;
 const cw=a.coway,ord=l=>[...l.filter(x=>x.type!=='기타'),...l.filter(x=>x.type==='기타').map(x=>({...x,type:'기타(유형 없음)'}))],pt=ord(a.popular.types),top1=pt[0]&&pt[0].type!=='기타(유형 없음)'?pt[0]:null;
 return `<h2>댓글 분석<small>${esc(title)}</small></h2>${vids}
 <div class="v28-cmt-kpi"><div><span>분석 댓글</span><b>${number(a.opinion)}개</b><small>이벤트 참여 ${number(a.events)}개 제외</small></div><div class="cw"><span>코웨이 언급</span><b>${number(cw.count)}개</b><small>${cw.share!=null?'분석 댓글의 '+cw.share+'%':''}</small></div><div><span>가장 많은 유형</span><b>${esc(top1?.type||'—')}</b><small>${top1?number(top1.count)+'건 · 좋아요 '+number(top1.likes):''}</small></div></div>
 <section class="v28-cmt-sec cw"><h3>A. 코웨이(자사) 관련 댓글</h3>${cw.count?v28CmtBars(ord(cw.types))+`<div class="v28-cmt-list">${cw.top.map(c=>v28CmtCard(c,c.coway_types)).join('')}</div>`:'<p class="v28-cmt-empty">코웨이·코웨이 제품을 언급한 댓글이 없습니다.</p>'}</section>
 <section class="v28-cmt-sec"><h3>B. 인기 댓글 · 많이 나온 유형</h3>${v28CmtBars(pt.slice(0,9))}<div class="v28-cmt-list">${a.popular.top.map(c=>v28CmtCard(c)).join('')}</div>${a.words.length?`<div class="v28-cmt-words"><span>자주 나온 단어</span>${a.words.map(w=>`<em>${esc(w.word)} <b>${w.count}</b></em>`).join('')}</div>`:''}</section>
 <p class="footnote">${a.models?.length?'광고 모델(소재 카피 기준): '+esc(a.models.join(', '))+' — 모델 언급은 광고·모델 반응으로 분류 · ':''}${esc(a.method)}${a.videos[0]?.fetched_at?' · 수집 '+esc(a.videos.map(v=>v.fetched_at).filter(Boolean).sort().pop().slice(0,16).replace('T',' ')):''}</p>${listing?.static?'':'<button class="v28-cmt-refresh" data-v28-cmt-fetch="1">댓글 새로 받기</button>'}`;
}
async function v28OpenComments(id,title,force){
 const dialog=$('#detail');dialog.className='post-dialog v28-cmt-dialog';dialog.dataset.cmt=id;dialog.dataset.title=title;
 $('#detail-body').innerHTML=`<h2>댓글 분석<small>${esc(title)}</small></h2><p class="v28-cmt-empty">댓글을 불러오는 중…</p>`;if(!dialog.open)dialog.showModal();
 try{let a=await api('/api/comments/'+encodeURIComponent(id));
  if(!listing?.static&&(force||a.videos.some(v=>!v.status))){$('#detail-body').innerHTML=`<h2>댓글 분석<small>${esc(title)}</small></h2><p class="v28-cmt-empty">YouTube에서 댓글을 받는 중…</p>`;a=await api('/api/comments/'+encodeURIComponent(id),{force:!!force})}
  if(dialog.dataset.cmt===id)$('#detail-body').innerHTML=v28CmtView(a,title)}
 catch(e){$('#detail-body').innerHTML=`<h2>댓글 분석<small>${esc(title)}</small></h2><p class="v28-cmt-empty">${esc(e.message)}</p>`}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v28-cmt]');if(b){e.preventDefault();e.stopImmediatePropagation();const box=$('#story-hover');if(box)box.hidden=true;v28OpenComments(b.dataset.v28Cmt,b.dataset.v28Title||'');return}
 const f=e.target.closest('[data-v28-cmt-fetch]');if(f){e.preventDefault();const d=$('#detail');v28OpenComments(d.dataset.cmt,d.dataset.title||'',true)}},true);
// 다른 캠페인: 이미지 없는 소재는 썸네일 칸을 비워 둠(글자 표시 안 함)
var v28BaseOther=otherCampaignsPanel;otherCampaignsPanel=function(d){return v28BaseOther(d).replace(/<div class="v5-thumb-fill">[\s\S]*?<\/div>/g,'<div class="v5-thumb-fill v28-blank"></div>')};

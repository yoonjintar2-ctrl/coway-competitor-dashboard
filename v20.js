/* v20 — 2026-11-03: YouTube 신규 후보도 캠페인 분석 페이지로 연다. 소재(영상·조회수)만 표시하고, 하단에는 광고주 단위 표(다른 캠페인·월별 매체 광고비)만 둔다. */
function v16OpenCandidate(id){activeId=id;route='analysis';render().then(()=>window.scrollTo({top:0,behavior:'instant'}))}
async function v20CandidateView(c){
 // 광고주 단위 자료는 같은 광고주의 다른 캠페인 상세에서 가져온다(광고주 월별 표는 캠페인과 무관).
 const sib=listing.campaigns.filter(x=>x.advertiser===c.advertiser&&!String(x.id).startsWith('ytc-')).sort((a,b)=>b.last_seen.localeCompare(a.last_seen))[0];
 let base=null;if(sib){try{base=await api('/api/campaign/'+sib.id+'?'+new URLSearchParams({start:listing.period.history_start||listing.period.start,end:listing.period.end}))}catch(e){base=null}}
 const vids=c.candidate_videos||[];const views=vids.reduce((s,v)=>s+(v.view_count||0),0);
 const head=`<div class="v6-title"><button class="v6-back" data-v6-back aria-label="타임라인으로 돌아가기">← 타임라인</button><div class="v6-chips"><span class="v6-chip adv">${esc(c.advertiser)}</span><span class="v6-chip cat">${esc(c.category_label)}</span><span class="v6-chip v20-chip">YouTube 신규 후보</span></div><h2>${esc(c.name.replace(/^YouTube 신규 후보 · /,''))}</h2></div>`;
 const notice=`<div class="glass section v20-notice"><b>아덱스 광고비·소재 확인 전</b><p>${esc(c.advertiser)} 공식 YouTube에 조회수 10만 회 이상 영상이 올라와 신규 캠페인 후보로 등록했습니다. 아덱스에 광고비·소재가 잡히면 TV·디지털 등 다른 매체와 함께 캠페인으로 확정하고 이 페이지를 업데이트합니다.</p></div>`;
 const kpi=`<div class="campaign-kpis v20-kpis"><div class="glass"><span>YouTube 누적 조회수</span><strong>${number(views)}회</strong><small>영상 ${vids.length}개 합계 · 공개 조회수(유료·자연 포함)</small></div><div class="glass"><span>첫 영상 공개</span><strong>${dateLabel(c.first_seen)}</strong><small>14일 안에 올라온 영상은 한 후보로 묶음</small></div><div class="glass"><span>관측 광고비</span><strong>확인 전</strong><small>아덱스 디지털 반영 대기</small></div></div>`;
 const mats=`<section class="glass section"><div class="section-head"><div><h2>주요 소재</h2></div></div><div class="v20-videos">${vids.map(v=>`<a class="v20-video" href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener"><div class="v20-thumb">${v.thumbnail?`<img src="${esc(safeUrl(v.thumbnail))}" alt="" loading="lazy">`:''}<span>${v5Icon.yt}</span></div><b>${esc(v.title||'')}</b><small>${esc(v.published_at)} 공개 · 조회수 ${number(v.view_count)}회</small><em>YouTube에서 보기 ↗</em></a>`).join('')}</div><p class="footnote">공식 채널 영상 중 제목에 품목 단어가 있고 조회수 10만 회 이상인 영상입니다. 아덱스 소재와 연결되면 광고비·매체가 함께 표시됩니다.</p></section>`;
 let bottom='';if(base){const others=[sib,...(base.other_campaigns||[])].filter((x,i,a)=>x&&a.findIndex(y=>y.id===x.id)===i);bottom=otherCampaignsPanel({...base,campaign:{...base.campaign,advertiser:c.advertiser},other_campaigns:others})+advertiserMonthlyPanel(base)}
 return head+notice+kpi+mats+bottom;
}
var v20BaseRender=render;
render=async function(){
 if(!(route==='analysis'&&String(activeId).startsWith('ytc-')))return v20BaseRender.apply(this,arguments);
 document.querySelectorAll('[data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route==='analysis'));
 $('#page-title').textContent='캠페인 분석';$('#subtitle').textContent='';
 const c=listing.campaigns.find(x=>x.id===activeId);if(!c){activeId='';return v20BaseRender.apply(this,arguments)}
 $('#content').innerHTML='<div class="loading glass">캠페인 정보를 정리하고 있습니다.</div>';
 const html=await v20CandidateView(c);detailData=null;$('#content').innerHTML=html;
 try{const st={route,activeId};const cur=history.state;if(!cur||cur.route!==st.route||cur.activeId!==st.activeId)(cur?history.pushState:history.replaceState).call(history,st,'')}catch(e){}
};

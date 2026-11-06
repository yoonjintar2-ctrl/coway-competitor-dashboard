/* v42 — 2026-11-06 17:27: 광고비 통합 분석·TV 통합 분석 그래프 오른쪽 위에 이미지 저장·엑셀 원본·전체 화면 단추 (검색쿼리 히트맵과 같은 모양) */
function v42IsFull(){return !!document.fullscreenElement||document.body.classList.contains('v42-max')}
function v42Tools(kind){const f=v42IsFull();return `<div class="v42-tools" data-v42="${kind}"><button type="button" class="v39-ic" data-v42-png title="이미지로 저장" aria-label="이미지로 저장">${V39_IMG}</button><button type="button" class="v39-ic" data-v42-xls title="엑셀 원본 내려받기" aria-label="엑셀 원본 내려받기">${V39_XLS}</button><button type="button" class="v39-ic" data-v42-full title="${f?'전체 화면 끝내기(Esc)':'전체 화면으로 보기'}" aria-label="전체 화면">${f?V39_SHRINK:V39_GROW}</button></div>`}
function v42Put(){
 if(route==='monthly'){const c=document.querySelector('#content .v38-card');if(c&&!c.querySelector('.v42-tools')){const bar=document.createElement('div');bar.className='v42-bar';bar.innerHTML=v42Tools('monthly');c.prepend(bar)}}
 if(route==='reach'){const h=document.querySelector('#content .v41-card-wrap .v41-head');if(h&&!h.querySelector('.v42-tools')){const y=h.querySelector('.v41-years');const box=document.createElement('div');box.className='v42-right';if(y){y.replaceWith(box);box.appendChild(y)}else h.appendChild(box);box.insertAdjacentHTML('beforeend',v42Tools('reach'))}}}
if(typeof v38Draw==='function'){var v42BaseV38=v38Draw;v38Draw=function(){const r=v42BaseV38.apply(this,arguments);try{v42Put()}catch(e){}return r}}
if(typeof v41Draw==='function'){var v42BaseV41=v41Draw;v41Draw=function(){const r=v42BaseV41.apply(this,arguments);try{v42Put()}catch(e){}return r}}

// 화면의 SVG를 그대로(계산된 색·글꼴까지) 옮겨 담기
var V42_P=['fill','fill-opacity','stroke','stroke-width','stroke-opacity','stroke-dasharray','stroke-linecap','stroke-linejoin','opacity','font-size','font-weight','font-family','font-style','text-anchor','dominant-baseline','letter-spacing','visibility','display'];
function v42Svg(src,x,y){const dst=src.cloneNode(true),a=[src,...src.querySelectorAll('*')],b=[dst,...dst.querySelectorAll('*')];
 a.forEach((e,i)=>{const cs=getComputedStyle(e);let st='';V42_P.forEach(k=>{const v=cs.getPropertyValue(k);if(v&&v!=='normal'&&v!=='auto')st+=k+':'+v+';'});b[i].setAttribute('style',st);b[i].removeAttribute('class')});
 const w=src.getAttribute('width')||src.getBoundingClientRect().width,h=src.getAttribute('height')||src.getBoundingClientRect().height;
 dst.setAttribute('x',x);dst.setAttribute('y',y);dst.setAttribute('width',w);dst.setAttribute('height',h);if(!dst.getAttribute('viewBox')&&src.viewBox&&src.viewBox.baseVal&&src.viewBox.baseVal.width)dst.setAttribute('viewBox',[src.viewBox.baseVal.x,src.viewBox.baseVal.y,src.viewBox.baseVal.width,src.viewBox.baseVal.height].join(' '));
 return new XMLSerializer().serializeToString(dst)}
function v42X(s){return String(s??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}
function v42Save(body,W,H,name){const xml=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"><rect width="${W}" height="${H}" fill="#ffffff"/>${body}</svg>`;
 const img=new Image();img.onload=()=>{const k=2,cv=document.createElement('canvas');cv.width=W*k;cv.height=H*k;const ctx=cv.getContext('2d');ctx.scale(k,k);ctx.drawImage(img,0,0);
  cv.toBlob(bl=>{if(!bl){toast('이미지를 만들지 못했어요.');return}v42Down(bl,name)},'image/png')};
 img.onerror=()=>toast('이미지를 만들지 못했어요.');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml)}
function v42Down(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name.replace(/[\\/:*?"<>|]/g,'_');document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600)}
function v42Day(){const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`}

// ---- 광고비 통합 분석 ----
function v42MonthlyName(){const d=v38D||{};return {adv:d.advertiser||v38Adv||'',cat:d.category||'전체'}}
function v42MonthlyPng(){const ch=document.querySelector('#content .v38-chart'),yg=document.querySelector('#content .v38-ygut');if(!ch){toast('그래프가 아직 없어요.');return}
 const {adv,cat}=v42MonthlyName(),head=64,cw=+ch.getAttribute('width'),chh=+ch.getAttribute('height'),gw=yg?56:0,W=Math.ceil(cw+gw+32),H=Math.ceil(chh+head+46);
 let body=`<text x="20" y="32" font-size="18" font-weight="800" fill="#102b45">${v42X(adv)} · ${v42X(cat)} — 월별 광고비·네이버 쿼리</text><text x="20" y="52" font-size="11.5" fill="#7d8a96">광고비 단위 억원 · 실집행 추정 요율 반영 · 내려받은 날 ${v42Day()}</text>`;
 if(yg){const vb=yg.viewBox.baseVal,sc=chh/(+ch.getAttribute('height'));body+=v42Svg(yg,12,head+(vb.y||0)*sc).replace(/^<svg/,'<svg')}
 body+=v42Svg(ch,12+gw,head);
 let lx=20;const ly=H-18;V38_CATS.forEach(([,n,c])=>{body+=`<rect x="${lx}" y="${ly-9}" width="11" height="11" rx="2" fill="${c}" fill-opacity=".85"/><text x="${lx+16}" y="${ly}" font-size="11.5" font-weight="700" fill="#55697a">${v42X(n)}</text>`;lx+=16+n.length*12+22});
 body+=`<rect x="${lx}" y="${ly-5}" width="16" height="3" rx="1.5" fill="${V38_G}"/><text x="${lx+22}" y="${ly}" font-size="11.5" font-weight="700" fill="#55697a">네이버 쿼리</text>`;
 v42Save(body,W,H,`${adv}_${cat}_광고비통합분석_${v42Day()}.png`)}
function v42MonthlyXls(){const d=v38D;if(!d||typeof v38Xlsx!=='function'){toast('자료가 아직 없어요.');return}const {adv,cat}=v42MonthlyName();
 const K=[['tv_terr','TV 지상파'],['tv_cable','TV 종편·케이블'],['dg_video','디지털 동영상'],['dg_pc','디지털 PC'],['dg_mo','디지털 MO'],['radio','라디오'],['news','신문'],['mag','잡지']];
 const rows=[[`${adv} · ${cat} · 월별 광고비(원, 실집행 추정 요율 반영)·네이버 쿼리 — 내려받은 날 ${v42Day()}`],[],['월',...K.map(k=>k[1]),'광고비 합계','전년 같은 달 합계',`경쟁사 평균(${d.avg_basis||'경쟁사'})`,'네이버 쿼리(월 합계)','쿼리 집계 일수','비고']];
 const tot=m=>K.reduce((s,[k])=>s+((d.spend[m]||{})[k]||0),0);
 d.months.forEach((m,i)=>{const sp=d.spend[m]||{},py=i>=12?tot(d.months[i-12]):'';rows.push([m,...K.map(([k])=>Math.round(sp[k]||0)),Math.round(tot(m)),py===''?'':Math.round(py),Math.round(d.avg[m]||0),d.query[m]==null?'':Math.round(d.query[m]),d.query_days[m]||0,m===d.current?`수집 중(${d.current_day||''}일까지)`:''])});
 if((d.camps||[]).length){rows.push([],['캠페인','품목','시작','끝','광고비(원)']);[...d.camps].sort((a,b)=>(a.s||'').localeCompare(b.s||'')).forEach(c=>rows.push([c.name,c.category||'',c.s||'',c.e||'',Math.round(c.amount||0)]))}
 v42Down(v38Xlsx(rows,'광고비 통합 분석'),`${adv}_${cat}_광고비통합분석_${v42Day()}.xlsx`)}

// ---- TV 통합 분석 ----
function v42ReachPts(){const ALL=v41Cat==='전체';if(!ALL){const o=v41PtsNow();return o.pts.map(p=>({...p,cat:v41Cat}))}
 const save=v41D,out=[];try{for(const c of Object.keys(v41All)){const dc=v41All[c];if(!dc.years.includes(v41Year))continue;v41D=dc;v41PtsNow().pts.forEach(p=>out.push({...p,cat:c}))}}finally{v41D=save}return out}
function v42ReachPng(){const plot=document.querySelector('#content .v41-plot'),sv=plot&&plot.querySelector('svg');if(!sv){toast('그래프가 아직 없어요.');return}
 const head=68,W=Math.ceil(+sv.getAttribute('width')+40),H=Math.ceil(+sv.getAttribute('height')+head+20);
 let body=`<text x="20" y="32" font-size="18" font-weight="800" fill="#102b45">${v41Year}년 누적 경쟁사 TV 노출량 · R3+ — ${v42X(v41Cat)}</text>`;
 if(v41Cat==='전체'){let lx=20;Object.keys(v41All).filter(c=>plot.querySelector(`.v41-dot[data-v41-cat="${CSS.escape(c)}"]`)).forEach(c=>{body+=`<circle cx="${lx+5}" cy="48" r="5" fill="${v41CatCol(c)}"/><text x="${lx+14}" y="52" font-size="11.5" font-weight="700" fill="#55697a">${v42X(c)}</text>`;lx+=26+c.length*12});body+=`<circle cx="${lx+5}" cy="48" r="4" fill="#fff" stroke="#14284d" stroke-width="3"/><text x="${lx+14}" y="52" font-size="11.5" font-weight="700" fill="#55697a">코웨이</text>`}
 else{const nt=document.querySelector('#content .v41-note')?.textContent||'',mx=Math.floor((W-40)/6.6);body+=`<text x="20" y="52" font-size="11" fill="#7d8a96">${v42X(nt.length>mx?nt.slice(0,mx-1)+'…':nt)}</text>`}
 body+=v42Svg(sv,20,head);
 plot.querySelectorAll('.v41-card').forEach(c=>{if(c.hidden||!c.offsetWidth)return;const x=20+c.offsetLeft,y=head+c.offsetTop,w=c.offsetWidth,h=c.offsetHeight,me=c.classList.contains('me'),cap=c.querySelector('.cap'),b=c.querySelector('b'),sp=c.querySelector('span');
  body+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${me?(cap?'#ffffff':'#f4f6fc'):'#ffffff'}" stroke="${me?(cap?'#14284d':'#c5d0ec'):'#e3eaef'}" stroke-width="${me&&cap?1.5:1}"/>`;let ty=y+17;
  if(cap){const cw=cap.offsetWidth||40;body+=`<rect x="${x+10}" y="${y+7}" width="${cw}" height="16" rx="8" fill="${getComputedStyle(cap).backgroundColor}"/><text x="${x+10+cw/2}" y="${y+18.5}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${v42X(cap.textContent)}</text>`;ty=y+38}
  const nm=b?b.childNodes[0].textContent.trim():'',won=b&&b.querySelector('em')?b.querySelector('em').textContent:'';
  body+=`<text x="${x+10}" y="${ty}" font-size="12.5" font-weight="800" fill="${me?(cap?'#14284d':'#3550a0'):'#3c4a56'}">${v42X(nm)} <tspan font-weight="700" fill="${me?(cap?'#14284d':'#3550a0'):'#55697a'}">${v42X(won)}</tspan></text><text x="${x+10}" y="${ty+15}" font-size="11" fill="#8a96a3">${v42X(sp?sp.textContent:'')}</text>`});
 v42Save(body,W,H,`TV통합분석_${v41Cat}_${v41Year}_${v42Day()}.png`)}
function v42ReachXls(){if(!v41D||typeof v38Xlsx!=='function'){toast('자료가 아직 없어요.');return}const pts=v42ReachPts().sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||(b.a==='코웨이')-(a.a==='코웨이')||b.eq-a.eq);
 const rows=[[`${v41Year}년 누적 경쟁사 TV 노출량 · R3+ — ${v41Cat} (내려받은 날 ${v42Day()})`],[document.querySelector('#content .v41-note')?.textContent||''],[],['품목','광고주','광고비(천원)','Eq GRP','R3+(%)']];
 pts.forEach(p=>rows.push([p.cat||'',p.a,Math.round(p.won||0),Math.round((p.eq||0)*10)/10,p.r&&p.r.r3!=null?Math.round(p.r.r3*10)/10:'']));
 v42Down(v38Xlsx(rows,'TV 통합 분석'),`TV통합분석_${v41Cat}_${v41Year}_${v42Day()}.xlsx`)}

// ---- 단추 ----
function v42Redraw(){try{if(route==='monthly'&&v38D)v38Draw();else if(route==='reach'&&v41D)v41Draw()}catch(e){}}
function v42Max(on){document.body.classList.toggle('v42-max',on);document.body.classList.toggle('v42-full',v42IsFull());v42Redraw()}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.v42-tools [data-v42-png],.v42-tools [data-v42-xls],.v42-tools [data-v42-full]');if(!t)return;e.preventDefault();const kind=t.closest('.v42-tools').dataset.v42;
 if(t.hasAttribute('data-v42-png')){kind==='monthly'?v42MonthlyPng():v42ReachPng();return}
 if(t.hasAttribute('data-v42-xls')){kind==='monthly'?v42MonthlyXls():v42ReachXls();return}
 if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return}if(document.body.classList.contains('v42-max')){v42Max(false);return}
 const c=document.getElementById('content');document.body.classList.add('v42-full');if(c&&c.requestFullscreen)c.requestFullscreen().catch(()=>v42Max(true));else v42Max(true)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('v42-max')&&!document.querySelector('dialog[open]'))v42Max(false)});
document.addEventListener('fullscreenchange',()=>{const on=!!document.fullscreenElement&&document.body.classList.contains('v42-full');if(!document.fullscreenElement)document.body.classList.remove('v42-full');else if(!on)return;if(route==='monthly'||route==='reach')v42Redraw()});

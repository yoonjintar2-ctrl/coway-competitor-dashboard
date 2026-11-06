/* v40 — 2026-11-06 월별 통합 분석 하단: 품목 내 광고주별 월별 광고비 + 매체 믹스·쉐어 오브 스펜딩
   품목(세부 품목)을 골랐을 때만 — 그 품목에 쓴 광고비만(경쟁사 모두 + 코웨이). */
var V40_MIX=[['tv_terr','지상파','#4c66b2'],['tv_cable','종편·케이블','#7fc4e4'],['dg','디지털','#9fd6c8'],['radio','라디오','#6ea7a3'],['news','신문','#8a97ab'],['mag','잡지','#c3c8cd']];
var v40Per='ytd';  // 'ytd' 또는 'YYYY-MM'
function v40Mix(x){const o={};V40_MIX.forEach(([k])=>o[k]=0);for(const [k,v] of Object.entries(x||{})){const kk=k.startsWith('dg_')?'dg':k;if(kk in o)o[kk]+=v||0}return o}
function v40Months(d){const y=d.current.slice(0,4);return d.months.filter(m=>m.startsWith(y))}
function v40Range(d,per){return per==='ytd'?v40Months(d):[per]}
function v40Tot(ps,adv,ms){const a=ps[adv]||{};let t=0;ms.forEach(m=>{for(const v of Object.values(a[m]||{}))t+=v||0});return t}
function v40Order(d){const ps=d.peer_spend||{},ms=d.months.slice(-12);return Object.keys(ps).sort((a,b)=>(b==='코웨이')-(a==='코웨이')||v40Tot(ps,b,ms)-v40Tot(ps,a,ms))}
function v40Sel(d){const ms=v40Months(d);return `<select class="chip v40-per" data-v40-per>${[['ytd',`${d.current.slice(0,4)}년 누적`],...ms.slice().reverse().map(m=>[m,`${m.slice(2,4)}.${m.slice(5)}${m===d.current?' (수집 중)':''}`])].map(([v,l])=>`<option value="${v}" ${v===v40Per?'selected':''}>${l}</option>`).join('')}</select>`}
function v40PeerTable(d){const ps=d.peer_spend||{},M=d.months,CUR=d.current,VIS=M.slice(-12),advs=v40Order(d).filter(a=>v40Tot(ps,a,M)>0);
 if(!advs.length)return `<p class="v40-empty">이 품목은 최근 2년 광고비 자료가 없어요.</p>`;
 const cell=(a,m)=>{let t=0;for(const v of Object.values((ps[a]||{})[m]||{}))t+=v||0;return t};
 const rows=advs.map(a=>`<tr class="${a===d.advertiser?'me':''}${a==='코웨이'?' cw':''}"><th scope="row"><button type="button" data-v40-adv="${esc(a)}" title="${esc(a)} 월별 통합 분석으로">${esc(a)}</button></th>${M.map(m=>{const v=cell(a,m);return `<td class="${v?'':'z'}${m===CUR?' cur':''}">${v38Money(v)}</td>`}).join('')}<td class="tot">${v38Money(VIS.reduce((s,m)=>s+cell(a,m),0))}</td></tr>`).join('');
 const sum=M.map(m=>advs.reduce((s,a)=>s+cell(a,m),0));
 return `<div class="v40-tbl" id="v40-pscroll"><table class="v40-pt"><thead><tr><th scope="col">광고주</th>${M.map(m=>`<th scope="col" class="${m===CUR?'cur':''}">${+m.slice(5)}월<small>${m.slice(2,4)}년</small></th>`).join('')}<th scope="col" class="tot">최근 12개월</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">품목 합계</th>${sum.map((v,i)=>`<td class="${M[i]===CUR?'cur':''}">${v38Money(v)}</td>`).join('')}<td class="tot">${v38Money(VIS.reduce((s,m)=>s+sum[M.indexOf(m)],0))}</td></tr></tfoot></table></div>`}
// 매체 믹스: 광고주별 100% 막대 + 업종 평균
function v40MixChart(d,wid){wid=wid||(document.getElementById('v40-mix')||{}).clientWidth||600;const ps=d.peer_spend||{},ms=v40Range(d,v40Per),advs=v40Order(d).filter(a=>v40Tot(ps,a,v40Months(d))>0);
 if(!advs.length)return `<p class="v40-empty">${d.current.slice(0,4)}년 광고비 자료가 없어요.</p>`;
 const mixOf=a=>{const o=v40Mix({});ms.forEach(m=>{const x=v40Mix((ps[a]||{})[m]);for(const k in o)o[k]+=x[k]});return o};
 const cols=advs.map(a=>[a,mixOf(a)]);const all=v40Mix({});cols.forEach(([,o])=>{for(const k in all)all[k]+=o[k]});cols.push(['업종 평균',all]);
 const n=cols.length,CW=Math.max(56,Math.min(130,(wid-8)/n)),BW=Math.min(64,CW*.6),H=300,T=14,W=Math.max(n*CW+8,wid-2),used=V40_MIX.filter(([k])=>cols.some(([,o])=>o[k]>0));
 let s='';cols.forEach(([a,o],i)=>{const tot=Object.values(o).reduce((x,y)=>x+y,0),x=4+i*CW+(CW-BW)/2;let y=T+H;
  if(!tot){s+=`<rect x="${x}" y="${T}" width="${BW}" height="${H}" rx="4" fill="#f1f4f6"/><text x="${x+BW/2}" y="${T+H/2}" text-anchor="middle" font-size="10" fill="#a3b0ba">집행 없음</text>`}
  else used.forEach(([k,,c])=>{const v=o[k];if(!v)return;const h=v/tot*H;y-=h;s+=`<rect class="v40-seg" x="${x}" y="${y}" width="${BW}" height="${Math.max(.6,h-1)}" fill="${c}" data-v40-tip="${esc(a)}|${k}|${v}|${tot}"/>`+(h>=15?`<text x="${x+BW/2}" y="${y+h/2+4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff" pointer-events="none">${Math.round(v/tot*100)}%</text>`:'')});
  const me=a==='코웨이',avg=a==='업종 평균';s+=`<text x="${4+i*CW+CW/2}" y="${T+H+17}" text-anchor="middle" font-size="11" font-weight="${me?800:600}" fill="${me?'#1d4f91':avg?'#8a96a3':'#55697a'}">${esc(a.length>7?a.slice(0,6)+'…':a)}</text>`});
 return `<div class="v40-legend">${used.map(([,n,c])=>`<span><i style="background:${c}"></i>${n}</span>`).join('')}</div><div class="v40-mixsc"><svg width="${W}" height="${T+H+28}" viewBox="0 0 ${W} ${T+H+28}">${s}</svg></div>`}
// 쉐어 오브 스펜딩 도넛
// 쉐어 오브 스펜딩: 3D 도넛(기울인 타원 + 옆면), 코웨이 조각만 살짝 띄움, 1% 미만은 기타로 묶고 마우스 올리면 세부 (11-06 10:24)
function v40Shade(hex,k){const n=parseInt(hex.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(c*k)));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`}
function v40Donut(d){const ps=d.peer_spend||{},ms=v40Range(d,v40Per),all=v40Order(d).map(a=>[a,v40Tot(ps,a,ms)]).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
 const tot=all.reduce((s,[,v])=>s+v,0);if(!tot)return `<p class="v40-empty">이 기간에는 광고비 자료가 없어요.</p>`;
 const big=all.filter(([a,v])=>v/tot>=.01||a==='코웨이'),small=all.filter(x=>!big.includes(x)),etc=small.reduce((s,[,v])=>s+v,0);
 const list=big.map(([a,v])=>({a,v}));if(etc>0)list.push({a:'기타',v:etc,etc:small});
 const W=600,H=380,cx=W/2,cy=H/2-6,R=176,K=.56,r=R*.54,DEP=30,G=['#8d969f','#a3abb3','#b9c0c6','#7f8891','#ccd2d7','#9aa3ab','#6f7881'];
 const P=(a,rr,ox,oy,dz)=>[cx+ox+Math.cos(a)*rr,cy+oy+Math.sin(a)*rr*K+(dz||0)];let a0=-Math.PI/2,gi=0;
 list.forEach(z=>{z.f=z.v/tot;z.a0=a0;z.a1=a0+z.f*Math.PI*2;a0=z.a1;z.me=z.a==='코웨이';z.col=z.me?'#4c66b2':z.a==='기타'?'#d5dade':G[gi++%G.length];const m=(z.a0+z.a1)/2;z.m=m;z.ox=z.me?Math.cos(m)*14:0;z.oy=z.me?Math.sin(m)*14*K:0});
 const arc=(z,rr,s0,s1,dz,rev)=>{const [x0,y0]=P(rev?s1:s0,rr,z.ox,z.oy,dz),[x1,y1]=P(rev?s0:s1,rr,z.ox,z.oy,dz),lg=Math.abs(s1-s0)>Math.PI?1:0;return {m:`${x0},${y0}`,a:`A${rr},${rr*K} 0 ${lg} ${rev?0:1} ${x1},${y1}`}};
 const clip=(s0,s1,lo,hi)=>{const a=Math.max(s0,lo),b=Math.min(s1,hi);return b>a?[a,b]:null};
 const tip=z=>z.etc?`data-v40-etc="${esc(JSON.stringify(z.etc.map(([a,v])=>[a,v])))}|${tot}"`:`data-v40-tip="${esc(z.a)}|sos|${z.v}|${tot}"`;
 let back='',walls='',tops='';
 list.forEach(z=>{// 안쪽 벽(뒤쪽 절반: 위쪽 화면)
  [[-Math.PI/2,0],[Math.PI,1.5*Math.PI]].forEach(([lo,hi])=>{const c=clip(z.a0,z.a1,lo,hi);if(!c)return;const t=arc(z,r,c[0],c[1],0),b=arc(z,r,c[0],c[1],DEP,true);back+=`<path d="M${t.m} ${t.a} L${b.m} ${b.a} Z" fill="${v40Shade(z.col,.62)}"/>`});
  // 바깥 벽(앞쪽 절반)
  const c=clip(z.a0,z.a1,0,Math.PI);if(c){const t=arc(z,R,c[0],c[1],0),b=arc(z,R,c[0],c[1],DEP,true);walls+=`<path class="v40-seg" ${tip(z)} d="M${t.m} ${t.a} L${b.m} ${b.a} Z" fill="${v40Shade(z.col,.74)}"/>`}
  // 윗면
  if(list.length===1){tops+=`<path d="M${P(0,R,0,0)} A${R},${R*K} 0 1 1 ${P(Math.PI,R,0,0)} A${R},${R*K} 0 1 1 ${P(0,R,0,0)} M${P(0,r,0,0)} A${r},${r*K} 0 1 0 ${P(Math.PI,r,0,0)} A${r},${r*K} 0 1 0 ${P(0,r,0,0)} Z" fill="${z.col}" fill-rule="evenodd"/>`;return}
  const o=arc(z,R,z.a0,z.a1,0),i=arc(z,r,z.a0,z.a1,0,true);tops+=`<path class="v40-seg" ${tip(z)} d="M${o.m} ${o.a} L${i.m} ${i.a} Z" fill="${z.col}" stroke="rgba(255,255,255,.85)" stroke-width="1.2"/>`});
 // 이름표(이름 비중 + 금액), 좌우로 나눠 세로로 밀기
 const labs=list.map(z=>({z,side:Math.cos(z.m)<0?-1:1,y:cy+z.oy+Math.sin(z.m)*(R*K+26)+(Math.sin(z.m)>0?DEP:0)}));
 [-1,1].forEach(sd=>{const L=labs.filter(q=>q.side===sd).sort((p,q)=>p.y-q.y);for(let k=1;k<L.length;k++)if(L[k].y-L[k-1].y<30)L[k].y=L[k-1].y+30;const ov=L.length?L.at(-1).y-(H-24):0;if(ov>0)L.forEach(q=>q.y-=ov);for(let k=L.length-2;k>=0;k--)if(L[k+1].y-L[k].y<30)L[k].y=L[k+1].y-30});
 let lb='';labs.forEach(q=>{const z=q.z,[ex,ey]=P(z.m,R*.97,z.ox,z.oy,Math.sin(z.m)>0?DEP*.5:0),lx=cx+q.side*(R+22),tx=cx+q.side*(R+28),pct=z.f*100,pc=pct>=1?Math.round(pct)+'%':'1% 미만';
  lb+=`<path d="M${ex},${ey} L${cx+Math.cos(z.m)*(R+10)},${q.y-4} L${lx},${q.y-4}" fill="none" stroke="#c4ccd2" stroke-width="1"/><g ${tip(z)} class="v40-seg"><text x="${tx}" y="${q.y-6}" text-anchor="${q.side<0?'end':'start'}" font-size="12.5" font-weight="${z.me?900:700}" fill="${z.me?'#1d4f91':'#3c4a56'}">${esc(z.a)} ${pc}</text><text x="${tx}" y="${q.y+9}" text-anchor="${q.side<0?'end':'start'}" font-size="11" fill="#8a96a3">${v38Money(z.v)}${z.etc?` · ${z.etc.length}곳`:''}</text></g>`});
 const ctr=`<text x="${cx}" y="${cy+2}" text-anchor="middle" font-size="20" font-weight="900" fill="#102b45">${v38Money(tot)}</text><text x="${cx}" y="${cy+20}" text-anchor="middle" font-size="11" fill="#8a96a3">품목 합계</text>`;
 return `<svg class="v40-donut" viewBox="0 0 ${W} ${H}" width="100%">${back}${walls}${tops}${ctr}${lb}</svg>`}
function v40Charts(d){return `<div class="v40-two"><div class="v38-glass v40-pane"><div class="v40-ph"><h3>매체 믹스</h3>${v40Sel(d)}</div><div id="v40-mix">${v40MixChart(d)}</div></div>
 <div class="v38-glass v40-pane"><div class="v40-ph"><h3>Share of Spending</h3>${v40Sel(d)}</div><div id="v40-sos">${v40Donut(d)}</div></div></div>`}
function v40After(){const d=v38D,card=document.querySelector('#content .v38-card');if(!d||!card||route!=='monthly')return;document.querySelectorAll('#content .v40-sec').forEach(x=>x.remove());
 const need=`<div class="v40-need">세부 품목을 고르면 품목 안 광고주별 광고비 비교와 매체 믹스·Share of Spending 그래프를 볼 수 있어요. 위쪽 <b>세부 품목</b>에서 품목을 선택해 주세요.</div>`;
 const unit=`${esc(d.category)} 품목에 쓴 광고비만 · 경쟁사 전체와 코웨이 · TV는 SM C&C 실집행 추정, 디지털은 월별 통합 분석과 같은 기준`;
 card.insertAdjacentHTML('afterend',`<section class="glass section v40-sec"><div class="v40-h"><h2>품목 내 광고주별 월별 광고비</h2>${d.category?`<p>${unit} · 광고주 이름을 누르면 그 광고주 화면으로</p>`:''}</div>${d.category?`<div class="v38-glass">${v40PeerTable(d)}</div>`:need}</section>
  <section class="glass section v40-sec"><div class="v40-h"><h2>품목 내 매체 믹스 · Share of Spending</h2>${d.category?`<p>${unit} · 기본은 올해 누적, 오른쪽 위에서 월을 고를 수 있어요</p>`:''}</div>${d.category?v40Charts(d):need}</section>`);
 const sc=document.getElementById('v40-pscroll');if(sc)sc.scrollLeft=sc.scrollWidth;const mx=document.getElementById('v40-mix');if(mx)mx.innerHTML=v40MixChart(d,mx.clientWidth)}
if(typeof v38Draw==='function'){var v40BaseDraw=v38Draw;v38Draw=function(...a){const r=v40BaseDraw.apply(this,a);try{v40After()}catch(e){console.error(e)}return r}}
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('[data-v40-per]');if(!s||!v38D)return;v40Per=s.value;document.querySelectorAll('[data-v40-per]').forEach(x=>x.value=v40Per);
 const a=document.getElementById('v40-mix'),b=document.getElementById('v40-sos');if(a)a.innerHTML=v40MixChart(v38D);if(b)b.innerHTML=v40Donut(v38D)});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-v40-adv]');if(!b||route!=='monthly')return;const a=b.dataset.v40Adv;if(a===v38Adv)return;
 const o=(v38Opt||[]).find(x=>x.advertiser===a);if(!o){toast('이 광고주는 월별 통합 분석 목록에 없어요.');return}v38Adv=a;if(!(o.categories||[]).includes(v38Cat))v38Cat='';
 document.querySelector('#content .v38-card')?.classList.add('loading');try{await v38Load();v38Draw();if(typeof v38Sync==='function')v38Sync();window.scrollTo({top:0,behavior:'smooth'})}catch(err){toast('불러오지 못했어요: '+err.message)}});
document.addEventListener('mousemove',e=>{if(route!=='monthly')return;const et=e.target.closest&&e.target.closest('[data-v40-etc]');if(et){const [js,t]=et.dataset.v40Etc.split(/\|(?=[^|]*$)/),L=JSON.parse(js);
  return v38Tip(`<b class="h">기타 ${L.length}곳 · ${v38Money(L.reduce((s,[,v])=>s+v,0))}</b>${L.map(([a,v])=>`<div class="r"><span><b>${esc(a)}</b></span><b>${v38Money(v)} <small style="font-weight:600;color:#8a96a3">${(v/t*100).toFixed(v/t>=.001?1:2)}%</small></b></div>`).join('')}`,e.clientX,e.clientY)}
 const g=e.target.closest&&e.target.closest('[data-v40-tip]');if(!g){if(document.getElementById('v38-tip')&&!e.target.closest('.v38-box'))v38Tip(null);return}
 const [a,k,v,t]=g.dataset.v40Tip.split('|'),nm=k==='sos'?'광고비':(V40_MIX.find(x=>x[0]===k)||[,k])[1];v38Tip(`<b class="h">${esc(a)}</b><div class="r"><span><b>${nm}</b></span><b>${v38Money(+v)}</b></div><div class="s">${k==='sos'?'품목 합계의':'광고주 광고비의'} ${(+v/+t*100).toFixed(1)}%</div>`,e.clientX,e.clientY)},{passive:true});

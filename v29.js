/* v29 — 신규 디자인(19:05부터 기본값). '기존 디자인으로 보기'를 누른 브라우저만 기존 화면. */
(function(){
 const KEY='coway-new-design';
 const get=()=>{try{return localStorage.getItem(KEY)!=='0'}catch(e){return true}};
 const set=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}};
 function font(){if(document.getElementById('nd-font'))return;const l=document.createElement('link');l.id='nd-font';l.rel='stylesheet';
  l.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';document.head.appendChild(l)}
 function apply(on){document.documentElement.classList.toggle('nd',on);if(on)font();const b=document.querySelector('.nd-toggle');if(b)b.textContent=on?'기존 디자인으로 보기':'✦ 신규 디자인 보기'}
 function toast(t){const d=document.createElement('div');d.className='nd-toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
 apply(get());
 function mount(){const box=document.querySelector('.sidebar-bottom')||document.querySelector('.sidebar');if(!box||box.querySelector('.nd-toggle'))return;
  const b=document.createElement('button');b.type='button';b.className='nd-toggle';box.appendChild(b);apply(get());
  b.addEventListener('click',()=>{const on=!get();set(on);apply(on);toast(on?'신규 디자인으로 돌아왔어요.':'기존 디자인으로 보고 있어요. 이 브라우저에서만 바뀌어요.');setTimeout(()=>location.reload(),700)})}
 // 화면(route) 표시: 필터를 타임라인에서만 보이게
 function mark(){try{document.documentElement.dataset.ndRoute=(typeof route!=='undefined'&&route)||'timeline'}catch(e){}}
 function hook(){if(typeof render!=='function'||render.__nd)return;const base=render;render=async function(...a){mark();const r=await base.apply(this,a);mark();return r};render.__nd=true;mark()}
 document.addEventListener('DOMContentLoaded',()=>setTimeout(hook,0));document.addEventListener('click',()=>setTimeout(mark,0),true);
 // v30 재질: 판 = .glass(+큰 판 .sheen), 작은 요소 = .chip, 등장 = .rise(판마다 0.05초 차례)
 let stagger=0,staggerT=0;
 function rise(el){if(el.dataset.ndRise)return;el.dataset.ndRise='1';const now=Date.now();if(now-staggerT>400)stagger=0;staggerT=now;el.style.animationDelay=(stagger++*0.05).toFixed(2)+'s';el.classList.add('rise')}
 function sheen(el){if(!el.querySelector(':scope>.sheen'))el.insertAdjacentHTML('afterbegin','<span class="sheen"><i></i></span>')}
 function decorate(){if(!document.documentElement.classList.contains('nd'))return;
  const side=document.querySelector('.sidebar'),head=document.querySelector('main>header');
  for(const el of [side,head])if(el){el.classList.add('glass');sheen(el);rise(el)}
  for(const el of document.querySelectorAll('.gantt-shell')){el.classList.add('glass');sheen(el)}
  for(const el of document.querySelectorAll('#content>*'))rise(el);
  for(const el of document.querySelectorAll('.v17-rc')){el.classList.add('glass');rise(el)}
  for(const el of document.querySelectorAll('.toolbar select,.v5-bar,#campaign-switch'))el.classList.add('chip');
 }
 let qd=false;const mo=new MutationObserver(()=>{if(qd)return;qd=true;requestAnimationFrame(()=>{qd=false;decorate()})});
 document.addEventListener('DOMContentLoaded',()=>{decorate();mo.observe(document.body,{childList:true,subtree:true})});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

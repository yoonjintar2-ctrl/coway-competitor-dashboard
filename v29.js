/* v29 — 신규 디자인 미리보기 전환. 선택은 이 브라우저에만 저장(다른 사람 화면은 그대로). */
(function(){
 const KEY='coway-new-design';
 const get=()=>{try{return localStorage.getItem(KEY)==='1'}catch(e){return false}};
 const set=v=>{try{v?localStorage.setItem(KEY,'1'):localStorage.removeItem(KEY)}catch(e){}};
 function font(){if(document.getElementById('nd-font'))return;const l=document.createElement('link');l.id='nd-font';l.rel='stylesheet';
  l.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';document.head.appendChild(l)}
 function apply(on){document.documentElement.classList.toggle('nd',on);if(on)font();const b=document.querySelector('.nd-toggle');if(b)b.textContent=on?'기존 디자인으로 보기':'✦ 신규 디자인 보기'}
 function toast(t){const d=document.createElement('div');d.className='nd-toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
 apply(get());
 function mount(){const box=document.querySelector('.sidebar-bottom')||document.querySelector('.sidebar');if(!box||box.querySelector('.nd-toggle'))return;
  const b=document.createElement('button');b.type='button';b.className='nd-toggle';box.appendChild(b);apply(get());
  b.addEventListener('click',()=>{const on=!get();set(on);apply(on);toast(on?'신규 디자인으로 보고 있어요. 이 브라우저에서만 바뀌어요.':'기존 디자인으로 돌아왔어요.')})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

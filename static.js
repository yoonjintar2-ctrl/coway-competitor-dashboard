/* 정적(GitHub Pages) 모드: /api/* 요청을 미리 만든 data/*.json 으로 대신한다. 수정(POST)은 막는다. */
(function(){
 const BASE=location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
 const ASSET=BASE+'assets/';
 const realFetch=window.fetch.bind(window);
 const cache=new Map();
 async function json(file){if(!cache.has(file))cache.set(file,realFetch(BASE+'data/'+file,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('자료 파일이 없습니다: '+file);return r.text()}).then(t=>t.split('"/assets/').join('"'+ASSET)));return JSON.parse(await cache.get(file))}
 const ok=o=>new Response(JSON.stringify(o),{status:200,headers:{'Content-Type':'application/json'}});
 const ro=()=>new Response(JSON.stringify({error:'공개 사이트는 읽기 전용입니다. 수정·수집은 PC 로컬 버전에서 하세요.'}),{status:403,headers:{'Content-Type':'application/json'}});
 window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input.url;if(!/^\/api\//.test(url))return realFetch(input,init);
  if(init&&init.method&&init.method!=='GET')return ro();
  const u=new URL(url,location.origin),p=u.pathname,q=u.searchParams;
  try{
   if(p==='/api/campaigns'){const adv=q.get('advertiser')||'competitors',cat=q.get('category')||'all';
    const L=await json(adv==='competitors'?'campaigns-competitors.json':'campaigns-all.json');
    if(adv!=='all'&&adv!=='competitors')L.campaigns=L.campaigns.filter(c=>c.advertiser===adv);
    if(cat!=='all')L.campaigns=L.campaigns.filter(c=>c.category===cat);
    return ok(L)}
   if(p.startsWith('/api/campaign/'))return ok(await json('campaign/'+decodeURIComponent(p.split('/').pop())+'.json'));
   if(p.startsWith('/api/comments/'))return ok(await json('comments/'+decodeURIComponent(p.split('/').pop())+'.json'));
   if(p==='/api/news-clips')return ok(await json('news.json'));
   if(p==='/api/daily-creatives'){const d=q.get('day');return ok(await json(d?'daily/'+d+'.json':'daily.json'))}
   if(p==='/api/campaign-renames')return ok({items:[]});
   if(p==='/api/adjustments')return ok(await json('adjustments.json'));
   if(p==='/api/indexes')return ok(await json('indexes.json'));
   if(p==='/api/media-classes')return ok(await json('media-classes.json'));
   if(p==='/api/health')return ok({ok:true,static:true});
   if(p==='/api/monthly/options')return ok(await json('monthly/options.json'));
   if(p.startsWith('/api/monthly-file/'))return ok(await json('monthly/'+decodeURIComponent(p.split('/').pop())));
   if(p==='/api/monthly'){const o=await json('monthly/options.json');const x=(o.options||[]).find(z=>z.advertiser===q.get('advertiser'));const f=x&&x.files&&x.files[q.get('category')||''];if(!f)throw new Error('자료 파일이 없습니다');return ok(await json('monthly/'+f))}
   if(p==='/api/ra/rules')return ok(await json('ra-rules.json'));
   if(p==='/api/ra/status')return ok(await json('ra-status.json'));
   return ok({static:true,settings:{},csrf:'static'});
  }catch(e){return new Response(JSON.stringify({error:e.message}),{status:404,headers:{'Content-Type':'application/json'}})}
 };
 // 설정 버튼은 보이되, 공개 사이트에서는 열지 않고 안내만 (2026-11-05)
 window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-route="settings"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();alert('설정은 PC 대시보드에서만 수정할 수 있어요.\n회사 PC에서 대시보드(127.0.0.1:8765)를 열어 설정해 주세요.')},true);
 document.addEventListener('DOMContentLoaded',async()=>{document.body.classList.add('static-site');try{const m=await json('meta.json');const b=document.createElement('div');b.className='static-badge';b.innerHTML='<span>읽기 전용</span><span>'+String(m.built_at).replace(/[<>&]/g,'')+' 업데이트</span>';document.querySelector('.sidebar-bottom')?.prepend(b)}catch(e){}});
})();

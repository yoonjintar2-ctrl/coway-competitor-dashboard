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
   if(p==='/api/adjustments')return ok(await json('adjustments.json'));
   if(p==='/api/indexes')return ok(await json('indexes.json'));
   if(p==='/api/media-classes')return ok(await json('media-classes.json'));
   if(p==='/api/health')return ok({ok:true,static:true});
   return ok({static:true,settings:{},csrf:'static'});
  }catch(e){return new Response(JSON.stringify({error:e.message}),{status:404,headers:{'Content-Type':'application/json'}})}
 };
 document.addEventListener('DOMContentLoaded',async()=>{document.body.classList.add('static-site');try{const m=await json('meta.json');const b=document.createElement('div');b.className='static-badge';b.textContent='읽기 전용 · '+m.built_at+' 기준';document.querySelector('.sidebar-bottom')?.prepend(b)}catch(e){}});
})();

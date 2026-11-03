/* v11 — 2026-11-03 Claude 5차: 타임라인 제목에서 'YYYY.MM 집행' 제거, 광고주 색 통일, 상시 캠페인은 광고주 영역 맨 아래 1행, 막대 굵기 통일. */
v5Short=function(c){
 let n=(c.name||'').replace(/\s*·?\s*\d{4}\.\d{2}\s*집행\s*$/,'').trim();
 if(n.startsWith(c.advertiser+' · '))n=n.slice(c.advertiser.length+3);
 else if(n===c.advertiser)n='';
 else if(n.startsWith(c.advertiser))n=n.slice(c.advertiser.length).replace(/^\s*·\s*/,'')||n;
 return n||(c.products||[])[0]||'';
};
placeBrandFlights=function(rows,left,right){
 const by=new Map();for(const c of rows){if(!by.has(c.advertiser))by.set(c.advertiser,[]);by.get(c.advertiser).push(c)}
 const cat=rows[0]?.category,spend=new Map();for(const c of listing.campaigns){if(c.category===cat)spend.set(c.advertiser,(spend.get(c.advertiser)||0)+c.adjusted_amount)}
 const groups=[...by].map(([name,items])=>({name,items:items.sort((a,b)=>a.first_seen.localeCompare(b.first_seen)||a.id.localeCompare(b.id))})).sort((a,b)=>(spend.get(b.name)||0)-(spend.get(a.name)||0)||a.name.localeCompare(b.name));
 const items=[];let base=0;
 const visible=c=>!(c._left+c._span<left||c._left>right);
 for(const g of groups){
  const local=[];
  for(const c of g.items){if(c.review_status==='evergreen'||!visible(c))continue;const begin=Math.max(left,c._left),finish=Math.max(Math.min(right,c._left+c._span),begin+(c._labelDays||6));let lane=0;while(local[lane]!==undefined&&begin<=local[lane]+1)lane++;local[lane]=finish;items.push({c,lane:base+lane})}
  let used=local.length;
  const ever=g.items.filter(c=>c.review_status==='evergreen'&&visible(c));
  if(ever.length){for(const c of ever)items.push({c,lane:base+used});used+=1}
  base+=used;
 }
 return {items,count:base};
};

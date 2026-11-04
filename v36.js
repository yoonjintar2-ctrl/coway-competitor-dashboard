/* v36 — 2026-11-04 14:30
   1) 캠페인 머리 스틸컷: 왼쪽 40% 지점부터 오른쪽 끝까지 서서히 보이게, 스틸컷 위에도 유리판 위·오른쪽 빛 효과,
      세로로 긴(폭이 좁은) 소재는 그림 폭 안에서 서서히 보이게(왼쪽이 선처럼 잘려 보이지 않게).
   2) 캠페인 기간 날짜: 다른 카드처럼 검정·큰 글씨.
   3) 경쟁사 광고비 비교: y축은 크게 끊은 정수 단위(예: 5억·10억·15억…), 칸은 더 촘촘히. */

// 1) 머리 스틸컷
function v36Hero(){const box=document.querySelector('#content .analysis-heading.v34-has-hero');const hero=box&&box.querySelector('.v34-hero');if(!hero||hero.dataset.v36)return;hero.dataset.v36='1';
 const src=(hero.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)||[])[1];if(!src)return;
 if(!box.querySelector('.v36-gloss'))box.insertAdjacentHTML('afterbegin','<div class="v36-gloss" aria-hidden="true"></div>');
 const img=new Image();img.onload=()=>{const H=box.offsetHeight,Wb=box.offsetWidth,w=H*img.naturalWidth/Math.max(1,img.naturalHeight);
  if(img.naturalWidth/Math.max(1,img.naturalHeight)<1.3){ // 세로로 길거나 정사각형에 가까운 소재(잡지 등): 그림 폭만큼만, 그림 안에서 서서히
   const left=Math.max(Wb*.4,Wb-w);hero.classList.add('v36-narrow');hero.style.left=left+'px';hero.style.backgroundSize='auto 100%';hero.style.backgroundPosition='right center';
   box.querySelector('.v36-gloss').style.left=left+'px'}
  else{hero.classList.remove('v36-narrow');hero.style.left='40%';hero.style.backgroundSize='cover'}};
 img.src=src}
var v36BaseAV=v32AnalysisVideos;
v32AnalysisVideos=function(){v36BaseAV();v36Hero()};
addEventListener('resize',()=>{const h=document.querySelector('#content .v34-hero');if(h){delete h.dataset.v36;v36Hero()}});

// 2) 캠페인 기간 날짜
var v36BaseDetail=detailView;
detailView=function(d){return v36BaseDetail(d).replace(/<strong class="v5-period v35-period"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/strong>/,'<strong class="v5-period v35-period v36-period"><b>$1</b><b>$2</b></strong>')};

// 3) 경쟁사 광고비 비교 y축: 크게 끊은 정수 단위
function v36Step(peak){const unit=peak>=1e8?1e8:1e4,raw=peak/unit/7,mag=Math.pow(10,Math.floor(Math.log10(Math.max(raw,1e-9))));
 let step=[1,2,5,10].map(m=>m*mag).find(s=>s>=raw)||10*mag;step=Math.max(1,Math.round(step));return {unit,step:step*unit}}
function v36Label(v,unit){if(!v)return '0';return unit===1e8?`${number(Math.round(v/1e8))}억`:`${number(Math.round(v/1e4))}만`}
var v36BaseAnnual=annualPanel;
annualPanel=function(d){let h=v36BaseAnnual(d);if(!h||typeof v12Annual==='undefined'||!v12Annual)return h;
 const {by,shown}=v12Annual;const peak=Math.max(1,...shown.flatMap(n=>[...(by.get(n)||new Map()).values()]));
 const width=1100,height=280,left=70,right=20,top=20,bottom=36,y=v=>height-bottom-v/peak*(height-top-bottom);
 // 기존 5칸 눈금 지우고 새 눈금
 h=h.replace(/<line x1="70" x2="1080" y1="[\d.]+" y2="[\d.]+" stroke="#e(?:1ebf0|ef3f6)"\s*\/?>(?:<\/line>)?<text x="61" y="[\d.]+" text-anchor="end">[^<]*<\/text>/g,'');
 const {unit,step}=v36Step(peak);let ticks='';for(let v=0;v<=peak+1e-6;v+=step){ticks+=`<line x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}" stroke="#e1ebf0"/><text x="${left-9}" y="${y(v)+4}" text-anchor="end">${v36Label(v,unit)}</text>`}
 return h.replace(/(<svg class="v3-chart v12-annual-svg"[^>]*>)/,'$1'+ticks)};
// 그래프 밖으로 나가면 카드 닫기(혹시 남는 경우까지)
document.addEventListener('pointermove',e=>{const b=document.getElementById('annual-card');if(!b||b.hidden)return;if(e.target.closest&&e.target.closest('.v12-annual-svg'))return;b.hidden=true;
 document.querySelectorAll('.v12-month-band').forEach(x=>x.setAttribute('fill-opacity',0))},{passive:true});

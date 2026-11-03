/* v13 — 2026-11-03: 경쟁사 판단 탭에 '인덱스 미등록 상품'(집계에서 빠진 상품) 목록과 O/X 추가 단추 */
var v13BaseDraw=v7Draw;
v7Draw=function(){
 v13BaseDraw();
 if(route!=='settings'||v7Tab!=='competitor')return;const d=v7Def();const un=(d?.unlisted||[]).filter(u=>!d.rows.some(r=>r[1]===u.advertiser&&r[2]===u.product));if(!un.length)return;
 const sec=document.createElement('section');sec.className='glass section v13-unlisted';
 sec.innerHTML=`${header('인덱스 미등록 상품 · 현재 집계 제외',`최근 12개월 아덱스에 광고비가 있지만 이 표에 없는 상품 ${un.length}개입니다. 포함 O/X를 정해 추가한 뒤 위의 저장을 누르세요.`)}<div class="v7-table-scroll"><table class="data-table"><thead><tr><th>업종</th><th>광고주</th><th>상품</th><th>12개월 광고비</th><th>최근 집행</th><th></th></tr></thead><tbody>${un.map((u,i)=>`<tr><td>${esc(u.category)}</td><td>${esc(u.advertiser)}</td><td>${esc(u.product)}</td><td style="text-align:right">${v4Money(u.amount)}원</td><td>${dateLabel(u.last_day)}</td><td class="v13-btns"><button class="primary" data-v13-add="${i}" data-v13-flag="O">포함 O</button><button class="secondary" data-v13-add="${i}" data-v13-flag="X">X</button></td></tr>`).join('')}</tbody></table></div>`;
 sec.dataset.list=JSON.stringify(un);
 (document.querySelector('.v7-index')?.parentElement||$('#content')).appendChild(sec);
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-v13-add]');if(!b)return;const list=JSON.parse(b.closest('.v13-unlisted').dataset.list);const u=list[Number(b.dataset.v13Add)];const d=v7Def();
 d.rows.unshift([u.category,u.advertiser,u.product,b.dataset.v13Flag,b.dataset.v13Flag==='O'?'O':'X','','']);v7Draw();toast(`${u.product} → 포함 ${b.dataset.v13Flag} 추가 · 저장을 눌러 확정하세요.`)});

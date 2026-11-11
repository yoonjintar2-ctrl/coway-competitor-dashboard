/* v7 — 2026-11-03 Claude: 설정 > 인덱스 (엑셀로 관리하는 기준표를 붙여넣기·편집). v6 다음 로드. */
var v7Tab='media',v7Idx=null,v7Filter='',v7Paste=false;
const v7Tabs=[['media','매체 구분'],['competitor','경쟁사 판단'],['category_map','업종 → 품목'],['product_name','상품명 통합'],['pp','채널 → PP'],['magazine','인쇄 매체 카테고리'],['ad_type','광고 유형'],['report_adv','통합분석 제외 광고주'],['manual_spend','수기 수정']];
var v7BaseRender=render;
render=async function(){
 if(route!=='settings')return v7BaseRender();
 document.querySelectorAll('[data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route===route));
 $('#page-title').textContent='설정 · 인덱스';$('#subtitle').textContent='엑셀로 관리하는 기준표를 붙여넣거나 직접 수정합니다. 저장하면 사이트 표시와 집계에 반영되고, 원본 수집 자료는 그대로 보존됩니다.';
 $('#content').innerHTML='<div class="loading glass">기준표를 불러오고 있습니다.</div>';
 if(v7Tab==='media'){v6Media=await api('/api/media-classes')}else{v7Idx=v7Idx||await api('/api/indexes')}
 v7Draw();
};
function v7Def(){return v7Idx?.indexes.find(x=>x.name===v7Tab)}
function v7Menu(){return `<nav class="v7-menu">${v7Tabs.map(([k,l])=>{const d=v7Idx?.indexes.find(x=>x.name===k);const n=k==='media'?(v6Media?.rows.length??''):(d?d.rows.length:'');return `<button data-v7-tab="${k}" class="${k===v7Tab?'active':''}">${l}${n!==''?` <b>${n}</b>`:''}</button>`}).join('')}</nav>`}
function v7Draw(){
 const menu=v7Menu();
 if(v7Tab==='media'){$('#content').innerHTML=v6SettingsView();return}
 const d=v7Def(),f=v7Filter.toLowerCase();const rows=d.rows.map((r,i)=>[r,i]).filter(([r])=>!f||r.join(' ').toLowerCase().includes(f));const shown=rows.slice(0,400);
 $('#content').innerHTML=`<div class="v7-layout">${menu}<section class="glass section v7-index">${header(d.title,`${d.rows.length}행${d.updated_at?' · 최근 저장 '+d.updated_at.slice(0,16).replace('T',' '):''}${d.source?' · '+d.source:''}`,`<div class="v7-actions"><button class="secondary" data-v7-paste>엑셀에서 붙여넣기</button><button class="secondary" data-v7-csv>CSV 내려받기</button><button class="primary" data-v7-save>저장</button></div>`)}<p class="v7-help">${esc(d.help)}</p>${v7Paste?`<div class="v7-paste"><p>엑셀에서 머리글(${d.columns.join(' · ')}) 순서대로 열을 선택해 복사한 뒤 붙여넣으세요. 머리글 행은 자동으로 건너뜁니다.</p><textarea id="v7-paste-text" rows="8" placeholder="${esc(d.columns.join('\t'))}"></textarea><div class="v7-actions"><button class="secondary" data-v7-apply="append">기존 표에 추가</button><button class="primary" data-v7-apply="replace">표 전체 교체</button><button data-v7-paste>취소</button></div></div>`:''}<div class="v7-tools"><input id="v7-filter" placeholder="검색" value="${esc(v7Filter)}"><button class="secondary" data-v7-add>행 추가</button><small>${rows.length}행 일치${rows.length>400?' · 앞 400행 표시(검색으로 좁혀 보세요)':''}</small></div><div class="v7-table-scroll"><table class="data-table v7-table"><thead><tr>${d.columns.map(c=>`<th>${esc(c)}</th>`).join('')}<th></th></tr></thead><tbody>${shown.map(([r,i])=>`<tr>${d.columns.map((c,j)=>`<td><input data-v7-cell="${i}:${j}" value="${esc(r[j]??'')}"></td>`).join('')}<td><button data-v7-del="${i}" title="행 삭제">×</button></td></tr>`).join('')}</tbody></table>${!d.rows.length?empty('아직 등록된 행이 없습니다.','엑셀에서 붙여넣기로 한 번에 넣을 수 있습니다.'):''}</div></section></div>`;
}
function v7ParseTSV(text,n){const lines=text.replace(/\r/g,'').split('\n').filter(l=>l.trim());const rows=lines.map(l=>{const c=l.split('\t').map(x=>x.trim());while(c.length<n)c.push('');return c.slice(0,n)});const d=v7Def();if(rows.length&&rows[0].some((x,j)=>x&&d.columns[j]&&x.replace(/\s/g,'')===d.columns[j].replace(/\s/g,'')))rows.shift();return rows}
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-v7-tab]');if(t){v7Tab=t.dataset.v7Tab;v7Filter='';v7Paste=false;await render();return}
 if(route!=='settings'||v7Tab==='media')return;
 const d=v7Def();if(!d)return;
 if(e.target.closest('[data-v7-paste]')){v7Paste=!v7Paste;v7Draw();return}
 const ap=e.target.closest('[data-v7-apply]');if(ap){const rows=v7ParseTSV($('#v7-paste-text').value,d.columns.length);if(!rows.length){toast('붙여넣은 내용이 없습니다.');return}d.rows=ap.dataset.v7Apply==='replace'?rows:[...d.rows,...rows];v7Paste=false;v7Draw();toast(rows.length+'행 반영 · 저장을 눌러 확정하세요.');return}
 if(e.target.closest('[data-v7-add]')){d.rows.unshift(d.columns.map(()=>''));v7Filter='';v7Draw();return}
 const del=e.target.closest('[data-v7-del]');if(del){d.rows.splice(Number(del.dataset.v7Del),1);v7Draw();return}
 if(e.target.closest('[data-v7-csv]')){const csv=[d.columns,...d.rows].map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv'}));a.download=d.title+'.csv';a.click();return}
 if(e.target.closest('[data-v7-save]')){try{v7Idx=await api('/api/indexes',{name:d.name,rows:d.rows.filter(r=>r.some(x=>String(x).trim()))});v7Draw();toast(d.title+' 저장 완료 · 화면을 새로고침하면 타임라인·분석에 반영됩니다.')}catch(err){toast(err.message)}return}
});
document.addEventListener('input',e=>{const c=e.target.closest?.('[data-v7-cell]');if(c){const [i,j]=c.dataset.v7Cell.split(':').map(Number);v7Def().rows[i][j]=c.value;return}if(e.target.id==='v7-filter'){v7Filter=e.target.value;const pos=e.target.selectionStart;v7Draw();const i=$('#v7-filter');i.focus();i.setSelectionRange(pos,pos)}});
// 매체 구분 탭은 v6 화면을 그대로 쓰되 메뉴 안에서 다시 그림
var v7BaseSettings=v6SettingsView;
v6SettingsView=function(){return `<div class="v7-layout">${v7Menu()}<div>${v7BaseSettings()}</div></div>`};

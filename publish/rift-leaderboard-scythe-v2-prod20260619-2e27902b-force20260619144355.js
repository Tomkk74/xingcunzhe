(function(){
'use strict';
let boardRows=[];
const clsName=id=>window.Equipment?.CLS_CN?.[id]||window.CLASSES?.[id]?.cn||id||'未知职业';
const html=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const time=s=>typeof window.fmt==='function'?fmt(s||0):`${Math.floor((s||0)/60)}:${String(Math.floor(s||0)%60).padStart(2,'0')}`;
const rankClass=i=>i===0?' top1':i===1?' top2':i===2?' top3':'';
function skillName(k){return INFO?.[k]?.[0]||ATTACK_NAME?.[k]||k}
function rowName(r){return safeName?.(r.name,r.playerName,r.userName,r.displayName,r.nickname)||r.name||'匿名勇士'}
function equipText(it){let txt=window.Equipment?.itemText?Equipment.itemText(it):'';return String(txt||'').split(' / ').slice(0,5)}
function equippedSummary(){try{return (Equipment?.equippedItems?.(S.player.cls)||[]).map(it=>({slot:Equipment.SLOT_CN?.[it.slot]||it.slot,name:it.name,rarity:it.rarity,power:it.itemPower||it.level||0,text:equipText(it)}))}catch(e){console.warn('读取排行榜装备失败:',e.message);return[]}}
function runSkills(){return Object.entries(S.skills||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`${skillName(k)} Lv.${v}`)}
function runEvos(){return Object.keys(S.evolutions||{}).map(id=>EVOLUTIONS?.[id]?.name||id).filter(Boolean)}
function runCombos(){try{return (activeCombos?.()||[]).map(id=>comboName?.(id)||S.combos?.[id]?.name||id).filter(Boolean)}catch(_){return[]}}
function riftArgs(){let r=S.rift||{};return{time:S.time,riftTime:S.clearTime||S.time,riftLayer:r.layer||0,job:S.player.job,classId:S.player.cls,mapId:'rift',level:S.player.lv,kills:S.kills,bossKills:S.bossKills||0,win:!!(S.cleared||r.guardianKilled),buildName:r.buildName||activeBuild?.()?.[0]||'自由流派',skills:runSkills(),evolutions:runEvos(),combos:runCombos(),equipment:equippedSummary()}}
window.renderBoard=function(board){boardRows=Array.isArray(board)?board:[];if(!boardRows.length){$('boardList').innerHTML='<div class="choice">暂无大秘境排行，通关任意大秘境后会记录最高层。</div>';return}$('boardList').innerHTML=boardRows.map((r,i)=>`<button class="choice boardRow riftBoardRow${rankClass(i)}" data-rift-board="${i}" type="button"><b class="boardRank">${i+1}</b><span class="boardName">${html(rowName(r))}</span><span class="boardLv">秘境 ${Math.max(0,Math.floor(Number(r.riftLayer)||0))} 层</span></button>`).join('')};
window.openBoard=async function(){if(window.boardBusy)return;window.boardBusy=true;$('boardSub').textContent='加载中...';$('boardList').innerHTML='<div class="choice">正在读取大秘境最高层排行</div>';$('leaderboard').classList.remove('hidden');if(S)S.paused=true;try{let r=await invokeFn('leaderboard',{method:'list'});renderBoard(r.board);$('boardSub').textContent='大秘境最高层前二十名，点击玩家查看职业、流派、技能和装备'}catch(e){if(isCaptchaError?.(e))showCaptchaBoard();else{$('boardSub').textContent=e.code==='function_not_published'?'排行榜函数还未发布，请保存游戏后上线':'排行榜加载失败';$('boardList').innerHTML=`<div class="choice">${html(e.message||'请稍后重试')}</div>`}}finally{window.boardBusy=false}};
window.submitScore=async function(){if(!S?.player||S.mapId!=='rift'||!S.rift?.guardianKilled||S.rift._boardSubmitted)return;S.rift._boardSubmitted=true;try{let names=await playerNameFields();let r=await invokeFn('leaderboard',{method:'submit',args:{...riftArgs(),...names}});renderBoard(r.board)}catch(e){S.rift._boardSubmitted=false;console.error('秘境排行榜提交失败:',e.code,e.message,e.stack)}};
let baseEnd=window.end;window.end=function(win){let wasRift=!!S?.rift?.active,out=baseEnd?baseEnd(win):undefined;if(wasRift&&win)setTimeout(()=>window.submitScore?.(),0);return out};
function showDetail(r){let idx=boardRows.indexOf(r),eq=(r.equipment||[]).map(it=>`<div class="choice"><h2>${html(it.slot||'装备')} · ${html(it.name)}${it.power?` <small>强度${it.power}</small>`:''}</h2><p>${html((it.text||[]).join(' / ')||it.rarity||'')}</p></div>`).join('')||'<div class="choice">未记录装备</div>';let body=$('equipDetailBody');body.innerHTML=`<h1 class="title">${idx+1} · ${html(rowName(r))}</h1><p class="sub">大秘境 ${Math.max(0,Math.floor(Number(r.riftLayer)||0))} 层 · ${html(clsName(r.classId))} · ${html(r.buildName||'自由流派')} · 通关 ${time(r.riftTime||0)}</p><div class="choice"><h2>技能与流派</h2><p>核心技能：${html((r.skills||[]).join('、')||'未记录')}</p><p>进化：${html((r.evolutions||[]).join('、')||'未记录')}</p><p>组合：${html((r.combos||[]).join('、')||'未记录')}</p></div><h2 class="title">装备搭配</h2>${eq}`;$('equipDetailModal').classList.remove('hidden');$('equipDetailModal').classList.add('leaderboardDetailModal');if(S)S.paused=true}
document.addEventListener('click',e=>{let b=e.target.closest('[data-rift-board]');if(!b)return;let r=boardRows[Number(b.dataset.riftBoard)];if(r)showDetail(r)});
function bindBoardButton(){let btn=$('boardBtn');if(btn)btn.onclick=window.openBoard}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindBoardButton);else bindBoardButton();
console.info('秘境排行榜补丁已启用：层数、角色流派、装备详情')
})();

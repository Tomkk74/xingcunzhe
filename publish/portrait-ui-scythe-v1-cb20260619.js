(function(){
'use strict';
function e(s){return typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function skillName(id){return INFO?.[id]?.[0]||id}
function shortText(id){let t=(typeof skillFxText==='function'?skillFxText(id):INFO?.[id]?.[1])||'本技能会随等级、组合刻印和套装强化提升。';return e(t)}
function knownEvos(id){try{return (typeof evoKnownFor==='function'?evoKnownFor(id):[]).map(([,v])=>v.name).join(' / ')}catch(_){return ''}}
function learned(){try{return typeof learnedSkills==='function'?learnedSkills():Object.entries(S?.skills||{}).filter(([,v])=>v>0)}catch(_){return []}}
function combos(){
  try{
    let ids=typeof activeCombos==='function'?activeCombos():(S.comboOrder||[]).filter(id=>S.combos[id]&&!S.combos[id].consumed);
    return ids.map(id=>{let c=S.combos[id]||{},parts=(c.parts||[]).map(k=>ATTACK_NAME?.[k]||skillName(k));return {name:c.name||parts.join('+'),lv:c.lv||1,desc:typeof comboDesc==='function'?comboDesc(id):'提升参与技能的伤害、数量、范围和冷却。'}})
  }catch(_){return []}
}
function evos(){try{return Object.keys(S?.evolutions||{}).map(id=>({name:EVOLUTIONS?.[id]?.name||id,desc:EVOLUTIONS?.[id]?.desc||'已完成进化，技能形态已改变。'}))}catch(_){return []}}
function node(kind,name,lv,desc,empty){return `<div class="skillNode ${kind||''} ${empty?'empty':''}">${lv?`<span class="lv">${e(lv)}/5</span>`:''}<h2>${e(name)}</h2><p>${desc||''}</p></div>`}
function renderPortraitSkills(){
  let body=document.getElementById('skillPanelBody');if(!body)return;
  let ls=learned(),cs=combos(),es=evos();
  if(document.getElementById('skillPanelSub'))document.getElementById('skillPanelSub').textContent=S?.player?`${S.player.job} · Lv.${S.player.lv} · 技能 ${ls.length} · 合成 ${cs.length} · 进化 ${es.length}`:'查看本局技能。';
  let learnedHtml=ls.map(([id,lv])=>{let range=SKILL_RANGE?.[id],ev=knownEvos(id),extra=(range?`<br>距离：${e(range.kind||'技能')} / ${e(range.ideal||range.range)}`:'')+(ev?`<br>可进化：${e(ev)}`:'');return node(skillChoiceClass?.({id})||'',skillName(id),lv,`${shortText(id)}${extra}`)}).join('')||node('', '未学习技能','', '进入战斗升级后会在这里形成技能树。', true);
  let comboHtml=cs.map(c=>node('combo',`合成 · ${c.name}`,c.lv,e(c.desc))).join('')||node('combo','待合成','', '每 5 级有机会把相关刻印合成为流派节点。', true);
  let evoHtml=es.map(v=>node('evo',`进化 · ${v.name}`,'',e(v.desc))).join('')||node('evo','待进化','', '主技能 Lv.5 + 对应辅助 Lv.3，击败魔王后完成进化。', true);
  let slots=ls.slice(0,5).map(([id,lv])=>`<div class="portraitSkillSlot filled"><b>${e(skillName(id).slice(0,2))}</b><span>${e(lv)}/5</span></div>`).join('');
  slots+=Array.from({length:Math.max(0,5-ls.length)},()=>'<div class="portraitSkillSlot"></div>').join('');
  body.innerHTML=`<div class="portraitSkillTree"><section class="portraitSkillGroup"><h3>基础技能</h3>${learnedHtml}</section><section class="portraitSkillGroup"><h3>邪术技能</h3>${comboHtml}${evoHtml}</section><div class="portraitSkillFooter">${slots}</div></div>`;
}
function openPortraitSkills(){if(window.layoutEdit)return;if(!window.S?.run){window.showNotice?.('进入战斗后才能查看本局技能');return}renderPortraitSkills();document.getElementById('skillPanel')?.classList.remove('hidden');S.paused=true}
function markEquip(){let p=document.querySelector('#equipmentPanel .panel');if(!p)return;p.classList.add('portraitEquipPanel');document.getElementById('equipSlots')?.classList.add('portraitEquipSlots');document.getElementById('equipGrid')?.classList.add('portraitEquipGrid')}
function hook(){
  let b=document.getElementById('skillBtn');if(b)b.onclick=openPortraitSkills;
  let old=window.renderRunSkills;if(typeof old==='function')window.renderRunSkills=function(){renderPortraitSkills()};
  let oldEq=window.renderEquipment;if(typeof oldEq==='function')window.renderEquipment=function(filter){let r=oldEq(filter);markEquip();return r};
  let panel=document.getElementById('equipmentPanel');if(panel)new MutationObserver(markEquip).observe(panel,{childList:true,subtree:true});
  markEquip();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
console.info('竖屏装备/技能界面补丁已启用');
})();

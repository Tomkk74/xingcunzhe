window.GameModules = window.GameModules || {};
window.GameModules.equipment = (() => {
  const KEY = 'arcane-equipment-v1';
  const ICON_SHEETS = { gold:'./assets/generated/equipment-icons-gold-rpg-sheet.8bac9168.webp', unique:'./assets/generated/equipment-icons-unique-rpg-sheet.b1783e31.webp', setPaladin:'./assets/generated/equipment-icons-set-paladin-rpg-sheet.96aa82dd.webp', setMage:'./assets/generated/equipment-icons-set-mage-rpg-sheet.a179ef44.webp', setRanger:'./assets/generated/equipment-icons-set-ranger-rpg-sheet.a6ce5da2.webp', setSaintess:'./assets/generated/equipment-icons-set-saintess-rpg-sheet.c2224def.webp' };
  const SLOTS = ['weapon','helm','chest','amulet','ring','boots'];
  const SLOT_CN = { weapon:'武器', helm:'头盔', chest:'胸甲', amulet:'项链', ring:'戒指', boots:'靴子' };
  const CLS_CN = { paladin:'圣骑士', mage:'大魔法师', ranger:'游侠', lewdSaintess:'淫靡圣女' };
  const RES = ['physical','fire','frost','arcane','holy','shadow','lust'];
  const RES_CN = { physical:'物理', fire:'火焰', frost:'霜寒', arcane:'奥术', holy:'神圣', shadow:'暗影', lust:'欲望', all:'全属性' };
  const GOLD = [
    ['gold-sun-blade','耀金切割者','weapon',{damage:.16,atkSpeed:.04},{fire:.08,holy:.06}],['gold-meteor-staff','陨星金杖','weapon',{damage:.14,range:.08},{fire:.1,arcane:.04}],['gold-hawk-bow','猎鹰金弓','weapon',{atkSpeed:.1,range:.1},{physical:.08}],['gold-crystal-mace','晶核权杖','weapon',{damage:.12,pickup:.08},{arcane:.08,holy:.04}],['gold-dragon-axe','龙纹战斧','weapon',{damage:.2,move:-.03},{fire:.12}],['gold-moon-dagger','月辉短刃','weapon',{atkSpeed:.14,crit:.05},{frost:.07,shadow:.05}],
    ['gold-ward-crown','守望金冠','helm',{hp:.1,armor:.04},{holy:.08,arcane:.04}],['gold-flame-visor','烬火面甲','helm',{damage:.07,hp:.06},{fire:.12}],['gold-frost-hood','霜纹兜帽','helm',{cooldown:.05,range:.04},{frost:.12}],['gold-stone-helm','岩芯重盔','helm',{hp:.16,armor:.06},{physical:.12}],['gold-void-mask','虚金假面','helm',{damage:.08,pickup:.06},{shadow:.1,arcane:.04}],['gold-rose-veil','蔷薇金纱','helm',{hp:.08,regen:.04},{lust:.1,holy:.04}],
    ['gold-sun-plate','太阳镀层甲','chest',{hp:.18,armor:.06},{holy:.08,fire:.06}],['gold-ember-robe','余烬法袍','chest',{damage:.09,cooldown:.04},{fire:.1,arcane:.04}],['gold-hunter-leather','金线猎装','chest',{move:.08,atkSpeed:.06},{physical:.08,frost:.04}],['gold-deep-carapace','深金壳甲','chest',{hp:.22,move:-.04},{physical:.14}],['gold-mist-robe','迷雾长袍','chest',{range:.08,pickup:.1},{shadow:.1}],['gold-vessel-dress','圣器礼服','chest',{hp:.14,regen:.06},{lust:.12}],
    ['gold-dawn-amulet','黎明护符','amulet',{damage:.08,cooldown:.05},{holy:.1}],['gold-arcane-core','秘法金核','amulet',{range:.1,pickup:.12},{arcane:.12}],['gold-fire-heart','熔火心坠','amulet',{damage:.11,hp:.05},{fire:.12}],['gold-ice-tear','冰月泪滴','amulet',{cooldown:.06,move:.04},{frost:.12}],['gold-bone-charm','骸骨金坠','amulet',{armor:.05,hp:.1},{physical:.1,shadow:.04}],['gold-rose-heart','蔷薇心坠','amulet',{regen:.08,pickup:.08},{lust:.12}],
    ['gold-signet-fury','狂怒金戒','ring',{damage:.1,atkSpeed:.05},{fire:.06}],['gold-signet-focus','专注金戒','ring',{cooldown:.08,range:.04},{arcane:.08}],['gold-signet-guard','坚守金戒','ring',{hp:.1,armor:.04},{physical:.08,holy:.04}],['gold-signet-moon','月影金戒','ring',{move:.06,crit:.04},{frost:.08,shadow:.04}],['gold-signet-greed','拾荒金戒','ring',{pickup:.18,gold:.12},{shadow:.06}],['gold-signet-rose','玫瑰金戒','ring',{regen:.06,hp:.08},{lust:.1}],
    ['gold-sun-greaves','日铸胫甲','boots',{move:.08,hp:.06},{holy:.06,fire:.04}],['gold-wind-boots','疾风金靴','boots',{move:.14,atkSpeed:.04},{physical:.06}],['gold-frost-steps','霜踏长靴','boots',{move:.08,cooldown:.04},{frost:.1}],['gold-void-steps','虚空行靴','boots',{move:.1,range:.05},{shadow:.08,arcane:.04}],['gold-stone-sabaton','岩金战靴','boots',{hp:.12,armor:.04},{physical:.1}],['gold-rose-slippers','蔷薇软靴','boots',{move:.06,regen:.06},{lust:.1}],
  ];
  const UNIQUES = [
    ['unique-void-lantern','暗金·虚空提灯','amulet',{damage:.12,pickup:.18},{shadow:.16,arcane:.08},'每 18 秒吸入附近经验与金币，并使下一次升级选项品质提高。'],['unique-dragon-heart','暗金·龙心余烬','chest',{hp:.2,damage:.1},{fire:.22},'受到生命上限 20% 以上伤害时爆发火环。'],['unique-moon-crown','暗金·霜月王冠','helm',{cooldown:.08,range:.08},{frost:.2},'冻结弹幕命中你时转化为寒月护盾。'],['unique-saint-nail','暗金·圣钉战槌','weapon',{damage:.22,atkSpeed:-.04},{holy:.16},'击杀精英后短暂强化光环伤害。'],['unique-thunder-bow','暗金·雷鸣长弓','weapon',{atkSpeed:.16,range:.14},{arcane:.12,physical:.08},'远程攻击周期性链向高威胁目标。'],['unique-blood-plate','暗金·血契重甲','chest',{hp:.26,armor:.08},{physical:.14,shadow:.1},'低生命时获得吸血反击。'],['unique-clock-gloves','暗金·逆时针环','ring',{cooldown:.12,atkSpeed:.08},{arcane:.14},'拾取 Boss 宝箱后强化冷却节奏。'],['unique-greed-boots','暗金·贪婪旅靴','boots',{move:.12,gold:.28},{shadow:.12},'无尽首个 Boss 额外掉落判定。'],['unique-rose-mirror','暗金·蔷薇镜','amulet',{hp:.14,regen:.1},{lust:.18,holy:.06},'承受属性伤害后储存为反击喷溅。'],['unique-abyss-mask','暗金·深渊假面','helm',{damage:.18,crit:.06},{shadow:.2},'自动攻击优先锁定精英。'],['unique-golem-soul','暗金·巨像魂核','ring',{hp:.2,armor:.06},{physical:.18},'站立时获得岩盾。'],['unique-star-tome','暗金·星陨秘典','weapon',{damage:.18,range:.16},{arcane:.18},'飞弹穿透后召唤小陨星。'],['unique-demon-horn','暗金·魔王断角','helm',{damage:.16,hp:.12},{fire:.12,shadow:.12},'Boss 战中伤害提升，但承压更高。'],['unique-pale-ring','暗金·苍白轮戒','ring',{cooldown:.1,move:.08},{frost:.14,shadow:.08},'受击后短暂相位化。'],['unique-faith-boots','暗金·朝圣者遗步','boots',{move:.08,regen:.08},{holy:.16},'移动留下治疗圣痕。'],['unique-hunt-quiver','暗金·无尽箭匣','amulet',{atkSpeed:.12,range:.1},{physical:.14},'投射物有概率复制一次。'],['unique-plague-bell','暗金·瘟疫铃','weapon',{range:.12,cooldown:.06},{shadow:.14,lust:.06},'精英死亡留下腐蚀领域。'],['unique-sun-shield','暗金·太阳残盾','chest',{hp:.18,armor:.1},{holy:.18,fire:.08},'护盾破裂时清除周围弹幕。'],
  ];
  const SET_FAMILIES = [
    ['paladin','aureate-guardian','辉金守护','setPaladin',{hp:.08,armor:.03,holy:.06}],['paladin','thorn-bulwark','荆棘壁垒','setPaladin',{hp:.1,physical:.06,fire:.04}],['paladin','dawn-judgment','黎明审判','setPaladin',{damage:.07,range:.04,holy:.06}],
    ['mage','astral-missile','星界飞弹','setMage',{damage:.08,arcane:.06,range:.05}],['mage','ember-meteor','余烬陨星','setMage',{damage:.09,fire:.07,cooldown:.03}],['mage','storm-sigil','风暴符印','setMage',{atkSpeed:.06,arcane:.05,cooldown:.04}],
    ['ranger','cyclone-axe','旋风飞斧','setRanger',{atkSpeed:.07,physical:.06,range:.04}],['ranger','moon-hunter','月影猎手','setRanger',{crit:.05,frost:.06,move:.04}],['ranger','venom-shadow','毒影伏击','setRanger',{atkSpeed:.05,shadow:.06,move:.05}],
    ['lewdSaintess','crimson-vessel','绯红圣器','setSaintess',{hp:.1,lust:.07,regen:.04}],['lewdSaintess','violet-hymn','紫罗兰圣歌','setSaintess',{range:.06,holy:.05,lust:.05}],['lewdSaintess','rose-mirror','蔷薇镜像','setSaintess',{damage:.06,lust:.06,shadow:.04}],
  ];
  const SET_BONUS = {
    'aureate-guardian':{n:'辉金守护',s:'2件 生命+12%、神圣抗性+12%；4件 圣域护盾；6件 大蒜光环变辉金圣域。',b2:{hp:.12,holy:.12},b4:{armor:.06,regen:.05},b6:{skill:'garlic',skillDmg:.55,range:.16,shieldAttrBlock:.25}},
    'thorn-bulwark':{n:'荆棘壁垒',s:'2件 护甲+10%、物理抗性+15%；4件 受击荆棘反击；6件 血色新星变荆棘圣盾。',b2:{armor:.1,physical:.15},b4:{hp:.1},b6:{skill:'bloodNova',skillDmg:.5,bossAttrCut:.08}},
    'dawn-judgment':{n:'黎明审判',s:'2件 伤害+10%、范围+8%；4件 圣枪审判 Boss；6件 圣光长枪变天罚枪阵。',b2:{damage:.1,range:.08},b4:{holy:.12},b6:{skill:'holyLance',skillDmg:.62,eliteAttrCut:.08}},
    'astral-missile':{n:'星界飞弹',s:'2件 奥术伤害+12%、冷却+6%；4件 飞弹命中蓄积星轨；6件 魔法飞弹变星轨齐射。',b2:{arcane:.12,cooldown:.06},b4:{damage:.08},b6:{skill:'missile',skillDmg:.58,range:.08}},
    'ember-meteor':{n:'余烬陨星',s:'2件 火焰伤害+15%、范围+8%；4件 火焰留下燃烧；6件 火球/陨星变龙焰天灾。',b2:{fire:.15,range:.08},b4:{damage:.09},b6:{skill:'meteorShard',skillDmg:.65,bossAttrCut:.06}},
    'storm-sigil':{n:'风暴符印',s:'2件 攻速+10%、奥术抗性+10%；4件 雷链附加符印；6件 连锁雷弧变风暴共鸣。',b2:{atkSpeed:.1,arcane:.1},b4:{cooldown:.08},b6:{skill:'thunderChain',skillDmg:.56,range:.06}},
    'cyclone-axe':{n:'旋风飞斧',s:'2件 物理伤害+12%、攻速+8%；4件 飞斧回旋更久；6件 回旋飞斧变旋风猎场。',b2:{physical:.12,atkSpeed:.08},b4:{range:.09},b6:{skill:'axe',skillDmg:.6,move:.06}},
    'moon-hunter':{n:'月影猎手',s:'2件 移速+10%、暴击+8%；4件 移动蓄势；6件 月牙斩变月蚀连斩。',b2:{move:.1,crit:.08},b4:{frost:.1},b6:{skill:'moonSlash',skillDmg:.58,damage:.08}},
    'venom-shadow':{n:'毒影伏击',s:'2件 暗影伤害+12%、移速+6%；4件 毒雾标记伏击；6件 毒雾/影刃触发毒影处决。',b2:{shadow:.12,move:.06},b4:{atkSpeed:.08},b6:{skill:'poisonCloud',skillDmg:.55,eliteAttrCut:.08}},
    'crimson-vessel':{n:'绯红圣器',s:'2件 生命+14%、欲望抗性+12%；4件 受击积累绯红能量；6件 欲液反涌变绯红喷泉。',b2:{hp:.14,lust:.12},b4:{regen:.08},b6:{skill:'lustSplash',skillDmg:.62,shieldAttrBlock:.2}},
    'violet-hymn':{n:'紫罗兰圣歌',s:'2件 范围+10%、神圣/欲望抗性+8%；4件 祈祷领域回复淫荡值；6件 献媚祈祷变堕欲圣咏。',b2:{range:.1,holy:.08,lust:.08},b4:{regen:.06},b6:{skill:'lustPrayer',skillDmg:.58,attrCapBonus:.06}},
    'rose-mirror':{n:'蔷薇镜像',s:'2件 伤害+8%、暗影/欲望抗性+10%；4件 受伤生成镜像反击；6件 飞吻/溢流触发万花镜裂。',b2:{damage:.08,shadow:.1,lust:.1},b4:{crit:.08},b6:{skill:'lustKiss',skillDmg:.55,range:.08}},
  };
  const PALADIN_RECTS = (() => {
    const cols = [[16,13,170,175],[220,20,126,162],[378,24,163,164],[561,16,108,171],[700,32,141,129],[868,18,134,170]];
    const y = [13,210,408];
    return y.flatMap((yy, row) => cols.map(([x, baseY, w, h]) => ({ x, y: row ? yy : baseY, w, h })));
  })();
  const MAGE_RECTS = (() => {
    const row1 = [[21,10,157,195],[195,14,148,184],[363,12,163,189],[552,13,128,184],[706,39,144,144],[864,14,145,184]];
    const row2 = [[12,216,160,212],[195,216,148,184],[363,216,163,189],[552,216,128,184],[706,241,144,144],[864,216,145,184]];
    const row3 = [[10,437,145,209],[195,437,148,184],[363,437,163,189],[552,437,128,184],[706,462,144,144],[864,437,145,184]];
    return [...row1, ...row2, ...row3].map(([x,y,w,h]) => ({ x, y, w, h }));
  })();
  const UNIQUE_RECTS = [
    [37,8,107,214],[193,10,164,207],[386,10,137,206],[545,9,144,205],[711,7,127,203],[846,21,173,201],
    [13,275,153,161],[187,252,152,197],[376,244,121,216],[521,243,158,208],[689,271,137,159],[839,267,175,179],
    [13,477,157,216],[183,504,151,164],[345,486,148,203],[519,480,113,212],[670,475,126,219],[847,474,154,224],
  ].map(([x,y,w,h]) => ({ x, y, w, h }));
  function rectFor(sheet, index) {
    if (sheet === 'setPaladin' || sheet === 'setSaintess') return PALADIN_RECTS[index];
    if (sheet === 'setMage' || sheet === 'setRanger') return MAGE_RECTS[index];
    return null;
  }
  const pieceNames = { weapon:'武器', helm:'冠冕', chest:'衣甲', amulet:'坠饰', ring:'戒环', boots:'足具' };
  const toItem = (r, sheet, i) => ({ baseId:r[0], name:r[1], rarity:sheet, slot:r[2], stats:r[3], resists:r[4], effect:r[5]||'', icon:{sheet:ICON_SHEETS[sheet], index:i, rect:sheet==='unique'?UNIQUE_RECTS[i]:null} });
  const gold = GOLD.map((r,i)=>toItem(r,'gold',i)), uniques = UNIQUES.map((r,i)=>toItem(r,'unique',i));
  const sets = SET_FAMILIES.flatMap((f,fi)=>SLOTS.map((slot,i)=>({ baseId:`set-${f[1]}-${slot}`, name:`${f[2]}·${pieceNames[slot]}`, rarity:'set', class:f[0], setId:f[1], setName:f[2], slot, stats:{...Object.fromEntries(Object.entries(f[4]).filter(([k])=>!RES.includes(k))), [slot==='weapon'?'damage':slot==='boots'?'move':slot==='ring'?'atkSpeed':slot==='amulet'?'range':'hp']:.06}, resists:Object.fromEntries(Object.entries(f[4]).filter(([k])=>RES.includes(k))), icon:{sheet:ICON_SHEETS[f[3]], index:(fi%3)*6+i, rect:rectFor(f[3], (fi%3)*6+i)} })));
  const all = [...gold,...uniques,...sets];
  let meta = { items:[], equipped:{}, dust:0 }, ready = false;
  const clone = v => JSON.parse(JSON.stringify(v));
  const rand = (a, b) => a + Math.random() * (b - a);
  async function kvGet(k){try{return (await window.dzmm.kv.get(k))?.value??null}catch(_){try{let r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(_){return null}}}
  async function kvPut(k,v){try{await window.dzmm.kv.put(k,v)}catch(_){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}}
  function normalize(d){let base={items:[],equipped:{},dust:0}; if(!d||typeof d!=='object')return base; base.items=Array.isArray(d.items)?d.items.filter(x=>x&&x.uid&&x.baseId).slice(0,160):[]; base.equipped=d.equipped&&typeof d.equipped==='object'?d.equipped:{}; base.dust=Math.max(0,Math.floor(Number(d.dust)||0)); return base;}
  async function init(){if(ready)return meta; meta=normalize(await kvGet(KEY)); ready=true; return meta;}
  async function save(){await kvPut(KEY,meta)}
  function baseById(id){return all.find(x=>x.baseId===id)}
  function hydrate(it){let b=baseById(it.baseId); return b?{...clone(b),...it, icon:clone(b.icon), rarity:b.rarity, class:b.class, setId:b.setId, setName:b.setName, slot:b.slot, name:b.name, stats:it.stats||scaleMap(b.stats,it.level), resists:it.resists||scaleMap(b.resists,it.level)}:it}
  function scaleMap(m,lv=1,mul=1){let s=(1+Math.max(0,lv-1)*.018)*mul,o={}; for(const [k,v] of Object.entries(m||{}))o[k]=Math.round(v*s*1000)/1000; return o}
  function addScaled(out,k,v,lv=1,mul=1){out[k]=Math.round(((out[k]||0)+v*(1+Math.max(0,lv-1)*.018)*mul)*1000)/1000}
  function goldRoll(){let q=Math.random(),tier=q>.92?'极品':q>.72?'精良':q>.38?'良品':'普通',mul=tier==='极品'?rand(.18,.32):tier==='精良'?rand(.08,.18):tier==='良品'?rand(-.02,.08):rand(-.12,-.02),extra=tier==='极品'?2:tier==='精良'?2:1;return{tier,mul:1+mul,extra}}
  function addGoldAffixes(stats,resists,roll,level){if(!roll)return;let keys=['hp','damage','armor','move','cooldown','atkSpeed','range','pickup','gold','regen','crit'];for(let i=0;i<roll.extra;i++){let k=keys[Math.floor(Math.random()*keys.length)],base={hp:.055,damage:.045,armor:.025,move:.035,cooldown:.025,atkSpeed:.035,range:.04,pickup:.055,gold:.045,regen:.03,crit:.025}[k];addScaled(stats,k,base,level,roll.mul*.85)}if(Math.random()<.45+(roll.extra-1)*.2){let r=RES[Math.floor(Math.random()*RES.length)];addScaled(resists,r,.045,level,roll.mul)}}
  function rollDrop(cls,bossKills=1,layer=0){let r=Math.random(),isUnique=r<.08+layer*.004,isSet=!isUnique&&r<.28+layer*.006,pool=isUnique?uniques:isSet?sets.filter(x=>!x.class||x.class===cls):gold,b=pool[Math.floor(Math.random()*pool.length)],level=Math.max(1,bossKills+layer*2),roll=!isUnique&&!isSet?goldRoll():null,stats=scaleMap(b.stats,level,roll?.mul||1),resists=scaleMap(b.resists,level,roll?.mul||1);addGoldAffixes(stats,resists,roll,level); return {...clone(b), uid:`eq${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`, baseId:b.baseId, level, rollTier:roll?.tier||'', rollMul:roll?.mul||1, corrupted:true, source:`Boss ${bossKills}`, stats, resists} }
  async function addItem(item){await init(); let clean={uid:item.uid,baseId:item.baseId,level:item.level||1,source:item.source||'',rollTier:item.rollTier||'',rollMul:item.rollMul||1,stats:item.stats,resists:item.resists,corrupted:false}; meta.items.unshift(clean); meta.items=meta.items.slice(0,160); await save(); return clean}
  function equippedMap(cls){meta.equipped[cls]=meta.equipped[cls]||{}; return meta.equipped[cls]}
  async function equip(uid,cls){await init(); let it=hydrate(meta.items.find(x=>x.uid===uid)); if(!it||it.corrupted||it.class&&it.class!==cls)return false; equippedMap(cls)[it.slot]=uid; await save(); return true}
  async function unequip(slot,cls){await init(); delete equippedMap(cls)[slot]; await save(); return true}
  async function discard(uid){await init(); meta.items=meta.items.filter(x=>x.uid!==uid); for(const eq of Object.values(meta.equipped||{}))for(const [slot,id] of Object.entries(eq))if(id===uid)delete eq[slot]; await save(); return true}
  function equippedItems(cls){let eq=equippedMap(cls); return SLOTS.map(s=>meta.items.find(x=>x.uid===eq[s])).filter(Boolean).map(hydrate)}
  function addBonus(out,b){for(const [k,v] of Object.entries(b||{})){if(k==='skill'||k==='skillDmg')continue; if(RES.includes(k))out.resists[k]=(out.resists[k]||0)+v;else out[k]=(out[k]||0)+v}}
  function stats(cls){let out={resists:{},sets:{},setText:[],setPowers:{},skillDmg:{},allRes:0,attrCapBonus:0,bossAttrCut:0,eliteAttrCut:0,shieldAttrBlock:0}; for(const it of equippedItems(cls)){for(const [k,v] of Object.entries(it.stats||{}))out[k]=(out[k]||0)+v; for(const [k,v] of Object.entries(it.resists||{}))out.resists[k]=(out.resists[k]||0)+v; if(it.setId)out.sets[it.setId]=(out.sets[it.setId]||0)+1} for(const [id,n] of Object.entries(out.sets)){let cfg=SET_BONUS[id]; if(!cfg)continue; out.setPowers[id]=n; if(n>=2)addBonus(out,cfg.b2); if(n>=4)addBonus(out,cfg.b4); if(n>=6){addBonus(out,cfg.b6); out.setPowers[id]=6; if(cfg.b6.skill)out.skillDmg[cfg.b6.skill]=(out.skillDmg[cfg.b6.skill]||0)+(cfg.b6.skillDmg||0)} out.setText.push(`${cfg.n} ${n}/6：${cfg.s}`)} if(equippedItems(cls).some(x=>x.rarity==='unique'))out.attrCapBonus+=.05; return out}
  function pct(v){return `${v>=0?'+':''}${Math.round(v*100)}%`}
  function itemText(it){let s=[]; if(it.rollTier)s.push(`品相：${it.rollTier}`); for(const [k,v] of Object.entries(it.stats||{}))s.push(`${{hp:'生命',damage:'伤害',armor:'护甲',move:'移速',cooldown:'冷却',atkSpeed:'攻速',range:'范围',pickup:'拾取',gold:'金币',regen:'回复',crit:'暴击'}[k]||k} ${pct(v)}`); for(const [k,v] of Object.entries(it.resists||{}))s.push(`${RES_CN[k]||k}抗性 ${pct(v)}`); return s.join(' / ')}
  function iconScale(it){if(it?.rarity==='unique')return .78;if(it?.rarity==='set')return .84;return 1}
  function iconRows(it){return it?.rarity==='unique'||it?.rarity==='set'?3:6}
  function iconYOffset(it){return it?.rarity==='unique'?28:it?.rarity==='set'?24:0}
  function iconHtml(it){let r=it.icon?.rect,s=iconScale(it); if(r){let fit=34/Math.max(r.w,r.h),bw=Math.round(1024*fit),bh=bw;return `<span class="eqIcon" style="background-image:url('${it.icon?.sheet||''}');background-size:${bw}px ${bh}px;background-position:${Math.round(-r.x*fit)}px ${Math.round(-r.y*fit)}px;background-repeat:no-repeat;transform:scale(${s})"></span>`} let i=it.icon?.index||0,x=i%6,y=Math.floor(i/6),rows=iconRows(it),step=100/(rows-1),oy=iconYOffset(it);return `<span class="eqIcon" style="background-image:url('${it.icon?.sheet||''}');background-size:600% ${rows*100}%;background-position:${x*20}% ${y*step+oy}%;background-repeat:no-repeat;transform:scale(${s})"></span>`}
  function data(){return meta}
  return { init, save, data, SLOTS, SLOT_CN, CLS_CN, RES_CN, all, rollDrop, addItem, equip, unequip, discard, equippedItems, stats, hydrate, itemText, iconHtml };
})();
window.Equipment = window.GameModules.equipment;

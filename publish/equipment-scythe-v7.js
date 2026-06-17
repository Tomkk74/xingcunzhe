window.GameModules = window.GameModules || {};
window.GameModules.equipment = (() => {
  const KEY = 'arcane-equipment-v2';
  const GOLD_ICON_PREFIX = './assets/generated/huangjin/t_d98add39-dbc9-4803-ad99-c075894fe454_';
  const UNIQUE_ICON_PREFIX = './assets/generated/anjin/t_9f0f72b8-ae78-49b3-93d5-0415d37c6b00_';
  const SET_ICON_PREFIX = { setPaladin:'./assets/generated/paladin/t_cccb496c-393b-4a20-9ed8-245883afa2b3_', setMage:'./assets/generated/mage/t_7cfaf443-aece-4533-b56a-d6e8c72a9734_', setRanger:'./assets/generated/ranger/t_695e9072-a6b9-41c7-b65a-423267d0669a_', setSaintess:'./assets/generated/saintess/t_f9571423-469d-490d-868a-2a33dcaa326c_', setScythe:'./assets/generated/scythe-maiden/t_afb7751d-ed19-476d-ab4e-c4a492c79c92_' };
  const SLOTS = ['weapon','helm','chest','amulet','ring','boots'];
  const SLOT_CN = { weapon:'武器', helm:'头盔', chest:'胸甲', amulet:'项链', ring:'戒指', boots:'靴子' };
  const CLS_CN = { paladin:'圣骑士', mage:'大魔法师', ranger:'游侠', lewdSaintess:'淫靡圣女', scytheMaiden:'琦琦' };
  const RES = ['physical','fire','frost','arcane','holy','shadow','poison','lust'];
  const RES_CN = { physical:'物理', fire:'火焰', frost:'霜寒', arcane:'奥术', holy:'神圣', shadow:'暗影', poison:'毒素', lust:'欲望', all:'全属性' };
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
    ['scytheMaiden','reaper-waltz','冥月圆舞','setScythe',{move:.08,physical:.05,shadow:.05}],['scytheMaiden','blood-reaping','血镰誓约','setScythe',{hp:.1,regen:.04,shadow:.05}],['scytheMaiden','soul-shadow','断魂影镰','setScythe',{damage:.06,crit:.05,shadow:.06}],
  ];
  const SET_BONUS = {
    'aureate-guardian':{n:'辉金守护',s:'2件 [+]大蒜光环伤害+50%；4件 生命+30% 回复+15%；6件 [x]大蒜光环伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{garlic:.5}},b4:{hp:.3,regen:.15},b6:{skill:'garlic',skillDmg:4,range:.24,shieldAttrBlock:.32}},
    'thorn-bulwark':{n:'荆棘壁垒',s:'2件 [+]血色新星伤害+50%；4件 护甲+22% 物理抗性+24%；6件 [x]血色新星伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{bloodNova:.5}},b4:{armor:.22,physical:.24},b6:{skill:'bloodNova',skillDmg:4,bossAttrCut:.12}},
    'dawn-judgment':{n:'黎明审判',s:'2件 [+]圣光长枪伤害+50%；4件 冷却+18% 范围+14%；6件 [x]圣光长枪伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{holyLance:.5}},b4:{cooldown:.18,range:.14},b6:{skill:'holyLance',skillDmg:4.5,eliteAttrCut:.12}},
    'astral-missile':{n:'星界飞弹',s:'2件 [+]魔法飞弹伤害+50%；4件 冷却+18% 奥术抗性+22%；6件 [x]魔法飞弹伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{missile:.5}},b4:{cooldown:.18,arcane:.22},b6:{skill:'missile',skillDmg:4.5,range:.14}},
    'ember-meteor':{n:'余烬陨星',s:'2件 [+]陨星碎片伤害+50%；4件 范围+18% 火焰抗性+22%；6件 [x]陨星碎片伤害+350%~575%（独立乘区）。',b2:{skillDmgAdd:{meteorShard:.5}},b4:{range:.18,fire:.22},b6:{skill:'meteorShard',skillDmg:4.6,bossAttrCut:.1}},
    'storm-sigil':{n:'风暴符印',s:'2件 [+]连锁雷弧伤害+50%；4件 攻速+22% 冷却+15%；6件 [x]连锁雷弧伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{thunderChain:.5}},b4:{atkSpeed:.22,cooldown:.15},b6:{skill:'thunderChain',skillDmg:4,range:.12}},
    'cyclone-axe':{n:'旋风飞斧',s:'2件 [+]回旋飞斧伤害+50%；4件 攻速+20% 物理抗性+18%；6件 [x]回旋飞斧伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{axe:.5}},b4:{atkSpeed:.2,physical:.18},b6:{skill:'axe',skillDmg:4.5,move:.12}},
    'moon-hunter':{n:'月影猎手',s:'2件 [+]月牙斩伤害+50%；4件 暴击+18% 霜寒抗性+22%；6件 [x]月牙斩伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{moonSlash:.5}},b4:{crit:.18,frost:.22},b6:{skill:'moonSlash',skillDmg:4.5}},
    'venom-shadow':{n:'毒影伏击',s:'2件 [+]毒雾爆裂伤害+50%；4件 移速+18% 暗影抗性+22%；6件 [x]毒雾爆裂伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{poisonCloud:.5}},b4:{move:.18,shadow:.22},b6:{skill:'poisonCloud',skillDmg:4,eliteAttrCut:.12}},
    'crimson-vessel':{n:'绯红圣器',s:'2件 [+]欲液反涌伤害+50%；4件 生命+30% 欲望抗性+22%；6件 [x]欲液反涌伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{lustSplash:.5}},b4:{hp:.3,lust:.22},b6:{skill:'lustSplash',skillDmg:4.5,shieldAttrBlock:.28}},
    'violet-hymn':{n:'紫罗兰圣歌',s:'2件 [+]献媚祈祷伤害+50%；4件 范围+20% 回复+15%；6件 [x]献媚祈祷伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{lustPrayer:.5}},b4:{range:.2,regen:.15},b6:{skill:'lustPrayer',skillDmg:4,attrCapBonus:.08}},
    'rose-mirror':{n:'蔷薇镜像',s:'2件 [+]媚心飞吻伤害+50%；4件 暴击+18% 暗影/欲望抗性+16%；6件 [x]媚心飞吻伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{lustKiss:.5}},b4:{crit:.18,shadow:.16,lust:.16},b6:{skill:'lustKiss',skillDmg:4,range:.14}},
    'reaper-waltz':{n:'冥月圆舞',s:'2件 [+]残月镰舞伤害+50%；4件 移速+18% 生命+22%；6件 [x]残月镰舞伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{scytheArc:.5}},b4:{move:.18,hp:.22},b6:{skill:'scytheArc',skillDmg:4.5,shieldAttrBlock:.24}},
    'blood-reaping':{n:'血镰誓约',s:'2件 [+]血镰回旋伤害+50%；4件 护甲+16% 回复+14%；6件 [x]血镰回旋伤害+300%~500%（独立乘区）。',b2:{skillDmgAdd:{bloodReap:.5}},b4:{armor:.16,regen:.14},b6:{skill:'bloodReap',skillDmg:4,bossAttrCut:.1}},
    'soul-shadow':{n:'断魂影镰',s:'2件 [+]幽魂刃舞伤害+50%；4件 暴击+18% 攻速+16%；6件 [x]幽魂刃舞伤害+330%~550%（独立乘区）。',b2:{skillDmgAdd:{wraithBlade:.5}},b4:{crit:.18,atkSpeed:.16},b6:{skill:'wraithBlade',skillDmg:4.5,eliteAttrCut:.12}},
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
  const SCYTHE_RECTS = [
    [38,54,238,258],[315,61,191,228],[566,87,161,182],[787,56,220,248],[1046,77,183,218],[1304,74,194,237],
    [36,367,218,265],[304,379,203,230],[561,395,172,212],[782,363,224,258],[1034,391,199,218],[1290,396,205,217],
    [46,682,208,260],[310,690,192,220],[558,687,176,222],[784,672,228,258],[1030,688,214,230],[1296,696,198,216],
  ].map(([x,y,w,h]) => ({ x, y, w, h, sw:1536, sh:1024 }));
  const UNIQUE_RECTS = [
    [37,8,107,214],[193,10,164,207],[386,10,137,206],[545,9,144,205],[711,7,127,203],[846,21,173,201],
    [13,275,153,161],[187,252,152,197],[376,244,121,216],[521,243,158,208],[689,271,137,159],[839,267,175,179],
    [13,477,157,216],[183,504,151,164],[345,486,148,203],[519,480,113,212],[670,475,126,219],[847,474,154,224],
  ].map(([x,y,w,h]) => ({ x, y, w, h }));
  function gridRect(index, cols = 6, rows = 6, size = 1254) {
    let w = size / cols, h = size / rows;
    return { x:(index % cols) * w, y:Math.floor(index / cols) * h, w, h, sw:size, sh:size };
  }
  function rectFor(sheet, index) {
    if (sheet === 'setPaladin' || sheet === 'setMage' || sheet === 'setRanger' || sheet === 'setSaintess' || sheet === 'setScythe') return gridRect(index);
    return null;
  }
  const pieceNames = { weapon:'武器', helm:'冠冕', chest:'衣甲', amulet:'坠饰', ring:'戒环', boots:'足具' };
  const iconPath = (prefix, i) => `${prefix}${Math.floor(i/6)+1}_${i%6+1}.png`;
  const toItem = (r, sheet, i) => ({ baseId:r[0], name:r[1], rarity:sheet, slot:r[2], stats:r[3], resists:r[4], effect:r[5]||'', icon:{src:iconPath(sheet==='gold'?GOLD_ICON_PREFIX:UNIQUE_ICON_PREFIX,i), index:i} });
  const gold = GOLD.map((r,i)=>toItem(r,'gold',i)), uniques = UNIQUES.map((r,i)=>toItem(r,'unique',i));
  const sets = SET_FAMILIES.flatMap((f,fi)=>SLOTS.map((slot,i)=>({ baseId:`set-${f[1]}-${slot}`, name:`${f[2]}·${pieceNames[slot]}`, rarity:'set', class:f[0], setId:f[1], setName:f[2], slot, stats:{...Object.fromEntries(Object.entries(f[4]).filter(([k])=>!RES.includes(k))), [slot==='weapon'?'damage':slot==='boots'?'move':slot==='ring'?'atkSpeed':slot==='amulet'?'range':'hp']:.06}, resists:Object.fromEntries(Object.entries(f[4]).filter(([k])=>RES.includes(k))), icon:{src:`${SET_ICON_PREFIX[f[3]]}${fi%3+1}_${i+1}.png`, index:(fi%3)*6+i} })));
  const all = [...gold,...uniques,...sets];
  const DEF_KEYS = ['hp','armor','move','pickup','gold','regen'];
  const OFF_KEYS = ['damage','cooldown','atkSpeed','range','crit','skillLv'];
  const SKILL_BY_CLASS = {
    paladin:['garlic','bloodNova','holyLance'], mage:['missile','meteorShard','thunderChain'], ranger:['axe','moonSlash','poisonCloud'],
    lewdSaintess:['lustSplash','lustPrayer','lustKiss'], scytheMaiden:['scytheArc','bloodReap','wraithBlade']
  };
  let meta = { items:[], equipped:{}, dust:0 }, ready = false, activeKey = '';
  const clone = v => JSON.parse(JSON.stringify(v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const timeout = (p, ms = 1200) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
  function localGet(k){try{let r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(_){return null}}
  function localPut(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
  async function kvGet(k){let local=localGet(k);if(local)return local;try{return (await timeout(window.dzmm.kv.get(k)))?.value??null}catch(_){return null}}
  async function kvPut(k,v){localPut(k,v);try{await timeout(window.dzmm.kv.put(k,v))}catch(_){}}
  function normalize(d){let base={items:[],equipped:{},dust:0}; if(!d||typeof d!=='object')return base; base.items=Array.isArray(d.items)?d.items.filter(x=>x&&x.uid&&x.baseId).slice(0,160):[]; base.equipped=d.equipped&&typeof d.equipped==='object'?d.equipped:{}; base.dust=Math.max(0,Math.floor(Number(d.dust)||0)); return base;}
  function storeKey(){return window.Season?.key?Season.key(KEY):KEY}
  async function init(){let k=storeKey();if(ready&&activeKey===k)return meta; activeKey=k; meta=normalize(await kvGet(k)); ready=true; return meta;}
  async function save(){await kvPut(storeKey(),meta)}
  function baseById(id){return all.find(x=>x.baseId===id)}
  function requiredLevel(lv=1,rarity='gold'){let cap=window.Season?.cap?Season.cap():20,bonus=rarity==='unique'?2:rarity==='set'?1:0;return Math.min(cap,Math.max(1,Math.ceil((lv||1)+bonus)))}
  function hydrate(it){let b=baseById(it.baseId); return b?{...clone(b),...it, icon:clone(b.icon), rarity:b.rarity, class:b.class, setId:b.setId, setName:b.setName, slot:b.slot, name:b.name, requiredLevel:it.requiredLevel||requiredLevel(it.level,b.rarity), season:it.season||window.Season?.CURRENT||1, stats:it.stats||scaleMap(b.stats,it.level), resists:it.resists||scaleMap(b.resists,it.level)}:it}
  function scaleMap(m,lv=1,mul=1){let s=(1+Math.max(0,lv-1)*.024)*mul,o={}; for(const [k,v] of Object.entries(m||{}))o[k]=Math.round(v*s*1000)/1000; return o}
  function addScaled(out,k,v,lv=1,mul=1){out[k]=Math.round(((out[k]||0)+v*(1+Math.max(0,lv-1)*.024)*mul)*1000)/1000}
  function powerForLayer(layer=0){layer=Math.max(0,Math.floor(layer||0));return 1+Math.min(3.2,layer*.032+Math.max(0,layer-50)*.018)}
  function dropProfile(layer=0){layer=Math.max(0,Math.floor(layer||0));let t=clamp((layer-10)/89,0,1),quality=Math.min(.96,.04+Math.max(0,layer-10)*.047),set=layer<20?Math.max(.03,(layer-10)*.012):Math.min(.9,.18+(layer-20)*.011+quality*.35),unique=layer<30?0:Math.min(.32,.035+(layer-30)*.006+quality*.18);return{quality,set,unique}}
  function goldRoll(layer=0){let q=Math.random()+dropProfile(layer).quality*.7,tier=q>.98?'神铸':q>.86?'极品':q>.62?'精良':q>.34?'良品':'普通',mul={神铸:1.75,极品:1.45,精良:1.22,良品:1.05,普通:.88}[tier]*powerForLayer(layer),extra={神铸:5,极品:4,精良:3,良品:2,普通:2}[tier];return{tier,mul,extra}}
  function affixBase(k){return{hp:.075,armor:.04,move:.045,pickup:.08,gold:.07,regen:.045,damage:.065,cooldown:.04,atkSpeed:.05,range:.055,crit:.035,skillLv:1}[k]||.04}
  function slotKeys(slot){return slot==='weapon'||slot==='amulet'||slot==='ring'?OFF_KEYS:DEF_KEYS}
  function addGoldAffixes(stats,resists,roll,level,slot,cls){if(!roll)return;let Affix=window.GameModules.affix;let result=Affix.rollGoldAffixes(level,roll.mul*.55,slot,cls);for(const [k,v] of Object.entries(result.stats)){if(k==='attrDmg'){if(!stats.attrDmg)stats.attrDmg={};for(const [ak,av] of Object.entries(v))stats.attrDmg[ak]=(stats.attrDmg[ak]||0)+av;continue}stats[k]=(stats[k]||0)+v}for(const [k,v] of Object.entries(result.resists))resists[k]=(resists[k]||0)+v;if(result.isLucky&&roll.tier)roll.tier+=' ★'}
  function rollSetPower(b,layer){let max=b.setId==='ember-meteor'?4.6:b.setId==='storm-sigil'||b.setId==='venom-shadow'||b.setId==='violet-hymn'||b.setId==='rose-mirror'||b.setId==='blood-reaping'||b.setId==='aureate-guardian'||b.setId==='thorn-bulwark'?4:4.5,min=max*.6,hi=Math.min(max,min+(max-min)*(dropProfile(layer).quality+.12));return Math.round(rand(min,hi)*1000)/1000}
  function rollDrop(cls,bossKills=1,layer=0,force=null){let p=dropProfile(layer),r=Math.random(),kind=force||(r<p.unique?'unique':r<p.unique+p.set?'set':'gold'),pool=kind==='unique'?uniques:kind==='set'?sets.filter(x=>x.class===cls):gold,b=pool[Math.floor(Math.random()*pool.length)],level=Math.max(1,10+Math.floor(layer*1.8)+bossKills),req=requiredLevel(level,b.rarity),roll=kind==='gold'?goldRoll(layer):null,pm=powerForLayer(layer),stats=scaleMap(b.stats,level,kind==='unique'?pm*1.55:kind==='set'?pm:roll?.mul||1),resists=scaleMap(b.resists,level,kind==='unique'?pm*1.55:kind==='set'?pm:roll?.mul||1);if(kind==='gold')addGoldAffixes(stats,resists,roll,level,b.slot,cls);if(kind==='set')stats.setSkillDmg=rollSetPower(b,layer);return {...clone(b), uid:`eq${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`, baseId:b.baseId, level, requiredLevel:req, season:window.Season?.CURRENT||1, rollTier:roll?.tier||(kind==='set'?'套装特效 '+Math.round((stats.setSkillDmg||0)*100)+'%':'满属性暗金'), rollMul:roll?.mul||1, corrupted:true, source:`秘境 ${layer||bossKills}层`, stats, resists} }
  async function addItem(item){await init(); let clean={uid:item.uid,baseId:item.baseId,level:item.level||1,requiredLevel:item.requiredLevel||requiredLevel(item.level,item.rarity),season:item.season||window.Season?.CURRENT||1,source:item.source||'',rollTier:item.rollTier||'',rollMul:item.rollMul||1,stats:item.stats,resists:item.resists,corrupted:false}; meta.items.unshift(clean); meta.items=meta.items.slice(0,160); await save(); return clean}
  function equippedMap(cls){meta.equipped[cls]=meta.equipped[cls]||{}; return meta.equipped[cls]}
  function canEquip(it,cls){if(!it||it.corrupted)return false;if(it.class&&it.class!==cls)return false;return (window.Season?.level?Season.level():20)>=(it.requiredLevel||1)}
  async function equip(uid,cls){await init(); let it=hydrate(meta.items.find(x=>x.uid===uid)); if(!canEquip(it,cls))return false; equippedMap(cls)[it.slot]=uid; await save(); return true}
  async function unequip(slot,cls){await init(); delete equippedMap(cls)[slot]; await save(); return true}
  async function discard(uid){await init(); meta.items=meta.items.filter(x=>x.uid!==uid); for(const eq of Object.values(meta.equipped||{}))for(const [slot,id] of Object.entries(eq))if(id===uid)delete eq[slot]; await save(); return true}
  async function discardMany(uids){await init(); let set=new Set(uids||[]); meta.items=meta.items.filter(x=>!set.has(x.uid)); for(const eq of Object.values(meta.equipped||{}))for(const [slot,id] of Object.entries(eq))if(set.has(id))delete eq[slot]; await save(); return true}
  function equippedItems(cls){let eq=equippedMap(cls); return SLOTS.map(s=>meta.items.find(x=>x.uid===eq[s])).filter(Boolean).map(hydrate)}
  function addBonus(out,b){for(const [k,v] of Object.entries(b||{})){if(k==='skill'||k==='skillDmg')continue; if(k==='attrDmg'){if(!out.attrDmg)out.attrDmg={};for(const [ak,av] of Object.entries(v))out.attrDmg[ak]=(out.attrDmg[ak]||0)+av;continue;} if(k==='skillDmgAdd'){if(!out.skillDmgAdd)out.skillDmgAdd={};for(const [sk,sv] of Object.entries(v))out.skillDmgAdd[sk]=(out.skillDmgAdd[sk]||0)+sv;continue;} if(RES.includes(k))out.resists[k]=(out.resists[k]||0)+v;else out[k]=(out[k]||0)+v}}
  function stats(cls){let out={resists:{},sets:{},setText:[],setPowers:{},skillDmg:{},skillDmgAdd:{},skillLv:{},attrDmg:{},allRes:0,attrCapBonus:0,bossAttrCut:0,eliteAttrCut:0,shieldAttrBlock:0};let equipped=equippedItems(cls); for(const it of equipped){for(const [k,v] of Object.entries(it.stats||{})){if(k.startsWith('skill:'))out.skillLv[k.slice(6)]=(out.skillLv[k.slice(6)]||0)+v;else if(k==='setSkillDmg')continue;else if(k==='attrDmg'){for(const [ak,av] of Object.entries(v))out.attrDmg[ak]=(out.attrDmg[ak]||0)+av;}else if(k==='skillDmgAdd'){for(const [sk,sv] of Object.entries(v))out.skillDmgAdd[sk]=(out.skillDmgAdd[sk]||0)+sv;}else out[k]=(out[k]||0)+v} for(const [k,v] of Object.entries(it.resists||{}))out.resists[k]=(out.resists[k]||0)+v; if(it.setId)out.sets[it.setId]=(out.sets[it.setId]||0)+1} for(const [id,n] of Object.entries(out.sets)){let cfg=SET_BONUS[id]; if(!cfg)continue; out.setPowers[id]=n; if(n>=2)addBonus(out,cfg.b2); if(n>=4)addBonus(out,cfg.b4); if(n>=6){addBonus(out,cfg.b6); out.setPowers[id]=6; if(cfg.b6.skill){let pieces=equipped.filter(x=>x.setId===id),avg=pieces.reduce((a,x)=>a+(x.stats?.setSkillDmg||cfg.b6.skillDmg*.6),0)/Math.max(1,pieces.length);out.skillDmg[cfg.b6.skill]=(out.skillDmg[cfg.b6.skill]||0)+Math.min(cfg.b6.skillDmg,avg)}} out.setText.push(`${cfg.n} ${n}/6：${cfg.s}`)} if(equipped.some(x=>x.rarity==='unique'))out.attrCapBonus+=.05; return out}
  function pct(v){return `${v>=0?'+':''}${Math.round(v*100)}%`}
  function itemText(it){let s=[]; if(it.rollTier)s.push(`品相：${it.rollTier}`); for(const [k,v] of Object.entries(it.stats||{})){if(k.startsWith('skill:'))s.push(`${INFO?.[k.slice(6)]?.[0]||k.slice(6)} +${v}`);else if(k==='setSkillDmg')s.push(`6件套特效伤害 ${pct(v)}`);else if(k==='attrDmg'){for(const [ak,av] of Object.entries(v))s.push(`[x]${RES_CN[ak]||ak}属性伤害 ${pct(av)}`);}else if(k==='skillDmgAdd'){for(const [sk,sv] of Object.entries(v))s.push(`[+]${ATTACK_NAME?.[sk]||sk}伤害 ${pct(sv)}`);}else s.push(`${{hp:'生命',damage:'伤害',armor:'护甲',move:'移速',cooldown:'冷却',atkSpeed:'攻速',range:'范围',pickup:'拾取',gold:'金币',regen:'回复',crit:'暴击'}[k]||k} ${pct(v)}`)} for(const [k,v] of Object.entries(it.resists||{}))s.push(`${RES_CN[k]||k}抗性 ${pct(v)}`); return s.join(' / ')}
  function iconScale(it){if(it?.rarity==='unique')return .78;if(it?.rarity==='set')return .84;return 1}
  function iconRows(it){return it?.rarity==='unique'||it?.rarity==='set'?3:6}
  function iconYOffset(it){return it?.rarity==='unique'?28:it?.rarity==='set'?24:0}
  function iconHtml(it){let r=it.icon?.rect,s=iconScale(it); if(it.icon?.src)return `<span class="eqIcon" style="background-image:url('${it.icon.src}');background-size:contain;background-position:center;background-repeat:no-repeat;transform:scale(${s})"></span>`; if(r){let fit=34/Math.max(r.w,r.h),bw=Math.round((r.sw||1024)*fit),bh=Math.round((r.sh||1024)*fit);return `<span class="eqIcon" style="background-image:url('${it.icon?.sheet||''}');background-size:${bw}px ${bh}px;background-position:${Math.round(-r.x*fit)}px ${Math.round(-r.y*fit)}px;background-repeat:no-repeat;transform:scale(${s})"></span>`} let i=it.icon?.index||0,x=i%6,y=Math.floor(i/6),rows=iconRows(it),step=100/(rows-1),oy=iconYOffset(it);return `<span class="eqIcon" style="background-image:url('${it.icon?.sheet||''}');background-size:600% ${rows*100}%;background-position:${x*20}% ${y*step+oy}%;background-repeat:no-repeat;transform:scale(${s})"></span>`}
  function data(){return meta}
  function setBonus(id){return SET_BONUS[id]||null}
  return { init, save, data, SLOTS, SLOT_CN, CLS_CN, RES_CN, all, rollDrop, addItem, equip, unequip, discard, discardMany, equippedItems, stats, hydrate, itemText, iconHtml, setBonus, requiredLevel, canEquip };
})();
window.Equipment = window.GameModules.equipment;

(function(){
'use strict';
const CFG={wind:{size:132,hit:42},moonSlash:{size:158,hit:52}};
const baseCast=window.castProjectile;
const baseVolley=window.volley;
function isBlade(k){return k==='wind'||k==='moonSlash'}
function bladeProjectile(kind,target,speed,dmg,life,aoe=0,slow=0,off=0,pierce=false){
  let p=S?.player;if(!p||!target)return;
  let c=CFG[kind],a=Math.atan2(target.y-p.y,target.x-p.x)+off,sm=typeof projectileSpeedMul==='function'?projectileSpeedMul():1;
  if(S.artifacts?.includes('moon')&&kind==='moonSlash')slow=Math.max(slow,2);
  S.proj.push({kind,x:p.x,y:p.y,vx:Math.cos(a)*speed*sm,vy:Math.sin(a)*speed*sm,dmg,life,maxLife:life,aoe,slow,rot:a,
    trail:[],hit:new Set(),pierce:pierce!==false,blade:true,hitRadius:c.hit+(aoe||0)*.45,size:c.size+(aoe||0)*1.15});
  if(typeof sfx==='function')sfx('slash');
  p.hit=.16;p.cast=.24;
}
window.castProjectile=function(kind,target,speed,dmg,life,aoe=0,slow=0,off=0,pierce=false){
  if(isBlade(kind))return bladeProjectile(kind,target,speed,dmg,life,aoe,slow,off,pierce);
  return baseCast?baseCast(kind,target,speed,dmg,life,aoe,slow,off,pierce):undefined;
};
window.volley=function(kind,target,n,speed,dmg,life,aoe=0,slow=0,pierce=false){
  if(!isBlade(kind))return baseVolley?baseVolley(kind,target,n,speed,dmg,life,aoe,slow,pierce):undefined;
  let spread=kind==='wind'?.16:.20;
  for(let i=0;i<n;i++)window.castProjectile(kind,target,speed,dmg,life,aoe,slow,(i-(n-1)/2)*spread,true);
};
window.drawBladeWave=function(m,kind){
  let img=imgs?.[kind];
  if(!img?.complete)return;
  let sz=m.size||(CFG[kind]||CFG.wind).size,fr=m.frame??frameOf(S.time,12),alpha=kind==='moonSlash'?.98:.92;
  drawSheet(img,m.x,m.y,sz,fr,m.rot||0,kind==='moonSlash'?1.18:1.35,kind==='moonSlash'?.82:.72,alpha);
};
console.info('游侠风刃/月牙斩使用素材放大渲染补丁已启用');
})();

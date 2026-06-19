(function(){
'use strict';
const CFG={
  wind:{size:122,hit:42,color:'#67e8f9',core:'#ecfeff',shadow:'#22d3ee',name:'风裂刃'},
  moonSlash:{size:145,hit:52,color:'#bfdbfe',core:'#f8fbff',shadow:'#60a5fa',name:'月牙斩'}
};
const baseCast=window.castProjectile;
const baseVolley=window.volley;
function isBlade(k){return k==='wind'||k==='moonSlash'}
function bladeProjectile(kind,target,speed,dmg,life,aoe=0,slow=0,off=0,pierce=false){
  let p=window.S?.player;if(!p||!target)return;
  let c=CFG[kind],a=Math.atan2(target.y-p.y,target.x-p.x)+off,sm=typeof projectileSpeedMul==='function'?projectileSpeedMul():1;
  if(S.artifacts?.includes('moon')&&kind==='moonSlash')slow=Math.max(slow,2);
  S.proj.push({
    kind,x:p.x,y:p.y,vx:Math.cos(a)*speed*sm,vy:Math.sin(a)*speed*sm,dmg,life,maxLife:life,aoe,slow,rot:a,
    trail:[],hit:new Set(),pierce:pierce!==false,blade:true,hitRadius:c.hit+(aoe||0)*.45,size:c.size+(aoe||0)*1.15
  });
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
  let c=CFG[kind]||CFG.wind,life=m.maxLife?m.life/m.maxLife:1,age=1-life,sz=m.size||c.size,w=sz*.54,h=sz*.28;
  ctx.save();
  ctx.translate(m.x,m.y);ctx.rotate(m.rot||0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.86;
  ctx.shadowColor=c.shadow;ctx.shadowBlur=22;
  let g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.38,c.color);g.addColorStop(.72,c.core);g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.beginPath();
  ctx.moveTo(-w*.9,-h*.24);ctx.quadraticCurveTo(-w*.05,-h*1.25,w*.98,0);ctx.quadraticCurveTo(-w*.05,h*1.25,-w*.9,h*.24);ctx.quadraticCurveTo(-w*.42,0,-w*.9,-h*.24);ctx.fill();
  ctx.strokeStyle=c.core;ctx.lineWidth=Math.max(4,sz*.055);ctx.lineCap='round';ctx.beginPath();ctx.arc(-w*.18,0,w*.98,-.72,.72);ctx.stroke();
  ctx.strokeStyle=c.color;ctx.lineWidth=Math.max(8,sz*.09);ctx.globalAlpha=.42;ctx.beginPath();ctx.arc(-w*.12,0,w*.86,-.78,.78);ctx.stroke();
  ctx.globalAlpha=.24*(1-age*.35);ctx.fillStyle=c.shadow;ctx.beginPath();ctx.ellipse(-w*.34,0,w*.55,h*.72,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
};
console.info('游侠大风刃/月牙斩渲染补丁已启用');
})();

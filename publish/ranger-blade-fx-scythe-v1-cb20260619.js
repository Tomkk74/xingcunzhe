(function(){
'use strict';
const CFG={wind:{size:132,hit:42},moonSlash:{size:158,hit:52}};
const baseCast=window.castProjectile;
const baseVolley=window.volley;
const baseDrawSheet=window.drawSheet;
if(window.imgs?.wind&&!imgs.windFlipped)imgs.windFlipped=imgs.wind;
function isBlade(k){return k==='wind'||k==='moonSlash'}
function ensureWindFlip(){
  let src=window.imgs?.wind;if(!src?.complete||imgs._windFlipReady||imgs._windFlipPending)return;
  let w=src.naturalWidth||src.width,h=src.naturalHeight||src.height,cv=document.createElement('canvas'),cx=cv.getContext('2d');
  cv.width=w;cv.height=h;let fw=w/2,fh=h/2;
  for(let y=0;y<2;y++)for(let x=0;x<2;x++){cx.save();cx.translate(x*fw+fw,y*fh);cx.scale(-1,1);cx.drawImage(src,x*fw,y*fh,fw,fh,0,0,fw,fh);cx.restore()}
  let out=new Image();imgs._windFlipPending=true;out.onload=function(){imgs.windFlipped=out;imgs._windFlipReady=true;imgs._windFlipPending=false};
  out.onerror=function(){imgs._windFlipPending=false};out.src=cv.toDataURL('image/png');
}
function drawMirroredSheet(img,x,y,size,frame,rot=0,sx=1,sy=1,a=1){
  if(!img?.complete)return;let fw=img.width/2,fh=img.height/2;
  ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(-sx,sy);
  ctx.drawImage(img,frame%2*fw,Math.floor(frame/2)*fh,fw,fh,-size/2,-size/2,size,size);ctx.restore();
}
window.drawSheet=function(img,x,y,size,frame,rot=0,sx=1,sy=1,a=1){
  if(img===imgs?.windFlipped)return drawMirroredSheet(imgs.wind,x,y,size,frame,rot,Math.abs(sx),sy,a);
  return baseDrawSheet?baseDrawSheet(img,x,y,size,frame,rot,sx,sy,a):undefined;
};
function bladeProjectile(kind,target,speed,dmg,life,aoe=0,slow=0,off=0,pierce=false){
  let p=S?.player;if(!p||!target)return;ensureWindFlip();
  let c=CFG[kind],a=Math.atan2(target.y-p.y,target.x-p.x)+off,sm=typeof projectileSpeedMul==='function'?projectileSpeedMul():1;
  if(S.artifacts?.includes('moon')&&kind==='moonSlash')slow=Math.max(slow,2);
  S.proj.push({kind,fxKind:kind==='wind'?'windFlipped':undefined,x:p.x,y:p.y,vx:Math.cos(a)*speed*sm,vy:Math.sin(a)*speed*sm,dmg,life,maxLife:life,aoe,slow,rot:a,
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
  if(kind==='wind')ensureWindFlip();
  let img=kind==='wind'?(imgs?.windFlipped||imgs?.wind):imgs?.[kind];
  if(!img?.complete)return;
  let sz=m.size||(CFG[kind]||CFG.wind).size,fr=m.frame??frameOf(S.time,12),alpha=kind==='moonSlash'?.98:.92;
  if(kind==='wind'&&!imgs._windFlipReady)drawMirroredSheet(img,m.x,m.y,sz,fr,m.rot||0,1.35,.72,alpha);
  else drawSheet(img,m.x,m.y,sz,fr,m.rot||0,kind==='wind'?1.35:1.18,kind==='moonSlash'?.82:.72,alpha);
};
console.info('游侠风刃/月牙斩使用素材放大渲染补丁已启用');
})();

(function(){
'use strict';
const boot=window.__arcaneBootLoading;
if(!boot)return;
const phaseFor=label=>String(label||'').includes('存档')?'runtime_initializing':'resource_loading';
const oldProgress=window.setLoadProgress;
if(typeof oldProgress==='function'){
  window.setLoadProgress=function(done,total,label){
    boot.progress({
      phase: phaseFor(label),
      loadedResources: Math.max(0,Number(done)||0),
      totalResources: Math.max(0,Number(total)||0),
      currentResource: String(label||'启动资源').slice(0,80),
      message: String(label||'加载中').slice(0,80),
    });
    return oldProgress.apply(this,arguments);
  };
}
const oldError=window.setLoadError;
if(typeof oldError==='function'){
  window.setLoadError=function(msg){
    boot.error('BOOT_FAILED',String(msg||'游戏启动失败').slice(0,180));
    return oldError.apply(this,arguments);
  };
}
const oldFinish=window.finishLoadingStep;
if(typeof oldFinish==='function'){
  window.finishLoadingStep=function(next,opt){
    const wrapped=typeof next==='function'?function(){
      const out=next.apply(this,arguments);
      boot.ready();
      return out;
    }:next;
    return oldFinish.call(this,wrapped,opt);
  };
}
const oldIntro=window.showSeasonIntro;
if(typeof oldIntro==='function'){
  window.showSeasonIntro=function(){
    const out=oldIntro.apply(this,arguments);
    boot.ready();
    return out;
  };
}
})();

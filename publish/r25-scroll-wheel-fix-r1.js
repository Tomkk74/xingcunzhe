(function(){
  const selectors=[
    '#levelup .fuseList','#levelup .choices','#levelup .panel',
    '#inventory .panel','#inventory .evoGuide','#artifactDetail','#bagGrid',
    '#artifactChoice .panel','#evoGuideList','#skillPanelBody',
    '#equipmentPanel #equipGrid','#equipmentPanel #equipSlots',
    '#equipDetailBody','.equipDetailBody','.statModalBody',
    '#riftEditorBody','#riftEditorModal .riftEditorModalPanel',
    '#leaderboard #boardList','#boardList','.progressTreeWrap',
    '.altarList','.seasonRules','#classSelect .panel','#settings .panel'
  ];
  const horizontalSelectors=['.mapTrack'];
  let drag=null;
  let suppressClickUntil=0;
  let suppressRoot=null;
  function visible(el){
    return !!(el&&el.offsetParent!==null&&!el.closest('.hidden'));
  }
  function delta(e){
    const unit=e.deltaMode===1?18:e.deltaMode===2?window.innerHeight:1;
    return {x:e.deltaX*unit,y:e.deltaY*unit};
  }
  function canY(el,dy){
    if(!el||!visible(el))return false;
    if(el.scrollHeight<=el.clientHeight+1)return false;
    if(dy>0)return el.scrollTop+el.clientHeight<el.scrollHeight-1;
    if(dy<0)return el.scrollTop>1;
    return false;
  }
  function canX(el,dx){
    if(!el||!visible(el))return false;
    if(el.scrollWidth<=el.clientWidth+1)return false;
    if(dx>0)return el.scrollLeft+el.clientWidth<el.scrollWidth-1;
    if(dx<0)return el.scrollLeft>1;
    return false;
  }
  function firstScrollable(target,dy){
    for(const sel of selectors){
      const el=target.closest(sel);
      if(canY(el,dy))return el;
    }
    for(const sel of selectors){
      const root=document.querySelector(sel);
      if(root&&root.contains(target)&&root.scrollHeight>root.clientHeight+1)return root;
    }
    return null;
  }
  function firstScrollableAny(target){
    for(const sel of selectors){
      const el=target.closest(sel);
      if(el&&visible(el)&&el.scrollHeight>el.clientHeight+1)return el;
    }
    for(const sel of selectors){
      const root=document.querySelector(sel);
      if(root&&root.contains(target)&&visible(root)&&root.scrollHeight>root.clientHeight+1)return root;
    }
    return null;
  }
  function textControl(el){
    return !!el.closest('input,textarea,select,[contenteditable="true"]');
  }
  function firstHorizontal(target,dx){
    for(const sel of horizontalSelectors){
      const el=target.closest(sel);
      if(canX(el,dx))return el;
    }
    return null;
  }
  document.addEventListener('wheel',function(e){
    const target=e.target;
    if(!(target instanceof Element))return;
    const d=delta(e);
    const h=Math.abs(d.x)>Math.abs(d.y)?firstHorizontal(target,d.x):null;
    if(h){
      h.scrollLeft+=d.x;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const el=firstScrollable(target,d.y);
    if(!el)return;
    el.scrollTop+=d.y;
    e.preventDefault();
    e.stopPropagation();
  },{capture:true,passive:false});
  document.addEventListener('pointerdown',function(e){
    const target=e.target;
    if(!(target instanceof Element)||e.button>0||textControl(target))return;
    const el=firstScrollableAny(target);
    if(!el)return;
    drag={el,startY:e.clientY,startX:e.clientX,top:el.scrollTop,moved:false,id:e.pointerId};
  },{capture:true});
  document.addEventListener('pointermove',function(e){
    if(!drag||drag.id!==e.pointerId)return;
    const dy=e.clientY-drag.startY;
    const dx=e.clientX-drag.startX;
    if(!drag.moved&&Math.abs(dy)<6)return;
    if(Math.abs(dx)>Math.abs(dy)*1.35)return;
    drag.moved=true;
    drag.el.scrollTop=drag.top-dy;
    e.preventDefault();
    e.stopPropagation();
  },{capture:true,passive:false});
  function endDrag(){
    if(drag&&drag.moved){
      suppressClickUntil=Date.now()+220;
      suppressRoot=drag.el;
    }
    drag=null;
  }
  document.addEventListener('pointerup',endDrag,{capture:true});
  document.addEventListener('pointercancel',endDrag,{capture:true});
  document.addEventListener('click',function(e){
    const target=e.target;
    if(!(target instanceof Element)||Date.now()>suppressClickUntil)return;
    if(suppressRoot&&suppressRoot.contains(target)){
      e.preventDefault();
      e.stopPropagation();
    }
  },{capture:true});
})();

window.GameModules = window.GameModules || {};
window.GameModules.startTipTypewriter = (() => {
  const TIP = '温馨提示：请多使用主动存档槽保存进度；发现 Bug 或有建议请及时私聊作者反馈；喜欢本游戏的话，欢迎点赞收藏支持更新。';
  const LINKS = {
    chat: 'https://www.dzmm.ai/chat?c=0b218611-cd50-4867-8b83-ca463e93eedc',
    user: 'https://www.dzmm.ai/user/03b30ae3-a2da-440b-9333-58dd490507ea',
    game: 'https://www.dzmm.ai/character/3057312?rf=c7dde8a6'
  };
  let typing = false, runId = 0, lastVisible = false;

  function ensureStyle() {
    if (document.getElementById('startTipTypewriterStyle')) return;
    const style = document.createElement('style');
    style.id = 'startTipTypewriterStyle';
    style.textContent = `.startTypeTip{min-height:42px;margin:0 0 10px;padding:8px 12px;border:1px solid rgba(250,204,21,.34);border-radius:12px;background:rgba(5,8,18,.36);color:#ffe9a8;font-size:13px;line-height:1.45;text-shadow:0 2px 4px #000,0 0 10px rgba(250,204,21,.28);letter-spacing:.03em}.startTypeTip:after{content:'|';display:inline-block;margin-left:2px;color:#facc15;animation:startTipCaret .75s step-end infinite}.supportBtn{margin:-2px auto 10px;min-width:142px!important;padding:7px 14px!important;border-radius:12px!important}.supportPanel{width:min(90vw,520px)!important}.supportActions{display:grid;grid-template-columns:1fr;gap:10px}.supportActions a{display:block;padding:11px 14px;border:1px solid rgba(250,204,21,.45);border-radius:12px;background:rgba(15,23,42,.72);color:#fde68a;text-decoration:none;font-weight:800}.supportActions small{display:block;margin-top:4px;color:#d8c7a1;font-weight:400}@keyframes startTipCaret{50%{opacity:0}}@media (orientation:portrait){.startTypeTip{font-size:12px;min-height:54px;padding:7px 10px}}`;
    document.head.appendChild(style);
  }
  function copyUrl(url) { try { navigator.clipboard?.writeText?.(url); } catch (_) {} }
  function ensureSupportModal() {
    if (document.getElementById('supportModal')) return;
    const modal = document.createElement('section');
    modal.id = 'supportModal';
    modal.className = 'overlay hidden';
    modal.innerHTML = `<div class="panel supportPanel"><h1 class="title">反馈与支持</h1><p class="sub">遇到 Bug、存档异常、卡顿或有玩法建议，欢迎私聊作者。喜欢的话也请点赞收藏支持更新。</p><div class="supportActions"><a data-support-link="chat" href="${LINKS.chat}" target="_blank" rel="noopener noreferrer">私聊作者<small>反馈问题时建议带上设备、职业、层数和截图描述。</small></a><a data-support-link="user" href="${LINKS.user}" target="_blank" rel="noopener noreferrer">查看作者主页<small>关注作者，方便后续反馈和查看新内容。</small></a><a data-support-link="game" href="${LINKS.game}" target="_blank" rel="noopener noreferrer">前往游戏主页<small>可以点赞、收藏、评论，支持持续更新。</small></a></div><p class="sub"><button id="supportClose" class="ghostBtn" type="button">关闭</button></p></div>`;
    document.querySelector('.game')?.appendChild(modal);
    document.getElementById('supportClose').onclick = closeSupport;
    modal.addEventListener('click', e => {
      const a = e.target.closest('[data-support-link]');
      if (a) copyUrl(LINKS[a.dataset.supportLink]);
    });
  }
  function closeSupport() { document.getElementById('supportModal')?.classList.add('hidden'); }
  function openSupport() { ensureSupportModal(); document.getElementById('supportModal')?.classList.remove('hidden'); }
  function ensureStartUi() {
    ensureStyle();
    ensureSupportModal();
    const menu = document.querySelector('#start .coverMenu');
    if (!menu) return null;
    let tip = document.getElementById('startTypeTip');
    if (!tip) {
      tip = document.createElement('p');
      tip.id = 'startTypeTip';
      tip.className = 'startTypeTip';
      menu.insertBefore(tip, menu.firstChild);
    }
    if (!document.getElementById('supportBtn')) {
      const btn = document.createElement('button');
      btn.id = 'supportBtn';
      btn.type = 'button';
      btn.className = 'ghostBtn supportBtn';
      btn.textContent = '反馈作者 / 点赞收藏';
      btn.onclick = openSupport;
      tip.after(btn);
    }
    return tip;
  }
  function startVisible() {
    const el = document.getElementById('start');
    return !!(el && !el.classList.contains('hidden'));
  }
  async function play() {
    const el = ensureStartUi();
    if (!el || typing) return;
    typing = true;
    const id = ++runId;
    el.textContent = '';
    for (let i = 0; i < TIP.length; i++) {
      if (id !== runId || !startVisible()) break;
      el.textContent += TIP[i];
      await new Promise(r => setTimeout(r, /[；。]/.test(TIP[i]) ? 180 : 34));
    }
    typing = false;
  }
  function check() {
    const visible = startVisible();
    if (visible && !lastVisible) play();
    if (!visible) runId++;
    lastVisible = visible;
  }
  function bind() {
    ensureStartUi();
    check();
    const start = document.getElementById('start');
    if (start && !start.__tipObserver) {
      new MutationObserver(check).observe(start, { attributes: true, attributeFilter: ['class'] });
      start.__tipObserver = true;
    }
    document.addEventListener('click', () => setTimeout(check, 40));
  }
  return { bind, play, openSupport };
})();
window.addEventListener('load', () => window.GameModules.startTipTypewriter?.bind?.());
setTimeout(() => window.GameModules.startTipTypewriter?.bind?.(), 0);

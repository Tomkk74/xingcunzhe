(function () {
  'use strict';

  const PALADIN_SHEET = './assets/generated/paladin/paladin-walk-8x5.1ee5e369.png?v=20260715-paladin-walk-r1';

  function directionVector(actor) {
    let vx = Number(actor?.vx) || 0;
    let vy = Number(actor?.vy) || 0;
    if (actor?.moving && Math.hypot(vx, vy) < 0.05) {
      const target = actor.target && !actor.target.dead ? actor.target : actor.path;
      if (target) {
        vx = target.x - actor.x;
        vy = target.y - actor.y;
      }
    }
    if (Math.hypot(vx, vy) < 0.05) {
      vx = Number(actor?.faceX) || 0;
      vy = Number(actor?.faceY);
      if (!Number.isFinite(vy)) vy = 1;
    }
    return { vx, vy };
  }

  function pose(actor, legacy = {}) {
    const base = {
      cols: 6,
      rows: 4,
      row: legacy.row || 0,
      frame: legacy.frame || 0,
      flip: legacy.flip || 1,
    };
    if (actor?.cls !== 'paladin') return base;

    const { vx, vy } = directionVector(actor);
    const ax = Math.abs(vx);
    const ay = Math.abs(vy);
    let row;
    if (ay > ax * 1.8) row = vy < 0 ? 4 : 0;
    else if (ax > ay * 1.8) row = 2;
    else row = vy < 0 ? 3 : 1;

    return {
      cols: 8,
      rows: 5,
      row,
      frame: actor.moving ? Math.floor((actor.anim || 0) * 1.15) % 8 : 0,
      flip: vx > 0 ? -1 : 1,
    };
  }

  function actorAt(x, y) {
    const actors = [window.S?.player].concat(window.S?.aiBots || []).filter(Boolean);
    return actors.find((actor) => Math.abs(actor.x - x) < 4 && Math.abs(actor.y - y) < 6) || null;
  }

  window.PlayerSprites = { paladinSheet: PALADIN_SHEET, pose };
  if (window.AS) window.AS.paladin = PALADIN_SHEET;

  window.drawAction = function (img, x, y, size, row, frame, alpha = 1, scaleX = 1) {
    if (!img?.complete) return window.drawSheet?.(img, x, y, size, 0, 0, scaleX, 1, alpha);
    const layout = pose(actorAt(x, y), { row, frame, flip: scaleX });
    const frameWidth = img.width / layout.cols;
    const frameHeight = img.height / layout.rows;
    const width = size;
    const height = size * frameHeight / frameWidth;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(layout.flip, 1);
    ctx.drawImage(
      img,
      (layout.frame % layout.cols) * frameWidth,
      layout.row * frameHeight,
      frameWidth,
      frameHeight,
      -width / 2,
      -height / 2,
      width,
      height
    );
    ctx.restore();
  };
})();

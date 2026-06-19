const KEY = 'leaderboard_rift_v1';

export default async function (request: any, ctx: any) {
  const body = request.body ?? {};
  if (body.method === 'submit') return await submitScore(ctx, body.args ?? {});
  if (body.method === 'list') return await listScores(ctx);
  throw new Error('unknown leaderboard method');
}

async function listScores(ctx: any) {
  const board = readBoard((await ctx.kv.global.get(KEY))?.value);
  sortBoard(board);
  return { board: publicRows(board.slice(0, 10)) };
}

async function submitScore(ctx: any, args: any) {
  const row = buildRow(ctx, args);
  if (!row) return await listScores(ctx);
  validateRow(row);
  const board = readBoard((await ctx.kv.global.get(KEY))?.value);
  const old = row.userKey ? board.find((r) => r.userKey === row.userKey) : null;
  const next = old && compareRows(old, row) <= 0 ? old : row;
  const filtered = row.userKey ? board.filter((r) => r.userKey !== row.userKey) : board;
  filtered.push(next);
  sortBoard(filtered);
  const top = filtered.slice(0, 10);
  await ctx.kv.global.put(KEY, top);
  return { board: publicRows(top), rank: top.findIndex((r) => r.at === next.at && r.name === next.name) + 1 };
}

function buildRow(ctx: any, args: any) {
  const win = args.win === true;
  const riftLayer = Math.max(0, Math.floor(Number(args.riftLayer) || 0));
  if (!win || riftLayer < 1) return null;
  const riftTime = Math.max(0, Math.floor(Number(args.riftTime) || Number(args.time) || 0));
  const level = Math.max(1, Math.floor(Number(args.level) || 1));
  const kills = Math.max(0, Math.floor(Number(args.kills) || 0));
  const clientName = pickName(args.playerName, args.userName, args.displayName, args.nickname, args.username, args.name);
  const serverName = pickName(ctx.user?.name, ctx.user?.displayName, ctx.user?.nickname, ctx.user?.username);
  const userKey = ctx.user?.id ? String(ctx.user.id) : '';
  const idFallback = userKey ? `勇士${userKey.slice(-4)}` : '';
  return {
    userKey,
    name: pickName(serverName, clientName, idFallback, '匿名勇士'),
    job: cleanText(args.job, 12),
    classId: cleanText(args.classId, 24),
    mapId: 'rift',
    riftLayer,
    riftTime,
    level,
    kills,
    buildName: cleanText(args.buildName, 24),
    skills: cleanList(args.skills, 12, 28),
    evolutions: cleanList(args.evolutions, 8, 28),
    combos: cleanList(args.combos, 8, 48),
    equipment: cleanEquipment(args.equipment),
    win: true,
    at: new Date().toISOString(),
  };
}

function validateRow(r: any) {
  if (r.riftLayer < 1 || r.riftLayer > 300) throw new Error('invalid rift layer');
  if (!Number.isFinite(r.riftTime) || r.riftTime < 20 || r.riftTime > 86400) throw new Error('invalid rift time');
  if (r.level < 1 || r.level > 300) throw new Error('invalid level');
  if (r.kills < 0 || r.kills > 500000) throw new Error('invalid kill count');
}

function readBoard(raw: any) {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (_) { data = []; }
  }
  if (!Array.isArray(data)) return [];
  return data.map(cleanRow).filter((r) => r.win && r.riftLayer >= 1);
}

function publicRows(board: any[]) {
  return board.map(({ userKey, ...row }) => row);
}

function pickName(...values: any[]) {
  for (const v of values) {
    const s = String(v ?? '').trim();
    if (s && s !== 'null' && s !== 'undefined' && !/^匿名/.test(s)) return s.slice(0, 16);
  }
  return '';
}

function cleanText(v: any, len: number) {
  return String(v ?? '').trim().slice(0, len);
}

function cleanList(v: any, max: number, len: number) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => cleanText(x, len)).filter(Boolean).slice(0, max);
}

function cleanEquipment(v: any) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 8).map((x) => ({
    slot: cleanText(x?.slot, 12),
    name: cleanText(x?.name, 32),
    rarity: cleanText(x?.rarity, 12),
    power: Math.max(0, Math.floor(Number(x?.power) || 0)),
    text: cleanList(x?.text, 5, 54),
  })).filter((x) => x.name);
}

function sortBoard(board: any[]) {
  board.sort(compareRows);
}

function compareRows(a: any, b: any) {
  return b.riftLayer - a.riftLayer || a.riftTime - b.riftTime || b.level - a.level || b.kills - a.kills;
}

function cleanRow(r: any) {
  return {
    userKey: String(r?.userKey || r?.userId || ''),
    name: pickName(r?.name, r?.playerName, r?.userName, r?.displayName, r?.nickname, r?.username, '匿名勇士'),
    job: cleanText(r?.job, 12),
    classId: cleanText(r?.classId, 24),
    mapId: 'rift',
    riftLayer: Math.max(0, Math.floor(Number(r?.riftLayer) || 0)),
    riftTime: Math.max(0, Math.floor(Number(r?.riftTime) || 0)),
    level: Math.max(1, Math.floor(Number(r?.level) || 1)),
    kills: Math.max(0, Math.floor(Number(r?.kills) || 0)),
    buildName: cleanText(r?.buildName, 24),
    skills: cleanList(r?.skills, 12, 28),
    evolutions: cleanList(r?.evolutions, 8, 28),
    combos: cleanList(r?.combos, 8, 48),
    equipment: cleanEquipment(r?.equipment),
    win: r?.win === true,
    at: cleanText(r?.at, 40),
  };
}

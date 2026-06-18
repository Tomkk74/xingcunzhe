export default async function (request: any, ctx: any) {
  const body = request.body ?? {};
  if (body.method === 'submit') return await submitScore(ctx, body.args ?? {});
  if (body.method === 'list') return await listScores(ctx);
  throw new Error('unknown leaderboard method');
}

async function listScores(ctx: any) {
  const board = readBoard((await ctx.kv.global.get('leaderboard'))?.value);
  sortBoard(board);
  return { board: publicRows(board.slice(0, 10)) };
}

async function submitScore(ctx: any, args: any) {
  const row = buildRow(ctx, args);
  if (!row) return await listScores(ctx);
  validateRow(row);
  const board = readBoard((await ctx.kv.global.get('leaderboard'))?.value);
  const uid = row.userKey;
  const filtered = uid ? board.filter((r) => r.userKey !== uid) : board;
  filtered.push(row);
  sortBoard(filtered);
  const top = filtered.slice(0, 10);
  await ctx.kv.global.put('leaderboard', top);
  return { board: publicRows(top), rank: top.findIndex((r) => r.at === row.at && r.name === row.name) + 1 };
}

function buildRow(ctx: any, args: any) {
  const time = Math.floor(Number(args.time));
  const bossKills = Math.floor(Number(args.bossKills) || 0);
  const win = args.win === true;
  if (!win || bossKills < 10) return null;
  const endlessLayer = Math.max(0, Math.floor(Number(args.endlessLayer) || 0));
  const endlessTime = Math.max(0, Math.floor(Number(args.endlessTime) || 0));
  const level = Math.max(1, Math.floor(Number(args.level) || 1));
  const kills = Math.max(0, Math.floor(Number(args.kills) || 0));
  const clientName = pickName(args.playerName, args.userName, args.displayName, args.nickname, args.username, args.name);
  const serverName = pickName(ctx.user?.name, ctx.user?.displayName, ctx.user?.nickname, ctx.user?.username);
  const userKey = ctx.user?.id ? String(ctx.user.id) : '';
  const idFallback = userKey ? `勇士${userKey.slice(-4)}` : '';
  return {
    userKey,
    name: pickName(serverName, clientName, idFallback, '匿名勇士'),
    job: String(args.job ?? '').slice(0, 12),
    mapId: String(args.mapId ?? 'chaos').slice(0, 16),
    time,
    endlessLayer,
    endlessTime,
    level,
    kills,
    bossKills,
    win: true,
    at: new Date().toISOString(),
  };
}

function validateRow(r: any) {
  if (!Number.isFinite(r.time) || r.time < 30 || r.time > 86400) throw new Error('invalid clear time');
  if (r.endlessLayer < 0 || r.endlessLayer > 300 || r.endlessTime > 86400) throw new Error('invalid endless result');
  if (r.level < 1 || r.level > 300) throw new Error('invalid level');
  if (r.kills < 0 || r.kills > 500000 || r.bossKills < 10 || r.bossKills > 1000) throw new Error('invalid kill count');
  const maxLayerByBoss = Math.max(0, r.bossKills - 10);
  if (r.endlessLayer > maxLayerByBoss + 1) throw new Error('invalid endless layer');
  if (r.endlessLayer > 0 && r.endlessTime < r.endlessLayer * 20) throw new Error('invalid endless time');
}

function readBoard(raw: any) {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (_) { data = []; }
  }
  if (!Array.isArray(data)) return [];
  return data.map(cleanRow).filter((r) => r.win && r.bossKills >= 10);
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

function sortBoard(board: any[]) {
  board.sort((a, b) => b.endlessLayer - a.endlessLayer || b.endlessTime - a.endlessTime || a.time - b.time || b.bossKills - a.bossKills || b.level - a.level || b.kills - a.kills);
}

function cleanRow(r: any) {
  const bossKills = Math.max(0, Math.floor(Number(r?.bossKills) || 0));
  return {
    userKey: String(r?.userKey || r?.userId || ''),
    name: pickName(r?.name, r?.playerName, r?.userName, r?.displayName, r?.nickname, r?.username, '匿名勇士'),
    job: String(r?.job || '').slice(0, 12),
    mapId: String(r?.mapId || 'chaos').slice(0, 16),
    time: Math.max(0, Math.floor(Number(r?.time) || 0)),
    endlessLayer: Math.max(0, Math.floor(Number(r?.endlessLayer) || Math.max(0, bossKills - 10))),
    endlessTime: Math.max(0, Math.floor(Number(r?.endlessTime) || 0)),
    level: Math.max(1, Math.floor(Number(r?.level) || 1)),
    kills: Math.max(0, Math.floor(Number(r?.kills) || 0)),
    bossKills,
    win: r?.win === true || bossKills >= 10,
    at: String(r?.at || ''),
  };
}

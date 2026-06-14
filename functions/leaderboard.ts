export default async function (request: any, ctx: any) {
  const body = request.body ?? {};
  if (body.method === 'submit') return await submitScore(ctx, body.args ?? {});
  if (body.method === 'list') return await listScores(ctx);
  throw new Error('unknown leaderboard method');
}

async function listScores(ctx: any) {
  const raw = (await ctx.kv.global.get('leaderboard'))?.value;
  const board = Array.isArray(raw) ? raw.map(cleanRow).filter((r) => r.win && r.bossKills >= 10) : [];
  board.sort((a, b) => a.time - b.time || b.bossKills - a.bossKills || b.level - a.level || b.kills - a.kills);
  return { board: board.slice(0, 10) };
}

async function submitScore(ctx: any, args: any) {
  const time = Number(args.time);
  const job = String(args.job ?? '').slice(0, 12);
  const mapId = String(args.mapId ?? 'chaos').slice(0, 16);
  const level = Math.floor(Number(args.level) || 1);
  const kills = Math.floor(Number(args.kills) || 0);
  const bossKills = Math.floor(Number(args.bossKills) || 0);
  const win = args.win === true;
  if (!win || bossKills < 10) return await listScores(ctx);
  if (!Number.isFinite(time) || time < 30 || time > 86400) throw new Error('invalid clear time');
  const clientName = pickName(args.playerName, args.userName, args.displayName, args.nickname, args.username, args.name);
  const serverName = pickName(ctx.user?.name, ctx.user?.displayName, ctx.user?.nickname, ctx.user?.username);
  const idFallback = ctx.user?.id ? `勇士${String(ctx.user.id).slice(-4)}` : '';
  const name = pickName(serverName, clientName, idFallback, '匿名勇士');
  const row = { name, job, mapId, time: Math.floor(time), level, kills, bossKills, win: true, at: new Date().toISOString() };
  const raw = (await ctx.kv.global.get('leaderboard'))?.value;
  const board = Array.isArray(raw) ? raw.map(cleanRow).filter((r) => r.win && r.bossKills >= 10) : [];
  board.push(row);
  board.sort((a, b) => a.time - b.time || b.bossKills - a.bossKills || b.level - a.level || b.kills - a.kills);
  const top = board.slice(0, 10);
  await ctx.kv.global.put('leaderboard', top);
  return { board: top, rank: top.findIndex((r) => r.at === row.at && r.name === row.name) + 1 };
}

function pickName(...values: any[]) {
  for (const v of values) {
    const s = String(v ?? '').trim();
    if (s && s !== 'null' && s !== 'undefined' && !/^匿名/.test(s)) return s.slice(0, 16);
  }
  return '';
}

function cleanRow(r: any) {
  return {
    name: pickName(r?.name, r?.playerName, r?.userName, r?.displayName, r?.nickname, r?.username, '匿名勇士'),
    job: String(r?.job || '').slice(0, 12),
    mapId: String(r?.mapId || 'chaos').slice(0, 16),
    time: Math.max(0, Math.floor(Number(r?.time) || 0)),
    level: Math.max(1, Math.floor(Number(r?.level) || 1)),
    kills: Math.max(0, Math.floor(Number(r?.kills) || 0)),
    bossKills: Math.max(0, Math.floor(Number(r?.bossKills) || 0)),
    win: r?.win === true || Math.floor(Number(r?.bossKills) || 0) >= 10,
    at: String(r?.at || ''),
  };
}

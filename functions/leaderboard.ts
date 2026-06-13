export default async function (request: any, ctx: any) {
  const body = request.body ?? {};
  if (body.method === 'submit') return await submitScore(ctx, body.args ?? {});
  if (body.method === 'list') return await listScores(ctx);
  throw new Error('unknown leaderboard method');
}

async function listScores(ctx: any) {
  const raw = (await ctx.kv.global.get('leaderboard'))?.value;
  const board = Array.isArray(raw) ? raw : [];
  return { board: board.slice(0, 10).map(cleanRow) };
}

async function submitScore(ctx: any, args: any) {
  const time = Number(args.time);
  const job = String(args.job ?? '').slice(0, 12);
  const level = Math.floor(Number(args.level) || 1);
  const kills = Math.floor(Number(args.kills) || 0);
  if (!Number.isFinite(time) || time < 5 || time > 86400) throw new Error('invalid survival time');
  const name = String(ctx.user?.name || '匿名勇士').slice(0, 16);
  const row = { name, job, time: Math.floor(time), level, kills, at: new Date().toISOString() };
  const raw = (await ctx.kv.global.get('leaderboard'))?.value;
  const board = Array.isArray(raw) ? raw.map(cleanRow) : [];
  board.push(row);
  board.sort((a, b) => b.time - a.time || b.level - a.level || b.kills - a.kills);
  const top = board.slice(0, 10);
  await ctx.kv.global.put('leaderboard', top);
  return { board: top, rank: top.findIndex((r) => r.at === row.at && r.name === row.name) + 1 };
}

function cleanRow(r: any) {
  return {
    name: String(r?.name || '匿名勇士').slice(0, 16),
    job: String(r?.job || '').slice(0, 12),
    time: Math.max(0, Math.floor(Number(r?.time) || 0)),
    level: Math.max(1, Math.floor(Number(r?.level) || 1)),
    kills: Math.max(0, Math.floor(Number(r?.kills) || 0)),
    at: String(r?.at || ''),
  };
}

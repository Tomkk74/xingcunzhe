const CODES: any = {
  'Tomkk白衣胜雪': { id: 'tomkk-baiyi-20260615', gold: 6666, core: 100, message: '兑换成功：灵魂金币 +6666，魔核 +100' },
  'Tomkk666': { id: 'tomkk-rift-tickets-20260616', riftKeys: 50, message: '兑换成功：大秘境门票 +50' },
  '琦琦专属礼包': { id: 'scythe-gift-20260617', scytheGift: true, userId: '4701f6f4-6d69-4cd8-8dbe-0f20f2668162', message: '兑换成功：琦琦冥月套装 4 件、魔核 +400、金币 +20000、门票 +40、赛季等级直升 20' },
  '魔核特供': { id: 'core-grant-20260617', core: 400, userId: '835bd1b2-f27a-4490-aa59-f3d1dbde0d16', message: '兑换成功：魔核 +400' },
};

export default async function (request: any, ctx: any) {
  const code = String(request.body?.code ?? '').trim().slice(0, 40);
  const reward = CODES[code];
  if (!reward) throw new Error('兑换码无效');
  const userId = String(ctx.user?.id || '');
  if (reward.userId && reward.userId !== userId) throw new Error('该兑换码仅限指定用户领取');
  const key = `redeem:${userId || 'guest'}`;
  const used = normalizeUsed((await ctx.kv.get(key))?.value);
  if (used[reward.id]) return { applied: false, message: '该兑换码已使用过' };
  used[reward.id] = new Date().toISOString();
  await ctx.kv.put(key, used);
  return { applied: true, reward: publicReward(reward), message: reward.message };
}

function normalizeUsed(raw: any) {
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch (_) { raw = {}; }
  }
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
}

function publicReward(r: any) {
  return {
    id: r.id,
    gold: Math.max(0, Math.floor(Number(r.gold) || 0)),
    core: Math.max(0, Math.floor(Number(r.core) || 0)),
    riftKeys: Math.max(0, Math.floor(Number(r.riftKeys) || 0)),
    scytheGift: r.scytheGift === true,
  };
}

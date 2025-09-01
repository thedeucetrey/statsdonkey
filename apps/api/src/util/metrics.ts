export type Tally = { [k: string]: number };

export function mergeTallies(a: Tally, b: Tally): Tally {
  const out: Tally = { **a };
  for (const k of Object.keys(b)) out[k] = (out[k] || 0) + b[k];
  return out;
}

export function statLine_fromPAs(pas: Array<any>) {
  const t = { g:0, pa:0, ab:0, h:0, _1b:0, _2b:0, _3b:0, hr:0, bb:0, k:0, rbi:0, r:0, sb:0, sac:0, roe:0 };
  const add = (k: string, n=1) => t[k] = (t[k] + n);
  const hit = (kind: "1B"|"2B"|"3B"|"HR") => {
    add("h"); if (kind==="1B") add("_1b"); if (kind==="2B") add("_2b"); if (kind==="3B") add("_3b"); if (kind==="HR") add("hr");
  };

  t.g = new Set(pas.map(p => p.gameId?.toString())).size;
  for (const p of pas) {
    add("pa");
    if (["BB","SAC"].includes(p.result)) {
      if (p.result==="BB") add("bb"); if (p.result==="SAC") add("sac");
      continue;
    }
    add("ab");
    if (p.result in {"1B":1,"2B":1,"3B":1,"HR":1}) hit(p.result);
    else if (p.result==="K") add("k");
    else if (p.result==="ROE") add("roe");
  }

  const avg = t.ab ? (t.h / t.ab) : 0;
  const obp = (t.ab + t.bb + t.sac) ? ((t.h + t.bb) / (t.ab + t.bb + t.sac)) : 0;
  const slg = t.ab ? ((t._1b + 2*t._2b + 3*t._3b + 4*t.hr) / t.ab) : 0;
  const ops = obp + slg;
  return { ...t, avg, obp, slg, ops };
}

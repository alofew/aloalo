// 체스 규칙 + AI 엔진 (보드: 64칸 배열, 0=a8 ... 63=h1, 대문자=백, 소문자=흑)
const Chess = (() => {
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const isWhite = (p) => p !== "." && p === p.toUpperCase();
  const KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const KG = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const ROOK = [[-1,0],[1,0],[0,-1],[0,1]];
  const BISH = [[-1,-1],[-1,1],[1,-1],[1,1]];

  function initialState() {
    const b = [];
    for (const ch of START) {
      if (ch === "/") continue;
      if (ch >= "1" && ch <= "8") for (let i = 0; i < +ch; i++) b.push(".");
      else b.push(ch);
    }
    return { b, turn: "w", castle: "KQkq", ep: -1, half: 0 };
  }

  function isAttacked(b, sq, byWhite) {
    const r = sq >> 3, c = sq & 7;
    const pr = byWhite ? r + 1 : r - 1;
    const pawn = byWhite ? "P" : "p";
    if (pr >= 0 && pr < 8) for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (cc >= 0 && cc < 8 && b[pr * 8 + cc] === pawn) return true;
    }
    const kn = byWhite ? "N" : "n", kg = byWhite ? "K" : "k";
    for (const [dr, dc] of KN) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === kn) return true;
    }
    for (const [dr, dc] of KG) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === kg) return true;
    }
    const q = byWhite ? "Q" : "q", rk = byWhite ? "R" : "r", bs = byWhite ? "B" : "b";
    for (const [dirs, one] of [[ROOK, rk], [BISH, bs]]) {
      for (const [dr, dc] of dirs) {
        let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
          const p = b[rr * 8 + cc];
          if (p !== ".") { if (p === q || p === one) return true; break; }
          rr += dr; cc += dc;
        }
      }
    }
    return false;
  }

  function kingSq(b, white) {
    return b.indexOf(white ? "K" : "k");
  }

  function inCheck(s, white = s.turn === "w") {
    return isAttacked(s.b, kingSq(s.b, white), !white);
  }

  function pseudoMoves(s) {
    const { b, turn, castle, ep } = s;
    const white = turn === "w";
    const out = [];
    const add = (from, to, extra) => out.push({ from, to, ...extra });
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (p === "." || isWhite(p) !== white) continue;
      const r = sq >> 3, c = sq & 7;
      const t = p.toLowerCase();
      if (t === "p") {
        const dir = white ? -1 : 1, startR = white ? 6 : 1, lastR = white ? 0 : 7;
        const r1 = r + dir;
        const push = (to, extra) => {
          if ((to >> 3) === lastR) for (const pr of ["q", "r", "b", "n"]) add(sq, to, { ...extra, promo: pr });
          else add(sq, to, extra);
        };
        if (r1 >= 0 && r1 < 8 && b[r1 * 8 + c] === ".") {
          push(r1 * 8 + c);
          if (r === startR && b[(r + 2 * dir) * 8 + c] === ".") add(sq, (r + 2 * dir) * 8 + c, { double: true });
        }
        for (const dc of [-1, 1]) {
          const cc = c + dc;
          if (cc < 0 || cc > 7 || r1 < 0 || r1 > 7) continue;
          const to = r1 * 8 + cc, tp = b[to];
          if (tp !== "." && isWhite(tp) !== white) push(to, { capture: true });
          else if (to === ep) add(sq, to, { capture: true, enPassant: true });
        }
      } else if (t === "n" || t === "k") {
        for (const [dr, dc] of t === "n" ? KN : KG) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
          const to = rr * 8 + cc, tp = b[to];
          if (tp === ".") add(sq, to);
          else if (isWhite(tp) !== white) add(sq, to, { capture: true });
        }
        if (t === "k") {
          const row = white ? 7 : 0, ks = white ? "K" : "k", qs = white ? "Q" : "q";
          if (sq === row * 8 + 4 && !isAttacked(b, sq, !white)) {
            const rk = white ? "R" : "r";
            if (castle.includes(ks) && b[row * 8 + 5] === "." && b[row * 8 + 6] === "." && b[row * 8 + 7] === rk &&
                !isAttacked(b, row * 8 + 5, !white) && !isAttacked(b, row * 8 + 6, !white))
              add(sq, row * 8 + 6, { castle: "k" });
            if (castle.includes(qs) && b[row * 8 + 3] === "." && b[row * 8 + 2] === "." && b[row * 8 + 1] === "." && b[row * 8] === rk &&
                !isAttacked(b, row * 8 + 3, !white) && !isAttacked(b, row * 8 + 2, !white))
              add(sq, row * 8 + 2, { castle: "q" });
          }
        }
      } else {
        const dirs = t === "r" ? ROOK : t === "b" ? BISH : ROOK.concat(BISH);
        for (const [dr, dc] of dirs) {
          let rr = r + dr, cc = c + dc;
          while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
            const to = rr * 8 + cc, tp = b[to];
            if (tp === ".") add(sq, to);
            else { if (isWhite(tp) !== white) add(sq, to, { capture: true }); break; }
            rr += dr; cc += dc;
          }
        }
      }
    }
    return out;
  }

  function applyMove(s, m) {
    const b = s.b.slice();
    const p = b[m.from], white = isWhite(p);
    const captured = m.enPassant ? b[m.to + (white ? 8 : -8)] : b[m.to];
    b[m.to] = m.promo ? (white ? m.promo.toUpperCase() : m.promo) : p;
    b[m.from] = ".";
    if (m.enPassant) b[m.to + (white ? 8 : -8)] = ".";
    if (m.castle === "k") { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = "."; }
    if (m.castle === "q") { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = "."; }
    let castle = s.castle;
    const strip = (sq) => {
      const map = { 60: "KQ", 63: "K", 56: "Q", 4: "kq", 7: "k", 0: "q" };
      if (map[sq]) for (const ch of map[sq]) castle = castle.replace(ch, "");
    };
    strip(m.from); strip(m.to);
    const ep = m.double ? (m.from + m.to) / 2 : -1;
    const half = p.toLowerCase() === "p" || captured !== "." ? 0 : s.half + 1;
    return { b, turn: white ? "b" : "w", castle, ep, half };
  }

  function legalMoves(s) {
    const white = s.turn === "w";
    const res = [];
    for (const m of pseudoMoves(s)) {
      const n = applyMove(s, m);
      if (!isAttacked(n.b, kingSq(n.b, white), !white)) res.push(m);
    }
    return res;
  }

  function insufficient(b) {
    const rest = b.filter((p) => p !== "." && p.toLowerCase() !== "k");
    if (rest.length === 0) return true;
    if (rest.length === 1 && "bn".includes(rest[0].toLowerCase())) return true;
    return false;
  }

  // ---------- AI ----------
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  function evaluate(s) {
    let score = 0;
    for (let sq = 0; sq < 64; sq++) {
      const p = s.b[sq];
      if (p === ".") continue;
      const white = isWhite(p), t = p.toLowerCase();
      const r = sq >> 3, c = sq & 7;
      const rr = white ? 7 - r : r; // 자기 진영 기준 전진 정도
      const center = 3.5 - Math.max(Math.abs(c - 3.5), Math.abs(r - 3.5)) ; // 0.0~3.5 (중앙일수록 큼)
      let v = VAL[t];
      if (t === "p") v += rr * 8 + (c >= 2 && c <= 5 ? rr * 2 : 0);
      else if (t === "n" || t === "b") v += center * 8;
      else if (t === "q") v += center * 2;
      else if (t === "k") v += rr === 0 ? 8 : -rr * 6; // 킹은 뒤에 두기
      else if (t === "r") v += rr === 6 ? 15 : 0;
      score += white ? v : -v;
    }
    return score;
  }

  function orderMoves(s, moves) {
    return moves
      .map((m) => {
        let k = 0;
        if (m.capture) k += 10 * VAL[(m.enPassant ? "p" : s.b[m.to]).toLowerCase()] - VAL[s.b[m.from].toLowerCase()] / 10 + 1000;
        if (m.promo) k += 800;
        return [k, m];
      })
      .sort((a, b) => b[0] - a[0])
      .map((x) => x[1]);
  }

  function search(s, depth, alpha, beta) {
    const moves = legalMoves(s);
    if (moves.length === 0) return inCheck(s) ? (s.turn === "w" ? -100000 - depth : 100000 + depth) : 0;
    if (s.half >= 100) return 0;
    if (depth === 0) return quiesce(s, alpha, beta, 4);
    const maxing = s.turn === "w";
    let best = maxing ? -Infinity : Infinity;
    for (const m of orderMoves(s, moves)) {
      const v = search(applyMove(s, m), depth - 1, alpha, beta);
      if (maxing) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  // 캡처만 계속 따라가서 수평선 효과 줄이기
  function quiesce(s, alpha, beta, left) {
    const stand = evaluate(s);
    if (left === 0) return stand;
    const maxing = s.turn === "w";
    if (maxing) { if (stand >= beta) return stand; if (stand > alpha) alpha = stand; }
    else { if (stand <= alpha) return stand; if (stand < beta) beta = stand; }
    let best = stand;
    for (const m of orderMoves(s, legalMoves(s).filter((m) => m.capture || m.promo))) {
      const v = quiesce(applyMove(s, m), alpha, beta, left - 1);
      if (maxing) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  // level: 1(쉬움, 가끔 실수) / 2(보통) / 3(어려움)
  function bestMove(s, level) {
    const moves = legalMoves(s);
    if (!moves.length) return null;
    const depth = [0, 1, 2, 3][level] || 2;
    const maxing = s.turn === "w";
    const scored = orderMoves(s, moves).map((m) => {
      let v = search(applyMove(s, m), depth - 1, -Infinity, Infinity);
      if (level === 1) v += (Math.random() - 0.5) * 300;
      else v += (Math.random() - 0.5) * 6; // 같은 점수 수 사이에 변화
      return { m, v };
    });
    scored.sort((a, b) => (maxing ? b.v - a.v : a.v - b.v));
    return scored[0].m;
  }

  return { initialState, legalMoves, applyMove, inCheck, insufficient, bestMove, isWhite };
})();

if (typeof module !== "undefined") module.exports = Chess;

// 체스 UI: 클릭으로 기물을 선택하고 이동, AI가 상대
const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAME = { k: "K", q: "Q", r: "R", b: "B", n: "N", p: "" };
const $ = (id) => document.getElementById(id);

let state, history, moveLog, lastMove, sel, myWhite, busy, over, seen;

const sqName = (i) => "abcdefgh"[i & 7] + (8 - (i >> 3));

function key(s) { return s.b.join("") + s.turn + s.castle + s.ep; }

function newGame() {
  myWhite = $("side").value === "w";
  state = Chess.initialState();
  history = []; moveLog = []; lastMove = null; sel = -1; busy = false; over = false;
  seen = { [key(state)]: 1 };
  render();
  if (!myWhite) aiMove();
}

function render() {
  const board = $("board");
  const legal = Chess.legalMoves(state);
  const targets = sel >= 0 ? legal.filter((m) => m.from === sel).map((m) => m.to) : [];
  const chkSq = Chess.inCheck(state) ? state.b.indexOf(state.turn === "w" ? "K" : "k") : -1;
  let html = "";
  for (let v = 0; v < 64; v++) {
    const i = myWhite ? v : 63 - v;
    const r = i >> 3, c = i & 7, p = state.b[i];
    const cls = ["sq", (r + c) % 2 ? "d" : "l"];
    if (lastMove && (i === lastMove.from || i === lastMove.to)) cls.push("last");
    if (i === sel) cls.push("sel");
    if (i === chkSq) cls.push("chk");
    if (targets.includes(i)) cls.push("hint", p !== "." ? "cap" : "x");
    const co = (v % 8 === 0 ? `<span class="co r">${8 - r}</span>` : "") + (v >= 56 ? `<span class="co f">${"abcdefgh"[c]}</span>` : "");
    html += `<div class="${cls.join(" ")}" data-i="${i}">${co}${p === "." ? "" : `<span class="pc ${Chess.isWhite(p) ? "w" : "b"}">${GLYPH[p.toLowerCase()]}︎</span>`}</div>`;
  }
  board.innerHTML = html;
  $("moves").innerHTML = moveLog.map((t) => `<li>${t}</li>`).join("");
  $("moves").scrollTop = 1e6;
  $("status").textContent = statusText(legal);
}

function statusText(legal) {
  if (over) return over;
  const mine = (state.turn === "w") === myWhite;
  const chk = Chess.inCheck(state) ? " — 체크!" : "";
  return (mine ? "당신의 차례" : "Claude가 생각 중…") + chk;
}

function checkEnd() {
  const legal = Chess.legalMoves(state);
  if (!legal.length) {
    over = Chess.inCheck(state)
      ? ((state.turn === "w") === myWhite ? "체크메이트! Claude의 승리 😎" : "체크메이트! 당신의 승리 🎉")
      : "스테일메이트 — 무승부";
  } else if (state.half >= 100) over = "50수 규칙 — 무승부";
  else if (Chess.insufficient(state.b)) over = "기물 부족 — 무승부";
  else if (seen[key(state)] >= 3) over = "3회 동형 반복 — 무승부";
  return !!over;
}

function play(m) {
  history.push({ state, moveLog: moveLog.slice(), lastMove, seen: { ...seen } });
  const p = state.b[m.from];
  let txt = m.castle ? (m.castle === "k" ? "O-O" : "O-O-O")
    : `${NAME[p.toLowerCase()]}${m.capture ? (p.toLowerCase() === "p" ? sqName(m.from)[0] : "") + "x" : ""}${sqName(m.to)}${m.promo ? "=" + m.promo.toUpperCase() : ""}`;
  state = Chess.applyMove(state, m);
  const k = key(state); seen[k] = (seen[k] || 0) + 1;
  if (Chess.inCheck(state)) txt += Chess.legalMoves(state).length ? "+" : "#";
  moveLog.push(`${state.turn === "b" ? "백" : "흑"} ${txt}`);
  lastMove = m; sel = -1;
  checkEnd();
  render();
}

function aiMove() {
  if (over) return;
  busy = true; render();
  setTimeout(() => {
    const m = Chess.bestMove(state, +$("level").value);
    busy = false;
    if (m) play(m);
  }, 60);
}

function onSquare(i) {
  if (busy || over || (state.turn === "w") !== myWhite) return;
  const legal = Chess.legalMoves(state);
  const cand = legal.filter((m) => m.from === sel && m.to === i);
  if (cand.length) {
    if (cand[0].promo) return askPromo(cand);
    play(cand[0]); aiMove(); return;
  }
  const p = state.b[i];
  sel = p !== "." && Chess.isWhite(p) === myWhite && legal.some((m) => m.from === i) ? i : -1;
  render();
}

function askPromo(cand) {
  const box = $("promoBox");
  box.innerHTML = ["q", "r", "b", "n"].map((t) => `<button data-p="${t}">${GLYPH[t]}︎</button>`).join("");
  $("promo").hidden = false;
  box.onclick = (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    $("promo").hidden = true;
    play(cand.find((m) => m.promo === t.dataset.p)); aiMove();
  };
}

$("board").addEventListener("click", (e) => {
  const s = e.target.closest(".sq");
  if (s) onSquare(+s.dataset.i);
});
$("new").onclick = newGame;
$("side").onchange = newGame;
$("undo").onclick = () => {
  if (busy || !history.length) return;
  // 내 차례가 될 때까지 되돌리기 (AI 수 + 내 수)
  do {
    ({ state, moveLog, lastMove, seen } = history.pop());
  } while (history.length && (state.turn === "w") !== myWhite);
  over = false; sel = -1;
  render();
  if ((state.turn === "w") !== myWhite) aiMove();
};
newGame();

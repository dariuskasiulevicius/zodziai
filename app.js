'use strict';

/* ---------- taisyklės / rules ---------- */
const PASS_THRESHOLDS = [3, 5, 7, 9, 11];   // Streak needed on pass 1..5
const MIN_DAYS        = 2;                  // distinct days within the streak
const STAGE_UNLOCK    = 0.8;                // 80% Ready unlocks next Stage
const LEAD            = /^(the|a|an|to)\s+/i;

const EMOJI = {
  creatures: ('🦊🐉🦖🦁🐯🐼🦄🐙🦉🐢🦋🐝🐬🦈🐨🐸🦜🦩🐧🦥🐘🦒🦓🦔'
             +'🐺🦌🐪🐊🦂🦚🦢🦡🐿️🦦🦭🐳🦕🐍🦎🐌🐞🦗🕷️🦂🐜🪲🦟🦀'
             +'🐡🐠🐟🦐🦑🪼🦞🐚🪸🦤🕊️🦃🦆🦅🪿🐓🐇🐁🐀🦝🦨🦫🐖🐄'
             +'🐎🦙🐐🐑🦛🦏🐆🐅🐒🦧🦍🐈🐕🦮🐩🐿️🦔🦇🐻🐻‍❄️🐨🦘🦦🐾').match(/\P{Mark}\p{Mark}*|./gu),
  space:     ('🚀🛸🌍🌎🌏🌙⭐🌟💫☄️🪐🌞🌠🔭🛰️👽🧑‍🚀🌌🌑🌒🌓🌔🌕🌖'
             +'🌗🌘🪨🧲⚛️🔬🧪🧬💡🔋🛠️⚙️🗜️🧭⏱️📡🎛️🎚️🔌🖲️💾💿📀'
             +'🧯🪫🔦🕹️🎮👾🤖🦾🦿🥽🧑‍🔬🔩⛽🚁✈️🛩️🪂🎆🎇✨🌀🌈☁️⚡'
             +'🔥💥🌊🏔️🗻🌋🏜️🏝️🧊❄️🌪️🌫️🛶⛵🚤🛥️🚢⚓🪝🧿🔮🎯🏆🥇').match(/\P{Mark}\p{Mark}*|./gu)
};

/* ---------- būsena / state ---------- */
let kids = [], kid = null, content = null, list = null, prog = null;
let round = [], pos = 0, answered = false, stats = null;

const $  = id => document.getElementById(id);
const show = name => document.querySelectorAll('.screen')
  .forEach(s => s.classList.toggle('on', s.id === 'screen-' + name));

/* ---------- saugojimas / storage ---------- */
const KEY = k => 'zodziai.v1.' + k;

function loadProgress(kidId) {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(KEY(kidId))); } catch (e) { p = null; }
  if (!p || typeof p !== 'object') p = {};
  p.words    = p.words    || {};
  p.lists    = p.lists    || {};
  p.unlocked = p.unlocked || 0;
  return p;
}
const saveProgress = () => localStorage.setItem(KEY(kid.id), JSON.stringify(prog));

const today = () => new Date().toISOString().slice(0, 10);
const wordKey = e => e.en + '|' + e.lt;
// Skaitymas nieko nekuria; įrašai atsiranda tik tada, kai vaikas iš tikrųjų atsako.
// Reads never create records — only answering does.
const EMPTY = Object.freeze({ s: 0, d: Object.freeze([]), seen: false, r: 0 });
const wordState = e => prog.words[wordKey(e)] || EMPTY;
const touchWord = e => prog.words[wordKey(e)] ||
  (prog.words[wordKey(e)] = { s: 0, d: [], seen: false, r: 0 });

const listState = () =>
  prog.lists[list.id] || (prog.lists[list.id] = { pass: 1, stage: 1, milestone80: 0 });

const threshold = () => PASS_THRESHOLDS[Math.min(listState().pass, PASS_THRESHOLDS.length) - 1];

// Dvi skirtingos sąvokos:
//   atThreshold – pakanka teisingų iš eilės. Valdo DALIŲ atsidarymą (navigacija).
//   isReady     – dar ir kitą dieną. Valdo juostą, ratus ir apdovanojimus (sąžiningumas).
// Be šio skirtumo pirmą dieną neįmanoma pajudėti iš 1 dalies.
function atThreshold(e) { return wordState(e).s >= threshold(); }

function isReady(e) {
  const w = wordState(e);
  return atThreshold(e) && w.d.length >= MIN_DAYS;
}

/* ---------- atsakymo tikrinimas / answer grading ---------- */
const squash = s => s.trim().replace(/\s+/g, ' ');
const strip  = s => squash(s).replace(LEAD, '');

// visi kiti šio sąrašo atsakymai
function otherAnswers(entry) {
  const set = new Set();
  for (const e of list.entries) if (e !== entry) set.add(strip(e.en).toLowerCase());
  return set;
}

function lev(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
  return m[b.length][a.length];
}

// -> { verdict: 'ok' | 'almost' | 'bad', why }
// `others` – kiti sąrašo žodžiai: jei vaikas parašė kitą tikrą žodį, tai klaida, ne apsirikimas.
function grade(raw, entry, others) {
  const given    = strip(raw);
  const expected = strip(entry.en);
  if (!given) return { verdict: 'bad', why: 'empty' };

  const same = given.toLowerCase() === expected.toLowerCase();

  if (same) {
    // didžioji raidė svarbi tik tikriniams daiktavardžiams
    const needsCapital = /^[A-Z]/.test(expected);
    if (needsCapital && !/^[A-Z]/.test(given)) return { verdict: 'almost', why: 'capital' };
    return { verdict: 'ok', why: '' };
  }

  // "bag" vietoj "bad" yra ne rašybos klaida, o kitas žodis
  if (others && others.has(given.toLowerCase())) return { verdict: 'bad', why: 'other-word' };

  const tol = expected.length >= 8 ? 2 : 1;
  if (lev(given.toLowerCase(), expected.toLowerCase()) <= tol)
    return { verdict: 'almost', why: 'spelling' };

  return { verdict: 'bad', why: '' };
}

/* ---------- raundo sudarymas / round building ---------- */
function weight(e) {
  if (isReady(e)) return 1;
  return 5 - Math.min(wordState(e).s, 3);   // 0->5, 1->4, 2->3, 3+->2
}

function sampleWeighted(pool, n) {
  const src = pool.slice(), out = [];
  while (out.length < n && src.length) {
    let total = 0;
    for (const e of src) total += weight(e);
    let r = Math.random() * total, i = 0;
    for (; i < src.length; i++) { r -= weight(src[i]); if (r <= 0) break; }
    out.push(src.splice(Math.min(i, src.length - 1), 1)[0]);
  }
  return out;
}

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

function buildRound() {
  const st = listState();
  const n  = content.roundLength || 12;
  const all = list.entries;

  let current, review;
  if (st.pass === 1) {
    current = all.filter(e => e.stage === st.stage);
    review  = all.filter(e => e.stage < st.stage);
  } else {
    current = all;                 // vėlesni ratai ignoruoja dalis
    review  = [];
  }

  let nReview = review.length ? Math.round(n * (content.reviewShare ?? 0.25)) : 0;
  let nCurrent = Math.min(n - nReview, current.length);
  nReview = Math.min(n - nCurrent, review.length);

  const picked = sampleWeighted(current, nCurrent).concat(sampleWeighted(review, nReview));
  return shuffle(picked);
}

/* ---------- pradžios ekranas / home ---------- */
function readyCount() { return list.entries.filter(isReady).length; }
function learnCount() { return list.entries.filter(atThreshold).length; }

function renderHome() {
  const st = listState(), total = list.entries.length, ready = readyCount();

  $('home-kid').textContent  = kid.name;
  $('home-list').textContent = list.name;
  $('home-pass').textContent = st.pass + ' ratas · reikia ' + threshold() + ' teisingų iš eilės';

  const learnt = learnCount();
  $('home-learn-count').textContent = learnt + ' / ' + total;
  $('home-learn-fill').style.width  = (total ? (learnt / total) * 100 : 0) + '%';
  $('home-ready-fill').style.width  = (total ? (ready / total) * 100 : 0) + '%';
  $('home-ready-count').textContent = ready === total
    ? 'Viskas patvirtinta kitą dieną ✓'
    : 'Patvirtinta kitą dieną: ' + ready + ' / ' + total;

  const stageBox = $('home-stage');
  if (st.pass === 1) {
    const inStage = list.entries.filter(e => e.stage === st.stage);
    const done    = inStage.filter(atThreshold).length;
    const maxStage = Math.max(...list.entries.map(e => e.stage));
    stageBox.style.display = '';
    stageBox.innerHTML =
      '<div class="row"><span>' + st.stage + ' dalis iš ' + maxStage + '</span>' +
      '<span>' + done + ' / ' + inStage.length + '</span></div>' +
      '<div class="bar small"><div class="bar-fill" style="width:' +
      (done / inStage.length) * 100 + '%"></div></div>';
  } else {
    stageBox.style.display = 'none';
  }

  const cd = $('home-countdown');
  if (list.testDate) {
    const days = Math.ceil((new Date(list.testDate) - new Date(today())) / 86400000);
    cd.style.display = '';
    cd.classList.toggle('urgent', days >= 0 && days <= 3);
    cd.textContent = days > 0
      ? 'Atsiskaitymas po ' + days + ' d. · dar neišmokta: ' + (total - ready)
      : days === 0 ? 'Atsiskaitymas šiandien!' : 'Atsiskaitymas jau praėjo';
  } else cd.style.display = 'none';

  const set = EMOJI[content.collectionTheme] || EMOJI.creatures;
  $('home-collection').textContent = set.slice(Math.max(0, prog.unlocked - 8), prog.unlocked).join(' ');
  show('home');
}

/* ---------- raundas / round ---------- */
function startRound() {
  round = buildRound();
  if (!round.length) { renderHome(); return; }
  pos = 0;
  stats = { correct: 0, almost: 0, wrong: 0, newReady: [], weak: [], unlockedBefore: prog.unlocked };
  showQuestion();
  show('round');
}

function useChoices(e) {
  const w = wordState(e);
  return !w.seen && w.s === 0;
}

function showQuestion() {
  const e = round[pos];
  answered = false;

  $('round-counter').textContent = (pos + 1) + ' / ' + round.length;
  $('prompt-pos').textContent    = e.pos ? posLabel(e.pos) : '';
  $('prompt-word').textContent   = e.lt;
  $('prompt-note').textContent   = e.note || '';

  $('feedback').className = 'feedback';
  $('btn-next').style.display = 'none';

  const expected = strip(e.en);
  const multi = expected.includes(' ');
  $('shape-hint').textContent = multi
    ? expected.split(' ').map(w => '_'.repeat(w.length)).join('   ')
    : '';

  if (useChoices(e)) {
    $('answer-form').style.display = 'none';
    const box = $('choice-block');
    box.style.display = 'flex';
    box.innerHTML = '';
    const others = shuffle(list.entries.filter(x => x !== e && x.pos === e.pos))
      .slice(0, 3);
    while (others.length < 3) {
      const cand = list.entries[(Math.random() * list.entries.length) | 0];
      if (cand !== e && !others.includes(cand)) others.push(cand);
    }
    shuffle(others.concat([e])).forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt.en;
      b.onclick = () => answerChoice(opt, e, b);
      box.appendChild(b);
    });
  } else {
    $('choice-block').style.display = 'none';
    $('answer-form').style.display = '';
    const input = $('answer-input');
    input.value = '';
    input.disabled = false;
    $('btn-check').disabled = false;
    input.focus();
  }
}

const POS = { n: 'daiktavardis', v: 'veiksmažodis', adj: 'būdvardis', adv: 'prieveiksmis', prep: 'prielinksnis' };
const posLabel = p => POS[p] || p;

function answerChoice(picked, entry, btn) {
  if (answered) return;
  answered = true;
  const w = touchWord(entry);
  w.seen = true;                                  // pasirinkimas niekada nekelia streak
  Array.from($('choice-block').children).forEach(b => b.disabled = true);
  btn.classList.add(picked === entry ? 'pick-ok' : 'pick-bad');
  feedback(picked === entry ? 'ok' : 'bad', entry, '', true);
  saveProgress();
}

function submitTyped(ev) {
  ev.preventDefault();
  if (answered) { next(); return; }
  const entry = round[pos];
  const raw   = $('answer-input').value;
  if (!squash(raw)) return;
  answered = true;

  const res = grade(raw, entry, otherAnswers(entry));
  const w   = touchWord(entry);
  w.seen = true;

  if (res.verdict === 'ok') {
    const before = isReady(entry);
    w.s += 1;
    if (!w.d.includes(today())) w.d.push(today());
    stats.correct++;
    if (!before && isReady(entry)) {
      stats.newReady.push(entry);
      if (w.r < listState().pass) { w.r = listState().pass; prog.unlocked++; }
    }
  } else if (res.verdict === 'almost') {
    stats.almost++;
    stats.weak.push(entry);
  } else {
    w.s = Math.max(0, w.s - 1);
    w.d = [];
    stats.wrong++;
    stats.weak.push(entry);
  }

  $('answer-input').disabled = true;
  $('btn-check').disabled = true;
  feedback(res.verdict, entry, raw, false, res.why);
  saveProgress();
}

function diffMarkup(given, expected) {
  const g = strip(given), out = [];
  for (let i = 0; i < g.length; i++) {
    const ok = g[i].toLowerCase() === (expected[i] || '').toLowerCase();
    out.push(ok ? esc(g[i]) : '<span class="miss">' + esc(g[i]) + '</span>');
  }
  return out.join('');
}
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function feedback(verdict, entry, raw, isChoice, why) {
  const box = $('feedback');
  const head = {
    ok:     ['Teisingai!', 'Correct!'],
    almost: ['Beveik!',    'Almost!'],
    bad:    ['Neteisingai','Wrong']
  }[verdict];

  let html = '<div class="verdict">' + head[0] +
             ' <span class="translated">· ' + head[1] + '</span></div>';

  if (verdict !== 'ok') {
    html += '<div class="answer">' + esc(entry.en) + '</div>';
    if (entry.ipa) html += '<div class="ipa">' + esc(entry.ipa) + '</div>';
  }
  if (why === 'capital')   html += '<div class="typed">Reikia didžiosios raidės</div>';
  if (why === 'other-word') html += '<div class="typed">Tai kitas šio sąrašo žodis</div>';
  if (!isChoice && verdict !== 'ok' && squash(raw))
    html += '<div class="typed">Tu parašei: ' + diffMarkup(raw, strip(entry.en)) + '</div>';
  if (isChoice && verdict === 'ok')
    html += '<div class="typed">Dabar pabandysi parašyti pats</div>';

  box.innerHTML = html;
  box.className = 'feedback on ' + verdict;
  $('btn-next').style.display = 'block';
  $('btn-next').focus();
}

function next() {
  pos++;
  if (pos >= round.length) finishRound();
  else showQuestion();
}

/* ---------- pabaiga / summary ---------- */
function finishRound() {
  const st = listState();
  let unlockedStage = false, passedUp = false;

  if (st.pass === 1) {
    const maxStage = Math.max(...list.entries.map(e => e.stage));
    while (st.stage < maxStage) {
      const inStage = list.entries.filter(e => e.stage === st.stage);
      if (inStage.filter(atThreshold).length / inStage.length >= STAGE_UNLOCK) {
        st.stage++; unlockedStage = true;
      } else break;
    }
  }
  const learntPct = learnCount() / list.entries.length;
  let hit80 = false;
  if (learntPct >= 0.8 && st.milestone80 !== st.pass) { st.milestone80 = st.pass; hit80 = true; }

  if (list.entries.every(isReady) && st.pass < PASS_THRESHOLDS.length) {
    st.pass++; passedUp = true;
  }
  saveProgress();

  const set = EMOJI[content.collectionTheme] || EMOJI.creatures;
  const gained = set.slice(stats.unlockedBefore, prog.unlocked);
  const weak = [...new Set(stats.weak.map(e => e.en))].slice(0, 6);

  $('summary-title').textContent = 'Raundas baigtas';
  $('summary-body').innerHTML =
    '<div class="score">' + stats.correct + ' / ' + round.length + '</div>' +
    '<div class="line">Beveik: ' + stats.almost + ' · Neteisingai: ' + stats.wrong + '</div>' +
    (stats.newReady.length ? '<div class="line">Nauji išmokti žodžiai: ' + stats.newReady.length + '</div>' : '') +
    (gained.length ? '<div class="new-emoji">' + gained.join(' ') + '</div>' : '') +
    (weak.length ? '<div class="weak">Dar sunku: ' + weak.map(w => '<b>' + esc(w) + '</b>').join(' ') + '</div>' : '') +
    (unlockedStage ? '<div class="celebrate">Atsidarė ' + listState().stage + ' dalis!</div>' : '') +
    (hit80 ? '<div class="celebrate">Jau ' + Math.round(learntPct * 100) +
             '% žodžių išmokta! Rytoj juos pakartok — tada bus patvirtinta.</div>' : '') +
    (passedUp ? '<div class="celebrate">Visas sąrašas išmoktas! Prasideda ' + listState().pass +
                ' ratas — dabar reikia ' + threshold() +
                ' teisingų iš eilės. Ankstesnis ratas lieka užbaigtas.</div>' : '');
  show('summary');
}

/* ---------- kolekcija / collection ---------- */
function renderCollection() {
  const set = EMOJI[content.collectionTheme] || EMOJI.creatures;
  $('collection-grid').innerHTML = set.map((em, i) =>
    '<span class="' + (i < prog.unlocked ? '' : 'locked') + '">' + em + '</span>').join('');
  show('collection');
}

/* ---------- paleidimas / boot ---------- */
async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(url + ' ' + r.status);
  return r.json();
}

async function selectKid(k) {
  kid = k;
  localStorage.setItem('zodziai.kid', k.id);
  content = await getJSON('data/lists_' + k.id + '.json');
  prog = loadProgress(k.id);
  list = content.lists[content.lists.length - 1];
  renderHome();
}

async function boot() {
  kids = await getJSON('data/kids.json');
  const saved = localStorage.getItem('zodziai.kid');
  const known = kids.find(k => k.id === saved);
  if (known) return selectKid(known);

  $('kid-buttons').innerHTML = '';
  kids.forEach(k => {
    const b = document.createElement('button');
    b.className = 'big-btn';
    b.textContent = k.name;
    b.onclick = () => selectKid(k);
    $('kid-buttons').appendChild(b);
  });
  show('kid');
}

$('answer-form').addEventListener('submit', submitTyped);
$('btn-next').onclick            = next;
$('btn-practice').onclick        = startRound;
$('btn-again').onclick           = startRound;
$('btn-home').onclick            = renderHome;
$('btn-quit').onclick            = renderHome;
$('btn-collection').onclick      = renderCollection;
$('btn-collection-back').onclick = renderHome;
$('btn-switch-kid').onclick      = () => { localStorage.removeItem('zodziai.kid'); boot(); };

if ('serviceWorker' in navigator)
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

boot().catch(err => {
  document.body.innerHTML = '<div style="padding:24px">Nepavyko įkelti žodžių.<br><small>'
    + err.message + '</small></div>';
});

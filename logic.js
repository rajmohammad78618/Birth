const $ = s => document.querySelector(s);
const song = $('#song');

/* ---------- Toast (chhota message) ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 6000);
}

/* ---------- Music ---------- */
// Gaana index.html ke saath usi folder me rakho: song.mpeg (ya song.mp3).
// Neeche ki list me naam ek-ek karke try hote hain.
const songList = ['song.mpeg', 'song.mp3', 'Song.mpeg', 'Song.mp3', 'song.mpeg.mpeg', 'song.mp3.mp3', 'music/song.mpeg', 'music/song.mp3', 'photos/song.mpeg', 'photos/song.mp3'];
let si = 0, wantPlay = false;
song.src = songList[si];

function setIcon() { $('#mute').textContent = song.paused ? '🔇' : '🔊'; }
song.addEventListener('play', setIcon);
song.addEventListener('pause', setIcon);

// File na mile to agla naam try karo; sab fail ho jaye to message dikhao
song.addEventListener('error', () => {
  si++;
  if (si < songList.length) { song.src = songList[si]; song.load(); return; }
  $('#mute').textContent = '⚠️';
  toast('Gaana nahi mila 😢 "song.mpeg" ko index.html wali usi folder me rakho');
  console.warn('song.mpeg nahi mila. Isse index.html ke saath usi folder me rakho.');
});
// Load hote hi, agar user chalana chahta tha to chala do
song.addEventListener('canplay', () => { if (wantPlay && song.paused) playSong(); });

function playSong() {
  wantPlay = true;
  const p = song.play();
  if (p && p.then) return p.then(() => true).catch(err => { console.warn('Song abhi play nahi hua:', err.name); return false; });
  return Promise.resolve(!song.paused);
}

// Autoplay block ho to pehle tap/click par gaana chala do (jab tak chal na jaye, har tap par try karta rahega)
function firstTap(e) {
  if (e.target.closest('#mute')) return;
  if (!song.paused) { removeTap(); return; }
  playSong().then(ok => { if (ok) removeTap(); });
}
function removeTap() {
  document.removeEventListener('click', firstTap);
  document.removeEventListener('touchend', firstTap);
  document.removeEventListener('keydown', firstTap);
}
document.addEventListener('click', firstTap);
document.addEventListener('touchend', firstTap);
document.addEventListener('keydown', firstTap);

// Music button: chalao / roko
$('#mute').addEventListener('click', () => {
  removeTap();
  if (song.paused) playSong();
  else { wantPlay = false; song.pause(); }
});

/* ---------- 3-2-1 timer, phir celebration ---------- */
// EDIT: START = kitne seconds ka timer chahiye (3 = teen second)
const START = 3;
let n = START;
const cnt = $('#count');
cnt.classList.add('tick');
const iv = setInterval(() => {
  n--;
  if (n > 0) { cnt.textContent = n; cnt.classList.remove('tick'); void cnt.offsetWidth; cnt.classList.add('tick'); }
  else { clearInterval(iv); celebrate(); }
}, 1000);

function celebrate() {
  $('#intro').classList.add('gone');
  setTimeout(() => {
    $('#intro').hidden = true; $('#title').hidden = false;
    for (let i = 0; i < 6; i++) setTimeout(() => burst(innerWidth * (.1 + i * .16), innerHeight * (.3 + Math.random() * .2), 90), i * 220);
    for (let i = 0; i < 14; i++) setTimeout(balloon, i * 120);
    hearts();
    playSong(); // autoplay block ho to pehle tap par chalega
  }, 600);
}

/* ---------- Girte hue hearts ---------- */
function hearts() {
  for (let i = 0; i < 25; i++) setTimeout(() => {
    const h = document.createElement('i');
    h.className = 'heart'; h.textContent = ['💖', '💗', '🌸', '✨'][i % 4];
    h.style.cssText = `left:${Math.random() * 100}%;--d:${4 + Math.random() * 3}s;font-size:${16 + Math.random() * 18}px`;
    document.body.append(h); setTimeout(() => h.remove(), 7500);
  }, i * 160);
}

/* ---------- Confetti ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d');
let ps = [], running = false;
const cols = ['#ff4d94', '#ff8fb8', '#ffd54a', '#ffffff', '#b388ff', '#6ee7f9'];
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
fit(); addEventListener('resize', fit);

function burst(x, y, n = 120) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, s = 4 + Math.random() * 9;
    ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, r: Math.random() * 6, vr: Math.random() * .4 - .2, c: cols[i % cols.length], l: 120 + Math.random() * 80 });
  }
  if (!running) { running = true; loop(); }
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  ps = ps.filter(p => p.l-- > 0);
  ps.forEach(p => {
    p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
    cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.l / 40);
    cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
  });
  if (ps.length) requestAnimationFrame(loop);
  else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ---------- Floating balloons (tap to pop) ---------- */
const bc = ['#ff8fb8', '#ff4d94', '#ffd6e7', '#ffb347', '#c9a7ff', '#8fd9ff'];
function balloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  const s = 44 + Math.random() * 40;
  b.style.cssText = `left:${Math.random() * 95}%;--s:${s}px;--c:${bc[Math.random() * bc.length | 0]};--d:${9 + Math.random() * 8}s;--x:${Math.random() * 80 - 40}px`;
  b.onclick = e => { burst(e.clientX, e.clientY, 40); b.remove(); };
  b.onanimationend = () => b.remove();
  $('#balloons').append(b);
}
setInterval(balloon, 900);
for (let i = 0; i < 6; i++) setTimeout(balloon, i * 250);

/* ---------- Open gift ---------- */
$('#open').onclick = () => {
  if (song.paused) playSong();
  for (let i = 0; i < 4; i++) setTimeout(() => burst(innerWidth * (.15 + i * .23), innerHeight * .4), i * 250);
  $('#letter').scrollIntoView();
};

/* ---------- Love letter ---------- */
// EDIT: neeche wala poora text apne shabdon me badal sakte ho
const msg = `Meli Bbuu 💖

Happy Birthday, maal 🎂

Instagram ke ek se msg se shuru hui hamaari vaartalap aaj hame yahaan tak le aayi 😊

Tum khush hoti ho to sab kuch accha ho jata hai, aur tum paas ho to har din khaas ho jata hai.

Aaj ka din sirf tumhara hai. Jo maangna ho maang lena, hum poora karne ki poori koshish karenge.

Sadaa khush rehna, meri maal. 🐻💕

— Aapka apna Bbuu`;
let typed = false;
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.id === 'letter' && !typed) {
    typed = true;
    let i = 0;
    typeT = setInterval(() => {
      $('#typed').textContent = msg.slice(0, ++i);
      if (i >= msg.length) clearInterval(typeT);
    }, 35); // typing speed (kam = tez)
  }
}), { threshold: .35 });
document.querySelectorAll('.reveal').forEach(e => io.observe(e));

/* ---------- Cake: button (ya cake par tap) se candles bujhti hain ---------- */
let blown = false;
function blow() {
  if (blown) return; blown = true;
  $('#cake').classList.add('blowing');
  $('#wish').textContent = 'Phoooo... 🌬️';
  setTimeout(() => {
    $('#cake').classList.add('out');
    $('#wish').textContent = 'Tumhari wish zaroor poori hogi, Meli Bbuu! ✨🎉';
    burst(innerWidth / 2, innerHeight / 2, 200); hearts();
  }, 700);
}
$('#cake').onclick = blow;
$('#blow').onclick = blow;

/* ---------- Photo gallery ---------- */
// EDIT: photos ka naam bina extension ke likho. Aur photos add karni ho to ek line badha do:
// ['Photo3', 'Caption yahaan'],
// Photo "photos/" folder me ho ya index.html ke saath usi folder me, dono jagah dhoondh legi.
const photos = [
  ['Photo1', 'Humari pyaari yaad 💕'],
  ['Photo2', 'Meri favourite 😍']
];

function photoCandidates(name) {
  const dirs = ['photos/', 'Photos/', ''];
  const exts = ['jpeg', 'jpg', 'JPG', 'JPEG', 'png', 'PNG'];
  const names = [name, name.toLowerCase()];
  const out = [];
  dirs.forEach(d => names.forEach(nm => exts.forEach(x => out.push(`${d}${nm}.${x}`))));
  return [...new Set(out)];
}
$('#track').innerHTML = photos.map((p, i) =>
  `<div class="card" style="--r:${i % 2 ? 2 : -2}deg"><img data-name="${p[0]}" alt=""><p>${p[1]}</p></div>`
).join('');
document.querySelectorAll('#track img').forEach(img => {
  const list = photoCandidates(img.dataset.name);
  let k = 0;
  img.onerror = () => {
    k++;
    if (k < list.length) img.src = list[k];
    else { img.parentNode.classList.add('ph'); console.warn(img.dataset.name + ' photo nahi mili'); }
  };
  img.src = list[0];
});

/* ---------- Twinkling stars ---------- */
for (let i = 0; i < 45; i++) {
  const s = document.createElement('i');
  s.className = 'star'; s.textContent = '✦';
  s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--z:${8 + Math.random() * 14}px;--t:${1.5 + Math.random() * 3}s;color:${['#ffb347', '#ff8fb8', '#ffffff', '#c9a7ff'][i % 4]}`;
  $('#stars').append(s);
}

/* ---------- Sparkle trail (finger / mouse) ---------- */
let lastSp = 0;
addEventListener('pointermove', e => {
  const n = Date.now(); if (n - lastSp < 50) return; lastSp = n;
  const s = document.createElement('i');
  s.className = 'spark'; s.textContent = ['✨', '💖', '⭐'][Math.random() * 3 | 0];
  s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.random() * 40 - 20}px;--dy:${Math.random() * 40 + 10}px`;
  document.body.append(s); setTimeout(() => s.remove(), 800);
});

/* ---------- Reasons (edit these!) ---------- */
// EDIT: 'Tumse pyaar kyun hai' ke cards. Line badhao/ghatao jitna chaho
const why = ['Tumhari care 🤗', 'Tumhara bachpana 🧸', 'Tumhara mujhe samajhna 💞', 'Itna sa pyaar, jo kabhi nahi paaya 🥹', 'Tumhara sab kuch mujhse share karna 💌', 'Jaisi ho, mere liye bilkul perfect 💖'];
$('#why').innerHTML = why.map((w, i) => `<div class="why" style="--i:${i * .12}s">${w}</div>`).join('');

/* ---------- Gift vouchers (tap to open) ---------- */
// EDIT: gift vouchers ['text', 'emoji']
const cp = [['3 wishes, jo chaaho maang lo', '🧞'], ['Main kitni kisses karun? 🤪', '😘'], ['Main jaldi hi aaunga', '🥰']];
$('#coupons').innerHTML = cp.map(c => `<div class="coupon"><em>Tap karo 🎟️</em><span>${c[1]} ${c[0]}</span></div>`).join('');
document.querySelectorAll('.coupon').forEach(c => c.onclick = e => { c.classList.add('open'); burst(e.clientX, e.clientY, 50); });

/* ---------- Finale ---------- */
$('#final').onclick = () => {
  for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * .3, 80), i * 200);
  for (let i = 0; i < 12; i++) setTimeout(balloon, i * 100);
  hearts();
};
/* =====================================================
   NEW FEATURES
   ===================================================== */
let typeT;

/* ---------- Skip typing ---------- */
function showAll() { clearInterval(typeT); typed = true; $('#typed').textContent = msg; }
$('#skip').onclick = showAll;

/* ---------- Scroll progress bar ---------- */
const bar = $('#bar');
addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
}, { passive: true });

/* ---------- Side dots navigation ---------- */
const secs = [...document.querySelectorAll('section')];
$('#dots').innerHTML = secs.map((s, i) => `<button aria-label="${s.dataset.label}" data-i="${i}"></button>`).join('');
const dots = [...document.querySelectorAll('#dots button')];
dots.forEach(d => d.onclick = () => secs[d.dataset.i].scrollIntoView({ behavior: 'smooth' }));
const dio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) dots.forEach((d, i) => d.classList.toggle('on', secs[i] === e.target));
}), { threshold: .5 });
secs.forEach(s => dio.observe(s));

/* ---------- Night mode ---------- */
$('#night').onclick = () => {
  const on = document.body.classList.toggle('night');
  $('#night').textContent = on ? '☀️' : '🌙';
  document.querySelector('meta[name=theme-color]').content = on ? '#3a1442' : '#ff8fb8';
};

/* ---------- Cursor glow (desktop) ---------- */
const glow = $('#glow');
addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  glow.style.opacity = 1; glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

/* ---------- 3D tilt on photo cards & vouchers ---------- */
document.querySelectorAll('.card, .coupon').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
    el.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 16 + 'deg');
  });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
});

/* ---------- Photo lightbox ---------- */
const lb = $('#lb');
document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
  const img = c.querySelector('img');
  if (c.classList.contains('ph') || !img.src) return;
  lb.querySelector('img').src = img.src; lb.querySelector('p').textContent = c.querySelector('p').textContent;
  lb.hidden = false;
}));
lb.onclick = () => lb.hidden = true;
addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

/* ---------- Story timeline ---------- */
// EDIT: ['Title', 'Description'] — jitni chaho utni lines
const story = [
  ['Pehla message 💬', 'Instagram par ek chhota sa msg, aur baatein shuru ho gayi.'],
  ['Baatein hi baatein 🌙', 'Raat-raat bhar baatein, aur pata hi nahi chala kab aadat ban gayi.'],
  ['Hum 💞', 'Ek dusre ke bina ab din adhoora lagta hai.'],
  ['Aaj 🎂', 'Tumhara birthday, aur mera sabse pyaara din.']
];
$('#tl').innerHTML = story.map((s, i) => `<div class="tl-i" style="--i:${.3 + i * .35}s"><b>${s[0]}</b>${s[1]}</div>`).join('');

/* ---------- Love meter ---------- */
// EDIT: har % par kya message dikhe
const mmsg = [[0, 'Bas itna? 🥺'], [30, 'Thoda aur...'], [60, 'Ab aaya maza 😍'], [90, 'Almost there 💗'], [100, 'Maximum se bhi zyada! ∞ 💥']];
const mt = $('#meter'), mh = $('#mheart');
let mburst = false;
function meter() {
  const v = +mt.value;
  mt.style.setProperty('--v', v + '%');
  mh.style.transform = `scale(${1 + v / 40})`;
  const m = [...mmsg].reverse().find(x => v >= x[0])[1];
  $('#mtxt').textContent = v >= 100 ? m : `${v}% — ${m}`;
  if (v >= 100 && !mburst) { mburst = true; burst(innerWidth / 2, innerHeight / 2, 160); hearts(); }
  if (v < 100) mburst = false;
}
mt.oninput = meter; meter();

/* ---------- Mic se phoonk (HTTPS/localhost par chalta hai) ---------- */
$('#mic').onclick = async () => {
  if (blown) return;
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const an = ac.createAnalyser(); an.fftSize = 512;
    ac.createMediaStreamSource(st).connect(an);
    const d = new Uint8Array(an.fftSize); let hit = 0;
    $('#wish').textContent = 'Sun raha hoon... zor se phoonko 🎤';
    (function chk() {
      if (blown) { st.getTracks().forEach(t => t.stop()); ac.close(); return; }
      an.getByteTimeDomainData(d);
      let m = 0; for (const v of d) m = Math.max(m, Math.abs(v - 128));
      hit = m > 60 ? hit + 1 : Math.max(0, hit - 1);
      if (hit > 6) { blow(); return; }
      requestAnimationFrame(chk);
    })();
  } catch (err) { toast('Mic nahi mila. Button se phoonk do 🌬️'); }
};

/* ---------- Scratch card ---------- */
// EDIT: scratch ke neeche ka secret message
$('#secret').textContent = 'Tum meri sabse badi khushi ho 💖 I love you!';
(function () {
  const c = $('#scr'), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 300, 150);
  g.addColorStop(0, '#ff8fb8'); g.addColorStop(1, '#ffb347');
  x.fillStyle = g; x.fillRect(0, 0, 300, 150);
  x.fillStyle = '#fff'; x.font = '700 20px Quicksand,sans-serif'; x.textAlign = 'center';
  x.fillText('Yahaan scratch karo ✨', 150, 80);
  let down = false, done = false, cnt = 0;
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * 300 / r.width, (e.clientY - r.top) * 150 / r.height]; };
  function scratch(e) {
    if (!down || done) return;
    const [px, py] = pos(e);
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.arc(px, py, 18, 0, 6.3); x.fill();
    if (++cnt % 8 === 0) {
      const d = x.getImageData(0, 0, 300, 150).data; let k = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] === 0) k++;
      if (k / (d.length / 64) > .45) { done = true; c.classList.add('done'); burst(innerWidth / 2, innerHeight / 2, 120); }
    }
  }
  c.addEventListener('pointerdown', e => { down = true; c.setPointerCapture(e.pointerId); scratch(e); });
  c.addEventListener('pointermove', scratch);
  addEventListener('pointerup', () => down = false);
})();

/* ---------- Heart catcher game ---------- */
// EDIT: GAME_TIME seconds me game ka time
const GAME_TIME = 20;
let score = 0, left = 0, gT, sT, playing = false;
const arena = $('#arena');
function spawn() {
  const bad = Math.random() < .2, f = document.createElement('i');
  f.className = 'fh'; f.textContent = bad ? '💔' : ['❤️', '💖', '💗'][Math.random() * 3 | 0];
  f.style.left = Math.random() * 86 + '%'; f.style.animationDuration = (2.2 + Math.random() * 2) + 's';
  f.onpointerdown = e => {
    e.preventDefault();
    score = Math.max(0, score + (bad ? -2 : 1));
    const r = arena.getBoundingClientRect(); burst(e.clientX, e.clientY, 14);
    f.remove(); stat();
  };
  f.onanimationend = () => f.remove();
  arena.append(f);
}
function stat() { $('#gstat').textContent = `Score: ${score} ❤️   ⏱ ${left}s`; }
$('#gstart').onclick = () => {
  if (playing) return;
  playing = true; score = 0; left = GAME_TIME; arena.innerHTML = ''; stat();
  $('#gstart').hidden = true;
  sT = setInterval(spawn, 550);
  gT = setInterval(() => {
    left--; stat();
    if (left <= 0) {
      clearInterval(gT); clearInterval(sT); playing = false; arena.innerHTML = '';
      const r = score >= 18 ? 'Wah! Dil churane me expert 😍' : score >= 10 ? 'Mast khela! 💕' : 'Koi nahi, mera dil to tumhare paas hi hai 🥰';
      $('#gstat').textContent = `Final score: ${score} — ${r}`;
      $('#gstart').textContent = 'Phir se khelo 🔁'; $('#gstart').hidden = false;
      if (score >= 10) { burst(innerWidth / 2, innerHeight / 2, 150); hearts(); }
    }
  }, 1000);
};

/* ---------- Wish jar ---------- */
function addWish() {
  const i = $('#wishIn'), v = i.value.trim();
  if (!v) { toast('Pehle wish to likho 🥺'); return; }
  const c = document.createElement('span');
  c.className = 'chip'; c.textContent = '🌠 ' + v;
  const j = $('#jar'); j.append(c);
  if (j.children.length > 14) j.firstChild.remove();
  i.value = ''; toast('Wish jar me chali gayi ✨ Poori hogi!');
  const r = c.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 40);
}
$('#wishAdd').onclick = addWish;
$('#wishIn').addEventListener('keydown', e => { if (e.key === 'Enter') addWish(); });

/* ---------- Finale: bhaagta "Nahi" button ---------- */
let dodge = 0;
const no = $('#no'), yes = $('#yes');
const NO_TEXT = ['Nahi 🙈', 'Pakka? 🥺', 'Sochlo na 🥹', 'Haan bol do 😭', 'Pakad ke dikhao 😜'];
function run() {
  dodge++;
  no.style.transform = `translate(${(Math.random() - .5) * 220}px,${(Math.random() - .5) * 120}px)`;
  no.textContent = NO_TEXT[Math.min(dodge, NO_TEXT.length - 1)];
  yes.style.transform = `scale(${Math.min(1 + dodge * .15, 2)})`;
}
no.addEventListener('pointerenter', run);
no.addEventListener('pointerdown', e => { e.preventDefault(); run(); });
yes.onclick = () => {
  $('#q').textContent = 'Pakka wala promise! Love you forever 💖🐻';
  no.hidden = true; yes.hidden = true;
  for (let i = 0; i < 10; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * (.2 + Math.random() * .4), 100), i * 250);
  for (let i = 0; i < 12; i++) setTimeout(balloon, i * 100);
  hearts();
};

/* ---------- Easter egg: title par 5 baar tap karo ---------- */
let taps = 0;
$('#h1').addEventListener('click', () => {
  if (++taps < 5) return; taps = 0; toast('Teddy bear shower! 🐻');
  for (let i = 0; i < 20; i++) setTimeout(() => {
    const b = document.createElement('i'); b.className = 'bear'; b.textContent = '🐻';
    b.style.cssText = `left:${Math.random() * 95}%;--d:${3 + Math.random() * 3}s;font-size:${24 + Math.random() * 24}px`;
    document.body.append(b); setTimeout(() => b.remove(), 6500);
  }, i * 150);
});

/* ---------- Keyboard: M = music ---------- */
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'm' && e.target.tagName !== 'INPUT') $('#mute').click(); });


/* =====================================================
   BACKGROUND ANIMATIONS
   ===================================================== */
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- Girti hui petals / phool ---------- */
// EDIT: PETALS me emoji badal sakte ho
const PETALS = ['🌸', '🌺', '💮', '🌷', '🪷'];
function petal() {
  if (RM || document.hidden) return;
  const p = document.createElement('i');
  p.className = 'petal'; p.textContent = PETALS[Math.random() * PETALS.length | 0];
  p.style.cssText = `left:${rnd(0, 98)}%;--d:${rnd(9, 15)}s;font-size:${rnd(14, 28)}px`;
  p.onanimationend = () => p.remove();
  $('#petals').append(p);
}
setInterval(petal, 1100);
for (let i = 0; i < 6; i++) setTimeout(petal, i * 300);

/* ---------- Fireflies (jugnu) ---------- */
if (!RM) for (let i = 0; i < 22; i++) {
  const f = document.createElement('i');
  f.className = 'fly';
  f.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;--t:${rnd(6, 14)}s;--g:${rnd(1, 3)}s;--a:${rnd(-80, 80) | 0}px;--b:${rnd(-100, 100) | 0}px;--c:${rnd(-60, 60) | 0}px;animation-delay:-${rnd(0, 8)}s`;
  $('#flies').append(f);
}

/* ---------- Shooting stars ---------- */
function shoot() {
  if (RM || document.hidden) return;
  const s = document.createElement('i');
  s.className = 'shoot';
  s.style.cssText = `left:${rnd(0, 70)}%;top:${rnd(0, 40)}%`;
  s.onanimationend = () => s.remove();
  $('#fx').append(s);
}
setInterval(shoot, 2800);
setTimeout(shoot, 1200);

/* ---------- Upar uthte bubbles ---------- */
function bubble() {
  if (RM || document.hidden) return;
  const b = document.createElement('i'), z = rnd(10, 38);
  b.className = 'bub';
  b.style.cssText = `left:${rnd(0, 98)}%;width:${z}px;height:${z}px;--d:${rnd(8, 14)}s;--x:${rnd(-60, 60) | 0}px`;
  b.onanimationend = () => b.remove();
  $('#fx').append(b);
}
setInterval(bubble, 1300);

/* ---------- Parallax: scroll par stars/blobs dheere khiskte hain ---------- */
addEventListener('scroll', () => {
  $('#stars').style.transform = `translateY(${-scrollY * .08}px)`;
  $('#bg').style.transform = `translateY(${-scrollY * .04}px)`;
}, { passive: true });
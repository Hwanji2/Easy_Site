// 섹션 페이드인
const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });
sections.forEach(sec => observer.observe(sec));

// 라이트/다크 모드 초기 적용
const themeToggle = document.getElementById('themeToggle');
const hour = new Date().getHours();
const isNight = hour >= 18 || hour < 6;
document.body.classList.add(isNight ? 'dark' : 'light');
themeToggle.textContent = isNight ? '🌙' : '☀️';

// 테마 토글
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
});

// 진행도 바
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = (scrollTop / scrollHeight) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
});

// 검색 기능
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const keyword = this.value.toLowerCase();
    const allText = document.querySelectorAll('body *:not(script):not(style):not(input):not(nav):not(.progress-bar)');
    for (const el of allText) {
      if (el.textContent.toLowerCase().includes(keyword) && keyword.length > 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }
});

// 게임 시작 네모
const startSquare = document.getElementById('startSquare');
const startArea = document.getElementById('startArea');
if (startSquare) {
  let cancelled = false;
  const develop = document.getElementById('develop');
  const cells = document.querySelectorAll('#develop .skill-table th, #develop .skill-table td');
  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
  async function animateSquare(){
    let dir = 1, pos = 0;
    await sleep(4000);
    while(!cancelled){
      const start = performance.now();
      while(performance.now() - start < 1500 && !cancelled){
        const limit = startArea.clientWidth - 20;
        pos += dir * 2;
        if(pos > limit || pos < 0) dir *= -1;
        startSquare.style.left = pos + 'px';
        await sleep(16);
      }
      for(const cell of cells){
        if(cancelled) break;
        const rect = cell.getBoundingClientRect();
        startSquare.style.position = 'fixed';
        startSquare.style.transition = 'transform 0.3s';
        startSquare.style.transform = `translate(${rect.left + rect.width/2 - 10}px, ${rect.top + rect.height/2 - 10}px)`;
        await sleep(350);
      }
      if(cancelled) break;
      startSquare.style.transition = 'none';
      function follow(e){
        const r = develop.getBoundingClientRect();
        const x = Math.min(r.right - 20, Math.max(r.left, e.clientX)) - 10;
        const y = Math.min(r.bottom - 20, Math.max(r.top, e.clientY)) - 10;
        startSquare.style.transform = `translate(${x}px, ${y}px)`;
      }
      develop.addEventListener('pointermove', follow);
      await sleep(1500);
      develop.removeEventListener('pointermove', follow);
      startSquare.style.position = 'absolute';
      startSquare.style.transform = 'translate(0,0)';
      pos = 0; startSquare.style.left = '0px';
      await sleep(500);
    }
  }
  animateSquare();

  startSquare.addEventListener('click', () => {
    cancelled = true;
    const game = document.getElementById('game');
    const canvas = document.getElementById('gameCanvas');
    document.querySelectorAll('.dev-content').forEach(c => c.classList.remove('active'));
    if (canvas) {
      const sq = startSquare.getBoundingClientRect();
      const cv = canvas.getBoundingClientRect();
      startSquare.style.position = 'fixed';
      startSquare.style.left = sq.left + 'px';
      startSquare.style.top = sq.top + 'px';
      startSquare.style.transition = 'transform 0.5s, opacity 0.5s';
      startSquare.style.transform = `translate(${cv.left + cv.width/2 - 10 - sq.left}px, ${cv.top + cv.height/2 - 10 - sq.top}px)`;
      setTimeout(()=>{ startSquare.style.opacity = 0; }, 500);
      setTimeout(()=>{ if(startArea) startArea.style.display = 'none'; }, 1000);
    }
    if (game && canvas) {
      game.classList.add('active');
      canvas.classList.remove('collapsed');
      canvas.classList.add('flash');
      setTimeout(()=>canvas.classList.remove('flash'), 600);
    }
    restartGame();
  });
}

// 기획 페이지 넘기기
const book = document.getElementById('book');
const pages = book ? book.querySelectorAll('.page') : [];
let pageIndex = 0;
if (book && pages.length) {
  const show = (idx, dir) => {
    const current = pages[pageIndex];
    const nextIdx = (idx + pages.length) % pages.length;
    const next = pages[nextIdx];
    current.classList.remove('active');
    current.classList.add(dir === 'next' ? 'flip-next-out' : 'flip-prev-out');
    next.classList.add('active', dir === 'next' ? 'flip-next-in' : 'flip-prev-in');
    setTimeout(() => {
      current.classList.remove('flip-next-out', 'flip-prev-out');
      next.classList.remove('flip-next-in', 'flip-prev-in');
    }, 600);
    pageIndex = nextIdx;
  };

  book.addEventListener('click', e => {
    const rect = book.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) {
      show(pageIndex - 1, 'prev');
    } else {
      show(pageIndex + 1, 'next');
    }
  });
}

// 간단한 러닝 게임
if (document.getElementById('gameCanvas')) {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  const texts = Array.from(document.querySelectorAll('#about .item'))
    .map(el => el.textContent.trim())
    .filter(t => t.length > 0);
  const codeBg = document.getElementById('codeBg');
  let codeInterval = null;
  const codeString = `function update() {\n  // runner game code\n}`;
  function startCodeTyping(){
    if(!codeBg) return;
    clearInterval(codeInterval);
    codeBg.textContent = '';
    let idx = 0;
    codeInterval = setInterval(()=>{
      codeBg.textContent += codeString[idx];
      idx = (idx + 1) % codeString.length;
    }, 60);
  }
  const player = { x: 30, y: 110, w: 20, h: 20, vy: 0, sliding: false };
  let jumpActive = false;
  let jumpTimer = 0;
  const maxJumpTime = 15;
  let canDouble = false;
  const obstacles = [];
  const trees = [];
  const fontSize = 24;
  let frame = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('highscore') || '0');
  let widthAnim = 0;
  let nextWidthScore = 50;
  let nextThemeScore = 100;
  let nextMoveScore = 30;
  let canvasTx = 0, canvasTy = 0, canvasScale = 1;
  const maxHearts = 3;
  let hearts = maxHearts;
  const cardGameEl = document.getElementById('cardGame');
  const cardGrid = document.getElementById('cardGrid');
  const cardTimerEl = document.getElementById('cardTimer');
  const cardStartMsg = document.getElementById('cardStartMsg');
  const towerIntroEl = document.getElementById('towerIntro');
  const introCanvas = document.getElementById('introCanvas');
  const introCtx = introCanvas ? introCanvas.getContext('2d') : null;
  const introMsg = document.getElementById('introMsg');
  const startTowerBtn = document.getElementById('startTowerBtn');
  const linePuzzleEl = document.getElementById('linePuzzle');
  const lineCanvas = document.getElementById('lineCanvas');
  const lineCtx = lineCanvas ? lineCanvas.getContext('2d') : null;
  const lineTimerEl = document.getElementById('lineTimer');
  const reactionGameEl = document.getElementById('reactionGame');
  const reactionMsg = document.getElementById('reactionMsg');
  const introOptions = document.getElementById('introOptions');
  const breakPieces = [];
  let linePuzzleStarted = false;
  let reactionGameStarted = false;
  let cardGameShown = false;
  const heartContainer = document.getElementById('heartContainer');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const inventory = document.getElementById('inventory');
  const gameOverEl = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const restartBtn = document.getElementById('restartBtn');
  let running = true;
  let runningTimeSpawned = false;
  let runningTimeAcquired = false;
  let boost = 0;
  let decel = false;
  let reactionActive = false;
  let reactionTimeout;
  let reactionTimer;
  let reactionStart = 0;
  let visitCount = parseInt(localStorage.getItem('towerVisits') || '0');
  let introActive = false;
  let introPhase = 0;
  const introPlayer = { x: 240, y: 140 };
  const introNpc = { x: 240, y: 80 };
  const playerGuess = navigator.userAgent.split(' ')[0] || '플레이어';
  let playerName = playerGuess;
  let introStep = 0;

  function typeDialogue(text, cb) {
    if (!introMsg) { cb && cb(); return; }
    introMsg.textContent = '';
    let i = 0;
    introMsg.classList.remove('hidden');
    const timer = setInterval(() => {
      introMsg.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(timer);
        cb && cb();
      }
    }, 100);
  }

  function playDialogue(lines, done) {
    let idx = 0;
    function next() {
      if (idx >= lines.length) { if(done) done(); return; }
      typeDialogue(lines[idx], () => {
        towerIntroEl.addEventListener('pointerdown', advance, { once: true });
      });
    }
    function advance() {
      idx++;
      next();
    }
    next();
  }

  function showOptions(opts) {
    if (!introOptions) { opts[0] && opts[0].onSelect(); return; }
    introOptions.innerHTML = '';
    opts.forEach(o => {
      const b = document.createElement('button');
      b.textContent = o.text;
      b.addEventListener('click', () => {
        introOptions.classList.add('hidden');
        o.onSelect();
      });
      introOptions.appendChild(b);
    });
    introOptions.classList.remove('hidden');
  }

  function nextIntro() {
    switch(introStep) {
      case 0:
        typeDialogue('연결되었나요? 게임이니까 부담 갖지 마세요.', () => {
          showOptions([{ text: '계속', onSelect: () => { introStep++; nextIntro(); } }]);
        });
        break;
      case 1:
        typeDialogue(`${playerGuess}가 맞나요?`, () => {
          showOptions([
            { text: '맞아요', onSelect: () => { playerName = playerGuess; introStep++; nextIntro(); } },
            { text: '아니요', onSelect: () => { const n = prompt('이름을 입력하세요'); if(n) playerName = n; introStep++; nextIntro(); } }
          ]);
        });
        break;
      case 2:
        const t = new Date().toLocaleTimeString();
        typeDialogue(`지금 시간이 ${t} 맞나요?`, () => {
          showOptions([
            { text: '맞아', onSelect: () => { introStep++; nextIntro(); } },
            { text: '잘 모르겠는데', onSelect: () => { introStep++; nextIntro(); } }
          ]);
        });
        break;
      case 3:
        typeDialogue(`안녕, ${playerName}!`, () => { introStep++; nextIntro(); });
        break;
      case 4:
        typeDialogue('게임의 탑에 온걸 환영한다!', () => { introStep++; nextIntro(); });
        break;
      case 5:
        typeDialogue('선택받은 인간으로서 낙원에 가려면 이 탑을 올라야 한다.', () => { introStep++; nextIntro(); });
        break;
      case 6:
        typeDialogue('탑은 총 10층으로 이루어져 있다.', () => { introStep++; nextIntro(); });
        break;
      case 7:
        typeDialogue('준비가 되었는가?', () => {
          showOptions([
            { text: '준비됐어', onSelect: () => { introStep = 9; nextIntro(); } },
            { text: '말도 안돼', onSelect: () => { introStep = 8; nextIntro(); } }
          ]);
        });
        break;
      case 8:
        typeDialogue('게임의 탑의 역사로 사람들은 더 이상 일을 할 필요가 없어졌다. 그리고 그들은 삶의 의미를 게임에서 찾았다.', () => { introStep = 9; nextIntro(); });
        break;
      case 9:
        typeDialogue('준비가 되었다면 버튼을 누르거라.', () => { if (startTowerBtn) startTowerBtn.classList.remove('hidden'); });
        break;
    }
  }

  function renderHearts() {
    if (!heartContainer) return;
    heartContainer.innerHTML = '';
    for (let i = 0; i < hearts; i++) {
      const span = document.createElement('span');
      span.className = 'heart';
      span.textContent = '💙';
      heartContainer.appendChild(span);
    }
  }
  function updateScore() {
    if (score > best) { best = score; localStorage.setItem("highscore", best); }
    if (scoreDisplay) {
      scoreDisplay.innerHTML =
        `<span class="score-block">Score: ${score}</span>` +
        `<span class="score-block">Best: ${best}</span>`;
    }
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function showGood() {
    if (!cardGameEl) return;
    const el = document.createElement('div');
    el.className = 'good-effect';
    el.textContent = 'Good!';
    cardGameEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function explodeCanvas() {
    for (let i = 0; i < 20; i++) {
      breakPieces.push({
        char: '💥',
        x: Math.random() * canvas.width,
        y: Math.random() * 80,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        a: 1
      });
    }
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 600);
  }

  let cardTime = 30, cardInterval, firstCard = null, matched = 0, totalCards = 0;
  let cardStarted = false;
  function startCardGame() {
    if (!cardGameEl) { running = true; update(); return; }
    running = false;
    cardTime = 30;
    matched = 0;
    cardStarted = false;
    cardGrid.innerHTML = '';
    const values = texts.slice(0);
    const cards = values.concat(values);
    totalCards = cards.length;
    shuffle(cards);
    cards.forEach(v => {
      const c = document.createElement('div');
      c.className = 'card';
      c.dataset.val = v;
      c.innerHTML = `<div class="inner"><div class="front"></div><div class="back">${v}</div></div>`;
      c.addEventListener('click', onCardClick);
      c.classList.add('flipped');
      cardGrid.appendChild(c);
    });
    cardTimerEl.textContent = cardTime;
    cardTimerEl.classList.add('hidden');
    if (cardStartMsg) cardStartMsg.classList.remove('hidden');
    cardGameEl.classList.remove('hidden');
    const startHandler = () => {
      if (cardStarted) return;
      cardStarted = true;
      if (cardStartMsg) cardStartMsg.classList.add('hidden');
      cardTimerEl.classList.remove('hidden');
      cardGrid.querySelectorAll('.card').forEach(cd => cd.classList.remove('flipped'));
      cardInterval = setInterval(() => {
        cardTime--; cardTimerEl.textContent = cardTime;
        if (cardTime <= 0) {
          explodeCanvas();
          endCardGame();
        }
      }, 1000);
    };
    cardGameEl.addEventListener('pointerdown', startHandler, { once: true });
  }

  function onCardClick(e) {
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    if (!firstCard) { firstCard = card; return; }
    if (firstCard.dataset.val === card.dataset.val) {
      firstCard.classList.add('matched');
      card.classList.add('matched');
      matched += 2;
      cardTime += 3;
      cardTimerEl.textContent = cardTime;
      score += 1;
      updateScore();
      showGood();
    } else {
      const a = firstCard; const b = card;
      setTimeout(() => { a.classList.remove('flipped'); b.classList.remove('flipped'); }, 600);
    }
    firstCard = null;
    if (matched >= totalCards) endCardGame();
  }

  function endCardGame() {
    clearInterval(cardInterval);
    if (cardGameEl) cardGameEl.classList.add('hidden');
    running = true;
    update();
  }

  let lineTime = 15, lineInterval, lines = [], currentLine = null;
  const nodes = lineCanvas ? [
    {x:50,y:40,color:'red'}, {x:430,y:40,color:'red'},
    {x:50,y:160,color:'blue'}, {x:430,y:160,color:'blue'}
  ] : [];

  function drawLinePuzzle() {
    if (!lineCtx) return;
    lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);
    nodes.forEach(n=>{ lineCtx.fillStyle=n.color; lineCtx.beginPath(); lineCtx.arc(n.x,n.y,8,0,Math.PI*2); lineCtx.fill(); });
    lineCtx.strokeStyle='#87ceeb'; lineCtx.lineWidth=2;
    lines.forEach(l=>{ lineCtx.beginPath(); lineCtx.moveTo(l.x1,l.y1); lineCtx.lineTo(l.x2,l.y2); lineCtx.stroke(); });
    if (currentLine) { lineCtx.beginPath(); lineCtx.moveTo(currentLine.x1,currentLine.y1); lineCtx.lineTo(currentLine.x2,currentLine.y2); lineCtx.stroke(); }
    lineCtx.fillStyle = '#87ceeb';
    lineCtx.font = "16px 'Press Start 2P', monospace";
    lineCtx.fillText(lineTime, lineCanvas.width - 30, 20);
  }

  function startLinePuzzle() {
    if (!linePuzzleEl) return;
    running = false;
    lineTime = 15; lines = []; currentLine = null;
    linePuzzleEl.classList.remove('hidden');
    drawLinePuzzle();
    lineInterval = setInterval(() => {
      lineTime--; drawLinePuzzle();
      if (lineTime <= 0) { explodeCanvas(); endLinePuzzle(false); }
    }, 1000);
  }

  function doLinesCross(l1,l2){
    function ccw(ax,ay,bx,by,cx,cy){ return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax); }
    return ccw(l1.x1,l1.y1,l1.x2,l1.y2,l2.x1,l2.y1)*ccw(l1.x1,l1.y1,l1.x2,l1.y2,l2.x2,l2.y2)<0 &&
           ccw(l2.x1,l2.y1,l2.x2,l2.y2,l1.x1,l1.y1)*ccw(l2.x1,l2.y1,l2.x2,l2.y2,l1.x2,l1.y2)<0;
  }

  function endLinePuzzle(success){
    clearInterval(lineInterval);
    if (linePuzzleEl) linePuzzleEl.classList.add('hidden');
    if (success) { score += 5; updateScore(); }
    running = true;
    update();
  }

  if (lineCanvas) {
    lineCanvas.addEventListener('pointerdown', e=>{
      const r=lineCanvas.getBoundingClientRect();
      const x=e.clientX-r.left, y=e.clientY-r.top;
      const n=nodes.find(nd=>Math.hypot(nd.x-x,nd.y-y)<10 && !lines.find(l=>l.color===nd.color));
      if(n){ currentLine={color:n.color,x1:n.x,y1:n.y,x2:n.x,y2:n.y}; drawLinePuzzle(); }
    });
    lineCanvas.addEventListener('pointermove', e=>{
      if(!currentLine) return; const r=lineCanvas.getBoundingClientRect(); currentLine.x2=e.clientX-r.left; currentLine.y2=e.clientY-r.top; drawLinePuzzle();
    });
    lineCanvas.addEventListener('pointerup', e=>{
      if(!currentLine) return; const r=lineCanvas.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
      const t=nodes.find(nd=>nd.color===currentLine.color && Math.hypot(nd.x-x,nd.y-y)<10 && !(nd.x===currentLine.x1 && nd.y===currentLine.y1));
      if(t){ currentLine.x2=t.x; currentLine.y2=t.y; lines.push({...currentLine}); }
      currentLine=null; drawLinePuzzle();
      if(lines.length===2 && !doLinesCross(lines[0],lines[1])) endLinePuzzle(true);
    });
  }

  function startReactionGame() {
    if (!reactionGameEl) return;
    running = false;
    reactionActive = false;
    reactionGameEl.style.background = 'rgba(0,0,0,0.8)';
    if (reactionMsg) reactionMsg.textContent = '화면이 빨개지면 클릭!';
    reactionGameEl.classList.remove('hidden');
    reactionTimeout = setTimeout(() => {
      reactionGameEl.style.background = 'rgba(255,0,0,0.9)';
      reactionActive = true;
      reactionStart = performance.now();
      reactionTimer = setTimeout(() => { if(reactionActive) { explodeCanvas(); endReactionGame(); } }, 1000);
    }, 1000 + Math.random() * 2000);
    reactionGameEl.addEventListener('pointerdown', onReactionClick);
  }

  function onReactionClick() {
    if (!reactionActive) return;
    const elapsed = performance.now() - reactionStart;
    clearTimeout(reactionTimer);
    if (elapsed <= 1000) { score += 2; updateScore(); }
    else { explodeCanvas(); }
    endReactionGame();
  }

  function endReactionGame() {
    clearTimeout(reactionTimeout);
    clearTimeout(reactionTimer);
    reactionGameEl.removeEventListener('pointerdown', onReactionClick);
    reactionGameEl.classList.add('hidden');
    running = true;
    update();
  }
  renderHearts();
  updateScore();

  function spawnText() {
    const high = Math.random() < 0.5;
    const src = texts[Math.floor(Math.random() * texts.length)] || 'TXT';
    const len = Math.min(Math.max(1, Math.floor(Math.random() * 3) + 1), src.length);
    const text = src.slice(0, len);
    ctx.font = fontSize + "px 'Press Start 2P', monospace";
    const h = fontSize * text.length;
    const w = ctx.measureText('M').width; // approximate character width
    const base = high ? 90 : 130; // align with floor height at 130px
    obstacles.push({ type: 'text', x: canvas.width, y: base - h, w, h, text });
  }

  function spawnHeart() {
    obstacles.push({ type: 'heart', x: canvas.width, y: 110, w: 16, h: 16 });
  }

  function spawnRunningItem() {
    obstacles.push({ type: 'running', x: canvas.width, y: 100, w: 20, h: 20 });
  }

  function spawnTree() {
    trees.push({ x: canvas.width + Math.random() * 40, y: 100 + Math.random() * 20, emoji: '💻' });
  }

  function drawIntro() {
    if (!introCtx || !introActive || introPhase !== 1) return;
    const spd = 1.5;
    if (keys['ArrowLeft'] || keys['KeyA']) introPlayer.x -= spd;
    if (keys['ArrowRight'] || keys['KeyD']) introPlayer.x += spd;
    if (keys['ArrowUp'] || keys['KeyW']) introPlayer.y -= spd;
    if (keys['ArrowDown'] || keys['KeyS']) introPlayer.y += spd;
    introPlayer.x = Math.max(5, Math.min(introCanvas.width - 5, introPlayer.x));
    introPlayer.y = Math.max(5, Math.min(introCanvas.height - 5, introPlayer.y));
    introCtx.fillStyle = '#554433';
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);
    introCtx.fillStyle = '#332211';
    introCtx.fillRect(0, 0, introCanvas.width, 10);
    introCtx.fillRect(0, introCanvas.height - 10, introCanvas.width, 10);
    introCtx.fillRect(0, 0, 10, introCanvas.height);
    introCtx.fillRect(introCanvas.width - 10, 0, 10, introCanvas.height);
    introCtx.fillStyle = '#ff9900';
    introCtx.fillRect(introNpc.x - 6, introNpc.y - 6, 12, 12);
    introCtx.fillStyle = '#3399ff';
    introCtx.fillRect(introPlayer.x - 5, introPlayer.y - 5, 10, 10);
    if (Math.hypot(introPlayer.x - introNpc.x, introPlayer.y - introNpc.y) < 12) {
      introPhase = 2;
      playDialogue([
        '게임의 탑에 온걸 환영한다!',
        '선택받은 인간으로서 낙원에 가려면 이 탑을 올라야 한다.',
        '탑은 총 10층으로 이루어져 있다.',
        '준비가 되었다면 버튼을 누르거라.'
      ], () => { if (startTowerBtn) startTowerBtn.classList.remove('hidden'); });
      return;
    }
    requestAnimationFrame(drawIntro);
  }

  function startTowerIntro() {
    explodeCanvas();
    running = true;
    update();
  }

  const keys = {};
  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (runningTimeAcquired && (e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
      boost = Math.min(boost + 0.5, 3);
      decel = false;
    }
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
      if (player.y >= 110 && !player.sliding) {
        const scale = 1 + Math.min(score / 100, 2);
        player.vy = -8 * scale;
        jumpActive = true;
        jumpTimer = 0;
        canDouble = true;
      } else if (canDouble) {
        const scale = 1 + Math.min(score / 100, 2);
        player.vy = -8 * scale;
        jumpActive = true;
        jumpTimer = 0;
        canDouble = false;
      }
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (player.y >= 110) {
        player.sliding = true;
        player.h = 10;
        player.y = 120;
      } else {
        player.vy = Math.max(player.vy, 8);
      }
    }
  });
  document.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      player.sliding = false;
      player.h = 20;
      if (player.y >= 110) player.y = 110;
    }
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
      jumpActive = false;
    }
    if (runningTimeAcquired && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) {
      decel = true;
    }
  });

  // touch/mouse controls
  canvas.style.touchAction = 'none';
  let startY = null;
  let touchHeld = false;
  canvas.addEventListener('pointerdown', e => {
    startY = e.clientY;
    touchHeld = true;
  });
  canvas.addEventListener('pointerup', e => {
    if (startY !== null) {
      const dy = e.clientY - startY;
      if (dy > 30) {
        if (player.y >= 110) {
          player.sliding = true;
          player.h = 10;
          player.y = 120;
        } else {
          player.vy = Math.max(player.vy, 8);
        }
      } else {
        const scale = 1 + Math.min(score / 100, 2);
        if (player.y >= 110 && !player.sliding) {
          player.vy = -8 * scale;
          jumpActive = true;
          jumpTimer = 0;
          canDouble = true;
        } else if (canDouble) {
          player.vy = -8 * scale;
          jumpActive = true;
          jumpTimer = 0;
          canDouble = false;
        }
      }
    }
    touchHeld = false;
    jumpActive = false;
    startY = null;
  });

  function endGame() {
    running = false;
    if (gameOverEl) {
      gameOverEl.classList.remove('hidden');
      let disp = 0;
      finalScoreEl.textContent = 'Score: 0';
      const target = score;
      const timer = setInterval(() => {
        disp++;
        finalScoreEl.textContent = 'Score: ' + disp;
        if (disp >= target) clearInterval(timer);
      }, 20);
    }
  }

  function update() {
    if (!running) return;
    if (widthAnim > 0) {
      const progress = Math.sin((100 - widthAnim) / 100 * Math.PI);
      canvas.style.width = (480 + 40 * progress).toFixed(0) + 'px';
      widthAnim--;
    } else {
      canvas.style.width = '480px';
    }
    canvas.style.transform = `rotateX(25deg) translate(${canvasTx}px, ${canvasTy}px) scale(${canvasScale})`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = 1 + Math.min(score / 100, 2);
    if (keys['ArrowLeft'] || keys['KeyA']) player.x = Math.max(0, player.x - 2 * scale);
    if (keys['ArrowRight'] || keys['KeyD']) player.x = Math.min(canvas.width - player.w, player.x + 2 * scale);
    if (jumpActive && (keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touchHeld) && jumpTimer < maxJumpTime && player.vy < 0) {
      player.vy -= 0.4 * scale;
      jumpTimer++;
    }
    player.vy += 0.4 * scale;
    player.y += player.vy;
    const floorY = player.sliding ? 120 : 110;
    if (player.y > floorY) {
      player.y = floorY;
      player.vy = 0;
      canDouble = false;
    }
    if (player.y >= 110) {
      if (keys['ArrowDown'] || keys['KeyS']) {
        player.sliding = true;
        player.h = 10;
        player.y = 120;
      } else if (player.sliding) {
        player.sliding = false;
        player.h = 20;
        player.y = 110;
      }
    }

    if (frame % Math.max(100 - score, 40) === 0) spawnText();
    if (frame % 200 === 0 && Math.random() < 0.3) spawnHeart();
    if (frame % 60 === 0) spawnTree();

    if (score >= nextWidthScore) { nextWidthScore += 50; widthAnim = 100; }
    if (score >= nextMoveScore) {
      nextMoveScore += 30;
      canvasTx = Math.random()*40 - 20;
      canvasTy = Math.random()*20 - 10;
      canvasScale = 1 + (Math.random()*0.4 - 0.2);
    }
    if (score >= nextThemeScore) {
      nextThemeScore += 100;
      document.body.classList.toggle('dark');
      document.body.classList.toggle('light');
    }
    obstacles.forEach(o => o.x -= (2 + boost) * scale);
    trees.forEach(t => t.x -= 1);
    if (trees.length && trees[0].x < -20) trees.shift();
    if (obstacles.length && obstacles[0].x + obstacles[0].w < 0) { obstacles.shift(); score++; updateScore(); }

    if (decel) {
      boost -= 0.1;
      if (boost <= 0) { boost = 0; decel = false; }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (player.x < o.x + o.w && player.x + player.w > o.x &&
          player.y < o.y + o.h && player.y + player.h > o.y) {
        if (o.type === 'heart') {
          hearts = Math.min(maxHearts, hearts + 1);
          obstacles.splice(i, 1);
          renderHearts();
          continue;
        } else if (o.type === 'running') {
          runningTimeAcquired = true;
          obstacles.splice(i, 1);
          if (inventory && !document.getElementById('runningTimeCard')) {
            const card = document.createElement('div');
            card.id = 'runningTimeCard';
            card.className = 'card';
            card.textContent = 'RunningTime';
            card.title = '러닝타임: 간단한 러너 예제';
            card.addEventListener('click', () => {
              window.open('https://github.com/Hwanji2/RUNNING-TIME', '_blank');
            });
            inventory.appendChild(card);
          }
          continue;
        } else {
          if (o.type === 'text') {
            for (let j = 0; j < o.text.length; j++) {
              breakPieces.push({
                char: o.text[j], x: o.x, y: o.y + fontSize * (j + 1),
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 1) * 2, a: 1
              });
            }
          }
          obstacles.splice(i, 1);
          canvas.classList.add('shake');
          setTimeout(() => canvas.classList.remove('shake'), 300);
          hearts = Math.max(0, hearts - 1);
          const lost = heartContainer ? heartContainer.lastElementChild : null;
          if (lost) lost.classList.add('fall');
          setTimeout(renderHearts, 600);
          if (hearts === 0) {
            if (score > best) { best = score; localStorage.setItem('highscore', best); }
            updateScore();
            endGame();
          }
        }
      }
    }

    const glow = 5 + 3 * Math.sin(frame / 10);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 130, canvas.width, 20);
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.save();
    ctx.shadowColor = '#87ceeb';
    ctx.shadowBlur = glow;
    trees.forEach(t => ctx.fillText(t.emoji, t.x, t.y));
    ctx.fillStyle = '#3399ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#ff5555';
    obstacles.forEach(o => {
      ctx.save();
      ctx.shadowColor = '#87ceeb';
      ctx.shadowBlur = glow;
      if (o.type === 'text') {
        ctx.font = fontSize + "px 'Press Start 2P', monospace";
        for (let i = 0; i < o.text.length; i++) {
          ctx.fillText(o.text[i], o.x, o.y + fontSize * (i + 1));
        }
      } else if (o.type === 'heart') {
        ctx.font = '16px \"Press Start 2P\", monospace';
        ctx.fillText('💙', o.x, o.y);
      } else if (o.type === 'running') {
        ctx.fillStyle = '#3399ff';
        ctx.font = '12px \"Press Start 2P\", monospace';
        ctx.fillText('RT', o.x, o.y);
      }
      ctx.restore();
    });
    ctx.restore();
    ctx.fillStyle = '#000';
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 24);
    for (let i = breakPieces.length - 1; i >= 0; i--) {
      const p = breakPieces[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.a -= 0.02;
      if (p.a <= 0) { breakPieces.splice(i,1); continue; }
      ctx.save();
      ctx.shadowColor = '#87ceeb';
      ctx.shadowBlur = glow;
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#ff5555';
      ctx.font = fontSize + "px 'Press Start 2P', monospace";
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    }
    frame++;
    requestAnimationFrame(update);
  }

  function restartGame() {
    hearts = maxHearts;
    score = 0;
    obstacles.length = 0;
    player.x = 30; player.y = 110; player.vy = 0; player.sliding = false;
    frame = 0;
    boost = 0;
    decel = false;
    runningTimeSpawned = false;
    runningTimeAcquired = false;
    linePuzzleStarted = false;
    reactionGameStarted = false;
    cardStarted = false;
    cardGameShown = false;
    breakPieces.length = 0;
    if (inventory) inventory.innerHTML = '';
    canvasTx = 0; canvasTy = 0; canvasScale = 1; nextMoveScore = 30;
    startCodeTyping();
    renderHearts();
    updateScore();
    if (gameOverEl) gameOverEl.classList.add('hidden');
    running = true;
    startTowerIntro();
  }
  if (restartBtn) restartBtn.addEventListener('click', restartGame);

}

// 오디오 볼륨 제어
const audio = document.getElementById('audio');
if (audio) {
  const master = document.getElementById('masterVolume');
  const left = document.getElementById('leftVolume');
  const right = document.getElementById('rightVolume');
  const playBtn = document.getElementById('playPause');
  const prevBtn = document.getElementById('prevTrack');
  const nextBtn = document.getElementById('nextTrack');
  const bar = document.querySelector('.progress-bar-audio');
  const progress = bar.querySelector('.progress');
  const list = document.querySelectorAll('.playlist li');
  const tracks = Array.from(list).map(li => li.dataset.src);
  let trackIndex = 0;
  function load(i) {
    trackIndex = (i + tracks.length) % tracks.length;
    audio.src = tracks[trackIndex];
    list.forEach(li => li.classList.remove('active'));
    list[trackIndex].classList.add('active');
    if (!audio.paused) audio.play();
  }
  list.forEach((li, idx) => li.addEventListener('click', () => load(idx)));

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const source = ctx.createMediaElementSource(audio);
  const merger = ctx.createChannelMerger(2);
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  source.connect(gainL).connect(merger, 0, 0);
  source.connect(gainR).connect(merger, 0, 1);
  merger.connect(ctx.destination);

  playBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); playBtn.textContent = '⏸'; }
    else { audio.pause(); playBtn.textContent = '▶'; }
  });
  prevBtn.addEventListener('click', () => load(trackIndex - 1));
  nextBtn.addEventListener('click', () => load(trackIndex + 1));
  audio.addEventListener('timeupdate', () => {
    progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  bar.addEventListener('click', e => {
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  master.addEventListener('input', () => {
    gainL.gain.value = master.value * left.value;
    gainR.gain.value = master.value * right.value;
  });
  left.addEventListener('input', () => {
    gainL.gain.value = master.value * left.value;
  });
  right.addEventListener('input', () => {
    gainR.gain.value = master.value * right.value;
  });
  load(0);
}



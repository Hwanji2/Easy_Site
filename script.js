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

// 개발 탭 기능
document.querySelectorAll('.dev-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dev-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('active');
  });
});

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
  const player = { x: 30, y: 110, w: 20, h: 20, vy: 0, sliding: false };
  let jumpActive = false;
  let jumpTimer = 0;
  const maxJumpTime = 15;
  let canDouble = false;
  const obstacles = [];
  const fontSize = 24;
  let frame = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('highscore') || '0');
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
  const breakPieces = [];
  let linePuzzleStarted = false;
  let reactionGameStarted = false;
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
  const introPlayer = { x: 180, y: 120 };
  const introNpc = { x: 180, y: 60 };

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
    {x:50,y:40,color:'red'}, {x:310,y:40,color:'red'},
    {x:50,y:120,color:'blue'}, {x:310,y:120,color:'blue'}
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

  function drawIntro() {
    if (!introCtx || !introActive || introPhase !== 1) return;
    const spd = 1.5;
    if (keys['ArrowLeft'] || keys['KeyA']) introPlayer.x -= spd;
    if (keys['ArrowRight'] || keys['KeyD']) introPlayer.x += spd;
    if (keys['ArrowUp'] || keys['KeyW']) introPlayer.y -= spd;
    if (keys['ArrowDown'] || keys['KeyS']) introPlayer.y += spd;
    introPlayer.x = Math.max(5, Math.min(introCanvas.width - 5, introPlayer.x));
    introPlayer.y = Math.max(5, Math.min(introCanvas.height - 5, introPlayer.y));
    introCtx.fillStyle = '#222';
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);
    introCtx.fillStyle = '#999';
    introCtx.fillRect(introNpc.x - 6, introNpc.y - 6, 12, 12);
    introCtx.fillStyle = '#3399ff';
    introCtx.fillRect(introPlayer.x - 5, introPlayer.y - 5, 10, 10);
    if (Math.hypot(introPlayer.x - introNpc.x, introPlayer.y - introNpc.y) < 12) {
      introPhase = 2;
      if (introMsg) {
        introMsg.textContent =
          '게임의 탑에 온걸 환영한다! 선택받은 인간으로서 낙원에 가려면 게임의 탑을 올라야 한다. 탑은 총 10층이다. 오르겠는가?';
        introMsg.classList.remove('hidden');
      }
      if (startTowerBtn) startTowerBtn.classList.remove('hidden');
      return;
    }
    requestAnimationFrame(drawIntro);
  }

  function startTowerIntro() {
    if (!towerIntroEl) { startCardGame(); return; }
    visitCount++;
    localStorage.setItem('towerVisits', visitCount);
    introPhase = 0;
    introActive = true;
    introPlayer.x = 180;
    introPlayer.y = 120;
    if (introMsg) {
      introMsg.textContent = visitCount === 1 ? '반가워요' : `벌써 ${visitCount}번째네요`;
      introMsg.classList.remove('hidden');
    }
    if (startTowerBtn) startTowerBtn.classList.add('hidden');
    towerIntroEl.classList.remove('hidden');
  }

  if (towerIntroEl) {
    towerIntroEl.addEventListener('pointerdown', () => {
      if (introPhase === 0) {
        introPhase = 1;
        if (introMsg) introMsg.classList.add('hidden');
        requestAnimationFrame(drawIntro);
      }
    });
  }

  if (startTowerBtn) {
    startTowerBtn.addEventListener('click', () => {
      towerIntroEl.classList.add('hidden');
      introActive = false;
      running = true;
      startCardGame();
    });
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
    if (score >= 10 && !reactionGameStarted) {
      reactionGameStarted = true;
      startReactionGame();
      return;
    }
    if (score >= 15 && !runningTimeSpawned && !runningTimeAcquired) {
      spawnRunningItem();
      runningTimeSpawned = true;
    }
    if (score >= 20 && !linePuzzleStarted) {
      linePuzzleStarted = true;
      startLinePuzzle();
      return;
    }
    obstacles.forEach(o => o.x -= (2 + boost) * scale);
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

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 130, canvas.width, 20);
    ctx.fillStyle = '#3399ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#ff5555';
    obstacles.forEach(o => {
      ctx.save();
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
    ctx.fillStyle = '#000';
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 24);
    for (let i = breakPieces.length - 1; i >= 0; i--) {
      const p = breakPieces[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.a -= 0.02;
      if (p.a <= 0) { breakPieces.splice(i,1); continue; }
      ctx.save();
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
    breakPieces.length = 0;
    if (inventory) inventory.innerHTML = '';
    renderHearts();
    updateScore();
    if (gameOverEl) gameOverEl.classList.add('hidden');
    running = true;
    startTowerIntro();
  }
  if (restartBtn) restartBtn.addEventListener('click', restartGame);

  startTowerIntro();
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

// 간단한 계산기
const calc = document.getElementById('calc');
if (calc) {
  const display = document.getElementById('calcDisplay');
  const history = document.getElementById('calcHistory');
  calc.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    const v = e.target.textContent;
    if (v === 'C') display.value = '';
    else if (v === '=') {
      const result = eval(display.value || '0');
      if (history) history.insertAdjacentHTML('afterbegin', `<li>${display.value} = ${result}</li>`);
      display.value = result;
    }
    else display.value += v;
  });
}

// 간단한 3D 큐브
if (document.getElementById('cubeCanvas')) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.161/build/three.min.js';
  script.onload = () => {
    const ctrl = document.createElement('script');
    ctrl.src = 'https://cdn.jsdelivr.net/npm/three@0.161/examples/js/controls/OrbitControls.js';
    ctrl.onload = () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 300/200, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cubeCanvas') });
      renderer.setSize(300, 200);
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshNormalMaterial();
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      camera.position.z = 3;
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    };
    document.head.appendChild(ctrl);
  };
  document.head.appendChild(script);
}


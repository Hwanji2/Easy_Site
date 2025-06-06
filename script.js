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
  const texts = Array.from(document.querySelectorAll('h2, p, li'))
    .map(el => el.textContent.trim())
    .filter(t => t.length > 0 && t.length < 15);
  const player = { x: 30, y: 110, w: 20, h: 20, vy: 0, sliding: false };
  const obstacles = [];
  const fontSize = 24;
  let frame = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('highscore') || '0');

  function spawn() {
    const high = Math.random() < 0.5;
    const text = texts[Math.floor(Math.random() * texts.length)] || 'TXT';
    ctx.font = fontSize + 'px sans-serif';
    const h = fontSize * text.length;
    const base = high ? 70 : 110;
    obstacles.push({ x: canvas.width, y: base - h, w: fontSize, h, text });
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && player.y >= 110 && !player.sliding) {
      player.vy = -8;
    }
    if (e.code === 'ArrowDown') {
      player.sliding = true;
      player.h = 10;
    }
  });
  document.addEventListener('keyup', e => {
    if (e.code === 'ArrowDown') {
      player.sliding = false;
      player.h = 20;
    }
  });

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.vy += 0.5;
    player.y += player.vy;
    if (player.y > 110) { player.y = 110; player.vy = 0; }

    if (frame % 100 === 0) spawn();
    obstacles.forEach(o => o.x -= 2);
    if (obstacles.length && obstacles[0].x + obstacles[0].w < 0) { obstacles.shift(); score++; }

    obstacles.forEach(o => {
      if (player.x < o.x + o.w && player.x + player.w > o.x &&
          player.y < o.y + o.h && player.y + player.h > o.y) {
        if (score > best) { best = score; localStorage.setItem('highscore', best); }
        score = 0; obstacles.length = 0; o.x = canvas.width;
      }
    });

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 130, canvas.width, 20);
    ctx.fillStyle = '#3399ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#ff5555';
    obstacles.forEach(o => {
      ctx.save();
      ctx.font = fontSize + 'px sans-serif';
      for (let i = 0; i < o.text.length; i++) {
        ctx.fillText(o.text[i], o.x, o.y + fontSize * (i + 1));
      }
      ctx.restore();
    });
    ctx.fillStyle = '#000';
    ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 10);
    frame++;
    requestAnimationFrame(update);
  }
  update();
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


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
const scoreEl = document.getElementById('score');
const addScore = document.getElementById('addScore');
if (addScore) {
  addScore.addEventListener('click', () => {
    scoreEl.textContent = parseInt(scoreEl.textContent) + 1;
  });
}

// 오디오 볼륨 제어
const audio = document.getElementById('audio');
if (audio) {
  const master = document.getElementById('masterVolume');
  const left = document.getElementById('leftVolume');
  const right = document.getElementById('rightVolume');
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const source = ctx.createMediaElementSource(audio);
  const merger = ctx.createChannelMerger(2);
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  source.connect(gainL).connect(merger, 0, 0);
  source.connect(gainR).connect(merger, 0, 1);
  merger.connect(ctx.destination);
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
}

// 간단한 계산기
const calc = document.getElementById('calc');
if (calc) {
  const display = document.getElementById('calcDisplay');
  calc.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    const v = e.target.textContent;
    if (v === 'C') display.value = '';
    else if (v === '=') display.value = eval(display.value || '0');
    else display.value += v;
  });
}

// 간단한 3D 큐브
if (document.getElementById('cubeCanvas')) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.161/build/three.min.js';
  script.onload = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300/200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('cubeCanvas')});
    renderer.setSize(300,200);
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:true});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 3;
    function animate(){
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene,camera);
    }
    animate();
  };
  document.head.appendChild(script);
}


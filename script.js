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


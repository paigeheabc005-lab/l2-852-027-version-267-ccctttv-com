
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initMobileNav() {
    const btn = qs('[data-menu-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initHero() {
    const hero = qs('[data-hero]');
    if (!hero) return;
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === index));
      dots.forEach((d, n) => d.classList.toggle('active', n === index));
    }
    function advance(delta) { show(index + delta); }
    if (prev) prev.addEventListener('click', () => { advance(-1); restart(); });
    if (next) next.addEventListener('click', () => { advance(1); restart(); });
    dots.forEach((dot, n) => dot.addEventListener('click', () => { show(n); restart(); }));
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => advance(1), 5500);
    }
    show(0);
    restart();
  }

  function normalize(s) {
    return (s || '').toLowerCase();
  }

  function initSearchFilters() {
    const input = qs('[data-search-input]');
    const grid = qs('[data-filter-grid]');
    const chips = qsa('[data-filter-chip]');
    const form = qs('[data-search-form]');
    if (!grid) return;
    const items = qsa('[data-search-item]', grid);

    function filter(term, category) {
      const q = normalize(term).trim();
      items.forEach(item => {
        const text = normalize(item.dataset.searchText || item.textContent);
        const cat = normalize(item.querySelector('.pill')?.textContent || '');
        const okTerm = !q || text.includes(q);
        const okCat = !category || category === 'all' || cat.includes(normalize(category));
        item.classList.toggle('hidden', !(okTerm && okCat));
      });
    }

    if (input) {
      input.addEventListener('input', () => filter(input.value, qs('[data-filter-chip].active')?.dataset.filterChip || 'all'));
    }
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(x => x.classList.remove('active'));
        chip.classList.add('active');
        filter(input ? input.value : '', chip.dataset.filterChip || 'all');
      });
    });
    if (form) {
      form.addEventListener('submit', (e) => {
        if (input && input.value.trim()) {
          e.preventDefault();
          filter(input.value, qs('[data-filter-chip].active')?.dataset.filterChip || 'all');
        }
      });
    }
  }

  function initPlayer() {
    const video = qs('video[data-hls-src]');
    if (!video) return;
    const src = video.dataset.hlsSrc;
    const btn = qs('[data-play-btn]');
    const stage = qs('.video-stage');

    function markPlaying() {
      stage && stage.classList.add('playing');
      btn && (btn.style.display = 'none');
    }
    function wirePlayback() {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // pre-warm playback but do not auto-play.
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          console.warn('HLS error', data && data.details);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    wirePlayback();
    if (btn) {
      btn.addEventListener('click', async () => {
        try {
          await video.play();
          markPlaying();
        } catch (e) {
          console.warn(e);
        }
      });
    }
    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', () => {
      if (stage) stage.classList.remove('playing');
      if (btn) btn.style.display = '';
    });
    qsa('[data-copy-src]').forEach(el => {
      el.addEventListener('click', async () => {
        const url = el.getAttribute('data-copy-src');
        try {
          await navigator.clipboard.writeText(url);
          el.textContent = '已复制播放源';
          setTimeout(() => { el.textContent = '复制播放源'; }, 1500);
        } catch (e) {
          prompt('复制下面的播放源地址：', url);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHero();
    initSearchFilters();
    initPlayer();
  });
})();

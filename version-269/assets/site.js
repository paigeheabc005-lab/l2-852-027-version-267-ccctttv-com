
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root=document) => root.querySelector(sel);

  function initMobileNav() {
    const btn = $('[data-mobile-toggle]');
    const nav = $('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initHeroCarousel() {
    const slides = $$('.hero-slide');
    const dots = $$('.hero-dot');
    if (!slides.length) return;
    let index = 0;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    };
    dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
    const timer = setInterval(() => show(index + 1), 5000);
    const wrap = $('.hero-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => clearInterval(timer), { once: true });
    }
    show(0);
  }

  function initPlayer() {
    const video = $('#site-player');
    if (!video) return;
    const overlay = $('[data-play-overlay]');
    const playBtn = $('[data-play-btn]');
    const src = video.dataset.hls;
    const fallback = video.dataset.fallback;
    let hls = null;
    const hideOverlay = () => overlay && overlay.classList.add('hide');
    const showOverlay = () => overlay && overlay.classList.remove('hide');
    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function(_, data) {
        if (data && data.fatal) {
          if (fallback) video.src = fallback;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (fallback) {
      video.src = fallback;
    }
    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(()=>{});
      hideOverlay();
    };
    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', () => { if (video.currentTime < 0.1) showOverlay(); });
    overlay && overlay.addEventListener('click', play);
    playBtn && playBtn.addEventListener('click', play);
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase();
  }

  function initSearchPage() {
    const root = $('#searchApp');
    const dataEl = $('#movieData');
    if (!root || !dataEl) return;
    let movies = [];
    try { movies = JSON.parse(dataEl.textContent || '[]'); } catch (e) { movies = []; }
    const q = new URLSearchParams(location.search).get('q') || '';
    const input = $('[data-search-input]', root);
    const typeSel = $('[data-type-filter]', root);
    const regionSel = $('[data-region-filter]', root);
    const yearSel = $('[data-year-filter]', root);
    const sortSel = $('[data-sort-filter]', root);
    const results = $('[data-search-results]', root);
    const countEl = $('[data-search-count]', root);
    const clearBtn = $('[data-clear-search]', root);

    if (input && q) input.value = q;

    function score(movie) {
      const y = parseInt(movie.year, 10) || 0;
      const len = (movie.summary || '').length + (movie.review || '').length * 0.7;
      return y * 10 + len / 100;
    }

    function makeCard(movie) {
      return `
      <article class="movie-card">
        <a href="${movie.slug}" class="movie-poster">
          <img loading="lazy" src="${movie.poster_wide}" alt="${movie.title}">
          <span class="badge top">${movie.type}</span>
          <span class="badge year">${movie.year}</span>
          <span class="badge region">${movie.region}</span>
        </a>
        <div class="movie-body">
          <h3 class="movie-title"><a href="${movie.slug}">${movie.title}</a></h3>
          <p class="movie-desc">${movie.one_line || movie.summary || movie.title}</p>
          <div class="movie-meta"><span class="pill">${movie.genre}</span><span class="pill">${movie.tags}</span></div>
        </div>
      </article>`;
    }

    function render() {
      const query = normalize(input ? input.value : '');
      const typeFilter = typeSel ? typeSel.value : '';
      const regionFilter = regionSel ? regionSel.value : '';
      const yearFilter = yearSel ? yearSel.value : '';
      const sortFilter = sortSel ? sortSel.value : 'relevance';

      let list = movies.filter(movie => {
        const hay = normalize([movie.title, movie.one_line, movie.summary, movie.review, movie.genre, movie.tags, movie.region, movie.type].join(' '));
        const okQuery = !query || hay.includes(query);
        const okType = !typeFilter || movie.type === typeFilter;
        const okRegion = !regionFilter || movie.region === regionFilter;
        const okYear = !yearFilter || String(movie.year).startsWith(yearFilter);
        return okQuery && okType && okRegion && okYear;
      });

      if (sortFilter === 'year-desc') list.sort((a, b) => (parseInt(b.year,10)||0) - (parseInt(a.year,10)||0) || (b.idx - a.idx));
      else if (sortFilter === 'year-asc') list.sort((a, b) => (parseInt(a.year,10)||0) - (parseInt(b.year,10)||0) || (a.idx - b.idx));
      else if (sortFilter === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      else list.sort((a, b) => score(b) - score(a));

      if (countEl) countEl.textContent = `找到 ${list.length} 部影片`;
      if (results) results.innerHTML = list.slice(0, 240).map(makeCard).join('') || '<div class="panel panel-pad">没有找到匹配的影片，请尝试更换关键词。</div>';
    }

    input && input.addEventListener('input', render);
    typeSel && typeSel.addEventListener('change', render);
    regionSel && regionSel.addEventListener('change', render);
    yearSel && yearSel.addEventListener('change', render);
    sortSel && sortSel.addEventListener('change', render);
    clearBtn && clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      if (typeSel) typeSel.value = '';
      if (regionSel) regionSel.value = '';
      if (yearSel) yearSel.value = '';
      if (sortSel) sortSel.value = 'relevance';
      render();
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroCarousel();
    initPlayer();
    initSearchPage();
  });
})();

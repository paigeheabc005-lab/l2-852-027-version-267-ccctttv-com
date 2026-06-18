(function () {
  var movies = window.SEARCH_MOVIES || [];
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  var escapeHtml = function (text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  var render = function (keyword) {
    var key = keyword.trim().toLowerCase();
    var matched = key ? movies.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(key) !== -1;
    }) : movies.slice(0, 48);

    matched = matched.slice(0, 96);

    if (status) {
      status.textContent = key ? '搜索结果' : '热门影片';
    }

    if (!results) {
      return;
    }

    if (!matched.length) {
      results.innerHTML = '<div class="content-card"><h2>暂无匹配内容</h2><p>请尝试输入其他片名、地区、年份或题材。</p></div>';
      return;
    }

    results.innerHTML = matched.map(function (movie) {
      return '<article class="movie-card">' +
        '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="corner-label">' + escapeHtml(movie.category) + '</span>' +
        '<span class="duration-label">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-info">' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  };

  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : '';
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', url);
      render(value);
    });
  }

  render(query);
})();

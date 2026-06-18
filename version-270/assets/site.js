(function () {
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $all(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupMenu() {
        var toggle = $("[data-menu-toggle]");
        var menu = $("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = $all("[data-hero-slide]");
        var dots = $all("[data-hero-target]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function setupLocalFilter() {
        var input = $("[data-local-search]");
        var cards = $all("[data-card-text]");
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            var q = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                card.style.display = card.getAttribute("data-card-text").toLowerCase().indexOf(q) > -1 ? "" : "none";
            });
        });
    }

    function buildCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + text(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + text(item.url) + "\" aria-label=\"" + text(item.title) + "\">",
            "<img src=\"" + text(item.cover) + "\" alt=\"" + text(item.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + text(item.year || "经典") + "</span>",
            "</a>",
            "<div class=\"movie-body\">",
            "<p class=\"movie-eyebrow\">" + text(item.region) + " · " + text(item.type) + "</p>",
            "<h3><a href=\"" + text(item.url) + "\">" + text(item.title) + "</a></h3>",
            "<p class=\"movie-desc\">" + text(item.oneLine || "") + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function setupSearch() {
        var input = $("#searchInput");
        var region = $("#regionFilter");
        var year = $("#yearFilter");
        var result = $("#searchResults");
        if (!input || !result || !window.SEARCH_ITEMS) {
            return;
        }
        var items = window.SEARCH_ITEMS;
        function render() {
            var q = input.value.trim().toLowerCase();
            var r = region ? region.value : "";
            var y = year ? year.value : "";
            var hits = items.filter(function (item) {
                var hay = [item.title, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
                var okText = !q || hay.indexOf(q) > -1;
                var okRegion = !r || item.region.indexOf(r) > -1 || (item.tags || []).join(" ").indexOf(r) > -1;
                var okYear = !y || String(item.year || "").indexOf(y) === 0;
                return okText && okRegion && okYear;
            }).slice(0, 120);
            result.innerHTML = hits.length ? hits.map(buildCard).join("") : "<div class=\"search-empty\">没有找到匹配影片</div>";
        }
        input.addEventListener("input", render);
        if (region) {
            region.addEventListener("change", render);
        }
        if (year) {
            year.addEventListener("change", render);
        }
        render();
    }

    function initPlayer(options) {
        var video = $(options.selector || "#moviePlayer");
        var trigger = $(options.trigger || "#playTrigger");
        var url = options.url;
        if (!video || !url) {
            return;
        }
        var prepared = false;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            prepare();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            video.play().catch(function () {});
        }
        if (trigger) {
            trigger.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupLocalFilter();
    });

    window.Site = {
        initPlayer: initPlayer
    };
})();

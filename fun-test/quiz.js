/* The Money Personality Quiz.
 *
 * Thirty forced choices across six traits. Every ordered pair of traits is
 * asked exactly once (6 × 5 = 30), which is why the question count is what
 * it is — each trait meets every other, from both sides, so no trait wins
 * by being asked about more often.
 *
 * Rebuilt as a plain page. The previous version was a compiled bundle whose
 * source had gone missing, which meant the words on it could not be edited
 * by anyone. The words are the product; they shouldn't live somewhere only
 * a build step can reach.
 */
(function () {
  var C = window.QUIZ.characters;
  var Q = window.QUIZ.questions;

  // Follow the phone unless told otherwise, like the rest of the site.
  var lang = /^zh/i.test(navigator.language) ? 1 : 0;
  var order = shuffled(Q.length);
  var at = 0;
  var scores = C.map(function () { return 0; });

  var $ = function (id) { return document.getElementById(id); };

  /* A mark per character — a soft grainy pebble, not a logo.
   *
   * The first pass drew each one as a radar polygon of its trait vector.
   * Honest, and unreadable: six small shards that looked like broken glass
   * rather than six personalities. These are organic blobs instead — the
   * silhouette still comes from the character's own numbers, so no two are
   * the same shape, but the family resemblance is the point.
   *
   * Built as one SVG with its own grain filter so it stays crisp at any
   * size and needs no image. The highlight sits upper-left and the shadow
   * lower-right, which is what makes a flat shape read as a thing you
   * could pick up. */
  function glyph(i, size) {
    var v = C[i].v, c = C[i].hue, cx = size / 2, cy = size / 2;
    var r = size * 0.40;

    // A closed Catmull-ish blob: six radii from the trait vector, smoothed
    // so the outline is a pebble rather than a polygon.
    var pts = v.map(function (val, k) {
      var a = (Math.PI * 2 * k) / 6 - Math.PI / 2;
      var len = r * (0.82 + 0.30 * ((val + 1) / 2));
      return [cx + Math.cos(a) * len, cy + Math.sin(a) * len];
    });
    var d = '';
    for (var k = 0; k < pts.length; k++) {
      var p0 = pts[k], p1 = pts[(k + 1) % pts.length];
      var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      d += (k ? '' : 'M' + mx.toFixed(1) + ' ' + my.toFixed(1));
      var n0 = pts[(k + 1) % pts.length], n1 = pts[(k + 2) % pts.length];
      var nx = (n0[0] + n1[0]) / 2, ny = (n0[1] + n1[1]) / 2;
      d += 'Q' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' ' +
           nx.toFixed(1) + ' ' + ny.toFixed(1);
    }
    d += 'Z';

    var u = 'g' + i + '-' + size;
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size +
      '" height="' + size + '" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="f' + u + '" cx="34%" cy="28%" r="78%">' +
          '<stop offset="0" stop-color="#fff" stop-opacity=".92"/>' +
          '<stop offset="42%" stop-color="' + c[0] + '"/>' +
          '<stop offset="100%" stop-color="' + c[1] + '"/>' +
        '</radialGradient>' +
        '<filter id="n' + u + '">' +
          '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" result="t"/>' +
          '<feColorMatrix in="t" type="saturate" values="0" result="d"/>' +
          '<feComposite in="d" in2="SourceAlpha" operator="in" result="m"/>' +
          '<feBlend in="SourceGraphic" in2="m" mode="multiply"/>' +
        '</filter>' +
      '</defs>' +
      '<path d="' + d + '" fill="url(#f' + u + ')" filter="url(#n' + u + ')"/>' +
      // A second, tighter highlight — the wet look the chrome wordmark has.
      '<ellipse cx="' + (cx - r * 0.30).toFixed(1) + '" cy="' + (cy - r * 0.38).toFixed(1) +
        '" rx="' + (r * 0.30).toFixed(1) + '" ry="' + (r * 0.20).toFixed(1) +
        '" fill="#fff" opacity=".55" transform="rotate(-24 ' + cx + ' ' + cy + ')"/>' +
      '</svg>';
  }

  /* Fisher–Yates. The question ORDER varies but the set never does — every
     trait still meets every other, so a shuffle can't bias the result. */
  function shuffled(n) {
    var a = Array.from({ length: n }, function (_, i) { return i; });
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function paintCast() {
    $('cast').innerHTML = C.map(function (c, i) {
      return '<article class="card" style="--c1:' + c.hue[0] + '33;--c2:' + c.hue[1] + '2e">' +
        '<div class="glyph">' + glyph(i, 68) + '</div>' +
        '<h3>' + c.name[lang] + '</h3>' +
        '<p class="role">' + c.title[lang] + '</p>' +
        '<p class="quote">“' + c.quote[lang] + '”</p>' +
        '</article>';
    }).join('');
  }

  function paintStatic() {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.textContent = lang ? el.dataset.zh : el.dataset.en;
    });
    document.documentElement.lang = lang ? 'zh-Hant' : 'en';
  }

  function askQuestion() {
    var q = Q[order[at]];
    $('count').textContent = (lang ? '第 ' : '') + (at + 1) +
      (lang ? ' 題 / 共 ' : ' of ') + Q.length + (lang ? ' 題' : '');
    $('question').textContent = q[lang ? 'zh' : 'en'];
    $('opt-a').textContent = q.a[lang];
    $('opt-b').textContent = q.b[lang];
    $('bar').style.width = ((at / Q.length) * 100).toFixed(1) + '%';
  }

  function answer(side) {
    var q = Q[order[at]];
    scores[q.pair[side]] += 1;
    at += 1;
    if (at < Q.length) { askQuestion(); return; }
    showResult();
  }

  function showResult() {
    $('bar').style.width = '100%';
    var best = 0;
    scores.forEach(function (s, i) { if (s > scores[best]) best = i; });
    var c = C[best];
    $('portrait').innerHTML = glyph(best, 132);
    $('r-name').textContent = c.name[lang];
    $('r-title').textContent = c.title[lang];
    $('r-quote').textContent = '“' + c.quote[lang] + '”';
    $('r-desc').textContent = c.desc[lang];
    $('r-strength').textContent = c.strength[lang];
    $('r-blind').textContent = c.blind[lang];
    $('r-tip').textContent = c.tip[lang];
    $('quiz').classList.remove('on');
    $('result').classList.add('on');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function begin() {
    order = shuffled(Q.length);
    at = 0;
    scores = C.map(function () { return 0; });
    $('cast-section').style.display = 'none';
    $('result').classList.remove('on');
    $('quiz').classList.add('on');
    askQuestion();
    document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
  }

  function setLang(next) {
    lang = next;
    $('lang-en').setAttribute('aria-pressed', String(!lang));
    $('lang-zh').setAttribute('aria-pressed', String(!!lang));
    paintStatic();
    paintCast();
    if ($('quiz').classList.contains('on')) askQuestion();
    if ($('result').classList.contains('on')) showResultTextOnly();
  }

  /* Re-label a result already on screen without re-scoring it. */
  function showResultTextOnly() {
    var best = 0;
    scores.forEach(function (s, i) { if (s > scores[best]) best = i; });
    var c = C[best];
    $('r-name').textContent = c.name[lang];
    $('r-title').textContent = c.title[lang];
    $('r-quote').textContent = '“' + c.quote[lang] + '”';
    $('r-desc').textContent = c.desc[lang];
    $('r-strength').textContent = c.strength[lang];
    $('r-blind').textContent = c.blind[lang];
    $('r-tip').textContent = c.tip[lang];
  }

  $('start').addEventListener('click', begin);
  $('again').addEventListener('click', function () {
    $('result').classList.remove('on');
    $('cast-section').style.display = '';
    begin();
  });
  $('opt-a').addEventListener('click', function () { answer(0); });
  $('opt-b').addEventListener('click', function () { answer(1); });
  $('lang-en').addEventListener('click', function () { setLang(0); });
  $('lang-zh').addEventListener('click', function () { setLang(1); });

  setLang(lang);
})();

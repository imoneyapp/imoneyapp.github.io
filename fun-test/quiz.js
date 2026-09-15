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

  /* The characters are ILLUSTRATED — one 3x2 sprite sheet, sliced by index.
   *
   * I first drew them as generated shapes, which was the wrong instinct
   * twice over: it threw away artwork that already exists, and no
   * procedural blob is going to out-act a jelly creature holding a pearl.
   * Each one matches its archetype — Sol guards something precious, Neo has
   * a tree growing inside, Zen is asleep and content — and that is the
   * quiz's whole personality. */
  function portraitStyle(i) {
    return 'background-position:' + (i % 3) * 50 + '% ' + Math.floor(i / 3) * 100 + '%';
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
        '<div class="portrait sm" style="' + portraitStyle(i) + '"></div>' +
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
    $('portrait').className = 'portrait lg';
    $('portrait').setAttribute('style', portraitStyle(best));
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

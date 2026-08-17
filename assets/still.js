/* The still.
   Click the iMoney mark and the page gives way to one image — no chrome, no
   caption, nothing to do but look at it. Click anywhere or press Esc and
   it's gone. */
(() => {
  const brand = document.getElementById('brand');
  if (!brand) return;
  brand.classList.add('live');

  const SRC = '/assets/sea.jpg';
  let img, veil, open = false;

  // Fetched on hover, not on page load. It's a quarter of a megabyte and
  // most visitors are here to type a name — they shouldn't pay for a moment
  // they never open. Hovering the mark all but always precedes clicking it,
  // so by the time the click lands the image is usually already decoded.
  const preload = () => {
    if (img) return;
    img = new Image();
    img.src = SRC;
    img.alt = '';
  };
  brand.addEventListener('pointerenter', preload);
  brand.addEventListener('focus', preload);

  const build = () => {
    preload();
    veil = document.createElement('div');
    veil.className = 'still';
    veil.setAttribute('aria-hidden', 'true');
    veil.appendChild(img);
    veil.addEventListener('click', hide);
    document.body.appendChild(veil);
  };

  const show = () => {
    if (!veil) build();
    open = true;
    // Force layout so the transition has a "from" state to leave. This was
    // a requestAnimationFrame callback, which is the usual way to do it and
    // is wrong here: rAF is paused in a hidden or backgrounded tab, so the
    // veil got built and then never opened. Reading offsetWidth is
    // synchronous and always happens.
    void veil.offsetWidth;
    veil.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function hide() {
    open = false;
    veil.classList.remove('open');
    document.body.style.overflow = '';
  }

  brand.addEventListener('click', e => { e.preventDefault(); show(); });
  addEventListener('keydown', e => { if (open && e.key === 'Escape') hide(); });
})();

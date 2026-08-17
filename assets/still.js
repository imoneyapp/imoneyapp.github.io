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
    // Next frame, so the element is in the document before the class that
    // transitions it — set both together and there's nothing to animate
    // from, and it just appears.
    requestAnimationFrame(() => veil.classList.add('open'));
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
